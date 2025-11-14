# Release Notes Generator Skill

Generate ESPHome release notes by analyzing PRs and creating comprehensive changelog sections.

## Prerequisites

Before using this skill, ensure dependencies are installed:

```bash
pip install -r requirements_release_notes.txt
```

This installs:

- `jinja2` - Template engine for prompt generation

You also need:

- GitHub CLI (`gh`) installed and authenticated: `gh auth login`

## Workflow

Follow these steps carefully to generate release notes for a new ESPHome release:

### Step 1: Prompt for Version

**Calculate suggested version** from current date (YYYY.MM.0):

- Get current year and month
- Suggest version like "2025.11.0" for November 2025

**Ask user for version**:

- Display: "Generate release notes for which version? (suggested: {version})"
- User can accept suggestion or provide different version (e.g., 2025.11.1 for patch release)

**Validate version format**: Must match YYYY.MM.PATCH

### Step 2: Discover PRs

**Run PR discovery tool**:

```bash
python script/discover_prs.py {version}
```

This will:

- Fetch all PRs from GitHub between the previous release and current version
- Cache individual PR JSON files in `script/cache/prs/`
- Create PR data summary file (used internally by other scripts)
- Display summary: "Found {total} PRs ({features} features, {components} new components, {breaking} breaking)"

### Step 3: Generate Prompt Files

**Run prompt generator**:

```bash
python script/generate_prompts.py {version}
```

- This generates prompt files from templates in `script/cache/{version}/prompts/`
- Outputs: `overview_and_highlights.txt` and `breaking_changes.txt`

**Tell the user they can edit the prompts**:

- "Prompt files generated in script/cache/{version}/prompts/"
- "You can edit these files before I process them if you want to adjust the instructions"

### Step 4: Read and Follow Prompt Instructions

Read the generated prompt files to understand what needs to be generated:

**Read**: `script/cache/{version}/prompts/overview_and_highlights.txt`

- Contains complete instructions for generating Release Overview and Feature Highlights
- Lists all PR files to read
- Specifies output files and format

**Read**: `script/cache/{version}/prompts/breaking_changes.txt` (if it exists)

- Contains complete instructions for generating Breaking Changes sections
- Lists all breaking change PR files to read
- Separates user-facing and developer-facing changes

**Read**: `script/release_notes_template.md`

- This is the Hugo template structure
- Contains marker locations where content will be inserted

### Step 5: Read PR Labels and Load PR Details

**First, read the PR labels file** to know which PRs to load:

```bash
# Read this file first
script/cache/{version}/pr_labels.json
```

This file contains:

- `new_features`: Array of PR numbers for feature PRs
- `new_components`: Array of PR numbers for component PRs
- `breaking_changes`: Array of PR numbers for breaking change PRs
- `all_prs`: Array of all PR numbers for this version

**Then, read individual PR JSON files** based on the numbers:

- For each PR number listed, read: `script/cache/prs/{pr_number}.json`
- Each file contains: number, title, body (full description), author, labels, url, state, merged_at

**Important**: The `script/cache/prs/` directory is shared across all versions, so you MUST use `pr_labels.json` to know which PRs belong to this version.

### Step 6: Generate Release Notes Sections

Follow the instructions in the prompt files you read in Step 4.

**Generate the following files**:

**Release Overview** (save to `script/cache/{version}/ai_responses/release_overview.md`):

- 2-4 sentences summarizing the major themes
- High-level introduction to what's in this release
- Based on the feature highlights you're about to write

**Feature Highlights** (save to `script/cache/{version}/ai_responses/feature_highlights.md`):

- 3-10 detailed ## sections for major features
- Prioritize: Major Features → Hardware → Architectural → Optimizations → Security → Bug Fixes
- Include specific measurements, examples, and context
- Use {% raw %}{{< docref "/path" >}}{% endraw %} for component links

**Breaking Changes - Users** (save to `script/cache/{version}/ai_responses/breaking_changes_users.md`):

- User-facing breaking changes with migration guidance
- YAML examples showing before/after
- Grouped by impact/component

**Breaking Changes - Developers** (save to `script/cache/{version}/ai_responses/breaking_changes_developers.md`):

- Developer-facing API changes
- C++ code examples showing before/after
- External component migration guidance

**CRITICAL GUIDELINES**:

**Priority Order for Features** (most important first):

- **1. New Major Features** - Groundbreaking user-facing functionality
- **2. New Hardware/Platform Support** - New chips, sensors, component types
- **3. Architectural Improvements** - Framework changes with significant impact
- **4. Performance/Memory Optimizations** - Substantial improvements (5KB+, 50%+)
- **5. Security Enhancements** - Critical security improvements
- **6. Notable Bug Fixes** - Important fixes for crashes, data corruption, major issues

- **What Qualifies as "Major"**:
  - Enables entirely new use cases
  - Adds support for popular/widely-used hardware
  - Framework changes affecting many components
  - Performance gains of 5KB+ or 50%+ improvements
  - Fixes that prevent crashes, data loss, or major malfunctions

- **Breaking Change PRs**:
  - Some PRs labeled "breaking-change" introduce important NEW features
  - You MAY discuss these features in Feature Highlights
  - BUT you MUST acknowledge if they require user action
  - DON'T claim breaking changes are "backward compatible"
  - Save migration details for the Breaking Changes section

- **Accuracy Requirements**:
  - Read FULL PR bodies, not just titles
  - Don't hallucinate measurements or benchmarks
  - Don't claim compatibility when breaking changes exist
  - Verify technical claims against PR descriptions

### Step 7: Assemble Changelog

**Run assemble tool**:

```bash
python script/assemble_changelog.py {version}
```

This tool will:

- Load template from `script/release_notes_template.md`
- Preserve existing `{{< imgtable >}}` and "## Full list of changes" sections if file exists
- Replace marker sections with generated content
- Replace version placeholders ({VERSION}, {DATE})
- Write to `content/changelog/{version}.md`

### Step 8: Remind User to Review

Display a **PROMINENT WARNING** about reviewing for accuracy:

```text
⚠️  CRITICAL: AI-generated content MUST be reviewed for accuracy!

Carefully review and edit: content/changelog/{version}.md

Check for:
  ✓ Hallucinations or inaccurate technical claims
  ✓ Incorrect compatibility statements (e.g., claiming breaking changes are backward compatible)
  ✓ Mischaracterized features or incorrect measurements
  ✓ Proper tone and clarity
  ✓ Correct component links and formatting
```

## Important Notes

- **Create directories if needed**: `script/cache/{version}/ai_responses/` may not exist
- **Read ALL PR files**: Don't skip or try to summarize without reading them all
- **Follow template instructions exactly**: The templates contain detailed guidance
- **Preserve existing content**: Don't overwrite imgtable or "Full list of changes"
- **Be honest about compatibility**: Never claim breaking changes are backward compatible
- **Review is mandatory**: Human review catches hallucinations and ensures accuracy

## Example Usage

```text
User: /release-notes
Assistant: Generate release notes for which version? (suggested: 2025.11.0)
User: 2025.11.0
Assistant: [Runs discovery tool, reads data, generates sections, assembles changelog]
Assistant: ✓ Changelog written to: content/changelog/2025.11.0.md
          ⚠️  CRITICAL: Please review for accuracy!
```

## Success Criteria

- ✓ Version suggested correctly based on current month
- ✓ PR discovery tool runs successfully
- ✓ All PR files read and analyzed
- ✓ All 4 sections generated with quality content
- ✓ Changelog assembled with proper markers replaced
- ✓ Existing content preserved (imgtable, full list)
- ✓ User reminded to review for accuracy
