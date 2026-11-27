"""Tests for script/bump-version.py write_version output."""

import importlib.util
import json
from pathlib import Path
from types import ModuleType

import pytest

REPO_ROOT = Path(__file__).parent.parent


def _load_bump_version() -> ModuleType:
    path = REPO_ROOT / "script" / "bump-version.py"
    spec = importlib.util.spec_from_file_location("bump_version", path)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _make_blog_post(root: Path, date_path: str, stem: str) -> None:
    post_dir = root / "src" / "content" / "docs" / "blog" / date_path
    post_dir.mkdir(parents=True, exist_ok=True)
    (post_dir / f"{stem}.mdx").write_text("---\ntitle: test\n---\n")


def test_write_version_writes_json(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    bump_version = _load_bump_version()
    monkeypatch.chdir(tmp_path)

    version = bump_version.Version(major=2026, minor=9, patch=0)
    bump_version.write_version(version)

    json_text = (tmp_path / "data" / "version.json").read_text()
    assert json.loads(json_text) == {"release": "2026.9.0", "version": "2026.9"}
    assert json_text.endswith("\n")


def test_write_version_derives_blog_url(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    bump_version = _load_bump_version()
    monkeypatch.chdir(tmp_path)
    _make_blog_post(tmp_path, "2026/08/19", "esphome-2026-8")

    version = bump_version.Version(major=2026, minor=8, patch=0)
    bump_version.write_version(version)

    assert json.loads((tmp_path / "data" / "version.json").read_text()) == {
        "release": "2026.8.0",
        "version": "2026.8",
        "blog_url": "/blog/2026/08/19/esphome-2026-8/",
    }


def test_write_version_newest_blog_post_wins(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    bump_version = _load_bump_version()
    monkeypatch.chdir(tmp_path)
    _make_blog_post(tmp_path, "2026/08/19", "esphome-2026-8")
    _make_blog_post(tmp_path, "2026/12/16", "esphome-2026-12")
    _make_blog_post(tmp_path, "2027/01/13", "esphome-2027-1")

    version = bump_version.Version(major=2027, minor=1, patch=0)
    bump_version.write_version(version)

    data = json.loads((tmp_path / "data" / "version.json").read_text())
    assert data["blog_url"] == "/blog/2027/01/13/esphome-2027-1/"


def test_write_version_ignores_non_release_blog_posts(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    bump_version = _load_bump_version()
    monkeypatch.chdir(tmp_path)
    _make_blog_post(tmp_path, "2026/08/12", "the-esphome-starter-kit-is-here")
    _make_blog_post(tmp_path, "2026/08/13", "esphome-starter-kit")

    version = bump_version.Version(major=2026, minor=8, patch=0)
    bump_version.write_version(version)

    assert "blog_url" not in json.loads(
        (tmp_path / "data" / "version.json").read_text()
    )


def test_write_version_preserves_blog_url_when_no_posts(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    bump_version = _load_bump_version()
    monkeypatch.chdir(tmp_path)

    data_dir = tmp_path / "data"
    data_dir.mkdir()
    (data_dir / "version.json").write_text(
        json.dumps(
            {
                "release": "2026.8.0",
                "version": "2026.8",
                "blog_url": "/blog/2026/08/19/esphome-2026-8/",
            }
        )
    )

    version = bump_version.Version(major=2026, minor=8, patch=1)
    bump_version.write_version(version)

    assert json.loads((data_dir / "version.json").read_text()) == {
        "release": "2026.8.1",
        "version": "2026.8",
        "blog_url": "/blog/2026/08/19/esphome-2026-8/",
    }
