# AegisOps Autopilot

Qwen Cloud hackathon submission workspace.

AegisOps is a production-incident autopilot for Track 4: Autopilot Agent. It turns ambiguous alerts into a traced remediation workflow: memory recall, multi-agent diagnosis, tool-backed evidence gathering, risk scoring, human approval, patch/runbook generation, and post-incident learning.

The implementation is designed for two judging modes:

- **Live Qwen mode:** set `DASHSCOPE_API_KEY` or `QWEN_API_KEY` and the server calls Qwen Cloud through the OpenAI-compatible endpoint.
- **Offline demo mode:** no secret is required; deterministic fixtures exercise the same orchestration path for judges and CI.

## Quick Start

```bash
pnpm install
pnpm run test
pnpm run build
pnpm run eval
pnpm run eval:ablation
pnpm run dev
```

Open the Vite URL shown by the command and run the incident demo.

## Working Demo Links

Primary runnable workspace:

```text
https://stackblitz.com/github/Oxygen56/aegisops-autopilot?startScript=dev
```

GitHub Pages target:

```text
https://oxygen56.github.io/aegisops-autopilot/
```

Pages demo reel target:

```text
https://oxygen56.github.io/aegisops-autopilot/?reel=1
```

The StackBlitz workspace uses `.stackblitzrc` to run `pnpm run dev` on launch. GitHub Pages is deployed by the repository Pages workflow as a static click-through demo that falls back to deterministic offline fixtures when `/api/*` is unavailable. Live Qwen Cloud mode uses the Node API when `QWEN_API_KEY` or `DASHSCOPE_API_KEY` is configured.

## Environment

```bash
QWEN_API_KEY=sk-...
QWEN_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
QWEN_MODEL=qwen-plus
```

`DASHSCOPE_API_KEY` is also accepted. Do not commit `.env` files.

## Qwen Tools And MCP

AegisOps exposes a judge-verifiable tool surface for Qwen-style orchestration:

- OpenAPI spec: `agents/aegisops/openapi.yaml`
- Capability manifest: `agents/aegisops/cap-manifest.json`
- MCP stdio server: `pnpm run mcp:stdio`
- Tool docs: `docs/QWEN_TOOLS.md`

HTTP tool example:

```bash
curl -sS http://127.0.0.1:8787/api/tools/policy_check \
  -H 'content-type: application/json' \
  -d '{"incidentId":"support-pii-leak-risk"}'
```

## Evidence

- Unit tests: `pnpm run test`
- Production build: `pnpm run build`
- End-to-end API smoke: `pnpm run smoke`
- Fixture eval: `reports/eval_report.md`
- Ablation eval: `reports/ablation_report.md`
- Experiment ledger: `reports/experiment_board.md`
- Judge demo transcript: `reports/judge_demo_transcript.md`
- Final preflight: `pnpm run final:preflight` writes `reports/final_preflight.md`
- Submission audit: `reports/submission_audit.md`

## Submission Assets

- Brief: `reports/brief.md`
- Architecture: `docs/ARCHITECTURE.md`
- Qwen tools: `docs/QWEN_TOOLS.md`
- Judge packet: `docs/JUDGE_PACKET.md`
- Judge quickstart: `docs/JUDGE_QUICKSTART.md`
- Rubric scorecard: `docs/RUBRIC_SCORECARD.md`
- Judge demo transcript: `reports/judge_demo_transcript.md`
- Screenshot: `docs/screenshots/aegisops-dashboard-viewport.png`
- Static demo screenshot: `docs/screenshots/pages-static-reel.png`
- Demo video pack: `docs/VIDEO_SUBMISSION.md`
- Demo video upload metadata: `docs/VIDEO_UPLOAD_METADATA.md`
- Demo script: `docs/DEMO_SCRIPT.md`
- Judge notes: `docs/JUDGE_NOTES.md`
- Publishing: `docs/PUBLISHING.md`
- Devpost copy: `submissions/devpost_fields.md`
- Final submission runbook: `submissions/FINAL_SUBMISSION_RUNBOOK.md`
- Alibaba deployment: `infra/alibaba/DEPLOYMENT.md`
- Full package: `buidl/package/`
