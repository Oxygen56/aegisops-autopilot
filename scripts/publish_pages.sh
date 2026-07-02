#!/usr/bin/env bash
set -euo pipefail

pnpm run build:pages

gh api --method PUT repos/Oxygen56/aegisops-autopilot/pages --input - <<'JSON'
{"build_type":"workflow"}
JSON

gh workflow run pages.yml --repo Oxygen56/aegisops-autopilot --ref main

echo "Triggered GitHub Pages deployment: https://oxygen56.github.io/aegisops-autopilot/"
