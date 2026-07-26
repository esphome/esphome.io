#!/usr/bin/env bash
# Regenerates lvgl_chart.png from lvgl_chart.yaml, the screenshot used in the `chart` widget
# section of widgets.mdx. Re-run this whenever the chart widget's rendering changes (new chart
# type, style default, etc.) to keep the screenshot in sync.
#
# Prerequisites:
#   - A local esphome checkout (the repo this esphome.io checkout normally lives inside of) with
#     its Python dev environment active, so `python3 -m esphome` picks up the local source tree
#     instead of an installed PyPI package.
#   - ImageMagick (`import`, `convert`), Xvfb, and optipng on PATH.
#
# Usage:
#   ESPHOME_REPO=/path/to/esphome ./lvgl_chart.sh   # if not nested the usual way
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
yaml_src="$script_dir/lvgl_chart.yaml"
png_dst="$script_dir/lvgl_chart.png"

# esphome.io is normally checked out inside the esphome repo itself (i.e. this script's directory
# is <esphome_repo>/esphome.io/src/content/docs/components/lvgl/images); walk up to find it unless
# the caller already told us where it is.
if [ -z "${ESPHOME_REPO:-}" ]; then
  d="$script_dir"
  for _ in 1 2 3 4 5 6 7; do
    d="$(dirname "$d")"
  done
  ESPHOME_REPO="$d"
fi
if [ ! -f "$ESPHOME_REPO/esphome/__main__.py" ]; then
  echo "error: '$ESPHOME_REPO' doesn't look like an esphome checkout." >&2
  echo "Set ESPHOME_REPO to point at one." >&2
  exit 1
fi

work_dir="$(mktemp -d)"
display_num=99
xvfb_pid=""
program_pid=""

cleanup() {
  [ -n "$program_pid" ] && kill "$program_pid" 2>/dev/null || true
  [ -n "$xvfb_pid" ] && kill "$xvfb_pid" 2>/dev/null || true
  rm -rf "$work_dir"
}
trap cleanup EXIT

cp "$yaml_src" "$work_dir/test.yaml"

echo "Compiling $yaml_src for the host platform..."
(cd "$ESPHOME_REPO" && python3 -m esphome compile "$work_dir/test.yaml")

binary="$work_dir/.esphome/build/chart-types-shot/.pioenvs/chart-types-shot/program"
if [ ! -x "$binary" ]; then
  echo "error: expected compiled binary at $binary -- did esphome.name in lvgl_chart.yaml change?" >&2
  exit 1
fi

echo "Rendering under Xvfb..."
Xvfb ":$display_num" -screen 0 700x900x24 &
xvfb_pid=$!
sleep 1
export DISPLAY=":$display_num"

# The demo data uses a virtual clock and freezes once every chart is full (see lvgl_chart.yaml),
# so this no longer races the capture against the real-time scroll -- any delay comfortably past
# the ~9s it takes to fill 30 samples at 300ms gives the identical, frozen image.
"$binary" >"$work_dir/run.log" 2>&1 &
program_pid=$!
sleep 12

raw_shot="$work_dir/screenshot.png"
import -window root "$raw_shot"

kill "$program_pid" 2>/dev/null || true
program_pid=""
kill "$xvfb_pid" 2>/dev/null || true
xvfb_pid=""

echo "Cropping and optimizing..."
convert "$raw_shot" -trim +repage "$png_dst"
optipng -o7 -quiet "$png_dst"

echo "Wrote $png_dst"
