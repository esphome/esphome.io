#!/usr/bin/env python3

import argparse
import json
from pathlib import Path
import re
import sys
from dataclasses import dataclass


@dataclass
class Version:
    major: int
    minor: int
    patch: int
    beta: int = 0
    dev: bool = False

    def __str__(self):
        return f"{self.major}.{self.minor}.{self.full_patch}"

    @property
    def full_patch(self):
        res = f"{self.patch}"
        if self.beta > 0:
            res += f"b{self.beta}"
        if self.dev:
            res += "-dev"
        return res

    @classmethod
    def parse(cls, value):
        match = re.match(r"(\d+).(\d+).(\d+)(b\d+)?(-dev)?", value)
        assert match is not None
        major = int(match[1])
        minor = int(match[2])
        patch = int(match[3])
        beta = int(match[4][1:]) if match[4] else 0
        dev = bool(match[5])
        return Version(major=major, minor=minor, patch=patch, beta=beta, dev=dev)


def sub(path, pattern, repl, expected_count=1):
    with open(path) as fh:
        content = fh.read()
    content, count = re.subn(pattern, repl, content, flags=re.MULTILINE)
    if expected_count is not None:
        assert count == expected_count, f"Pattern {pattern} replacement failed!"
    with open(path, "wt") as fh:
        fh.write(content)


BLOG_POST_RE = re.compile(r"^esphome-(\d+)-(\d+)$")


def find_blog_url() -> str | None:
    """Find the site path of the newest release notes blog post.

    Release posts live at src/content/docs/blog/YYYY/MM/DD/esphome-<year>-<minor>.mdx.
    Returns None when no release post exists in the tree.
    """
    blog_dir = Path("src/content/docs/blog")
    best: tuple[int, int, str] | None = None
    best_post: Path | None = None
    for post in blog_dir.glob("*/*/*/esphome-*.mdx"):
        match = BLOG_POST_RE.match(post.stem)
        if not match:
            continue
        key = (int(match[1]), int(match[2]), str(post.parent))
        if best is None or key > best:
            best = key
            best_post = post
    if best_post is None:
        return None
    rel = best_post.relative_to(blog_dir).with_suffix("")
    return "/blog/" + "/".join(rel.parts) + "/"


def write_version(version: Version) -> None:
    Path("data").mkdir(parents=True, exist_ok=True)
    data = {
        "release": str(version),
        "version": f"{version.major}.{version.minor}",
    }
    # Update data/version.json in place. blog_url is derived from the newest
    # release notes blog post in the tree; the release tooling re-runs this
    # script after creating the post. When no post exists (e.g. in a bare
    # checkout), any existing blog_url is preserved untouched.
    json_path = Path("data/version.json")
    json_data: dict[str, str] = {}
    if json_path.exists():
        json_data = json.loads(json_path.read_text())
    json_data.update(data)
    blog_url = find_blog_url()
    if blog_url is not None:
        json_data["blog_url"] = blog_url
    print(f"Writing {json_data} to data/version.json")
    with open(json_path, "w") as file:
        json.dump(json_data, file, indent=2)
        file.write("\n")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("new_version", type=str)
    args = parser.parse_args()

    version = Version.parse(args.new_version)
    print(f"Bumping to {version}")
    write_version(version)
    return 0


if __name__ == "__main__":
    sys.exit(main() or 0)
