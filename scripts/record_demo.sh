#!/usr/bin/env bash
set -euo pipefail

out_dir="docs/demo"
mov_path="$out_dir/aegisops-demo-reel-draft.mov"
m4v_path="$out_dir/aegisops-demo-reel-draft.m4v"
demo_url="${DEMO_REEL_URL:-http://127.0.0.1:${DEMO_REEL_PORT:-5184}/?reel=1}"
record_seconds="${DEMO_REEL_SECONDS:-65}"
tmp_dir="$(mktemp -d)"
tmp_mov="$tmp_dir/aegisops-demo-reel-draft.mov"
tmp_m4v="$tmp_dir/aegisops-demo-reel-draft.m4v"
trap 'rm -rf "$tmp_dir"' EXIT

mkdir -p "$out_dir"

osascript \
  -e 'tell application "Google Chrome" to activate' \
  -e 'tell application "Google Chrome" to set bounds of front window to {0, 0, 1280, 760}' \
  -e "tell application \"Google Chrome\" to set URL of active tab of front window to \"$demo_url\""

sleep 3

screencapture -R0,0,1280,760 -v -V "$record_seconds" -x "$tmp_mov"

avconvert \
  --source "$tmp_mov" \
  --preset PresetAppleM4V720pHD \
  --output "$tmp_m4v" \
  --replace

mv "$tmp_mov" "$mov_path"
mv "$tmp_m4v" "$m4v_path"
chmod 644 "$mov_path" "$m4v_path"
echo "Wrote $m4v_path"
