"""Tests for parse_enum_values_block in script/schema_doc.py.

Covers the structured <EnumValues> JSX form that replaces the fragile
bullet-list regex for enum descriptions. The bug being prevented: a
``(default)`` annotation followed by ``: description`` got mangled into
the description slot by the old REGEX_ENUM* patterns. With the JSX
form, value/default/description live in separate fields, so the bug is
structurally impossible.
"""

import sys
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "script"))

from schema_doc import md_get_next_config, parse_enum_values_block  # noqa: E402


def parse(text):
    """Run the parser against a multi-line string. Returns (end_index, entries)."""
    return parse_enum_values_block(text.splitlines(), 0)


def test_default_with_description_does_not_get_mangled():
    """Original device-builder#433 repro: '(default): …' must split cleanly."""
    end, entries = parse(
        """\
<EnumValues values={[
  { value: "ANY",     default: true, description: "Trigger on any edge change (high to low or low to high)" },
  { value: "RISING",  description: "Trigger only on rising edge (low to high)" },
  { value: "FALLING", description: "Trigger only on falling edge (high to low)" },
]} />
"""
    )
    assert entries == [
        {
            "value": "ANY",
            "default": True,
            "description": "Trigger on any edge change (high to low or low to high)",
        },
        {
            "value": "RISING",
            "description": "Trigger only on rising edge (low to high)",
        },
        {
            "value": "FALLING",
            "description": "Trigger only on falling edge (high to low)",
        },
    ]
    assert end == 5  # past the closing `]} />` line


def test_bare_values_no_descriptions():
    _, entries = parse(
        """\
<EnumValues values={[
  { value: "OFF", default: true },
  { value: "2x" },
  { value: "4x" },
]} />
"""
    )
    assert entries == [
        {"value": "OFF", "default": True},
        {"value": "2x"},
        {"value": "4x"},
    ]


def test_indented_block_inside_list_item():
    """The JSX is indented two spaces because it sits inside a list item."""
    _, entries = parse(
        """\
  <EnumValues values={[
    { value: "ANY", default: true, description: "Any edge" },
  ]} />
"""
    )
    assert entries == [{"value": "ANY", "default": True, "description": "Any edge"}]


def test_skips_leading_blank_lines():
    end, entries = parse(
        """\


<EnumValues values={[
  { value: "X" },
]} />
"""
    )
    assert entries == [{"value": "X"}]
    assert end == 5


def test_returns_none_when_no_block_present():
    end, entries = parse(
        """\
- `ANY` (default): Trigger on any edge change
- `RISING`: Trigger only on rising edge
"""
    )
    assert entries is None
    assert end == 0  # no advance — caller falls through to bullet path


def test_returns_none_when_entry_missing_value(capsys):
    """An entry without a 'value' key is malformed — surface and skip."""
    end, entries = parse(
        """\
<EnumValues values={[
  { default: true, description: "no value here" },
]} />
"""
    )
    assert entries is None
    assert end == 0
    assert "needs a 'value'" in capsys.readouterr().out


def test_unterminated_block_reports_and_falls_through(capsys):
    end, entries = parse(
        """\
<EnumValues values={[
  { value: "X" },
"""
    )
    assert entries is None
    assert end == 0
    assert "unterminated" in capsys.readouterr().out


def test_trailing_commas_tolerated():
    _, entries = parse(
        """\
<EnumValues values={[
  { value: "A", description: "first", },
  { value: "B", },
]} />
"""
    )
    assert entries == [
        {"value": "A", "description": "first"},
        {"value": "B"},
    ]


def test_compact_one_line_form():
    _, entries = parse(
        """\
<EnumValues values={[{ value: "X", default: true }]} />
"""
    )
    assert entries == [{"value": "X", "default": True}]


def test_jsx_block_terminates_parent_bullet():
    """Without this, md_get_next_config slurps the JSX opener as bullet text.

    The bullet walker's continuation rule joins any indented non-blank
    line into the current bullet. A `<EnumValues>` opener is indented to
    sit inside its parent list item — so without an explicit boundary,
    the parent bullet's text would end up as e.g.
    ``"**interrupt_type** … One of: <EnumValues values={["``, and the
    structured-enum walker downstream would never run.
    """
    lines = [
        "- **interrupt_type** (*Optional*): One of:",
        "",
        "  <EnumValues values={[",
        '    { value: "ANY", default: true, description: "Any edge" },',
        "  ]} />",
        "",
    ]
    end_index, item_config, item_indent = md_get_next_config(lines, 0)
    assert item_config == "**interrupt_type** (*Optional*): One of:"
    assert item_indent == 0
    assert end_index == 2  # positioned at the JSX opener line


if __name__ == "__main__":
    sys.exit(pytest.main([__file__, "-v"]))
