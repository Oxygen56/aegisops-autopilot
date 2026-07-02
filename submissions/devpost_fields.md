# Devpost Field Draft

## Project Name

AegisOps Autopilot

## Track

Track 4: Autopilot Agent

## Tagline

Qwen-powered production incident autopilot with memory, agent review, tool-backed evidence, and human approval gates.

## What It Does

AegisOps turns ambiguous production alerts into a traced remediation workflow. It recalls relevant incident memory, gathers log/metric/change/policy evidence, asks Qwen Cloud to diagnose and plan, convenes specialized agent roles, proposes reversible remediation, requires human approval for risky actions, and stores post-incident lessons.

## How We Built It

The app uses a TypeScript Node API, a React dashboard, and a Qwen Cloud client compatible with the OpenAI chat-completions interface. The backend includes a persistent memory layer, deterministic incident fixtures, a five-tool registry for logs/metrics/change graph/policy/dry-run execution, a risk-scored remediation planner, an OpenAPI tool surface, a lightweight MCP stdio server, and an Alibaba Cloud proof endpoint.

## Qwen Cloud Usage

`src/server/agent/qwenClient.ts` calls Qwen Cloud through `https://dashscope-intl.aliyuncs.com/compatible-mode/v1` by default and accepts `QWEN_API_KEY` or `DASHSCOPE_API_KEY`. Offline mode uses deterministic fixtures so judges can test the same workflow without private credentials.

## Custom Tool / MCP Integration

OpenAPI spec: `agents/aegisops/openapi.yaml`

Capability manifest: `agents/aegisops/cap-manifest.json`

MCP stdio server: `src/server/mcp/aegisopsMcp.ts`, runnable with `pnpm run mcp:stdio`.

The five tool calls are `log_search`, `metric_probe`, `change_graph`, `policy_check`, and `remediation_simulator`.

## Alibaba Cloud Deployment Proof

Code proof: https://github.com/Oxygen56/aegisops-autopilot/blob/main/src/server/cloud/alibabaProof.ts

Live proof endpoint after deployment: `https://<your-domain>/api/alibaba/proof`

## Live Demo

Primary runnable workspace: https://stackblitz.com/github/Oxygen56/aegisops-autopilot

GitHub Pages target: https://oxygen56.github.io/aegisops-autopilot/

Pages demo reel target: https://oxygen56.github.io/aegisops-autopilot/?reel=1

The public static demo falls back to deterministic offline fixtures when the private Node API is unavailable. Recheck GitHub Pages before final submission; if it still returns 404, use the StackBlitz workspace as the working demo link. The full Qwen/Alibaba runtime path is documented in the repository and Docker deployment instructions.

## Architecture Diagram

See `docs/ARCHITECTURE.md`.

## Screenshots

Dashboard screenshot: `docs/screenshots/aegisops-dashboard-viewport.png`

Static Pages screenshot: `docs/screenshots/pages-static-reel.png`

## Demo Video

Local draft: `docs/demo/aegisops-demo-reel-draft.m4v`

TODO: Upload the local draft to YouTube/Vimeo/Youku and paste the public URL here.

## Repository

https://github.com/Oxygen56/aegisops-autopilot

## Testing Instructions

```bash
pnpm install
pnpm run test
pnpm run build
pnpm run eval
pnpm run eval:ablation
pnpm run smoke
pnpm run dev
```

Then open the local Vite URL and run the incident workflow.

## Evidence

- `reports/eval_report.md`: full workflow average `0.988`.
- `reports/ablation_report.md`: full workflow average `0.988` versus single-agent baseline `0.420`.
- `reports/experiment_board.md`: contestctl run ledger for tests, build, eval, ablation, and smoke.
- `reports/submission_audit.md`: Devpost requirement-to-evidence audit and final external-action checklist.

## License

MIT
