# Devpost Field Draft

## Project Name

AegisOps Autopilot

## Track

Track 4: Autopilot Agent

## Tagline

Qwen-powered production incident autopilot with memory, agent review, tool-backed evidence, and human approval gates.

## What It Does

AegisOps turns ambiguous production alerts into a traced remediation workflow. It recalls relevant incident memory, gathers log/metric/change/policy evidence, asks Qwen Cloud to diagnose and plan, convenes specialized agent roles, proposes reversible remediation, requires human approval for risky actions, and stores post-incident lessons.

The impact target is practical production operations: reduce triage time, improve evidence completeness, and prevent unsafe autonomous mutation for reliability, privacy, and billing-risk incidents. The repository includes `docs/IMPACT_CASE.md` with target users, KPI model, adoption path, and evidence boundaries.

The repository also includes `docs/BUILD_PROVENANCE.md` and `reports/build_provenance.md`, which map Git history to major contest-delivery milestones for the Devpost New & Existing project rule.

## How We Built It

The app uses a TypeScript Node API, a React dashboard, and a Qwen Cloud client compatible with the OpenAI chat-completions interface. The backend includes a persistent memory layer, deterministic incident fixtures, a five-tool registry for logs/metrics/change graph/policy/dry-run execution, an OpenAI-compatible Qwen Function Calling loop, a risk-scored remediation planner, an OpenAPI tool surface, a lightweight MCP stdio server, and an Alibaba Cloud proof endpoint.

## Qwen Cloud Usage

`src/server/agent/qwenClient.ts` accepts `QWEN_API_KEY` or `DASHSCOPE_API_KEY` and calls Qwen Cloud through the DashScope OpenAI-compatible API. The live Alibaba ECS deployment is configured with `https://dashscope.aliyuncs.com/compatible-mode/v1`; the code default remains `https://dashscope-intl.aliyuncs.com/compatible-mode/v1` for international deployments. Offline mode uses deterministic fixtures so judges can test the same workflow without private credentials.

The live Qwen path sends five OpenAI-compatible function tool schemas in the Qwen `tools` field with `tool_choice=auto`. When Qwen returns `tool_calls`, the server executes only incident-scoped tools, overrides any model-supplied incident ID with the active workflow incident, appends `role=tool` outputs, and asks Qwen for the final diagnosis. Offline mode uses deterministic fixtures so judges can test the same workflow without private credentials.

## Custom Tool / MCP Integration

OpenAPI spec: `agents/aegisops/openapi.yaml`

Capability manifest: `agents/aegisops/cap-manifest.json`

MCP stdio server: `src/server/mcp/aegisopsMcp.ts`, runnable with `pnpm run mcp:stdio`.

The five tool calls are `log_search`, `metric_probe`, `change_graph`, `policy_check`, and `remediation_simulator`. The same registry backs the live Qwen Function Calling loop, the HTTP/OpenAPI tool endpoints, and the MCP stdio server.

The dashboard includes a `Judge rubric evidence` panel that maps the official 30/30/25/15 criteria to concrete repository evidence, so judges can quickly verify Qwen integration depth, engineering controls, impact, and documentation readiness from the running demo.

## Alibaba Cloud Deployment Proof

Qwen Cloud Base URL code proof: https://github.com/Oxygen56/aegisops-autopilot/blob/main/src/server/agent/qwenClient.ts

Code proof: https://github.com/Oxygen56/aegisops-autopilot/blob/main/src/server/cloud/alibabaProof.ts

Live demo: `http://101.201.33.56/`

Live proof endpoint: `http://101.201.33.56/api/alibaba/proof`

Verified deployment report: `reports/alibaba_deployment_proof.md`

Verification command: `pnpm run deploy:verify -- http://101.201.33.56`

Workbench screenshot checklist: `docs/ALIBABA_WORKBENCH_SCREENSHOT.md`

Separate proof recording checklist: `docs/ALIBABA_PROOF_RECORDING.md`

Workbench screenshot checklist: `docs/ALIBABA_WORKBENCH_SCREENSHOT.md`

TODO: Upload the separate Alibaba Cloud proof recording and paste the public URL here.

## Live Demo

Primary live demo: http://101.201.33.56/

Fallback runnable workspace: https://stackblitz.com/github/Oxygen56/aegisops-autopilot?startScript=dev

GitHub Pages target: https://oxygen56.github.io/aegisops-autopilot/

Pages demo reel target: https://oxygen56.github.io/aegisops-autopilot/?reel=1

The Alibaba ECS deployment runs the full Node API with live Qwen Cloud mode enabled. The StackBlitz workspace uses `.stackblitzrc` to run `pnpm run dev` on launch as a fallback reviewer path. The public GitHub Pages demo is deployed by the repository Pages workflow and falls back to deterministic offline fixtures when the private Node API is unavailable.

## Architecture Diagram

See `docs/ARCHITECTURE.md`.

Upload-ready diagram assets: `docs/architecture/aegisops-architecture.svg`, `docs/architecture/aegisops-architecture.png`

## Judge Packet

Fastest evidence path: `docs/JUDGE_PACKET.md`

## Screenshots

Dashboard screenshot: `docs/screenshots/aegisops-dashboard-viewport.png`

Static Pages screenshot: `docs/screenshots/pages-static-reel.png`

Devpost gallery upload set: `docs/screenshots/devpost-gallery/`

Recommended gallery order:

1. `01-dashboard-workflow.png`
2. `02-approved-remediation.png`
3. `03-human-approval-gate.png`
4. `04-openapi-tool-surface.png`
5. `05-architecture-qwen-tools.png`
6. `06-judge-rubric-evidence.png`

## Demo Video

YouTube demo video: https://youtu.be/eAqfwJn9sr8

Final local asset: `docs/demo/aegisops-demo-reel-fixed.mov`

Upload metadata, captions, and audit: `docs/VIDEO_UPLOAD_METADATA.md`, `docs/demo/aegisops-demo-reel-fixed.en.srt`, `reports/video_asset_audit.md`

External access check: YouTube oEmbed returned 200 for `https://youtu.be/eAqfwJn9sr8` on 2026-07-04 with the title `AegisOps Autopilot - Qwen Cloud Track 4 Incident Response Agent`.

## Blog / Social Post

Draft: `submissions/blog_post_draft.md`

TODO: Publish the draft publicly and paste the URL here for the optional Blog Post Prize.

## Repository

https://github.com/Oxygen56/aegisops-autopilot

## Submitted Devpost Page

https://devpost.com/software/aegisops-autopilot

## Testing Instructions

Fastest judging path: open http://101.201.33.56/ or the fallback StackBlitz workspace, then follow `docs/JUDGE_QUICKSTART.md`.

Run the checkout latency incident with approval enabled, then run the support PII incident without approval to verify the human approval gate.

For a local clone:

```bash
pnpm install
pnpm run ci
pnpm run dev
```

Then open the local Vite URL and run the incident workflow. Focused verification commands are listed in `docs/JUDGE_QUICKSTART.md`.

## Evidence

- `reports/eval_report.md`: full workflow average `0.988`.
- `reports/ablation_report.md`: full workflow average `0.988` versus single-agent baseline `0.420`.
- `reports/qwen_integration_audit.md`: automated Qwen endpoint, Function Calling loop, custom tool, OpenAPI, and MCP integration audit.
- `reports/model_ops_report.md`: model/provider choices, estimated token footprint, latency budget, and fallback behavior.
- `reports/build_provenance.md`: generated Git-history milestone report for contest-period implementation evidence.
- `reports/experiment_board.md`: contestctl run ledger for tests, build, eval, ablation, and smoke.
- `reports/judge_evidence_bundle.md`: single stable evidence index for viability gate, judging rubric, and live deployment proof.
- `src/client/main.tsx`: visible `Judge rubric evidence` dashboard panel for the official 30/30/25/15 review path.
- `reports/judge_demo_transcript.md`: deterministic transcript for the approved remediation path and the blocked human-gate path.
- `reports/video_asset_audit.md`: local video, captions, chapters, and recording-script consistency check.
- `docs/RUBRIC_SCORECARD.md`: official judging-criteria mapping to concrete repository evidence.
- `docs/OFFICIAL_REQUIREMENTS_MATRIX.md`: official Devpost requirement-to-evidence matrix.
- `docs/architecture/aegisops-architecture.svg` and `docs/architecture/aegisops-architecture.png`: upload-ready architecture diagram showing Qwen Cloud, the backend, memory, tools, dashboard, MCP/OpenAPI, and Alibaba Cloud proof runtime.
- `docs/IMPACT_CASE.md`: target users, KPI model, adoption path, and impact evidence boundaries.
- `pnpm run final:preflight`: latest link/package/CI preflight status for post-submit maintenance.
- `reports/submission_audit.md`: Devpost requirement-to-evidence audit and final external-action checklist.
- `docs/JUDGE_PACKET.md`: one-page judge evidence map and five-minute review path.
- `docs/VIDEO_UPLOAD_METADATA.md`: public video title, description, tags, chapters, thumbnail, and captions.
- `docs/ALIBABA_WORKBENCH_SCREENSHOT.md`: Alibaba Cloud Workbench screenshot proof checklist.
- `docs/ALIBABA_PROOF_RECORDING.md`: separate Alibaba Cloud proof recording script and upload metadata.
- `infra/alibaba/DEPLOYMENT.md`: Alibaba Cloud ACR + ECS deployment pack and proof endpoint instructions.
- `submissions/FINAL_SUBMISSION_RUNBOOK.md`: account-owner submit order, official requirement map, and final 30-minute check.
- `reports/alibaba_deployment_proof.md`: generated after live Alibaba deployment with `pnpm run deploy:verify`.

## License

MIT
