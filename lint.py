#!/usr/bin/env python3

import argparse
import collections
from pathlib import Path
from typing import Optional
import colorama
import fnmatch
import functools
import os.path
import re
import sys
import os
import subprocess

try:
    from PIL import Image

    PILLOW_INSTALLED = True
except ImportError:
    print("Pillow could not be imported - will not run image checks")
    print("Install pillow with `pip3 install pillow`")
    PILLOW_INSTALLED = False


class AnsiFore:
    KEEP = ""
    BLACK = "\033[30m"
    RED = "\033[31m"
    GREEN = "\033[32m"
    YELLOW = "\033[33m"
    BLUE = "\033[34m"
    MAGENTA = "\033[35m"
    CYAN = "\033[36m"
    WHITE = "\033[37m"
    RESET = "\033[39m"

    BOLD_BLACK = "\033[1;30m"
    BOLD_RED = "\033[1;31m"
    BOLD_GREEN = "\033[1;32m"
    BOLD_YELLOW = "\033[1;33m"
    BOLD_BLUE = "\033[1;34m"
    BOLD_MAGENTA = "\033[1;35m"
    BOLD_CYAN = "\033[1;36m"
    BOLD_WHITE = "\033[1;37m"
    BOLD_RESET = "\033[1;39m"


class AnsiStyle:
    BRIGHT = "\033[1m"
    BOLD = "\033[1m"
    DIM = "\033[2m"
    THIN = "\033[2m"
    NORMAL = "\033[22m"
    RESET_ALL = "\033[0m"


Fore = AnsiFore()
Style = AnsiStyle()


def print_error_for_file(file: str, body: Optional[str]):
    print(f"{AnsiFore.GREEN}### File {AnsiStyle.BRIGHT}{file}{AnsiStyle.RESET_ALL}")
    print()
    if body is not None:
        print(body)
        print()


def git_ls_files(patterns=None):
    command = ["git", "ls-files", "-s"]
    if patterns is not None:
        command.extend(patterns)
    proc = subprocess.Popen(command, stdout=subprocess.PIPE)
    output, _ = proc.communicate()
    lines = [x.split() for x in output.decode("utf-8").splitlines()]
    return {s[3].strip(): int(s[0]) for s in lines}


def find_all(a_str, sub):
    if not a_str.find(sub):
        # Optimization: If str is not in whole text, then do not try
        # on each line
        return
    for i, line in enumerate(a_str.split("\n")):
        column = 0
        while True:
            column = line.find(sub, column)
            if column == -1:
                break
            yield i, column
            column += len(sub)


colorama.init()

parser = argparse.ArgumentParser()
parser.add_argument(
    "files", nargs="*", default=[], help="files to be processed (regex on path)"
)
args = parser.parse_args()

EXECUTABLE_BIT = git_ls_files()
files = list(EXECUTABLE_BIT.keys())
# Match against re
file_name_re = re.compile("|".join(args.files))
files = [p for p in files if file_name_re.search(p)]

files.sort()

file_types = (
    ".cfg",
    ".css",
    ".gif",
    ".h",
    ".html",
    ".ico",
    ".jpg",
    ".js",
    ".json",
    ".md",
    ".png",
    ".py",
    ".rst",
    ".svg",
    ".toml",
    ".txt",
    ".webmanifest",
    ".xml",
    ".yaml",
    ".yml",
    "",
)
docs_types = [".rst"]
image_types = [".jpg", ".ico", ".png", ".svg", ".gif"]

LINT_FILE_CHECKS = []
LINT_CONTENT_CHECKS = []
LINT_POST_CHECKS = []


def run_check(lint_obj, fname, *args):
    include = lint_obj["include"]
    exclude = lint_obj["exclude"]
    func = lint_obj["func"]
    if include is not None:
        for incl in include:
            if fnmatch.fnmatch(fname, incl):
                break
        else:
            return None
    for excl in exclude:
        if fnmatch.fnmatch(fname, excl):
            return None
    return func(*args)


def run_checks(lints, fname, *args):
    for lint in lints:
        try:
            add_errors(fname, run_check(lint, fname, *args))
        except Exception:
            print(f"Check {lint['func'].__name__} on file {fname} failed:")
            raise


def _add_check(checks, func, include=None, exclude=None):
    checks.append(
        {
            "include": include,
            "exclude": exclude or [],
            "func": func,
        }
    )


def lint_file_check(**kwargs):
    def decorator(func):
        _add_check(LINT_FILE_CHECKS, func, **kwargs)
        return func

    return decorator


def lint_content_check(**kwargs):
    def decorator(func):
        _add_check(LINT_CONTENT_CHECKS, func, **kwargs)
        return func

    return decorator


def lint_post_check(func):
    _add_check(LINT_POST_CHECKS, func)
    return func


def lint_re_check(regex, **kwargs):
    flags = kwargs.pop("flags", re.MULTILINE)
    prog = re.compile(regex, flags)
    decor = lint_content_check(**kwargs)

    def decorator(func):
        @functools.wraps(func)
        def new_func(fname, content):
            errors = []
            for match in prog.finditer(content):
                if "NOLINT" in match.group(0):
                    continue
                lineno = content.count("\n", 0, match.start()) + 1
                substr = content[: match.start()]
                col = len(substr) - substr.rfind("\n")
                err = func(fname, match)
                if err is None:
                    continue
                errors.append((lineno, col + 1, err))
            return errors

        return decor(new_func)

    return decorator


def lint_content_find_check(find, only_first=False, **kwargs):
    decor = lint_content_check(**kwargs)

    def decorator(func):
        @functools.wraps(func)
        def new_func(fname, content):
            find_ = find
            if callable(find):
                find_ = find(fname, content)
            errors = []
            for line, col in find_all(content, find_):
                err = func(fname)
                errors.append((line + 1, col + 1, err))
                if only_first:
                    break
            return errors

        return decor(new_func)

    return decorator


@lint_file_check(exclude=[f"*{f}" for f in file_types])
def lint_ext_check(fname: str, stat: os.stat_result):
    return (
        "This file extension is not a registered file type. If this is an error, please "
        "update the script/ci-custom.py script."
    )


@lint_file_check(exclude=["script/*", ".devcontainer/*", "lint.py"])
def lint_executable_bit(fname: str, stat: os.stat_result):
    ex = EXECUTABLE_BIT[fname]
    if ex != 100644:
        return (
            "File has invalid executable bit {}. If running from a windows machine please "
            "see disabling executable bit in git.".format(ex)
        )
    return None


@lint_file_check(
    include=[f"images/*{ext}" for ext in image_types], exclude=["images/hero.png"]
)
def lint_index_images_size(fname: str, stat: os.stat_result):
    if stat.st_size > 40 * 1024:
        return (
            "Image is too large. The files in the images/ folder are displayed on esphome's "
            "front page and thus should be small (no more than 300x300px, and <40kb). "
            "Use a tool like https://compress-or-die.com/ to reduce the image size. "
            f"Size of file: {stat.st_size / 1024:.0f}kb"
        )
    return None


@lint_file_check(include=[f"*{ext}" for ext in image_types])
def lint_all_images_size(fname: str, stat: os.stat_result):
    if stat.st_size > 1024 * 1024:
        return (
            "Image is too large. Images in ESPHome's codebase should be 1MB in size max. "
            "Use a tool like https://compress-or-die.com/ to reduce the image size. "
            f"Size of file: {stat.st_size / 1024:.0f}kb"
        )
    return None


if PILLOW_INSTALLED:

    @lint_file_check(
        include=["images/*.jpg", "images/*.png"], exclude=["images/hero.png"]
    )
    def lint_index_images_dimensions(fname: str, stat: os.stat_result):
        img = Image.open(fname)
        if img.width > 300 or img.height > 300:
            return (
                "Image has too large dimensions. The images in the images/ folder are displayed on "
                "ESPHome's main page, so need to be lightweight. We allow a max of 300x300 for images on this page. "
                "Use a tool like https://compress-or-die.com/ to reduce the image size. "
                f"Dimensions of this image: {img.width}x{img.height}"
            )
        return None


@lint_content_find_check(
    "\t",
    only_first=True,
    exclude=[
        "Makefile",
    ],
)
def lint_tabs(fname):
    return "File contains tab character. Please convert tabs to spaces."


@lint_content_find_check("\r", only_first=True)
def lint_newline(fname):
    return "File contains Windows newline. Please set your editor to Unix newline mode."


@lint_content_check(exclude=["*.svg", "runtime.txt", "_static/*"])
def lint_end_newline(fname, content):
    if content and not content.endswith("\n"):
        return "File does not end with a newline, please add an empty line at the end of the file."
    return None


section_regex = re.compile(r"^(=+|-+|\*+|~+)$")
directive_regex = re.compile(r"^(\s*)\.\. (.*)::.*$")
directive_arg_regex = re.compile(r"^(\s+):.*:\s*.*$")


@lint_content_check(include=["*.rst"])
def lint_directive_formatting(fname, content):
    errors = []
    lines = content.splitlines(keepends=False)

    for i, line in enumerate(lines):
        m = directive_regex.match(line)
        if m is None:
            continue
        base_indentation = len(m.group(1))
        directive_name = m.group(2)
        if directive_name.startswith("|") or directive_name == "seo":
            continue
        # Match directive args
        for j in range(i + 1, len(lines)):
            if not directive_arg_regex.match(lines[j]):
                break
        else:
            # Reached end of file
            continue

        # Empty line must follow
        if lines[j]:
            errors.append(
                (
                    j,
                    1,
                    "Directive '{}' is not followed by an empty line. Please insert an "
                    "empty line after {}:{}".format(directive_name, fname, j),
                )
            )
            continue

        k = j + 1
        for j in range(k, len(lines)):
            if not lines[j]:
                # Ignore Empty lines
                continue

            num_spaces = len(lines[j]) - len(lines[j].lstrip())
            if num_spaces <= base_indentation:
                # Finished with this directive
                break
            num_indent = num_spaces - base_indentation
            if j == k and num_indent != 4:
                errors.append(
                    (
                        j + 1,
                        num_indent,
                        "Directive '{}' must be indented with 4 spaces, not {}. See "
                        "{}:{}".format(directive_name, num_indent, fname, j + 1),
                    )
                )
                break

    return errors


@lint_re_check(
    r"https://esphome.io/",
    include=["*.rst"],
    exclude=[
        "components/web_server.rst",
        "components/image.rst",
        "cookbook/lvgl.rst",
    ],
)
def lint_esphome_io_link(fname, match):
    return (
        "All links to esphome.io should be relative, please remove esphome.io from URL"
    )


def highlight(s):
    return f"\033[36m{s}\033[0m"


errors = collections.defaultdict(list)


def add_errors(fname, errs):
    if not isinstance(errs, list):
        errs = [errs]
    for err in errs:
        if err is None:
            continue
        try:
            lineno, col, msg = err
        except ValueError:
            lineno = 1
            col = 1
            msg = err
        if not isinstance(msg, str):
            raise ValueError("Error is not instance of string!")
        if not isinstance(lineno, int):
            raise ValueError("Line number is not an int!")
        if not isinstance(col, int):
            raise ValueError("Column number is not an int!")
        errors[fname].append((lineno, col, msg))


for fname in files:
    p = Path(fname)
    if not p.is_file():
        # file deleted but in git index
        continue
    run_checks(LINT_FILE_CHECKS, fname, fname, p.stat())
    if p.suffix in image_types:
        continue
    try:
        with open(fname, "r") as f_handle:
            content = f_handle.read()
    except UnicodeDecodeError:
        add_errors(
            fname,
            "File is not readable as UTF-8. Please set your editor to UTF-8 mode.",
        )
        continue
    run_checks(LINT_CONTENT_CHECKS, fname, fname, content)

run_checks(LINT_POST_CHECKS, "POST")

for f, errs in sorted(errors.items()):
    err_str = (
        f"{AnsiStyle.BOLD}{f}:{lineno}:{col}:{AnsiStyle.RESET_ALL} "
        f"{AnsiStyle.BOLD}{AnsiFore.RED}{'lint:'}{AnsiStyle.RESET_ALL} {msg}\n"
        for lineno, col, msg in errs
    )
    print_error_for_file(f, "\n".join(err_str))

sys.exit(len(errors))
