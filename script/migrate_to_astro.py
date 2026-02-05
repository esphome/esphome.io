#!/usr/bin/env python3
"""
Migration script to convert Hugo shortcodes to Astro component syntax.
"""

import os
import re
import sys
from pathlib import Path

def convert_anchor(match):
    """Convert {{< anchor "id" >}} to <span id="id"></span>"""
    anchor_id = match.group(1)
    return f'<span id="{anchor_id}"></span>'

def convert_pr(match):
    """Convert {{< pr number="123" repo="esphome" >}} to <PR number={123} repo="esphome" />"""
    content = match.group(1)
    number_match = re.search(r'number=["\']?(\d+)["\']?', content)
    repo_match = re.search(r'repo=["\']?([^"\'\s>]+)["\']?', content)

    if not number_match:
        return match.group(0)  # Return original if can't parse

    number = number_match.group(1)
    repo = repo_match.group(1) if repo_match else 'esphome'

    if repo == 'esphome':
        return f'<PR number={{{number}}} />'
    else:
        return f'<PR number={{{number}}} repo="{repo}" />'

def convert_ghuser(match):
    """Convert {{< ghuser name="user" >}} to <GHUser name="user" />"""
    content = match.group(1)
    name_match = re.search(r'name=["\']?([^"\'\s>]+)["\']?', content)
    text_match = re.search(r'text=["\']([^"\']+)["\']', content)

    if not name_match:
        return match.group(0)

    name = name_match.group(1)
    text = text_match.group(1) if text_match else None

    if text:
        return f'<GHUser name="{name}" text="{text}" />'
    else:
        return f'<GHUser name="{name}" />'

def convert_docref(match):
    """Convert {{< docref "path" >}} or {{< docref "path" "text" >}} to markdown link"""
    content = match.group(1).strip()

    # Parse quoted arguments
    args = re.findall(r'"([^"]*)"', content)

    if len(args) >= 2:
        path, text = args[0], args[1]
    elif len(args) == 1:
        path = args[0]
        # Extract text from path - use the last component
        text = path.rstrip('/').split('/')[-1].replace('_', ' ').title()
    else:
        return match.group(0)

    # Ensure path starts with /
    if not path.startswith('/') and not path.startswith('http'):
        path = '/' + path

    # Ensure path ends with /
    if not path.endswith('/') and not path.startswith('http') and '#' not in path:
        path = path + '/'

    return f'[{text}]({path})'

def convert_apiref(match):
    """Convert {{< apiref "text" "path" >}} to <APIRef text="text" path="path" />"""
    content = match.group(1).strip()
    args = re.findall(r'"([^"]*)"', content)

    if len(args) >= 2:
        text, path = args[0], args[1]
        return f'<APIRef text="{text}" path="{path}" />'
    elif len(args) == 1:
        path = args[0]
        return f'<APIRef text="API Reference" path="{path}" />'

    return match.group(0)

def convert_apiclass(match):
    """Convert {{< apiclass "text" "path" >}} to <APIClass text="text" path="path" />"""
    content = match.group(1).strip()
    args = re.findall(r'"([^"]*)"', content)

    if len(args) >= 2:
        text, path = args[0], args[1]
        return f'<APIClass text="{text}" path="{path}" />'

    return match.group(0)

def convert_apistruct(match):
    """Convert {{< apistruct "text" "path" >}} to <APIStruct text="text" path="path" />"""
    content = match.group(1).strip()
    args = re.findall(r'"([^"]*)"', content)

    if len(args) >= 2:
        text, path = args[0], args[1]
        return f'<APIStruct text="{text}" path="{path}" />'

    return match.group(0)

def convert_collapse(match):
    """Convert {{< collapse >}}...{{< /collapse >}} to <details>...</details>"""
    open_param = match.group(1).strip() if match.group(1) else ''
    content = match.group(2)

    is_open = 'open' if open_param and open_param.lower() not in ('false', '"false"') else ''
    open_attr = ' open' if is_open else ''

    return f'<details{open_attr}>\n<summary></summary>\n\n{content}\n</details>'

def convert_math(match):
    """Convert {{< math >}}...{{< /math >}} to $...$"""
    content = match.group(1).strip()
    return f'$${content}$$'

def convert_break(match):
    """Convert {{< break >}} to <br>"""
    return '<br />'

def convert_imgtable(match):
    """Convert {{< imgtable >}}...{{< /imgtable >}} to ImgTable component syntax"""
    content = match.group(1).strip()

    # Parse CSV-like content
    lines = []
    for line in content.strip().split('\n'):
        line = line.strip()
        if not line:
            continue

        # Parse each line as CSV-like
        # Handle quoted strings properly
        parts = []
        current = ''
        in_quotes = False
        for char in line:
            if char == '"' and not in_quotes:
                in_quotes = True
            elif char == '"' and in_quotes:
                in_quotes = False
            elif char == ',' and not in_quotes:
                parts.append(current.strip().strip('"'))
                current = ''
            else:
                current += char
        if current:
            parts.append(current.strip().strip('"'))

        if len(parts) >= 3:
            lines.append(parts)

    if not lines:
        return match.group(0)

    # Generate Astro component syntax
    items_str = ',\n  '.join(
        f'["{item[0]}", "{item[1]}", "{item[2]}"' +
        (f', "{item[3]}"' if len(item) > 3 and item[3] else '') +
        (f', "{item[4]}"' if len(item) > 4 and item[4] else '') +
        ']'
        for item in lines
    )

    return f'''<ImgTable items={{[
  {items_str}
]}} />'''

def convert_feature_grid(match):
    """Convert feature-grid shortcode to FeatureGrid component"""
    content = match.group(1).strip()

    # The content is JSON, so we can use it mostly as-is
    # Just need to wrap it in the component syntax
    return f'''<FeatureGrid items={{{content}}} />'''

def convert_getting_started_grid(match):
    """Convert getting-started-grid shortcode to GettingStartedGrid component"""
    content = match.group(1).strip()
    return f'''<GettingStartedGrid items={{{content}}} />'''

def convert_img(match):
    """Convert {{< img src="..." >}} to standard markdown image or HTML img"""
    content = match.group(1)
    src_match = re.search(r'src=["\']([^"\']+)["\']', content)
    alt_match = re.search(r'alt=["\']([^"\']+)["\']', content)

    if not src_match:
        return match.group(0)

    src = src_match.group(1)
    alt = alt_match.group(1) if alt_match else ''

    return f'![{alt}]({src})'

def needs_mdx(content: str) -> bool:
    """Check if file content needs MDX (contains Astro components)"""
    mdx_components = [
        '<ImgTable', '<PR ', '<GHUser ', '<APIRef ', '<APIClass ', '<APIStruct ',
        '<FeatureGrid', '<GettingStartedGrid'
    ]
    return any(comp in content for comp in mdx_components)

def get_required_imports(content: str) -> list:
    """Get list of required component imports based on content"""
    imports = []
    if '<ImgTable' in content:
        imports.append("import ImgTable from '@components/ImgTable.astro';")
    if '<PR ' in content:
        imports.append("import PR from '@components/PR.astro';")
    if '<GHUser ' in content:
        imports.append("import GHUser from '@components/GHUser.astro';")
    if '<APIRef ' in content:
        imports.append("import APIRef from '@components/APIRef.astro';")
    if '<APIClass ' in content:
        imports.append("import APIClass from '@components/APIClass.astro';")
    if '<APIStruct ' in content:
        imports.append("import APIStruct from '@components/APIStruct.astro';")
    if '<FeatureGrid' in content:
        imports.append("import FeatureGrid from '@components/FeatureGrid.astro';")
    if '<GettingStartedGrid' in content:
        imports.append("import GettingStartedGrid from '@components/GettingStartedGrid.astro';")
    return imports

def add_imports_to_frontmatter(content: str, imports: list) -> str:
    """Add import statements after frontmatter"""
    if not imports:
        return content

    import_block = '\n'.join(imports)

    # Find the end of frontmatter
    if content.startswith('---'):
        # Find the second ---
        second_dash = content.find('---', 3)
        if second_dash != -1:
            frontmatter = content[:second_dash + 3]
            rest = content[second_dash + 3:]
            return f'{frontmatter}\n{import_block}\n{rest}'

    # No frontmatter, add at beginning
    return f'{import_block}\n\n{content}'

def convert_frontmatter(content: str) -> str:
    """Convert Hugo frontmatter to Starlight format"""
    # Match frontmatter block
    fm_match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not fm_match:
        return content

    frontmatter = fm_match.group(1)
    rest = content[fm_match.end():]

    # Remove Hugo-specific params block
    frontmatter = re.sub(r'\nparams:\n  seo:\n    description:.*?\n    image:.*?\n', '\n', frontmatter, flags=re.DOTALL)
    frontmatter = re.sub(r'\nparams:\n  seo:\n    description:.*?\n', '\n', frontmatter, flags=re.DOTALL)
    frontmatter = re.sub(r'\nparams:.*?\n(?=\w|\Z)', '\n', frontmatter, flags=re.DOTALL)

    # Clean up multiple blank lines
    frontmatter = re.sub(r'\n{3,}', '\n\n', frontmatter)
    frontmatter = frontmatter.strip()

    return f'---\n{frontmatter}\n---{rest}'

def process_file(filepath: Path, dry_run: bool = False) -> tuple[bool, bool]:
    """
    Process a single markdown file.
    Returns (was_modified, needs_rename_to_mdx)
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        original = f.read()

    content = original

    # Convert frontmatter first
    content = convert_frontmatter(content)

    # Convert anchor shortcodes
    content = re.sub(r'{{<\s*anchor\s+"([^"]+)"\s*>}}', convert_anchor, content)

    # Convert pr shortcodes
    content = re.sub(r'{{<\s*pr\s+([^>]+)>}}', convert_pr, content)

    # Convert ghuser shortcodes
    content = re.sub(r'{{<\s*ghuser\s+([^>]+)>}}', convert_ghuser, content)

    # Convert docref shortcodes
    content = re.sub(r'{{<\s*docref\s+([^>]+)>}}', convert_docref, content)

    # Convert apiref shortcodes
    content = re.sub(r'{{<\s*apiref\s+([^>]+)>}}', convert_apiref, content)

    # Convert apiclass shortcodes
    content = re.sub(r'{{<\s*apiclass\s+([^>]+)>}}', convert_apiclass, content)

    # Convert apistruct shortcodes
    content = re.sub(r'{{<\s*apistruct\s+([^>]+)>}}', convert_apistruct, content)

    # Convert collapse shortcodes (with content)
    content = re.sub(
        r'{{<\s*collapse\s*([^>]*?)>}}(.*?){{<\s*/collapse\s*>}}',
        convert_collapse,
        content,
        flags=re.DOTALL
    )

    # Convert math shortcodes (with content)
    content = re.sub(
        r'{{<\s*math\s*>}}(.*?){{<\s*/math\s*>}}',
        convert_math,
        content,
        flags=re.DOTALL
    )

    # Convert break shortcodes
    content = re.sub(r'{{<\s*break\s*>}}', convert_break, content)

    # Convert imgtable shortcodes (with content)
    content = re.sub(
        r'{{<\s*imgtable\s*>}}(.*?){{<\s*/imgtable\s*>}}',
        convert_imgtable,
        content,
        flags=re.DOTALL
    )

    # Convert feature-grid shortcodes (with content)
    content = re.sub(
        r'{{<\s*feature-grid\s*>}}(.*?){{<\s*/feature-grid\s*>}}',
        convert_feature_grid,
        content,
        flags=re.DOTALL
    )

    # Convert getting-started-grid shortcodes (with content)
    content = re.sub(
        r'{{<\s*getting-started-grid\s*>}}(.*?){{<\s*/getting-started-grid\s*>}}',
        convert_getting_started_grid,
        content,
        flags=re.DOTALL
    )

    # Convert img shortcodes
    content = re.sub(r'{{<\s*img\s+([^>]+)>}}', convert_img, content)

    # Remove redirect shortcodes (handled by Netlify redirects)
    content = re.sub(r'{{<\s*redirect\s+[^>]+>}}\s*', '', content)

    # Remove seo shortcodes (handled by Starlight)
    content = re.sub(r'{{<\s*seo\s*[^>]*>}}\s*', '', content)

    # Check if file needs MDX
    file_needs_mdx = needs_mdx(content)

    # Add imports if needed
    if file_needs_mdx:
        imports = get_required_imports(content)
        content = add_imports_to_frontmatter(content, imports)

    was_modified = content != original

    if was_modified and not dry_run:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

    return was_modified, file_needs_mdx

def main():
    import argparse
    parser = argparse.ArgumentParser(description='Migrate Hugo shortcodes to Astro')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be changed without modifying files')
    parser.add_argument('--verbose', '-v', action='store_true', help='Show detailed output')
    parser.add_argument('path', nargs='?', default='src/content/docs', help='Path to process')
    args = parser.parse_args()

    base_path = Path(args.path)
    if not base_path.exists():
        print(f"Error: Path {base_path} does not exist")
        sys.exit(1)

    modified_count = 0
    mdx_needed = []

    for filepath in base_path.rglob('*.md'):
        was_modified, needs_mdx = process_file(filepath, dry_run=args.dry_run)

        if was_modified:
            modified_count += 1
            if args.verbose:
                print(f"Modified: {filepath}")

        if needs_mdx:
            mdx_needed.append(filepath)

    print(f"\nSummary:")
    print(f"  Files modified: {modified_count}")
    print(f"  Files needing MDX conversion: {len(mdx_needed)}")

    if mdx_needed and args.verbose:
        print("\nFiles that need .mdx extension:")
        for f in mdx_needed:
            print(f"  {f}")

    if args.dry_run:
        print("\n(Dry run - no files were actually modified)")

if __name__ == '__main__':
    main()
