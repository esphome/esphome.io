"""Tests for the assembly flow of script/generate_release_notes.py."""

from datetime import datetime, timedelta
import importlib.util
import json
from pathlib import Path
import re
import shutil
import sys
from types import ModuleType

import pytest

REPO_ROOT = Path(__file__).parent.parent


def _load_module() -> ModuleType:
    path = REPO_ROOT / "script" / "generate_release_notes.py"
    spec = importlib.util.spec_from_file_location("generate_release_notes", path)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    # Register before exec so dataclass string annotations resolve on 3.14
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


@pytest.fixture(name="grn")
def grn_fixture() -> ModuleType:
    return _load_module()


@pytest.fixture(name="workspace")
def workspace_fixture(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    """A repo-like tree with both templates and the prompt templates, cwd
    switched into it."""
    script_dir = tmp_path / "script"
    script_dir.mkdir()
    for template in ("release_notes_template.mdx", "blog_post_template.mdx"):
        shutil.copy(REPO_ROOT / "script" / template, script_dir / template)
    shutil.copytree(
        REPO_ROOT / "script" / "prompt_templates", script_dir / "prompt_templates"
    )
    monkeypatch.chdir(tmp_path)
    return tmp_path


def _make_generator(grn: ModuleType, version: str = "2026.9.0", dry_run: bool = False):
    return grn.ReleaseNotesGenerator(
        version=grn.Version.parse(version), dry_run=dry_run
    )


def _make_pr(grn: ModuleType, number: int, title: str, author: str, labels: list[str]):
    return grn.PullRequest(
        number=number,
        title=title,
        body="",
        author=author,
        labels=labels,
        url=f"https://api.github.com/repos/esphome/esphome/pulls/{number}",
        state="MERGED",
    )


def _prepare_assembly_inputs(grn: ModuleType, workspace: Path, generator) -> None:
    """Create the manifest, PR cache, and AI responses assemble needs."""
    prs = [
        _make_pr(grn, 100, "[wifi] Add feature", "alice", ["new-feature"]),
        _make_pr(grn, 101, "[api] Break things", "bob", ["breaking-change"]),
        _make_pr(grn, 102, "Bump ruff from 1 to 2", "app/dependabot", []),
        _make_pr(grn, 103, "Update foo requirement", "carol", ["dependencies"]),
    ]
    generator.prs_cache_dir.mkdir(parents=True, exist_ok=True)
    for pr in prs:
        (generator.prs_cache_dir / f"{pr.number}.json").write_text(
            json.dumps(pr.to_json())
        )
    generator.version_dir.mkdir(parents=True, exist_ok=True)
    (generator.version_dir / "pr_numbers.txt").write_text("100\n101\n102\n103\n")
    generator.responses_dir.mkdir(parents=True, exist_ok=True)
    (generator.responses_dir / "release_overview.md").write_text("The overview.")
    (generator.responses_dir / "upgrade_checklist.md").write_text("- If you upgrade")
    (generator.responses_dir / "feature_highlights.md").write_text("## Big Feature")
    (generator.responses_dir / "breaking_changes_users.md").write_text(
        "### User breaking change"
    )
    (generator.responses_dir / "undocumented_api_changes.md").write_text(
        "- Internal API change"
    )
    (generator.responses_dir / "breaking_changes_developers.md").write_text(
        "- Developer API change"
    )


def test_release_wednesday(grn: ModuleType) -> None:
    wednesday = grn.ReleaseNotesGenerator._release_wednesday()
    assert wednesday.weekday() == 2
    assert abs(wednesday - datetime.now()) < timedelta(days=5)


def test_blog_post_path_prefers_existing_post(
    grn: ModuleType, workspace: Path
) -> None:
    post = workspace / "src/content/docs/blog/2026/09/16/esphome-2026-9.mdx"
    post.parent.mkdir(parents=True)
    post.write_text("---\n---\n")

    generator = _make_generator(grn)
    assert generator._blog_post_path() == Path(
        "src/content/docs/blog/2026/09/16/esphome-2026-9.mdx"
    )


def test_blog_post_path_new_post_dated_release_wednesday(
    grn: ModuleType, workspace: Path
) -> None:
    generator = _make_generator(grn)
    wednesday = grn.ReleaseNotesGenerator._release_wednesday()
    expected = Path(
        "src/content/docs/blog"
    ) / wednesday.strftime("%Y/%m/%d") / "esphome-2026-9.mdx"
    assert generator._blog_post_path() == expected


def test_blog_site_path(grn: ModuleType) -> None:
    assert (
        grn.ReleaseNotesGenerator._blog_site_path(
            Path("src/content/docs/blog/2026/08/19/esphome-2026-8.mdx")
        )
        == "blog/2026/08/19/esphome-2026-8"
    )


def test_load_ai_responses_missing_files_empty(
    grn: ModuleType, workspace: Path
) -> None:
    generator = _make_generator(grn)
    generator.responses_dir.mkdir(parents=True)
    (generator.responses_dir / "release_overview.md").write_text("Overview\n")

    responses = generator._load_ai_responses()
    assert responses["overview"] == "Overview"
    assert responses["contributors"] == ""
    assert responses["companion"] == ""
    assert set(responses) == {
        "overview",
        "upgrade_checklist",
        "highlights",
        "breaking_users",
        "undocumented_api",
        "breaking_devs",
        "contributors",
        "companion",
    }


def test_load_ai_responses_returns_companion_when_present(
    grn: ModuleType, workspace: Path
) -> None:
    generator = _make_generator(grn)
    generator.responses_dir.mkdir(parents=True)
    (generator.responses_dir / "release_overview.md").write_text("Overview\n")
    (generator.responses_dir / "companion_summary.md").write_text("Companion\n")

    responses = generator._load_ai_responses()
    assert responses["companion"] == "Companion"


def test_generate_prompts_writes_companion_summary_txt(
    grn: ModuleType, workspace: Path
) -> None:
    """generate_prompts writes the fourth prompt, driven through the real
    Jinja rendering pipeline (not a mocked template)."""
    generator = _make_generator(grn)
    generator.ensure_dirs()
    prs = [
        _make_pr(grn, 100, "[wifi] Add feature", "alice", ["new-feature"]),
        _make_pr(grn, 101, "[api] Break things", "bob", ["breaking-change"]),
    ]

    generator.generate_prompts(prs)

    companion_prompt = (generator.prompts_dir / "companion_summary.txt").read_text()

    assert str(generator.responses_dir / "companion_summary.md") in companion_prompt
    assert str(generator.responses_dir / "release_overview.md") in companion_prompt
    assert str(generator.responses_dir / "feature_highlights.md") in companion_prompt
    assert (
        str(generator.responses_dir / "breaking_changes_users.md") in companion_prompt
    )
    assert str(generator.responses_dir / "upgrade_checklist.md") in companion_prompt
    assert (
        str(generator.responses_dir / "undocumented_api_changes.md") in companion_prompt
    )
    assert (
        str(generator.responses_dir / "breaking_changes_developers.md")
        in companion_prompt
    )
    assert str(generator._blog_post_path()) in companion_prompt
    assert (
        ":::note[New to ESPHome?]\n"
        "The [ESPHome Starter Kit](/starter-kit/) is the easiest way to start "
        "building your own smart home devices – no soldering, breadboarding, or "
        "coding required.\n"
        ":::"
    ) in companion_prompt


def test_assemble_writes_blog_post_and_changelog(
    grn: ModuleType, workspace: Path
) -> None:
    generator = _make_generator(grn)
    _prepare_assembly_inputs(grn, workspace, generator)
    (generator.responses_dir / "contributors.md").write_text("Thanks to everyone!")
    (generator.responses_dir / "companion_summary.md").write_text(
        "New to ESPHome? Read on for the full details."
    )

    # Blog post already created by the release tooling, with tokens filled
    post = workspace / "src/content/docs/blog/2026/09/16/esphome-2026-9.mdx"
    post.parent.mkdir(parents=True)
    post.write_text(
        (REPO_ROOT / "script" / "blog_post_template.mdx")
        .read_text()
        .replace("{VERSION}", "2026.9.0")
        .replace("{TAGLINE}", "A tagline")
        .replace("{DESCRIPTION}", "A description")
        .replace("{DATE}", "2026-09-16")
        .replace("{BLOG_PATH}", "blog/2026/09/16/esphome-2026-9")
    )

    assert generator.assemble_changelog() is True

    blog = post.read_text()
    assert "New to ESPHome? Read on for the full details." in blog
    # The template's marker comment is replaced, not left alongside the content
    assert "COMPANION SUMMARY" not in blog
    assert "The overview." in blog
    assert "- If you upgrade" in blog
    assert "## Big Feature" in blog
    assert "### User breaking change" in blog
    assert "- Internal API change" in blog
    assert "- Developer API change" in blog
    assert "Thanks to everyone!" in blog
    # Tokens filled by the release tooling are untouched
    assert "A tagline" in blog

    changelog = (workspace / "src/content/docs/changelog/2026.9.0.mdx").read_text()
    assert "Read the [ESPHome 2026.9.0 release notes]" in changelog
    assert "(/blog/2026/09/16/esphome-2026-9/)" in changelog
    assert "[wifi] Add feature" in changelog
    assert "[api] Break things" in changelog
    # Narrative sections no longer belong in the changelog
    assert "The overview." not in changelog
    # Dependency updates (matched by label or dependabot author) are listed
    # under their own heading, not in the all-changes list
    head, tail = changelog.split("### Dependency Changes")
    assert "Bump ruff from 1 to 2" not in head
    assert "Bump ruff from 1 to 2" in tail
    assert "Update foo requirement" not in head
    assert "Update foo requirement" in tail
    assert "[wifi] Add feature" not in tail


def test_assemble_creates_blog_post_from_template(
    grn: ModuleType, workspace: Path
) -> None:
    generator = _make_generator(grn)
    _prepare_assembly_inputs(grn, workspace, generator)

    assert generator.assemble_changelog() is True

    post_path = generator._blog_post_path()
    blog = post_path.read_text()
    assert post_path.exists()
    assert "The overview." in blog
    # No contributors response: fallback is generated from the cached PRs
    assert "@alice" in blog and "@bob" in blog
    assert 'title: "ESPHome 2026.9.0: {TAGLINE}"' in blog
    assert f"date: {'-'.join(post_path.parts[-4:-1])}" in blog
    site_path = grn.ReleaseNotesGenerator._blog_site_path(post_path)
    assert f"https://esphome.io/{site_path}" in blog
    # No companion_summary.md response: the marker block is left untouched
    assert "{/* COMPANION_SUMMARY_START */}" in blog
    assert "{/* COMPANION_SUMMARY_END */}" in blog
    assert "COMPANION SUMMARY" in blog


def test_assemble_preserves_existing_full_list(
    grn: ModuleType, workspace: Path
) -> None:
    generator = _make_generator(grn)
    _prepare_assembly_inputs(grn, workspace, generator)

    changelog_path = workspace / "src/content/docs/changelog/2026.9.0.mdx"
    changelog_path.parent.mkdir(parents=True)
    changelog_path.write_text(
        "---\n---\n\n## Full list of changes\n\nHand-edited list\n"
    )

    assert generator.assemble_changelog() is True
    changelog = changelog_path.read_text()
    assert "Hand-edited list" in changelog
    assert "[wifi] Add feature" not in changelog


def test_assemble_blog_only_skips_changelog_file(
    grn: ModuleType, workspace: Path
) -> None:
    """With blog_only, the blog post is written but the changelog page is
    left alone, since the release tooling writes that page itself."""
    generator = _make_generator(grn)
    _prepare_assembly_inputs(grn, workspace, generator)

    assert generator.assemble_changelog(blog_only=True) is True

    assert generator._blog_post_path().exists()
    assert not (workspace / "src/content/docs/changelog/2026.9.0.mdx").exists()


def test_run_assemble_only_threads_blog_only(grn: ModuleType, workspace: Path) -> None:
    """run(assemble_only=True, blog_only=True) skips PR discovery and passes
    blog_only through to assemble_changelog, so the changelog page is left
    alone."""
    generator = _make_generator(grn)
    _prepare_assembly_inputs(grn, workspace, generator)

    assert generator.run(assemble_only=True, blog_only=True) is True

    assert generator._blog_post_path().exists()
    assert not (workspace / "src/content/docs/changelog/2026.9.0.mdx").exists()


def test_assemble_dry_run_writes_nothing(grn: ModuleType, workspace: Path) -> None:
    generator = _make_generator(grn, dry_run=True)
    _prepare_assembly_inputs(grn, workspace, generator)

    assert generator.assemble_changelog() is True
    assert not (workspace / "src/content/docs/changelog/2026.9.0.mdx").exists()
    assert not generator._blog_post_path().exists()


def test_assemble_errors_without_overview(grn: ModuleType, workspace: Path) -> None:
    generator = _make_generator(grn)
    assert generator.assemble_changelog() is False


def test_assemble_errors_without_manifest(grn: ModuleType, workspace: Path) -> None:
    generator = _make_generator(grn)
    generator.responses_dir.mkdir(parents=True)
    (generator.responses_dir / "release_overview.md").write_text("Overview")
    assert generator.assemble_changelog() is False


def test_assemble_errors_without_cached_prs(grn: ModuleType, workspace: Path) -> None:
    generator = _make_generator(grn)
    generator.responses_dir.mkdir(parents=True)
    (generator.responses_dir / "release_overview.md").write_text("Overview")
    generator.version_dir.mkdir(parents=True, exist_ok=True)
    (generator.version_dir / "pr_numbers.txt").write_text("100\n")
    assert generator.assemble_changelog() is False


def test_assemble_errors_without_blog_template(
    grn: ModuleType, workspace: Path
) -> None:
    generator = _make_generator(grn)
    _prepare_assembly_inputs(grn, workspace, generator)
    (workspace / "script" / "blog_post_template.mdx").unlink()
    assert generator.assemble_changelog() is False


def test_assemble_errors_without_changelog_template(
    grn: ModuleType, workspace: Path
) -> None:
    generator = _make_generator(grn)
    _prepare_assembly_inputs(grn, workspace, generator)
    (workspace / "script" / "release_notes_template.mdx").unlink()
    assert generator.assemble_changelog() is False


def test_blog_post_template_structure() -> None:
    """The blog post template's frontmatter and section headings match the
    copywriters' house style: no cover banner, sentence-case headings, and
    the companion summary/featured-components ordering."""
    template = (REPO_ROOT / "script" / "blog_post_template.mdx").read_text()

    frontmatter = template.split("---", 2)[1]
    assert "cover:" not in frontmatter
    assert 'property: "og:image"' in frontmatter
    assert 'name: "twitter:image"' in frontmatter

    headings = re.findall(r"^#{2,3} .+$", template, re.MULTILINE)
    assert headings == [
        "## Components added in this release",
        "## Release overview",
        "## Upgrade checklist",
        "## Thank you, contributors",
        "## Breaking changes",
        "### Undocumented API changes",
        "### Breaking changes for developers",
        "## Full list of changes",
    ]

    companion_pos = template.index("{/* COMPANION_SUMMARY_START */}")
    components_heading_pos = template.index("## Components added in this release")
    img_table_pos = template.index("<ImgTable")
    overview_pos = template.index("## Release overview")
    assert companion_pos < components_heading_pos < img_table_pos < overview_pos


def test_main_parses_assemble_blog_only(
    grn: ModuleType, workspace: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """--assemble --blog-only is parsed and threaded through to run()."""
    captured_kwargs: dict[str, object] = {}

    def fake_run(self: object, **kwargs: object) -> bool:
        captured_kwargs.update(kwargs)
        return True

    monkeypatch.setattr(
        grn.ReleaseNotesGenerator, "check_github_cli", lambda self: None
    )
    monkeypatch.setattr(grn.ReleaseNotesGenerator, "run", fake_run)
    monkeypatch.setattr(
        sys,
        "argv",
        ["generate_release_notes.py", "2026.9.0", "--assemble", "--blog-only"],
    )

    assert grn.main() == 0
    assert captured_kwargs == {"assemble_only": True, "blog_only": True}


def test_assemble_creates_blog_post_from_template_prints_tagline_guidance(
    grn: ModuleType, workspace: Path, capsys: pytest.CaptureFixture[str]
) -> None:
    """The note printed when creating a new blog post from the template
    tells the operator to keep the tagline plain, sentence-case, and
    jargon-free (no abbreviations like "OTA")."""
    generator = _make_generator(grn)
    _prepare_assembly_inputs(grn, workspace, generator)

    assert generator.assemble_changelog() is True

    output = capsys.readouterr().out
    assert "fill in the {TAGLINE} and {DESCRIPTION} placeholders manually" in output
    assert "plain language in sentence case with no jargon or abbreviations" in output
    assert '"Faster builds and encrypted updates"' in output
    assert '"Faster builds and encrypted OTA"' in output
