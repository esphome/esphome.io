---
name: code-review
description: Review esphome.io documentation changes (the local diff, a branch, or a PR number) against CONTRIBUTING.md, the CI lint gates, and the ESPHome source. Use when asked to review docs changes, a docs PR, or "check my changes before I open a PR".
allowed-tools: Read, Bash, Glob, Grep
---

# ESPHome Docs Code Review

Review documentation changes for this repo and report concrete findings. This is a docs site (Astro + Starlight, MDX
content), so most defects are wrong technical content, broken links or images, and style-guide violations rather than
code bugs.

[CONTRIBUTING.md](../../../CONTRIBUTING.md) is the authoritative style guide. Read it before reviewing; do not rely on
memory of it, since it changes.

## 1. Resolve the Target

The argument decides what is reviewed:

- **No argument**: the working tree diff against the merge base with the target branch (`current` or `next`, see
  below), including uncommitted and untracked files.
- **PR number or URL**: `gh pr view <n> --repo esphome/esphome.io --json title,body,baseRefName,headRefName,files`
  and `gh pr diff <n> --repo esphome/esphome.io`. Do not check the PR out unless running the lint gates needs it,
  and never switch the branch of a main checkout to do so.
- **Branch name**: `git diff $(git merge-base <base> <branch>)..<branch>`.

Determine the base branch: the PR's `baseRefName`, otherwise whichever of `current` / `next` the branch forked from
most recently.

## 2. Run the CI Gates

Read `.github/workflows/ci.yml` and run every step of the `lint` job, not just the first one that fails, since CI
stops at the first red step and hides the rest. At the time of writing that is:

```bash
npx markdownlint-cli --config .markdownlintrc .
```

```bash
npm run format:check
```

```bash
npm run lint:js
```

```bash
npm run lint
```

```bash
npm run check:images
```

If the diff touches `script/` or `tests/` Python, also run `ruff check` and `pytest tests/` (in a `.venv`, never the
system Python). Run `npm run build` only when the change touches components, layouts, config, or MDX imports; for
plain prose edits the lint gates are enough.

If `node_modules` is missing, run `npm ci` first. Report gate failures as findings with the tool output; do not fix
them unless asked.

## 3. Review the Content

Go through every changed file. For each hunk, check:

### Technical Accuracy

- Config keys, types, defaults, and required/optional status match the ESPHome source. Find the component's
  `CONFIG_SCHEMA` in `esphome/components/<name>/` (a local esphome checkout if present, otherwise the
  esphome/esphome repo on the matching branch: `dev` for `next`, `release` for `current`). Treat any claim in the
  page, including ones the existing docs already make, as a hypothesis until the source confirms it.
- For `next` PRs, the matching esphome PR is linked in the description and the docs reflect its final state.
- YAML examples are valid and minimal: no optional keys unless the example is about them, pins written as the literal
  `GPIOXX` (unless the hardware fixes the pin), dependency config linked rather than inlined.
- Deprecated options are removed from the page, not documented as deprecated or given a migration table.

### Structure and Style

- Frontmatter has quoted `title` and `description`; no H1 in the body; headings start at H2, nest properly, and use
  Title Case.
- Configuration variables use `- **key** (**Required**, Type): ...` / `- **key** (*Optional*, Type): ... Defaults to
  ...` formatting.
- Lines are at most 120 characters.
- Internal links are absolute (`/components/wifi/`) with a trailing slash, and the target page and anchor exist
  under `src/content/docs/`. Anchors use the heading slug; new `<span id>` anchors only where a heading anchor is
  impossible.
- Markdown is used where it renders the same as raw HTML; no large inline `<style>` blocks; `&nbsp;` rather than
  `{" "}`.
- Alerts use the GitHub `> [!NOTE]` style with the right severity.
- Text is concise and technical, without marketing language or weasel words.

### Images and Components

- Single-use images are imported from a local `images/` directory; multi-use and ImgTable images live in
  `public/images/`. String `src` values have `width` and `height`.
- Images are optimized (well under the 1 MB lint limit) and prefer transparent backgrounds.
- New components: one image used on both the index card and the page top, an entry in
  `src/content/docs/components/index.mdx` in alphabetical order within its ImgTable block, and a `next` base branch.

### Moved or Deleted Pages

- A redirect exists in `netlify.toml` pointing directly at the final trailing-slash URL, and no links in the repo
  still point at the old path.

### PR Metadata (PR targets only)

- The body follows `.github/PULL_REQUEST_TEMPLATE.md` with the correct base-branch checkbox ticked.
- The base branch is right: fixes to existing docs go to `current`, new features with an esphome PR go to `next`.
- The PR is focused; unrelated changes should be split out.

Skip anything the lint gates already report, so the same problem is not listed twice.

## 4. Report

List findings ranked most severe first. Severity order: wrong technical content, broken build/lint/links/images,
wrong base branch or missing index entry, style-guide violations, minor wording. For each finding give:

- `path:line`
- what is wrong, in one sentence
- the fix, with a suggested replacement when it is short

Only report issues you have verified; drop anything you could not confirm, or mark it clearly as unverified. If
nothing survives, say so plainly. Keep the summary short and free of filler.

Do not edit files, commit, push, or post comments on the PR unless the user explicitly asks.
