# AegisOps Autopilot

Qwen Cloud hackathon submission workspace.

AegisOps is a Track 4 Autopilot Agent safety harness, not a passive incident dashboard. Qwen Cloud plans through five external tools, the same tool surface is exposed through OpenAPI and MCP for judge verification, and a human approval gate blocks risky mutations before they touch production.

The ablation evidence is front-loaded for judging: the full workflow scores `0.988` versus `0.420` for the single-agent baseline in `reports/ablation_report.md`. The gain comes from memory, tool-backed evidence, policy checks, dry-run remediation, and approval gating rather than a single free-form agent response.

The implementation is designed for two judging modes:

- **Live Qwen mode:** set `DASHSCOPE_API_KEY` or `QWEN_API_KEY` and the server calls Qwen Cloud through the OpenAI-compatible endpoint, including a capped Function Calling loop for incident tools.
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

Primary live demo:

```text
http://101.201.33.56/
```

Live Alibaba proof endpoint:

```text
http://101.201.33.56/api/alibaba/proof
```

Fallback runnable workspace:

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

Blog/Social Post Prize page:

```text
https://oxygen56.github.io/aegisops-autopilot/blog/qwen-cloud-aegisops-autopilot.html
```

The Alibaba ECS deployment runs the full Node API and exposes Qwen Cloud provider metadata at `/api/health` without leaking credentials. Public reviewer mode may run deterministic fixtures to avoid exposing or burning a private API key; setting `DASHSCOPE_API_KEY` or `QWEN_API_KEY` flips the same backend into live Qwen Cloud mode. The StackBlitz workspace uses `.stackblitzrc` to run `pnpm run dev` on launch as a fallback. GitHub Pages is deployed by the repository Pages workflow as a static click-through demo that falls back to deterministic offline fixtures when `/api/*` is unavailable.

## Environment

```bash
QWEN_API_KEY=sk-...
QWEN_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
QWEN_MODEL=qwen-plus
```

`DASHSCOPE_API_KEY` is also accepted. Do not commit `.env` files.

## Qwen Tools And MCP

AegisOps exposes a judge-verifiable tool surface for Qwen-style orchestration:

- Qwen request body: five OpenAI-compatible function schemas in the `tools` field, live `tool_calls`, and `role=tool` result messages
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
- Judge evidence bundle: `reports/judge_evidence_bundle.md`
- Judge demo transcript: `reports/judge_demo_transcript.md`
- Video asset audit: `reports/video_asset_audit.md`
- Final preflight: `pnpm run final:preflight` writes `reports/final_preflight.md`
- Submission audit: `reports/submission_audit.md`
- Qwen integration audit: `reports/qwen_integration_audit.md`
- Model ops report: `reports/model_ops_report.md`
- Build provenance: `reports/build_provenance.md`
- Visible rubric evidence UI: `src/client/main.tsx` renders the 30/30/25/15 judging map in the dashboard

## Submission Assets

- Brief: `reports/brief.md`
- Architecture: `docs/ARCHITECTURE.md`
- Upload-ready architecture diagram: `docs/architecture/aegisops-architecture.svg`, `docs/architecture/aegisops-architecture.png`
- Qwen tools: `docs/QWEN_TOOLS.md`
- Judge packet: `docs/JUDGE_PACKET.md`
- Build provenance: `docs/BUILD_PROVENANCE.md`
- Judge evidence bundle: `reports/judge_evidence_bundle.md`
- Judge quickstart: `docs/JUDGE_QUICKSTART.md`
- Rubric scorecard: `docs/RUBRIC_SCORECARD.md`
- Rubric evidence UI: dashboard panel titled `Judge rubric evidence`
- Official requirements matrix: `docs/OFFICIAL_REQUIREMENTS_MATRIX.md`
- Impact case: `docs/IMPACT_CASE.md`
- Judge demo transcript: `reports/judge_demo_transcript.md`
- Screenshot: `docs/screenshots/aegisops-dashboard-viewport.png`
- Static demo screenshot: `docs/screenshots/pages-static-reel.png`
- Demo video pack: `docs/VIDEO_SUBMISSION.md`
- Demo video upload metadata: `docs/VIDEO_UPLOAD_METADATA.md`
- Video asset audit: `reports/video_asset_audit.md`
- Alibaba Workbench screenshot proof: `docs/screenshots/alibaba-workbench-proof.png`
- Alibaba Workbench screenshot checklist: `docs/ALIBABA_WORKBENCH_SCREENSHOT.md`
- Alibaba proof recording: `docs/ALIBABA_PROOF_RECORDING.md`
- Demo script: `docs/DEMO_SCRIPT.md`
- Judge notes: `docs/JUDGE_NOTES.md`
- Publishing: `docs/PUBLISHING.md`
- Devpost copy: `submissions/devpost_fields.md`
- Final submission runbook: `submissions/FINAL_SUBMISSION_RUNBOOK.md`
- Alibaba deployment pack: `infra/alibaba/DEPLOYMENT.md`
- Full package: `buidl/package/`
