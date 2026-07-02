#!/usr/bin/env bash
set -euo pipefail

out_dir="docs/demo"
mov_path="$out_dir/aegisops-demo-reel-draft.mov"
m4v_path="$out_dir/aegisops-demo-reel-draft.m4v"

mkdir -p "$out_dir"

osascript \
  -e 'tell application "Google Chrome" to activate' \
  -e 'tell application "Google Chrome" to set bounds of front window to {0, 0, 1280, 760}' \
  -e 'tell application "Google Chrome" to set URL of active tab of front window to "http://localhost:5184/?reel=1"'

sleep 3

screencapture -R0,0,1280,760 -v -V 55 -x "$mov_path"

avconvert \
  --source "$mov_path" \
  --preset PresetAppleM4V720pHD \
  --output "$m4v_path" \
  --replace

chmod 644 "$mov_path" "$m4v_path"
echo "Wrote $m4v_path"
