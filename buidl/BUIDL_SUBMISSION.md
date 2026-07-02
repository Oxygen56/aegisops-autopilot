# qwencloud-hackathon BUIDL Submission

## One-Line Pitch

AegisOps is a Qwen-powered production incident autopilot that turns ambiguous alerts into memory-backed diagnosis, tool evidence, reversible remediation, and human-approved action.

## Problem

Production incidents punish teams for being either too slow or too aggressive. Humans need logs, metrics, recent changes, policy constraints, and prior incident memory before acting, but those sources are scattered. A naive agent can be dangerous if it jumps directly from alert to mutation without approval, rollback, or verification.

## Solution

AegisOps automates the incident workflow end to end:

1. Accepts an ambiguous production alert.
2. Recalls relevant operational memory.
3. Collects evidence from log, metric, change graph, and policy tools.
4. Uses Qwen Cloud to produce a conservative diagnosis and plan.
5. Runs an agent council with reliability and security review.
6. Requires human approval for risky production actions.
7. Generates reversible remediation commands and verification checks.
8. Stores post-incident learning for future cases.
9. Exposes the tools through OpenAPI and MCP stdio surfaces for portable agent integration.

## Demo

- Primary runnable workspace: https://stackblitz.com/github/Oxygen56/aegisops-autopilot?startScript=dev
- GitHub Pages target: https://oxygen56.github.io/aegisops-autopilot/
- Pages demo reel target: https://oxygen56.github.io/aegisops-autopilot/?reel=1
- Video: local draft at `docs/demo/aegisops-demo-reel-draft.m4v`; TODO upload to YouTube/Vimeo/Youku and paste public URL.
- Local run: `pnpm install && pnpm run test && pnpm run build && pnpm run dev`
- Repository: https://github.com/Oxygen56/aegisops-autopilot

## Technical Architecture

- Frontend: React/Vite judge dashboard in `src/client/main.tsx`.
- Backend: TypeScript Node API in `src/server/index.ts`.
- Orchestration: `src/server/agent/orchestrator.ts`.
- Qwen Cloud integration: `src/server/agent/qwenClient.ts`.
- Persistent memory: `src/server/agent/memory.ts`.
- Tool layer: `src/server/agent/tools.ts`.
- Tool registry: `src/server/agent/toolRegistry.ts`.
- MCP server: `src/server/mcp/aegisopsMcp.ts`.
- OpenAPI spec: `agents/aegisops/openapi.yaml`.
- Alibaba Cloud proof: https://github.com/Oxygen56/aegisops-autopilot/blob/main/src/server/cloud/alibabaProof.ts.
- Architecture diagram: `docs/ARCHITECTURE.md`.
- Screenshot: `docs/screenshots/aegisops-dashboard-viewport.png`.
- Static demo screenshot: `docs/screenshots/pages-static-reel.png`.
- Demo video pack: `docs/VIDEO_SUBMISSION.md`.

## Evidence

- Tests: `pnpm run test` passed; logged by contestctl in `experiments/runs/20260703-002530_unit-tests-final`.
- Build: `pnpm run build` passed; logged in `experiments/runs/20260703-002530_production-build-final`.
- Smoke: `pnpm run smoke` passed with score `0.988`; logged in `experiments/runs/20260703-002543_api-smoke-tools-final`.
- MCP smoke: `pnpm run smoke:mcp` passed; logged in `experiments/runs/20260703-002619_mcp-smoke-final`.
- Eval: `reports/eval_report.md` shows average overall score `0.988` across three deterministic incidents.
- Ablation: `reports/ablation_report.md` shows full workflow average `0.988` versus `0.420` for a single-agent baseline.
- Deployment: Dockerfile and Alibaba proof endpoint are ready; live deployment requires the user's Alibaba/Qwen credentials.
- Security checks: `.env` is ignored, proof endpoint returns no secrets, and production mutation is blocked without approval.

## Judging Rubric Mapping

- Innovation: combines Qwen Cloud reasoning, persistent memory, multi-agent review, policy-aware tools, MCP/OpenAPI custom tool surfaces, and approval-gated remediation.
- Technical implementation: typed workflow, deterministic fixtures, tests, Docker target, deployment proof endpoint, and modular agent/tool design.
- Impact: addresses real incident response pain where MTTR and safety both matter.
- Usability: dashboard exposes every decision, evidence source, tool call, and approval state.
- Ecosystem fit: uses Qwen Cloud-compatible APIs and is prepared for Alibaba Cloud ECS/Function Compute deployment.
