#!/usr/bin/env python3
"""
ESPHome Changelog Assembler

Assembles final changelog from template and AI-generated responses.
Designed to be called by Claude Code skill.

Usage:
    python script/assemble_changelog.py 2025.11.0
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from datetime import datetime
import json
from pathlib import Path
import re
import sys


@dataclass
class PullRequest:
    """Pull request metadata"""

    number: int
    title: str
    body: str
    author: str
    labels: list[str]
    url: str
    state: str
    merged_at: str | None = None


def load_pr_data(version: str) -> dict:
    """Load PR data from JSON file"""
    pr_data_file = Path("script/cache") / version / "pr_data.json"

    if not pr_data_file.exists():
        print(f"Error: PR data not found: {pr_data_file}")
        print(f"\nPlease run: python script/discover_prs.py {version}")
        sys.exit(1)

    with open(pr_data_file) as f:
        return json.load(f)


def load_prs_from_data(pr_data: dict) -> list[PullRequest]:
    """Convert PR data JSON to PullRequest objects"""
    return [
        PullRequest(
            number=pr_dict["number"],
            title=pr_dict["title"],
            body=pr_dict["body"],
            author=pr_dict["author"],
            labels=pr_dict["labels"],
            url=pr_dict["url"],
            state=pr_dict["state"],
            merged_at=pr_dict.get("merged_at"),
        )
        for pr_dict in pr_data["all_prs"]
    ]


def replace_marker_content(template: str, marker: str, content: str) -> str:
    """Replace content between <!-- MARKER_START --> and <!-- MARKER_END -->"""
    pattern = f"<!-- {marker}_START -->.*?<!-- {marker}_END -->"
    replacement = f"<!-- {marker}_START -->\n{content}\n<!-- {marker}_END -->"

    result, count = re.subn(pattern, replacement, template, flags=re.DOTALL)

    if count == 0:
        print(f"Warning: Marker {marker} not found in template")
    else:
        print(f"✓ Replaced {marker}")

    return result


def format_pr_list(prs: list[PullRequest]) -> str:
    """Format PRs as markdown list"""
    if not prs:
        return "None"

    lines = []
    for pr in prs:
        # Extract component from title if present [component]
        match = re.match(r"\[([^\]]+)\]\s*(.*)", pr.title)
        if match:
            component = match.group(1)
            title = match.group(2)
        else:
            component = ""
            title = pr.title

        # Format: - [component] Description [esphome#1234](url) by [@author](url)
        author_url = f"https://github.com/{pr.author}"
        pr_url = pr.url.replace("api.github.com/repos", "github.com")

        if component:
            line = f"- [{component}] {title} [esphome#{pr.number}]({pr_url}) by [@{pr.author}]({author_url})"
        else:
            line = f"- {title} [esphome#{pr.number}]({pr_url}) by [@{pr.author}]({author_url})"

        lines.append(line)

    return "\n".join(lines)


def generate_auto_sections(template: str, prs: list[PullRequest]) -> str:
    """Generate auto-populated sections from PR data"""
    # Group PRs by label
    new_features = [pr for pr in prs if "new-feature" in pr.labels]
    new_components = [pr for pr in prs if "new-component" in pr.labels]
    breaking_changes = [pr for pr in prs if "breaking-change" in pr.labels]

    # Generate lists
    features_list = format_pr_list(new_features)
    components_list = format_pr_list(new_components)
    breaking_list = format_pr_list(breaking_changes)
    all_list = format_pr_list(prs)

    # Replace sections
    template = replace_marker_content(
        template, "AUTO_GENERATED_NEW_FEATURES", features_list
    )
    template = replace_marker_content(
        template, "AUTO_GENERATED_NEW_COMPONENTS", components_list
    )
    template = replace_marker_content(
        template, "AUTO_GENERATED_BREAKING_CHANGES_LIST", breaking_list
    )
    return replace_marker_content(template, "AUTO_GENERATED_ALL_CHANGES", all_list)


def replace_placeholders(template: str, version: str) -> str:
    """Replace version placeholders"""
    # Format date
    now = datetime.now()
    day = now.day
    suffix = (
        "th" if 11 <= day <= 13 else {1: "st", 2: "nd", 3: "rd"}.get(day % 10, "th")
    )
    date_str = f"{day}{suffix} {now.strftime('%B %Y')}"

    template = template.replace("{VERSION}", version)
    template = template.replace("{DATE}", date_str)

    print(f"✓ Replaced placeholders: {version}, {date_str}")

    return template


def assemble_changelog(version: str) -> bool:
    """Assemble final changelog from template and AI responses"""
    print("\n=== Assembling Changelog ===\n")

    version_dir = Path("script/cache") / version
    responses_dir = version_dir / "ai_responses"

    # Check that AI responses exist
    overview_file = responses_dir / "release_overview.md"
    if not overview_file.exists():
        print(f"Error: Missing AI response: {overview_file}")
        print("Please generate the AI responses first")
        return False

    # Load template
    template_file = Path("script/release_notes_template.md")
    if not template_file.exists():
        print(f"Error: Template not found: {template_file}")
        return False

    template = template_file.read_text()

    # Check if destination file exists and has content to preserve
    output_file = Path("content/changelog") / f"{version}.md"
    existing_imgtable = None
    existing_full_list = None
    if output_file.exists():
        existing_content = output_file.read_text()

        # Extract existing imgtable content
        imgtable_match = re.search(
            r"{{< imgtable >}}(.*?){{< /imgtable >}}", existing_content, re.DOTALL
        )
        if imgtable_match and imgtable_match.group(1).strip():
            existing_imgtable = imgtable_match.group(0)
            print("✓ Preserving existing imgtable")

        # Extract existing "Full list of changes" section
        full_list_match = re.search(
            r"## Full list of changes.*", existing_content, re.DOTALL
        )
        if full_list_match:
            existing_full_list = full_list_match.group(0)
            print("✓ Preserving existing 'Full list of changes' section")

    # Load AI responses
    overview = overview_file.read_text().strip()

    breaking_users_file = responses_dir / "breaking_changes_users.md"
    breaking_users = ""
    if breaking_users_file.exists():
        breaking_users = breaking_users_file.read_text().strip()

    breaking_devs_file = responses_dir / "breaking_changes_developers.md"
    breaking_devs = ""
    if breaking_devs_file.exists():
        breaking_devs = breaking_devs_file.read_text().strip()

    highlights_file = responses_dir / "feature_highlights.md"
    highlights = ""
    if highlights_file.exists():
        highlights = highlights_file.read_text().strip()

    # Load PR data
    pr_data = load_pr_data(version)
    prs = load_prs_from_data(pr_data)

    if not prs:
        print("Error: No PRs found in PR data")
        return False

    print(f"Loaded {len(prs)} PRs from data")

    # Replace AI-generated sections
    template = replace_marker_content(template, "RELEASE_OVERVIEW", overview)

    if highlights:
        template = replace_marker_content(template, "FEATURE_HIGHLIGHTS", highlights)

    if breaking_users:
        template = replace_marker_content(
            template, "BREAKING_CHANGES_USERS", breaking_users
        )

    if breaking_devs:
        template = replace_marker_content(
            template, "BREAKING_CHANGES_DEVELOPERS", breaking_devs
        )

    # Generate auto sections
    template = generate_auto_sections(template, prs)

    # Replace version placeholders
    template = replace_placeholders(template, version)

    # Replace imgtable if we have one preserved
    if existing_imgtable:
        template = re.sub(
            r"<!-- MANUAL: Add featured components here -->\s*{{< imgtable >}}.*?{{< /imgtable >}}",
            existing_imgtable,
            template,
            flags=re.DOTALL,
        )

    # Replace "Full list of changes" section if we have one preserved
    if existing_full_list:
        template = re.sub(
            r"## Full list of changes.*",
            existing_full_list,
            template,
            flags=re.DOTALL,
        )

    # Write output
    output_file.parent.mkdir(parents=True, exist_ok=True)
    output_file.write_text(template)
    print(f"\n✓ Changelog written to: {output_file}")

    return True


def main() -> int:
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="Assemble ESPHome changelog from AI responses",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Assemble changelog for 2025.11.0
  python script/assemble_changelog.py 2025.11.0

Note:
  You must run script/discover_prs.py and generate AI responses first.
        """,
    )
    parser.add_argument(
        "version", type=str, help="Version to assemble changelog for (e.g., 2025.11.0)"
    )

    args = parser.parse_args()

    success = assemble_changelog(args.version)
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
