#!/usr/bin/env python3
"""
ESPHome PR Discovery Tool

Standalone tool that discovers PRs between releases and outputs JSON data.
Designed to be called by Claude Code skill for release notes generation.

Usage:
    python script/discover_prs.py 2025.11.0
    python script/discover_prs.py 2025.11.0 --force-update

Output: script/cache/{version}/pr_data.json
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
import json
from pathlib import Path
import re
import subprocess
import sys


@dataclass
class Version:
    """ESPHome version representation"""

    year: int
    month: int
    patch: int
    beta: int = 0

    def __str__(self):
        base = f"{self.year}.{self.month}.{self.patch}"
        if self.beta > 0:
            base += f"b{self.beta}"
        return base

    @property
    def tag(self):
        """Git tag name"""
        return str(self)

    @classmethod
    def parse(cls, value: str) -> Version:
        """Parse version string like '2025.11.0' or '2025.11.0b1'"""
        match = re.match(r"(\d{4})\.(\d+)\.(\d+)(b(\d+))?", value)
        if not match:
            raise ValueError(
                f"Invalid version format: {value}. Expected format: YYYY.MM.PATCH or YYYY.MM.PATCHbN"
            )
        year = int(match[1])
        month = int(match[2])
        patch = int(match[3])
        beta = int(match[5]) if match[5] else 0
        return cls(year=year, month=month, patch=patch, beta=beta)

    def previous_version_base(self) -> Version:
        """Get the base version of previous month (always .0 patch)"""
        if self.month == 1:
            # January -> previous December
            return Version(year=self.year - 1, month=12, patch=0)
        return Version(year=self.year, month=self.month - 1, patch=0)

    def find_latest_patch(self, all_tags: set[str]) -> Version:
        """Find the latest patch release for this major.minor version"""
        base = f"{self.year}.{self.month}."
        patches = [
            int(tag.replace(base, "").split("b")[0])
            for tag in all_tags
            if tag.startswith(base) and "b" not in tag
        ]
        if not patches:
            return self
        max_patch = max(patches)
        return Version(year=self.year, month=self.month, patch=max_patch)

    def find_latest_beta(self, all_tags: set[str]) -> tuple[str, bool]:
        """Find the latest beta tag for this major.minor.0 version

        Returns:
            tuple of (beta_tag, exists) where beta_tag is like "2025.11.0b3"
        """
        base = f"{self.year}.{self.month}.0b"
        betas = [int(tag.replace(base, "")) for tag in all_tags if tag.startswith(base)]
        if not betas:
            return (f"{base}1", False)
        max_beta = max(betas)
        return (f"{base}{max_beta}", True)


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

    @classmethod
    def from_json(cls, data: dict) -> PullRequest:
        """Create PR from GitHub API JSON response"""
        return cls(
            number=data["number"],
            title=data["title"],
            body=data.get("body", ""),
            author=data["author"]["login"],
            labels=[label["name"] for label in data.get("labels", [])],
            url=data["url"],
            state=data["state"],
            merged_at=data.get("mergedAt"),
        )

    def to_json(self) -> dict:
        """Convert to JSON-serializable dict"""
        return {
            "number": self.number,
            "title": self.title,
            "body": self.body,
            "author": self.author,
            "labels": self.labels,
            "url": self.url,
            "state": self.state,
            "merged_at": self.merged_at,
        }


class PRDiscovery:
    """PR discovery tool"""

    def __init__(self, version: Version, force_update: bool = False):
        self.version = version
        self.force_update = force_update
        # Shared cache for all PRs (persistent across all versions)
        self.prs_cache_dir = Path("script/cache/prs")
        # Version-specific directory
        self.version_dir = Path("script/cache") / str(version)
        self._all_tags: set[str] | None = None

    def check_github_cli(self) -> None:
        """Check if GitHub CLI is installed and authenticated"""
        try:
            result = subprocess.run(
                ["gh", "--version"],
                capture_output=True,
                text=True,
                check=False,
            )
            if result.returncode != 0:
                print("Error: GitHub CLI (gh) is not installed or not in PATH")
                print("\nInstallation instructions:")
                print("  macOS:   brew install gh")
                print(
                    "  Linux:   See https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
                )
                print("  Windows: See https://github.com/cli/cli#installation")
                sys.exit(1)
        except FileNotFoundError:
            print("Error: GitHub CLI (gh) is not installed")
            print("\nInstallation instructions:")
            print("  macOS:   brew install gh")
            print(
                "  Linux:   See https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
            )
            print("  Windows: See https://github.com/cli/cli#installation")
            sys.exit(1)

        # Check authentication
        try:
            result = subprocess.run(
                ["gh", "auth", "status"],
                capture_output=True,
                text=True,
                check=False,
            )
            if result.returncode != 0:
                print("Error: GitHub CLI is not authenticated")
                print("\nPlease run: gh auth login")
                sys.exit(1)
        except Exception as e:
            print(f"Error checking GitHub CLI authentication: {e}")
            print("\nPlease run: gh auth login")
            sys.exit(1)

    def ensure_dirs(self) -> None:
        """Create cache directories if they don't exist"""
        self.prs_cache_dir.mkdir(parents=True, exist_ok=True)
        self.version_dir.mkdir(parents=True, exist_ok=True)

    def run_gh(self, *args) -> dict:
        """Run gh CLI command and return JSON output"""
        cmd = ["gh"] + list(args)
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True,
            )
            return json.loads(result.stdout) if result.stdout else {}
        except subprocess.CalledProcessError as e:
            print(f"Error running gh command: {' '.join(cmd)}")
            print(f"stderr: {e.stderr}")
            raise

    def _fetch_all_tags(self) -> set[str]:
        """Fetch all tags from esphome/esphome repo (cached)"""
        if self._all_tags is not None:
            return self._all_tags

        print("Fetching all tags from esphome/esphome...")
        try:
            result = subprocess.run(
                [
                    "gh",
                    "api",
                    "repos/esphome/esphome/tags",
                    "--paginate",
                    "--jq",
                    ".[].name",
                ],
                capture_output=True,
                text=True,
                check=True,
            )
            tags = [t for t in result.stdout.strip().split("\n") if t]
            self._all_tags = set(tags)
            print(f"Found {len(self._all_tags)} tags")
            return self._all_tags
        except subprocess.CalledProcessError as e:
            print(f"Error fetching tags: {e.stderr}")
            self._all_tags = set()
            return self._all_tags

    def tag_exists(self, tag: str) -> bool:
        """Check if a git tag exists in esphome/esphome repo"""
        all_tags = self._fetch_all_tags()
        return tag in all_tags

    def get_pr_numbers_from_commits(self, base_ref: str, head_ref: str) -> list[int]:
        """Extract PR numbers from commits between two refs"""
        print(f"Comparing {base_ref}...{head_ref}")

        # Use --paginate with --jq to get all commit messages across all pages
        result = subprocess.run(
            [
                "gh",
                "api",
                f"repos/esphome/esphome/compare/{base_ref}...{head_ref}",
                "--paginate",
                "--jq",
                ".commits[].commit.message",
            ],
            capture_output=True,
            text=True,
            check=True,
        )

        # Each line is a commit message
        commit_messages = [line for line in result.stdout.strip().split("\n") if line]
        print(f"Found {len(commit_messages)} commits")

        pr_numbers = set()
        for message in commit_messages:
            # Extract PR numbers from patterns like (#12345)
            matches = re.findall(r"\(#(\d+)\)", message)
            pr_numbers.update(int(m) for m in matches)

        return sorted(pr_numbers)

    def _get_patch_release_prs(self, base_version: Version) -> list[int]:
        """Get all PRs that were included in patch releases"""
        patch_prs = set()
        patch_num = 1

        print(
            f"Checking for patch releases of {base_version.year}.{base_version.month}.x..."
        )

        while True:
            patch_tag = f"{base_version.year}.{base_version.month}.{patch_num}"

            if not self.tag_exists(patch_tag):
                break

            print(f"  Found patch release: {patch_tag}")

            # Get PRs between base and this patch
            base_tag = f"{base_version.year}.{base_version.month}.{patch_num - 1}"
            prs = self.get_pr_numbers_from_commits(base_tag, patch_tag)
            patch_prs.update(prs)

            patch_num += 1

        return sorted(patch_prs)

    def discover_prs(self) -> tuple[list[int], str, str, str]:
        """Discover PRs for this release

        Returns:
            tuple of (pr_numbers, previous_version, beta_tag, comparison)
        """
        current_tag = self.version.tag

        # Find the latest patch release of the previous month
        previous_base = self.version.previous_version_base()
        all_tags = self._fetch_all_tags()
        previous_version = previous_base.find_latest_patch(all_tags)
        previous_tag = previous_version.tag

        print(f"\n=== Discovering PRs for {current_tag} ===\n")
        print(f"Previous version: {previous_tag}")

        # Find the latest beta tag
        beta_tag, beta_tag_exists = self.version.find_latest_beta(all_tags)

        # Check if previous version tag exists
        if not self.tag_exists(previous_tag):
            print(f"Error: Previous version tag '{previous_tag}' does not exist")
            print("Cannot determine which PRs are new")
            sys.exit(1)

        if beta_tag_exists:
            # Beta branch exists - use everything from previous release to beta
            print(f"Beta tag '{beta_tag}' exists")
            comparison = f"{previous_tag}...{beta_tag}"
            print(f"Comparing tags: {comparison}")
            pr_numbers = self.get_pr_numbers_from_commits(previous_tag, beta_tag)
        else:
            # Beta doesn't exist yet - use dev branch but exclude patch releases
            print(f"Beta tag '{beta_tag}' does not exist yet")
            print("Using dev branch and excluding patch releases")

            # Get all PRs from previous version to dev
            all_prs = self.get_pr_numbers_from_commits(previous_tag, "dev")

            # Find and exclude PRs from patch releases
            patch_prs = self._get_patch_release_prs(previous_version)
            pr_numbers = sorted(set(all_prs) - set(patch_prs))

            if patch_prs:
                print(f"Excluded {len(patch_prs)} PRs from patch releases")

            comparison = f"{previous_tag}...dev"

        return pr_numbers, previous_tag, beta_tag, comparison

    def fetch_pr(self, pr_number: int) -> PullRequest:
        """Fetch PR metadata from GitHub"""
        print(f"Fetching PR #{pr_number}...", end=" ")

        data = self.run_gh(
            "pr",
            "view",
            str(pr_number),
            "--repo",
            "esphome/esphome",
            "--json",
            "number,title,body,author,labels,url,state,mergedAt",
        )

        print("✓")
        return PullRequest.from_json(data)

    def cache_pr(self, pr: PullRequest) -> None:
        """Save PR to shared cache"""
        cache_file = self.prs_cache_dir / f"{pr.number}.json"
        with open(cache_file, "w") as f:
            json.dump(pr.to_json(), f, indent=2)

    def load_cached_pr(self, pr_number: int) -> PullRequest | None:
        """Load PR from shared cache if it exists"""
        cache_file = self.prs_cache_dir / f"{pr_number}.json"
        if not cache_file.exists():
            return None

        with open(cache_file) as f:
            data = json.load(f)
            return PullRequest(
                number=data["number"],
                title=data["title"],
                body=data["body"],
                author=data["author"],
                labels=data["labels"],
                url=data["url"],
                state=data["state"],
                merged_at=data.get("merged_at"),
            )

    def fetch_and_cache_prs(self, pr_numbers: list[int]) -> list[PullRequest]:
        """Fetch PRs and cache them locally"""
        prs = []

        for pr_number in pr_numbers:
            # Check cache first unless force update
            if not self.force_update:
                cached_pr = self.load_cached_pr(pr_number)
                if cached_pr:
                    print(f"Using cached PR #{pr_number}")
                    prs.append(cached_pr)
                    continue

            # Fetch from GitHub
            pr = self.fetch_pr(pr_number)
            self.cache_pr(pr)
            prs.append(pr)

        return prs

    def run(self) -> bool:
        """Main workflow - discover and cache PRs, output JSON"""
        self.ensure_dirs()

        # Discover PRs
        pr_numbers, previous_version, beta_tag, comparison = self.discover_prs()

        if not pr_numbers:
            print("\nWarning: No PRs found!")
            print("This might mean:")
            print("  1. The version tags are incorrect")
            print("  2. No PRs have been merged since the last release")
            print("  3. There's an issue with the GitHub API")
            return False

        print(f"\nFound {len(pr_numbers)} PRs")

        # Fetch and cache
        print("\n=== Fetching PR Metadata ===\n")
        prs = self.fetch_and_cache_prs(pr_numbers)
        print(f"\n✓ Cached {len(prs)} PRs to {self.prs_cache_dir}")

        # Group PRs by label
        new_features = [pr for pr in prs if "new-feature" in pr.labels]
        new_components = [pr for pr in prs if "new-component" in pr.labels]
        breaking_changes = [pr for pr in prs if "breaking-change" in pr.labels]
        all_prs = prs

        # Create output data structure
        output_data = {
            "version": str(self.version),
            "previous_version": previous_version,
            "beta_tag": beta_tag,
            "comparison": comparison,
            "total_prs": len(all_prs),
            "new_features": [pr.to_json() for pr in new_features],
            "new_components": [pr.to_json() for pr in new_components],
            "breaking_changes": [pr.to_json() for pr in breaking_changes],
            "all_prs": [pr.to_json() for pr in all_prs],
        }

        # Write JSON output
        output_file = self.version_dir / "pr_data.json"
        with open(output_file, "w") as f:
            json.dump(output_data, f, indent=2)

        print(f"\n✓ PR data written to: {output_file}")
        print("\nSummary:")
        print(f"  Total PRs: {len(all_prs)}")
        print(f"  New Features: {len(new_features)}")
        print(f"  New Components: {len(new_components)}")
        print(f"  Breaking Changes: {len(breaking_changes)}")

        return True


def main() -> int:
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="Discover PRs for ESPHome release",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Discover PRs for 2025.11.0
  python script/discover_prs.py 2025.11.0

  # Force re-fetch all PRs from GitHub
  python script/discover_prs.py 2025.11.0 --force-update

Output:
  script/cache/{version}/pr_data.json - JSON file with PR metadata
  script/cache/prs/{pr_number}.json - Individual PR cache files
        """,
    )
    parser.add_argument(
        "version", type=str, help="Version to discover PRs for (e.g., 2025.11.0)"
    )
    parser.add_argument(
        "--force-update",
        action="store_true",
        help="Force re-fetch all PRs from GitHub (ignore cache)",
    )

    args = parser.parse_args()

    try:
        version = Version.parse(args.version)
    except ValueError as e:
        print(f"Error: {e}")
        return 1

    discovery = PRDiscovery(version=version, force_update=args.force_update)

    # Check GitHub CLI is installed and authenticated
    discovery.check_github_cli()

    success = discovery.run()
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
