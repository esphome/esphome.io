#! /bin/sh

# Script to convert a PR against `next` from RST to Markdown.
# Start by checking out the PR branch, either from your own repo, or by using the
# gh command, e.g `gh pr checkout https://github.com/esphome/esphome-docs/pull/<pr number>
# Then run this script.
#
# IMPORTANT:
# run `git diff next` afterwards to check just what changes you have made.
# If your PR modifies existing files, it's quite possible you will have
# overwritten any changes made since your PR was created, and the conversion
# process just overwrites the .md file, rather than doing a normal merge.
# So check carefully and manually fix any issues, or just revise the PR from scratch.


git config merge.directoryRenames false

git merge next -X theirs

# There may be conflicts reported 
# Convert files
script/convert_rst_to_md.py . .

# cleanup
rm -rf _* components guides cookbook changelog automations images index.rst markdown.py projects svg2png svg2png.py web-api
git add -u
git commit --quiet --message="Convert to Markdown" 
