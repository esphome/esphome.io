#!/usr/bin/env python3
"""
Handle remaining shortcodes that weren't in the initial migration.
"""

import re
from pathlib import Path

def convert_option(match):
    """Convert {{< option "name" >}}content{{< /option >}} to markdown definition list style"""
    option_name = match.group(1)
    content = match.group(2).strip()
    return f'**`{option_name}`**\n: {content}\n'

def convert_changelogs(match):
    """Remove changelogs shortcode - Starlight handles this automatically"""
    return ''

def convert_include(match):
    """Convert include shortcode to a comment noting it needs manual handling"""
    filename = match.group(1)
    return f'{{/* TODO: Include content from {filename} */}}'

def convert_html_file(match):
    """Convert html_file shortcode to a comment"""
    return '<!-- HTML file inclusion not supported -->'

def convert_api_key_input(match):
    """Convert api-key-input shortcode to a placeholder"""
    return '<div class="api-key-input">API Key Input Component</div>'

def convert_render_automations(match):
    """Convert render-automations shortcode to a comment"""
    return '<!-- Automations rendered here -->'

def convert_remaining_img(match):
    """Convert any remaining img shortcodes"""
    content = match.group(1)
    src_match = re.search(r'src=["\']([^"\']+)["\']', content)
    alt_match = re.search(r'alt=["\']([^"\']+)["\']', content)

    if not src_match:
        return match.group(0)

    src = src_match.group(1)
    alt = alt_match.group(1) if alt_match else ''

    return f'![{alt}]({src})'

def process_file(filepath: Path) -> bool:
    """Process a single file. Returns True if modified."""
    with open(filepath, 'r', encoding='utf-8') as f:
        original = f.read()

    content = original

    # Convert option shortcodes
    content = re.sub(
        r'{{<\s*option\s+"([^"]+)"\s*>}}(.*?){{<\s*/option\s*>}}',
        convert_option,
        content,
        flags=re.DOTALL
    )

    # Remove changelogs shortcodes
    content = re.sub(r'{{<\s*changelogs\s*>}}', convert_changelogs, content)

    # Convert include shortcodes
    content = re.sub(r'{{<\s*include\s+"([^"]+)"\s*>}}', convert_include, content)

    # Convert html_file shortcodes
    content = re.sub(r'{{<\s*html_file\s+[^>]+>}}', convert_html_file, content)

    # Convert api-key-input shortcodes
    content = re.sub(r'{{<\s*api-key-input\s*>}}', convert_api_key_input, content)

    # Convert render-automations shortcodes
    content = re.sub(r'{{<\s*render-automations\s*>}}', convert_render_automations, content)

    # Convert any remaining img shortcodes
    content = re.sub(r'{{<\s*img\s+([^>]+)>}}', convert_remaining_img, content)

    # Remove any https shortcodes that slipped through (likely false positives from URLs)
    # These aren't real shortcodes, just URLs that look like them

    was_modified = content != original

    if was_modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

    return was_modified

def main():
    base_path = Path('src/content/docs')
    modified_count = 0

    for filepath in base_path.rglob('*.md'):
        if process_file(filepath):
            modified_count += 1
            print(f'Modified: {filepath}')

    for filepath in base_path.rglob('*.mdx'):
        if process_file(filepath):
            modified_count += 1
            print(f'Modified: {filepath}')

    print(f'\nTotal files modified: {modified_count}')

if __name__ == '__main__':
    main()
