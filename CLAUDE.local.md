# Task: esphome.io docs for code PR esphome/esphome#18071 (modbus_controller)

You are writing documentation for the changes in code PR **#18071** (modbus_controller: interim
`create_command()` write API + the `custom_command:` → `custom_pdu:` rename). #18071 is currently
blocked on the `needs-docs` label; this docs work becomes a PR against **`next`** in
`esphome/esphome.io`, linked back from #18071.

This repo is Astro/Starlight. Docs are `.mdx` under `src/content/docs/components/`. Project rule:
when you edit a platform sub-page, keep the main index page (`modbus_controller.mdx`) in sync.

## Scope — three doc changes, all belonging to #18071

### 1. Rename `custom_command:` → `custom_pdu:` (the main change)
- OLD `custom_command`: a **raw frame** — bytes that had to START WITH the modbus **device address**
  byte, then function code + data. CRC auto-appended.
- NEW `custom_pdu`: the **PDU only** — function code + data, **no leading device-address byte**. The
  controller's configured `address:` and the CRC are added automatically.
- The old `custom_command:` key is removed and now raises a config-validation error pointing at
  `custom_pdu`. Document the rename and a migration note (drop the leading address byte).
- `custom_pdu` remains mutually exclusive with `register_type` / `address`.

Pages that mention `custom_command` (update prose + every example):
- `modbus_controller.mdx` — the "Using `custom_command`" section (~line 230, anchor
  `#modbus_custom_command`) and the two examples (~line 269 and ~279) that begin with `0x2` (the
  device address). Drop that byte, delete the `# 0x2 : modbus device address` comment, and note the
  address now comes from the controller's `address:`.
- `sensor/modbus_controller.mdx` (bullet ~line 64-66)
- `number/modbus_controller.mdx`
- `switch/modbus_controller.mdx`
- `text_sensor/modbus_controller.mdx`
- `binary_sensor/modbus_controller.mdx`

Example transform (main page):
```
# before
# 0x2 : modbus device address     <- remove this line
# 0x4 : modbus function code
custom_command: [ 0x2, 0x4, 0x1, 0x56, 0x00, 0x02]
# after — 0x2 comes from the controller's address:
custom_pdu: [0x4, 0x1, 0x56, 0x00, 0x02]
```
Rename the section heading/anchor to `custom_pdu`, but check how this repo handles the old anchor
`#modbus_custom_command` so existing links don't silently break.

### 2. `address: 0` (broadcast) now rejected at validation
The main page (~line 20-22) already says `0` is the broadcast address and "cannot be polled."
#18071 makes this a **hard config-validation error** for `modbus_controller` (previously it was
only a runtime no-op). Tighten that bullet: address `0` is rejected during validation; valid device
range is `1`-`247`.

### 3. `skip_updates` (per-sensor) deprecated / no longer has effect
#18071 makes per-sensor `skip_updates` a no-op (every range is polled each `update_interval`) and
deprecates the key (config-time warning, removed in a future release). Migration: to poll some
registers less often, put those sensors on a **second `modbus_controller`** with the same `address:`
and a slower `update_interval:`. Update the `skip_updates` bullet on the platform pages (e.g.
`sensor/modbus_controller.mdx` ~line 44) and the example on the main page (~line 376).
NOTE: `offline_skip_updates` is a **different**, controller-level option — leave it alone.

## Out of scope (do NOT document — these belong to later PRs #18080/#18082)
- The `write_lambda` buffer deprecation (returning a raw frame from a `write_lambda`) → #18080.
- `continuous:` polling → #18080.

## Workflow
- Verify every claim against the code PR: `gh pr view 18071 -R esphome/esphome` (it has exact
  semantics and removal versions — read them there rather than guessing).
- Match the style/tone of the surrounding esphome.io pages.
- Build/lint the docs if the repo has a check (look for an npm build/lint script) before finishing.
- Prepare a commit. When the user is happy, open a **draft** PR against `esphome/esphome.io` `next`,
  titled e.g. `[modbus_controller] Rename custom_command to custom_pdu`, and post the link so it can
  be added to #18071's body.
- **Do not push or open the PR without the user's go-ahead.**
