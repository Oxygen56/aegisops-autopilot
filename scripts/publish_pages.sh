#!/usr/bin/env bash
set -euo pipefail

repo="https://github.com/Oxygen56/aegisops-autopilot.git"
workdir="$(mktemp -d)"
trap 'rm -rf "$workdir"' EXIT

pnpm run build:pages

cp -R dist/. "$workdir/"
touch "$workdir/.nojekyll"

git -C "$workdir" init -b gh-pages
git -C "$workdir" config user.name "Codex"
git -C "$workdir" config user.email "codex@example.local"
git -C "$workdir" add .
git -C "$workdir" commit -m "Deploy GitHub Pages static demo"
git -C "$workdir" remote add origin "$repo"
git -C "$workdir" push --force origin gh-pages

gh api --method PUT repos/Oxygen56/aegisops-autopilot/pages --input - <<'JSON'
{"build_type":"legacy","source":{"branch":"gh-pages","path":"/"}}
JSON

echo "Published https://oxygen56.github.io/aegisops-autopilot/"
