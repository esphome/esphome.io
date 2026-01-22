#!/usr/bin/env python3
"""
Script to fix markdown formatting in ESPHome documentation.

Fixes applied:
- Wrap lines longer than 120 characters
- Remove unneeded consecutive spaces
- Ensure all list markers have exactly one space after them
- Reduce consecutive blank lines to a single blank line
- Ensure blank lines around headings, fenced code blocks, and lists
- Convert numbered lists to use 1. instead of sequential numbers

Code blocks and tables are preserved without modification.
"""

import argparse
import os
import re
import sys
from pathlib import Path
from typing import List, Tuple


def is_in_frontmatter(lines: List[str], line_idx: int) -> bool:
    """Check if the current line is inside YAML frontmatter."""
    if line_idx >= len(lines):
        return False

    # Look for frontmatter boundaries
    frontmatter_start = -1
    frontmatter_end = -1

    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped == "---":
            if frontmatter_start == -1:
                frontmatter_start = i
            elif frontmatter_end == -1:
                frontmatter_end = i
                break

    if frontmatter_start != -1 and frontmatter_end != -1:
        return frontmatter_start < line_idx < frontmatter_end

    return False


def is_in_code_block(lines: List[str], line_idx: int) -> bool:
    """Check if the current line is inside a code block."""
    code_block_count = 0
    for i in range(line_idx + 1):
        line = lines[i].strip()
        if line.startswith("```"):
            code_block_count += 1
    return code_block_count % 2 == 1


def is_table_line(line: str) -> bool:
    """Check if a line is part of a markdown table."""
    stripped = line.strip()
    # Table header separator (e.g., |---|---|)
    if re.match(r"^\|[\s\-\|:]+\|$", stripped):
        return True
    # Table row (contains | but not just at start/end)
    if "|" in stripped and stripped.count("|") >= 2:
        return True
    return False


def is_in_table(lines: List[str], line_idx: int) -> bool:
    """Check if the current line is part of a table by looking at context."""
    if line_idx >= len(lines):
        return False

    current_line = lines[line_idx].strip()
    if not current_line or not is_table_line(current_line):
        return False

    # Look for table context (header separator above or below)
    for offset in [-2, -1, 1, 2]:
        check_idx = line_idx + offset
        if 0 <= check_idx < len(lines):
            check_line = lines[check_idx].strip()
            if re.match(r"^\|[\s\-\|:]+\|$", check_line):
                return True

    return False


def process_line_with_inline_code(line: str) -> str:
    """Process a line that may contain inline code, preserving code content."""
    if "`" not in line:
        return remove_consecutive_spaces(line)

    # Split by backticks and process alternating segments
    parts = line.split("`")
    processed_parts = []

    for i, part in enumerate(parts):
        if i % 2 == 0:  # Outside code
            # Apply both consecutive space removal and punctuation spacing fix
            part = remove_consecutive_spaces(part)
            part = fix_punctuation_spacing(part)
            processed_parts.append(part)
        else:  # Inside code - preserve as-is
            processed_parts.append(part)

    return "`".join(processed_parts)


def get_list_indent(line: str) -> Tuple[str, str, str]:
    """Extract list indentation, marker, and content from a line.
    Returns (indent, marker, content) where marker includes the space after it.
    """
    stripped = line.lstrip()
    indent = line[: len(line) - len(stripped)]

    # Check for bullet lists
    bullet_match = re.match(r"^([-*+])\s+(.*)$", stripped)
    if bullet_match:
        marker = bullet_match.group(1) + " "
        content = bullet_match.group(2)
        return indent, marker, content

    # Check for numbered lists (treat all as 1.)
    number_match = re.match(r"^(\d+\.)\s+(.*)$", stripped)
    if number_match:
        marker = "1. "  # Always use 1. for numbered lists
        content = number_match.group(2)
        return indent, marker, content

    return "", "", line


def is_url(word: str) -> bool:
    """Check if a word is a URL that should not be split."""
    return any(
        word.startswith(protocol) for protocol in ["http://", "https://", "ftp://"]
    )


def find_shortcode_boundaries(text: str) -> List[Tuple[int, int]]:
    """Find all shortcode boundaries in text. Returns list of (start, end) positions."""
    boundaries = []
    i = 0
    while i < len(text):
        start = text.find("{{<", i)
        if start == -1:
            break
        end = text.find(">}}", start)
        if end == -1:
            break
        boundaries.append((start, end + 3))  # +3 for '>}}'
        i = end + 3
    return boundaries


def split_preserving_shortcodes(text: str) -> List[str]:
    """Split text into words while preserving shortcodes as single units."""
    shortcode_boundaries = find_shortcode_boundaries(text)
    if not shortcode_boundaries:
        return text.split()

    parts = []
    last_end = 0

    for start, end in shortcode_boundaries:
        # Add words before the shortcode
        before = text[last_end:start].strip()
        if before:
            parts.extend(before.split())

        # Add the shortcode as a single unit
        shortcode = text[start:end]
        parts.append(shortcode)

        last_end = end

    # Add any remaining text after the last shortcode
    after = text[last_end:].strip()
    if after:
        parts.extend(after.split())

    return parts


def is_shortcode(word: str) -> bool:
    """Check if a word is a Hugo shortcode that should not be split."""
    return word.startswith("{{<") and word.endswith(">}}")


def break_long_shortcode(shortcode: str, max_length: int, indent: str) -> List[str]:
    """Break a long shortcode into multiple lines at safe breakpoints between quoted parameters."""
    if len(shortcode) <= max_length:
        return [shortcode]

    # Find safe breakpoints (spaces that are not inside quotes)
    breakpoints = []
    in_quotes = False
    quote_char = None

    for i, char in enumerate(shortcode):
        if char in ['"', "'"] and (i == 0 or shortcode[i - 1] != "\\"):
            if not in_quotes:
                in_quotes = True
                quote_char = char
            elif char == quote_char:
                in_quotes = False
                quote_char = None
        elif char == " " and not in_quotes and i > 3:  # Don't break right after {{<
            breakpoints.append(i)

    if not breakpoints:
        return [shortcode]  # No safe breakpoints found

    # Build lines by accumulating content until we exceed max_length
    lines = []
    current_start = 0

    for i, breakpoint in enumerate(breakpoints):
        # Check if we can fit more content on current line
        content_so_far = shortcode[current_start:breakpoint]

        if current_start == 0:
            # First line - no indent
            if len(content_so_far) <= max_length:
                continue  # Can fit more
            else:
                # Need to break at previous breakpoint or here if it's the first
                if i > 0:
                    prev_breakpoint = breakpoints[i - 1]
                    lines.append(shortcode[current_start:prev_breakpoint])
                    current_start = prev_breakpoint + 1
                else:
                    # Must break here even though it's long
                    lines.append(content_so_far)
                    current_start = breakpoint + 1
        else:
            # Continuation line - with indent
            indented_content = indent + content_so_far
            if len(indented_content) <= max_length:
                continue  # Can fit more
            else:
                # Need to break at previous breakpoint
                if i > 0:
                    prev_breakpoint = breakpoints[i - 1]
                    prev_content = shortcode[current_start:prev_breakpoint]
                    lines.append(indent + prev_content)
                    current_start = prev_breakpoint + 1
                else:
                    # Must break here
                    lines.append(indent + content_so_far)
                    current_start = breakpoint + 1

    # Add remaining content
    remaining = shortcode[current_start:].strip()
    if remaining:
        if lines:
            lines.append(indent + remaining)
        else:
            lines.append(remaining)

    return lines if lines else [shortcode]


def is_atomic_word(word: str) -> bool:
    """Check if a word should be treated as an atomic unit (URL but not shortcode now)."""
    return is_url(word)  # Shortcodes can now be broken, so only URLs are atomic


def wrap_line(line: str, max_length: int = 120) -> List[str]:
    """Wrap a line to max_length, preserving markdown formatting and not splitting URLs."""
    if len(line) <= max_length:
        return [line]

    # Note: We now handle shortcodes intelligently instead of skipping the entire line

    # Check if this is a list item
    indent, marker, content = get_list_indent(line)

    if marker:  # This is a list item
        if not content or len(content) <= 20:
            return [line]

        # Calculate continuation indent (align with content after marker)
        continuation_indent = indent + " " * len(marker)

        # Split content into words while preserving shortcodes
        words = split_preserving_shortcodes(content)
        if not words:
            return [line]

        wrapped_lines = []
        current_line = indent + marker + words[0]

        for word in words[1:]:
            # Check if adding this word would exceed the limit
            potential_line = current_line + " " + word
            if len(potential_line) <= max_length:
                current_line = potential_line
            else:
                # If the word is a long shortcode, try to break it
                if is_shortcode(word) and len(word) > max_length:
                    wrapped_lines.append(current_line)
                    broken_shortcode = break_long_shortcode(
                        word, max_length, continuation_indent
                    )
                    wrapped_lines.extend(broken_shortcode)
                    current_line = continuation_indent.rstrip()  # Reset for next word
                # If the word is atomic (URL) and adding it would exceed the limit,
                # but the current line isn't empty, wrap before the atomic word
                elif (
                    is_atomic_word(word)
                    and current_line.strip() != (indent + marker).strip()
                ):
                    wrapped_lines.append(current_line)
                    current_line = continuation_indent + word
                # If it's not atomic or current line is just the marker, add normally
                else:
                    wrapped_lines.append(current_line)
                    current_line = continuation_indent + word

        if current_line:
            wrapped_lines.append(current_line)

        return wrapped_lines

    else:  # Regular line
        # Preserve leading whitespace
        leading_space = len(line) - len(line.lstrip())
        indent = line[:leading_space]
        content = line[leading_space:]

        # Don't wrap very short content
        if len(content) <= 20:
            return [line]

        words = split_preserving_shortcodes(content)
        if not words:
            return [line]

        wrapped_lines = []
        current_line = indent + words[0]

        for word in words[1:]:
            # Check if adding this word would exceed the limit
            potential_line = current_line + " " + word
            if len(potential_line) <= max_length:
                current_line = potential_line
            else:
                # If the word is a long shortcode, try to break it
                if is_shortcode(word) and len(word) > max_length:
                    wrapped_lines.append(current_line)
                    broken_shortcode = break_long_shortcode(word, max_length, indent)
                    wrapped_lines.extend(broken_shortcode)
                    current_line = indent.rstrip()  # Reset for next word
                # If the word is atomic (URL) and adding it would exceed the limit,
                # but the current line isn't empty, wrap before the atomic word
                elif is_atomic_word(word) and current_line.strip() != indent.strip():
                    wrapped_lines.append(current_line)
                    current_line = indent + word
                # If it's not atomic or current line is just indent, add normally
                else:
                    wrapped_lines.append(current_line)
                    current_line = indent + word

        if current_line:
            wrapped_lines.append(current_line)

        return wrapped_lines


def fix_list_markers(line: str) -> str:
    """Ensure list markers have exactly one space after them and convert numbered lists to 1."""
    # Match list markers: -, *, +, or numbered lists
    patterns = [
        (r"^(\s*)([-*+])(\s+)", r"\1\2 "),  # Bullet lists
        (r"^(\s*)(\d+\.)(\s+)", r"\g<1>1. "),  # Numbered lists -> convert to 1.
    ]

    for pattern, replacement in patterns:
        line = re.sub(pattern, replacement, line)

    return line


def remove_consecutive_spaces(line: str) -> str:
    """Remove consecutive spaces, but preserve intentional formatting."""
    # Don't modify lines that are entirely whitespace
    if not line.strip():
        return line

    # Preserve leading whitespace
    leading_space = len(line) - len(line.lstrip())
    indent = line[:leading_space]
    content = line[leading_space:]

    # Replace multiple spaces with single space
    content = re.sub(r" {2,}", " ", content)

    return indent + content


def fix_punctuation_spacing(line: str) -> str:
    """Remove spaces immediately before commas and periods."""
    # Don't modify lines that are entirely whitespace
    if not line.strip():
        return line

    # Remove spaces before commas and periods
    # Use word boundaries to avoid affecting things like version numbers (1.0) or decimals
    line = re.sub(r"\s+([,.])(?=\s|$)", r"\1", line)

    return line


def is_heading(line: str) -> bool:
    """Check if a line is a markdown heading."""
    stripped = line.strip()
    return stripped.startswith("#") and " " in stripped


def is_fenced_code_block_start(line: str) -> bool:
    """Check if a line starts a fenced code block."""
    return line.strip().startswith("```") and len(line.strip()) > 3


def is_fenced_code_block_end(line: str) -> bool:
    """Check if a line ends a fenced code block."""
    stripped = line.strip()
    return stripped == "```" or (stripped.startswith("```") and len(stripped) == 3)


def is_list_item(line: str) -> bool:
    """Check if a line is a list item."""
    stripped = line.strip()
    if not stripped:
        return False

    # Check for bullet lists
    if re.match(r"^[-*+]\s+", stripped):
        return True

    # Check for numbered lists
    if re.match(r"^\d+\.\s+", stripped):
        return True

    return False


def is_list_item_continuation(line: str, previous_line: str) -> bool:
    """Check if a line is a continuation of a list item.
    Continuations lines are part of the list item that came before
    it if the line indentation is 2 or 3 spaces more than the list item line.
    This should not strip lines to check for indentation.
    """
    line_indent = len(line) - len(line.lstrip())
    previous_indent = len(previous_line) - len(previous_line.lstrip())
    return line_indent in {previous_indent + 2, previous_indent + 3}


def ensure_blank_lines_around_elements(lines: List[str]) -> List[str]:
    """Ensure headings, fenced code blocks, and lists are surrounded by blank lines."""
    if not lines:
        return lines

    result = []
    i = 0

    while i < len(lines):
        line = lines[i]
        if is_in_code_block(lines, i):
            result.append(line)
            i += 1
            continue

        # Check if current line needs blank line before
        needs_blank_before = (
            is_heading(line)
            or is_fenced_code_block_start(line)
            or (is_list_item(line) and i > 0 and not is_list_item(lines[i - 1]))
        )

        # Check if current line needs blank line after
        needs_blank_after = (
            is_heading(line)
            or is_fenced_code_block_end(line)
            or (
                is_list_item(line)
                and i < len(lines) - 1
                and not is_list_item(lines[i + 1])
                and lines[i + 1].strip()
                and not is_list_item_continuation(lines[i + 1], line)
            )
        )

        # Add blank line before if needed
        if needs_blank_before and result and result[-1].strip():
            result.append("")

        result.append(line)

        # Add blank line after if needed
        if needs_blank_after and i < len(lines) - 1 and lines[i + 1].strip():
            result.append("")

        i += 1

    return result


def fix_markdown_file(file_path: Path) -> bool:
    """Fix a single markdown file. Returns True if changes were made."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return False

    # Remove trailing newlines and convert to list without \n
    original_lines = [line.rstrip("\n\r") for line in lines]
    fixed_lines = []

    i = 0
    while i < len(original_lines):
        line = original_lines[i]

        # Skip processing if we're in frontmatter, code block, or table
        if (
            is_in_frontmatter(original_lines, i)
            or is_in_code_block(original_lines, i)
            or is_in_table(original_lines, i)
        ):
            fixed_lines.append(line)
            i += 1
            continue

        # Fix list markers
        line = fix_list_markers(line)

        # Process line with inline code or remove consecutive spaces
        if "`" in line:
            line = process_line_with_inline_code(line)
        else:
            line = remove_consecutive_spaces(line)

        # Fix punctuation spacing (remove spaces before commas and periods)
        line = fix_punctuation_spacing(line)

        # Wrap long lines
        # disabled for now until we figure it out better
        # if len(line) > 120:
        #     wrapped = wrap_line(line, 120)
        #     fixed_lines.extend(wrapped)
        # else:
        #     fixed_lines.append(line)

        fixed_lines.append(line)

        i += 1

    # Ensure blank lines around headings, code blocks, and lists
    fixed_lines = ensure_blank_lines_around_elements(fixed_lines)

    # Reduce consecutive blank lines to single blank line
    final_lines = []
    blank_count = 0

    for line in fixed_lines:
        if not line.strip():
            blank_count += 1
            if blank_count == 1:
                final_lines.append("")
        else:
            blank_count = 0
            final_lines.append(line)

    # Remove trailing blank lines
    while final_lines and not final_lines[-1].strip():
        final_lines.pop()

    # Check if changes were made
    if final_lines != original_lines:
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                for line in final_lines:
                    f.write(line + "\n")
            return True
        except Exception as e:
            print(f"Error writing {file_path}: {e}")
            return False

    return False


def find_markdown_files(content_dir: Path) -> List[Path]:
    """Find all markdown files in the content directory."""
    markdown_files = []
    for root, dirs, files in os.walk(content_dir):
        for file in files:
            if file.endswith(".md"):
                markdown_files.append(Path(root) / file)
    return sorted(markdown_files)


def main():
    """Main function to process markdown files."""
    parser = argparse.ArgumentParser(
        description="Fix markdown formatting in ESPHome documentation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""Examples:
  python3 fix_markdown.py                           # Process all files in content/
  python3 fix_markdown.py --file content/api.md    # Process a single file
  python3 fix_markdown.py -f components/sensor/dht.md  # Process relative to content/""",
    )

    parser.add_argument(
        "--file",
        "-f",
        type=str,
        help="Process a single markdown file (path relative to content/ or absolute path)",
    )

    args = parser.parse_args()

    content_dir = Path(os.getcwd()) / "content"

    if args.file:
        # Process single file
        file_path = Path(args.file)

        # If it's not absolute, make it relative to content directory
        if not file_path.is_absolute():
            file_path = content_dir / file_path

        if not file_path.exists():
            print(f"File not found: {file_path}")
            sys.exit(1)

        if not file_path.suffix == ".md":
            print(f"File is not a markdown file: {file_path}")
            sys.exit(1)

        print(f"Processing single file: {file_path}")

        try:
            if fix_markdown_file(file_path):
                print(f"Fixed: {file_path}")
            else:
                print(f"No changes needed: {file_path}")
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
            sys.exit(1)

    else:
        # Process all files in content directory
        if not content_dir.exists():
            print(f"Content directory not found: {content_dir}")
            sys.exit(1)

        markdown_files = find_markdown_files(content_dir)

        if not markdown_files:
            print("No markdown files found in content directory")
            return

        print(f"Found {len(markdown_files)} markdown files")

        modified_count = 0
        for file_path in markdown_files:
            try:
                if fix_markdown_file(file_path):
                    print(f"Fixed: {file_path.relative_to(content_dir)}")
                    modified_count += 1
                else:
                    print(f"No changes: {file_path.relative_to(content_dir)}")
            except Exception as e:
                print(f"Error processing {file_path}: {e}")

        print(f"\nProcessed {len(markdown_files)} files")
        print(f"Modified {modified_count} files")


if __name__ == "__main__":
    main()
