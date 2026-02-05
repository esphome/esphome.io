#!/usr/bin/env python3
"""
Convert markdown files to MDX with Astro components.

This script converts:
- [esphome#123](https://github.com/esphome/esphome/pull/123) -> <PR number={123} />
- [esphome-docs#123](...) -> <PR number={123} repo="esphome-docs" />
- [@username](https://github.com/username) -> <GHUser name="username" />
- HTML comments <!-- --> -> MDX comments {/* */}
- Escapes < > in prose that aren't tags
"""

import os
import re
import sys
from pathlib import Path


def convert_pr_links(content: str) -> tuple[str, bool]:
    """Convert PR markdown links to <PR /> components."""
    # Pattern: [esphome#123](https://github.com/esphome/esphome/pull/123)
    # or [esphome-docs#123](https://github.com/esphome/esphome-docs/pull/123)
    pattern = r'\[esphome(-\w+)?#(\d+)\]\(https://github\.com/esphome/esphome(?:-\w+)?/pull/\d+\)'

    has_pr = bool(re.search(pattern, content))

    def replace_pr(match):
        repo_suffix = match.group(1)  # e.g., "-docs" or None
        number = match.group(2)
        if repo_suffix:
            repo = f"esphome{repo_suffix}"
            return f'<PR number={{{number}}} repo="{repo}" />'
        return f'<PR number={{{number}}} />'

    content = re.sub(pattern, replace_pr, content)
    return content, has_pr


def convert_ghuser_links(content: str) -> tuple[str, bool]:
    """Convert GitHub user markdown links to <GHUser /> components."""
    # Pattern: [@username](https://github.com/username)
    pattern = r'\[@([a-zA-Z0-9_-]+)\]\(https://github\.com/[a-zA-Z0-9_-]+\)'

    has_ghuser = bool(re.search(pattern, content))

    def replace_ghuser(match):
        username = match.group(1)
        return f'<GHUser name="{username}" />'

    content = re.sub(pattern, replace_ghuser, content)
    return content, has_ghuser


def convert_html_comments(content: str) -> str:
    """Convert HTML comments to MDX comments."""
    # Pattern: <!-- comment -->
    pattern = r'<!--(.*?)-->'

    def replace_comment(match):
        comment = match.group(1)
        return '{/*' + comment + '*/}'

    return re.sub(pattern, replace_comment, content, flags=re.DOTALL)


def escape_angle_brackets_in_prose(content: str) -> str:
    """Escape angle brackets that aren't part of HTML/JSX tags or code blocks."""
    lines = content.split('\n')
    result = []
    in_code_block = False
    in_frontmatter = False
    frontmatter_count = 0

    for line in lines:
        # Track frontmatter
        if line.strip() == '---':
            frontmatter_count += 1
            in_frontmatter = frontmatter_count == 1
            result.append(line)
            continue

        if in_frontmatter and frontmatter_count < 2:
            result.append(line)
            continue

        # Track code blocks
        if line.strip().startswith('```'):
            in_code_block = not in_code_block
            result.append(line)
            continue

        if in_code_block:
            result.append(line)
            continue

        # Skip inline code
        # For prose, escape < that look like they might cause issues
        # but not valid JSX components or HTML tags

        # Escape angle bracket URLs like <http://...>
        line = re.sub(r'<(https?://[^>]+)>', r'[\1](\1)', line)

        # Escape C++ templates like optional<T>, vector<int>
        # But be careful not to break actual JSX
        line = re.sub(r'(\w+)<(\w*)>', r'`\1<\2>`', line)

        result.append(line)

    return '\n'.join(result)


def add_imports(content: str, has_pr: bool, has_ghuser: bool) -> str:
    """Add component imports after frontmatter."""
    if not has_pr and not has_ghuser:
        return content

    imports = []
    if has_pr:
        imports.append('import PR from "@components/PR.astro";')
    if has_ghuser:
        imports.append('import GHUser from "@components/GHUser.astro";')

    import_block = '\n'.join(imports) + '\n'

    # Find end of frontmatter
    parts = content.split('---', 2)
    if len(parts) >= 3:
        return f"---{parts[1]}---\n\n{import_block}\n{parts[2]}"

    return import_block + content


def convert_file(filepath: Path, dry_run: bool = False) -> bool:
    """Convert a single markdown file to MDX."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Convert components
    content, has_pr = convert_pr_links(content)
    content, has_ghuser = convert_ghuser_links(content)

    # Only proceed if we have components to use
    if not has_pr and not has_ghuser:
        return False

    # Fix MDX compatibility issues
    content = convert_html_comments(content)
    content = escape_angle_brackets_in_prose(content)

    # Add imports
    content = add_imports(content, has_pr, has_ghuser)

    if content == original:
        return False

    if dry_run:
        print(f"Would convert: {filepath}")
        return True

    # Write new content
    new_path = filepath.with_suffix('.mdx')
    with open(new_path, 'w', encoding='utf-8') as f:
        f.write(content)

    # Remove old file if different path
    if new_path != filepath:
        filepath.unlink()

    print(f"Converted: {filepath} -> {new_path}")
    return True


def main():
    docs_root = Path('/workspaces/esphome-docs/src/content/docs')

    # Process changelog files first (they have the most PR/GHUser references)
    changelog_dir = docs_root / 'changelog'

    dry_run = '--dry-run' in sys.argv

    if dry_run:
        print("DRY RUN - no files will be modified\n")

    converted = 0

    # Convert changelog files
    for filepath in changelog_dir.glob('*.md'):
        if filepath.name == 'index.md':
            continue  # Skip index files for now
        if convert_file(filepath, dry_run):
            converted += 1

    print(f"\n{'Would convert' if dry_run else 'Converted'}: {converted} files")


if __name__ == '__main__':
    main()
