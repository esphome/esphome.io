#!/usr/bin/env python3
"""
Migrate Starlight admonitions to GitHub blockquote alerts.

Converts:
  :::note → > [!NOTE]
  :::tip → > [!TIP]
  :::caution → > [!CAUTION]
"""

import re
import sys
from pathlib import Path
from typing import Tuple

# Mapping of old syntax to new alert types
ADMONITION_MAP = {
    'note': 'NOTE',
    'tip': 'TIP',
    'caution': 'CAUTION',
}


def convert_admonition_block(match: re.Match) -> str:
    """
    Convert a single admonition block to GitHub blockquote alert format.

    Args:
        match: Regex match object containing the admonition block

    Returns:
        Converted blockquote alert string
    """
    admonition_type = match.group(1)
    content = match.group(2)

    # Get the alert type (uppercase)
    alert_type = ADMONITION_MAP[admonition_type]

    # Start with the alert header
    result = [f"> [!{alert_type}]"]

    # Process each line of content
    lines = content.split('\n')
    for line in lines:
        if line.strip():  # Non-empty line
            result.append(f"> {line}")
        else:  # Empty line - maintain blockquote structure
            result.append(">")

    return '\n'.join(result)


def convert_file(file_path: Path) -> Tuple[int, bool]:
    """
    Convert all admonitions in a file to GitHub blockquote alerts.

    Args:
        file_path: Path to the file to convert

    Returns:
        Tuple of (number of conversions made, success boolean)
    """
    try:
        # Read the file
        content = file_path.read_text(encoding='utf-8')

        # Pattern to match admonition blocks
        # Matches: :::TYPE\n...content...\n:::
        pattern = r'^:::(note|tip|caution)\n(.*?)\n:::$'

        # Count matches before conversion
        matches = list(re.finditer(pattern, content, re.MULTILINE | re.DOTALL))
        conversion_count = len(matches)

        if conversion_count == 0:
            return 0, True

        # Perform the conversion
        converted_content = re.sub(
            pattern,
            convert_admonition_block,
            content,
            flags=re.MULTILINE | re.DOTALL
        )

        # Write back to file
        file_path.write_text(converted_content, encoding='utf-8')

        return conversion_count, True

    except Exception as e:
        print(f"ERROR processing {file_path}: {e}", file=sys.stderr)
        return 0, False


def main():
    """Main execution function."""
    # Get all MDX files in the docs directory
    docs_dir = Path('/workspaces/esphome-docs/src/content/docs')

    if not docs_dir.exists():
        print(f"ERROR: Documentation directory not found: {docs_dir}", file=sys.stderr)
        sys.exit(1)

    mdx_files = list(docs_dir.rglob('*.mdx'))

    print(f"Found {len(mdx_files)} MDX files to process")
    print("=" * 60)

    total_conversions = 0
    files_converted = 0
    files_failed = 0

    for file_path in sorted(mdx_files):
        conversions, success = convert_file(file_path)

        if not success:
            files_failed += 1
            continue

        if conversions > 0:
            files_converted += 1
            total_conversions += conversions
            relative_path = file_path.relative_to(docs_dir)
            print(f"✓ {relative_path}: {conversions} conversion(s)")

    print("=" * 60)
    print(f"Summary:")
    print(f"  Total files processed: {len(mdx_files)}")
    print(f"  Files converted: {files_converted}")
    print(f"  Files failed: {files_failed}")
    print(f"  Total conversions: {total_conversions}")

    if files_failed > 0:
        sys.exit(1)


if __name__ == '__main__':
    main()
