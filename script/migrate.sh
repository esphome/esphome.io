#! /bin/bash
#
# should have already checked out the `new` branch
current_branch=$(git rev-parse --abbrev-ref HEAD)
[ "$current_branch" != "new" ] && echo only run this script from the 'new' branch && exit 1

#
# Remove previous migration
git reset --hard migration-base
#bring in latest
git merge --no-commit --no-ff origin current
git checkout HEAD -- Makefile
git add -u
git commit -m "Merge current"


# Convert and move
script/convert_rst_to_md.py . .
# Must commit the move before adding the rewrites
git commit --quiet --message="Rename files" --author="esphomebot <68923041+esphomebot@users.noreply.github.com>"

# Extract version and release values from conf.py
# Write to data/version.yaml
mkdir -p data
python3 -c '
import sys
import yaml
import conf
try:
  with open("data/version.yaml", "r") as file:
      data = yaml.safe_load(file)
except FileNotFoundError:
    data = {}
data["release"] = conf.release
data["version"] = conf.version
with open("data/version.yaml", "w") as file:
    yaml.dump(data, file)
'

# Now add the updated content and commit
rm -rf _extensions _static _templates _themes components guides cookbook changelog automations images index.rst markdown.py projects svg2png svg2png.py web-api
git add -u
git add static content
git commit --quiet --message="Convert to Markdown" --author="esphomebot <68923041+esphomebot@users.noreply.github.com>"
