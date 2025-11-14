#!/usr/bin/env python3
"""
ESPHome Release Notes Prompt Generator

Generates AI prompts from templates for release notes generation.
Designed to be called by Claude Code skill.

Usage:
    python script/generate_prompts.py 2025.11.0
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

from jinja2 import Environment, FileSystemLoader, select_autoescape


def load_pr_data(version: str) -> dict:
    """Load PR data from JSON file"""
    pr_data_file = Path("script/cache") / version / "pr_data.json"

    if not pr_data_file.exists():
        print(f"Error: PR data not found: {pr_data_file}")
        print(f"\nPlease run: python script/discover_prs.py {version}")
        sys.exit(1)

    with open(pr_data_file) as f:
        return json.load(f)


def generate_prompts(version: str) -> bool:
    """Generate prompt files from templates"""
    # Load PR data
    pr_data = load_pr_data(version)

    # Set up directories
    version_dir = Path("script/cache") / version
    prompts_dir = version_dir / "prompts"
    responses_dir = version_dir / "ai_responses"
    prs_cache_dir = Path("script/cache/prs")

    prompts_dir.mkdir(parents=True, exist_ok=True)
    responses_dir.mkdir(parents=True, exist_ok=True)

    # Set up Jinja2 environment
    template_dir = Path("script/prompt_templates")
    jinja_env = Environment(
        loader=FileSystemLoader(template_dir),
        autoescape=select_autoescape(),
        trim_blocks=True,
        lstrip_blocks=True,
    )

    # Convert PR data lists to objects with number field
    new_features = [{"number": pr["number"]} for pr in pr_data["new_features"]]
    new_components = [{"number": pr["number"]} for pr in pr_data["new_components"]]
    breaking_changes = [{"number": pr["number"]} for pr in pr_data["breaking_changes"]]

    print("\n=== Generating AI Prompts ===\n")

    # Generate Combined Overview + Feature Highlights Prompt
    template = jinja_env.get_template("overview_and_highlights.txt")
    overview_and_highlights_prompt = template.render(
        version=version,
        overview_file=responses_dir / "release_overview.md",
        highlights_file=responses_dir / "feature_highlights.md",
        prs_cache_dir=prs_cache_dir,
        total_prs=pr_data["total_prs"],
        new_features=new_features,
        new_components=new_components,
        breaking_changes=breaking_changes,
    )

    overview_highlights_file = prompts_dir / "overview_and_highlights.txt"
    overview_highlights_file.write_text(overview_and_highlights_prompt)
    print(f"✓ Generated: {overview_highlights_file}")

    # Generate Combined Breaking Changes Prompt (user + developer)
    if breaking_changes:
        template = jinja_env.get_template("breaking_changes.txt")
        breaking_prompt = template.render(
            version=version,
            users_file=responses_dir / "breaking_changes_users.md",
            devs_file=responses_dir / "breaking_changes_developers.md",
            prs_cache_dir=prs_cache_dir,
            breaking_changes=breaking_changes,
        )

        breaking_file = prompts_dir / "breaking_changes.txt"
        breaking_file.write_text(breaking_prompt)
        print(f"✓ Generated: {breaking_file}")

    print(f"\n✓ Prompts written to: {prompts_dir}")
    print("\nPrompt files:")
    print(f"  1. {overview_highlights_file}")
    if breaking_changes:
        print(f"  2. {breaking_file}")

    print("\nYou can now edit these prompt files before processing them.")

    return True


def main() -> int:
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="Generate AI prompts for ESPHome release notes",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate prompts for 2025.11.0
  python script/generate_prompts.py 2025.11.0

Note:
  You must run script/discover_prs.py first to fetch PR data.
        """,
    )
    parser.add_argument(
        "version", type=str, help="Version to generate prompts for (e.g., 2025.11.0)"
    )

    args = parser.parse_args()

    success = generate_prompts(args.version)
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
