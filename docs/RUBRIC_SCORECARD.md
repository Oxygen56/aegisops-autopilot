# Rubric Scorecard

This scorecard maps AegisOps Autopilot to the Qwen Cloud Hackathon judging criteria.

## Stage One: Baseline Viability

| requirement | evidence | status |
| --- | --- | --- |
| Fits a hackathon track | Track 4: Autopilot Agent in `README.md`, `reports/brief.md`, and `submissions/devpost_fields.md` | Verified |
| Uses Qwen Cloud APIs / required tools | `src/server/agent/qwenClient.ts` uses the Qwen/DashScope OpenAI-compatible endpoint and accepts `QWEN_API_KEY` or `DASHSCOPE_API_KEY` | Verified |
| Runs consistently for judges | `docs/JUDGE_QUICKSTART.md`, `.stackblitzrc`, `pnpm run ci`, and deterministic offline fixtures | Verified |
| Public open-source repository and license | `README.md`, `LICENSE`, GitHub repository | Verified |
| Alibaba Cloud deployment proof | `src/server/cloud/alibabaProof.ts`, `infra/alibaba/DEPLOYMENT.md`, `Dockerfile` | Code proof verified; live URL requires account deployment |
| Demo video under 3 minutes | `docs/demo/aegisops-demo-reel-draft.m4v` | Local draft verified; public upload required |

## Stage Two: Weighted Judging Criteria

| criterion | weight | strongest evidence | judge verification |
| --- | ---: | --- | --- |
| Innovation & AI Creativity | 30% | Qwen Cloud reasoning path, five custom incident tools, OpenAPI spec, MCP stdio server, persistent memory, agent council, and human approval gate | `docs/QWEN_TOOLS.md`, `agents/aegisops/openapi.yaml`, `agents/aegisops/cap-manifest.json`, `src/server/mcp/aegisopsMcp.ts`, `reports/judge_demo_transcript.md` |
| Technical Depth & Engineering | 30% | Typed Node/React architecture, deterministic fixture mode, risk-scored remediation planner, policy gate, tests, eval, ablation, Docker target, release gate | `pnpm run ci`, `tests/orchestrator.test.ts`, `reports/eval_report.md`, `reports/ablation_report.md`, `scripts/release_check.sh`, `Dockerfile` |
| Problem Value & Impact | 25% | Real production incident response workflow with reliability, privacy, and finance-risk scenarios; reduces MTTR while preventing unsafe mutation | `src/server/agent/fixtures.ts`, `docs/JUDGE_NOTES.md`, `docs/ARCHITECTURE.md`, `reports/judge_demo_transcript.md` |
| Presentation & Documentation | 15% | Judge quickstart, architecture diagram, demo script, video pack, Devpost copy, submission audit, reproducible run ledger | `docs/JUDGE_QUICKSTART.md`, `docs/ARCHITECTURE.md`, `docs/DEMO_SCRIPT.md`, `docs/VIDEO_SUBMISSION.md`, `submissions/devpost_fields.md`, `reports/submission_audit.md`, `reports/experiment_board.md` |

## Track 4 Autopilot Alignment

| Track 4 expectation | AegisOps implementation |
| --- | --- |
| Automates a real-world business workflow end to end | Handles production incident intake, diagnosis, evidence gathering, remediation planning, approval, dry-run, verification, and post-incident learning |
| Handles ambiguous inputs | Converts vague production alerts into typed incidents, recalled memories, tool evidence, and concrete runbook actions |
| Invokes external tools | Uses `log_search`, `metric_probe`, `change_graph`, `policy_check`, and `remediation_simulator`, exposed through HTTP/OpenAPI and MCP |
| Includes human-in-the-loop checkpoints | Blocks risky production mutation without approval and records the approval checklist |
| Emphasizes production readiness | Includes reversible actions, blast-radius labels, rollback, verification metrics, Docker packaging, secret scan, release checks, and Alibaba deployment proof code |

## Local Evidence Commands

```bash
pnpm run ci
pnpm run judge:transcript
pnpm run submission:audit
pnpm run docker:smoke
```

`pnpm run docker:smoke` requires a running Docker daemon. The other commands run without cloud credentials.

## Current External Dependencies

- Live Qwen Cloud mode requires `QWEN_API_KEY` or `DASHSCOPE_API_KEY`.
- Live Alibaba Cloud deployment requires account credentials and a deployment target.
- Public demo video requires upload to YouTube, Vimeo, or Youku.
- Optional blog/social prize requires publishing `submissions/blog_post_draft.md`.
