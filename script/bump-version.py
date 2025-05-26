#!/usr/bin/env python3

import argparse
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


def write_version(version: Version):
    # ESPHOME_REF = 2021.8.0
    sub(
        "Makefile",
        r"ESPHOME_REF = .*",
        f"ESPHOME_REF = {version}" if not version.dev else "ESPHOME_REF = dev",
    )
    # version = '1.14'
    sub("conf.py", r'version = ".*"', f'version = "{version.major}.{version.minor}"')
    # release = '1.14.4'
    sub("conf.py", r'release = ".*"', f'release = "{version}"')
    with open("_static/version", "wt") as fh:
        fh.write(str(version))


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
