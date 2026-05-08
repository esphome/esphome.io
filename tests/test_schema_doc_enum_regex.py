#!/usr/bin/env python3
"""Tests for the enum-bullet docs extractor in ``script/schema_doc.py``.

Pins the parsing of the bullet-list shapes that show up under
``- **<field>** (...): One of:`` in component MDX docs. The
extractor's job is to map a bullet line like::

    - `ANY` (default): Trigger on any edge change (high to low or low to high)

into a ``(value, description)`` pair the schema bundle can store
on the corresponding enum's ``values["ANY"].docs``.

Until this fix the ``(default)`` annotation broke the extractor —
the colon branch wouldn't fire because the parens intervened, and
the fallback parens-as-description branch's greedy ``.*`` matched
all the way to the *last* ``)`` on the line, capturing
``"default): Trigger on any edge change (high to low or low to high"``
as the description. The fix carves out an optional
``(default)`` / ``(*default*)`` annotation slot before the
description-separator alternation, and switches the parens-only
fallback to a non-greedy ``[^)]*`` so it can't swallow a
structural ``)`` that's part of the description proper.

Designed to run two ways:

  $ python tests/test_schema_doc_enum_regex.py
  $ python -m pytest tests/test_schema_doc_enum_regex.py

The first form has no third-party deps; the second works if a
future contributor adds pytest. Both walk the same ``def test_*``
functions and pass when every ``assert`` holds.
"""

from __future__ import annotations

import re
import sys
import unittest
from pathlib import Path

# ``script/`` isn't a package; import the regexes by adding it to
# sys.path. Done at module scope so both the standalone runner and
# pytest see the imports the same way.
_SCRIPT_DIR = Path(__file__).resolve().parent.parent / "script"
sys.path.insert(0, str(_SCRIPT_DIR))

from schema_doc import REGEX_ENUM1, REGEX_ENUM2  # noqa: E402


def _match_enum(pattern: str, line: str) -> tuple[str | None, str | None]:
    """Run *pattern* on *line* and return ``(value, description)``.

    Mirrors the production extractor's reading of the regex match:
    group 1 is the value, group 2 (colon/dash branch) wins over
    group 3 (parens-only branch) for the description.
    """
    m = re.search(pattern, line, re.IGNORECASE)
    if m is None:
        return None, None
    value = m.group(1)
    description = m.group(2) or m.group(3)
    return value, description


# ─── REGEX_ENUM1 — backtick-wrapped value (`VALUE` shape) ─────────


def test_enum1_value_only() -> None:
    """``\\`VALUE\\``` alone → value, no description."""
    value, desc = _match_enum(REGEX_ENUM1, "`X16`")
    assert value == "X16", value
    assert desc is None, desc


def test_enum1_colon_description() -> None:
    """``\\`VALUE\\`: description`` → colon-branch captures description."""
    value, desc = _match_enum(REGEX_ENUM1, "`RISING`: Trigger on rising edge (low to high)")
    assert value == "RISING"
    assert desc == "Trigger on rising edge (low to high)"


def test_enum1_dash_description() -> None:
    """``\\`VALUE\\` - description`` → dash-branch captures description."""
    value, desc = _match_enum(REGEX_ENUM1, "`OTHER` - dash-separated description")
    assert value == "OTHER"
    assert desc == "dash-separated description"


def test_enum1_default_annotation_then_colon_description() -> None:
    """Issue device-builder#433.

    ``\\`ANY\\` (default): Trigger on any edge change (high to low
    or low to high)`` previously produced ``"default): Trigger on
    any edge change (high to low or low to high"`` because the
    colon-branch couldn't reach past the ``(default)`` and the
    fallback parens-branch's greedy ``.*`` ate the closing ``)``
    plus everything after.
    """
    value, desc = _match_enum(
        REGEX_ENUM1,
        "`ANY` (default): Trigger on any edge change (high to low or low to high)",
    )
    assert value == "ANY"
    assert desc == "Trigger on any edge change (high to low or low to high)"


def test_enum1_default_annotation_no_description() -> None:
    """``\\`X8\\` (*default*)`` (markdown emphasis) → annotation eaten, no description.

    Mirrors the upstream ``components/sensor/as7341.mdx`` line for
    the ``gain`` enum's default value. Previously captured
    ``*default*`` as the description.
    """
    value, desc = _match_enum(REGEX_ENUM1, "`X8` (*default*)")
    assert value == "X8"
    assert desc is None


def test_enum1_default_annotation_bare_no_description() -> None:
    """``\\`X8\\` (default)`` (no emphasis) → same: no description."""
    value, desc = _match_enum(REGEX_ENUM1, "`X8` (default)")
    assert value == "X8"
    assert desc is None


def test_enum1_parenthetical_as_description() -> None:
    """``\\`VALUE\\` (parenthetical description)`` → parens-branch captures description.

    Pinned so the carve-out for ``(default)`` doesn't silently
    swallow other parenthetical descriptions.
    """
    value, desc = _match_enum(REGEX_ENUM1, "`VALUE` (parenthetical description)")
    assert value == "VALUE"
    assert desc == "parenthetical description"


def test_enum1_parenthetical_does_not_consume_trailing_paren() -> None:
    """Non-greedy parens-branch stops at the first ``)``.

    Regression net for the greedy ``.*`` that the original regex
    used — without the non-greedy switch this case would still pin
    the broken behaviour even after the ``(default)`` carve-out.
    """
    value, desc = _match_enum(REGEX_ENUM1, "`KEY` (short) trailing junk)")
    assert value == "KEY"
    assert desc == "short"


# ─── REGEX_ENUM2 — bold-wrapped value (**VALUE** shape) ───────────


def test_enum2_value_only() -> None:
    value, desc = _match_enum(REGEX_ENUM2, "**X16**")
    assert value == "X16"
    assert desc is None


def test_enum2_colon_description() -> None:
    value, desc = _match_enum(REGEX_ENUM2, "**RISING**: Trigger on rising edge")
    assert value == "RISING"
    assert desc == "Trigger on rising edge"


def test_enum2_default_annotation_then_colon_description() -> None:
    """Same pattern as ``REGEX_ENUM1`` but with bold-wrapped value."""
    value, desc = _match_enum(
        REGEX_ENUM2,
        "**ANY** (default): Trigger on any edge change (high to low or low to high)",
    )
    assert value == "ANY"
    assert desc == "Trigger on any edge change (high to low or low to high)"


def test_enum2_default_annotation_no_description() -> None:
    value, desc = _match_enum(REGEX_ENUM2, "**X8** (*default*)")
    assert value == "X8"
    assert desc is None


# ─── End-to-end fixture: the exact line from the bug report ──────


def test_binary_sensor_gpio_interrupt_type_fixture() -> None:
    """The exact MDX bullet line that surfaced device-builder#433.

    Pinning the *file-path-and-line-number* version of the
    repro keeps a future MDX edit (or a regex-shape refactor)
    honest: if anyone touches either the file or the regex they
    need to keep the contract.
    """
    line = "`ANY` (default): Trigger on any edge change (high to low or low to high)"
    value, desc = _match_enum(REGEX_ENUM1, line)
    assert value == "ANY", (
        f"expected value=ANY, got {value!r} — regex change broke the value capture"
    )
    assert desc == "Trigger on any edge change (high to low or low to high)", (
        f"expected description=…, got {desc!r} — the (default) annotation should be "
        f"consumed before the description-separator alternation runs"
    )
    # Sanity: the dropped artefact from the old regex must not leak through.
    assert desc is not None and not desc.startswith("default)"), (
        "regex regressed to the old broken form (eating the closing paren)"
    )


# ─── Standalone runner (no pytest dep needed) ────────────────────


if __name__ == "__main__":
    # Wrap the ``def test_*`` functions in a unittest.TestSuite so
    # ``python tests/test_schema_doc_enum_regex.py`` exits with the
    # right code for CI / a future pre-commit hook to gate on.
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    for name, obj in list(globals().items()):
        if name.startswith("test_") and callable(obj):
            test = unittest.FunctionTestCase(obj)
            suite.addTest(test)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
