#!/usr/bin/env bash
set -euo pipefail

pnpm run secret:scan
pnpm run test
pnpm run build
pnpm run eval
pnpm run eval:ablation
pnpm run smoke
pnpm run smoke:mcp
pnpm run judge:transcript
pnpm run submission:audit

test -s LICENSE
test -s README.md
test -s .stackblitzrc
test -s docs/ARCHITECTURE.md
test -s docs/JUDGE_QUICKSTART.md
test -s docs/QWEN_TOOLS.md
test -s docs/VIDEO_SUBMISSION.md
test -s submissions/devpost_fields.md
test -s docs/demo/aegisops-demo-reel-draft.m4v
test -s docs/screenshots/aegisops-dashboard-viewport.png
test -s docs/screenshots/pages-static-reel.png
test -s agents/aegisops/openapi.yaml
test -s agents/aegisops/cap-manifest.json
test -s reports/judge_demo_transcript.md
test -s reports/submission_audit.md

echo "release check passed"
