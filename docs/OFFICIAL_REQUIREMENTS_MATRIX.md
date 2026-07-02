# Official Requirements Matrix

Source: Qwen Cloud Hackathon Devpost page, last checked on 2026-07-03.

## Contest Facts

| official item | current submission choice |
| --- | --- |
| Hackathon | Global AI Hackathon Series with Qwen Cloud |
| Deadline | 2026-07-09 14:00 PDT / 2026-07-10 05:00 Beijing time |
| Project | AegisOps Autopilot |
| Selected track | Track 4: Autopilot Agent |
| Prize target | Track 4 winner: $7,000 cash + $3,000 cloud credits, blog feature, swag, Ambassador opportunity |
| Bonus target | Blog Post Award after public blog/social publication |

## Track 4 Fit

| Track 4 expectation | status | repository evidence |
| --- | --- | --- |
| Automates a real-world business workflow end to end | Verified | `docs/IMPACT_CASE.md`, `reports/judge_demo_transcript.md`, `src/server/agent/orchestrator.ts` |
| Handles ambiguous inputs | Verified | `src/server/agent/fixtures.ts`, `docs/DEMO_SCRIPT.md`, `docs/JUDGE_QUICKSTART.md` |
| Invokes external tools | Verified | `docs/QWEN_TOOLS.md`, `reports/qwen_integration_audit.md`, `agents/aegisops/openapi.yaml`, `src/server/agent/toolRegistry.ts` |
| Incorporates human-in-the-loop checkpoints | Verified | `tests/orchestrator.test.ts`, `src/server/agent/orchestrator.ts`, `reports/judge_demo_transcript.md` |
| Emphasizes production readiness over toy demos | Verified | `reports/model_ops_report.md`, `infra/alibaba/DEPLOYMENT.md`, `Dockerfile`, `scripts/release_check.sh` |

## Required Submission Items

| official submission requirement | status | paste/link or evidence |
| --- | --- | --- |
| Public code repository for judging and testing | Verified | `https://github.com/Oxygen56/aegisops-autopilot` |
| Open-source license visible in repository | Verified | `LICENSE` |
| Functional source code, assets, and instructions | Verified | `README.md`, `docs/JUDGE_QUICKSTART.md`, `.stackblitzrc`, `Dockerfile` |
| Project uses Qwen models available on Qwen Cloud | Verified | `src/server/agent/qwenClient.ts`, `reports/qwen_integration_audit.md`, `reports/model_ops_report.md` |
| Proof of Alibaba Cloud deployment/API usage | External action | Code proof exists in `src/server/cloud/alibabaProof.ts`; recording instructions exist in `docs/ALIBABA_PROOF_RECORDING.md`; live deployment requires account credentials and `pnpm run deploy:verify -- https://<your-domain>` |
| Architecture diagram | Verified | `docs/ARCHITECTURE.md` |
| Public demo video about 3 minutes | External action | Local video exists at `docs/demo/aegisops-demo-reel-draft.m4v`; public upload still required |
| Text description explaining features and functionality | Verified | `submissions/devpost_fields.md` |
| Track identification | Verified | `Track 4: Autopilot Agent` in `README.md`, `reports/brief.md`, and `submissions/devpost_fields.md` |
| Optional blog/social post for Blog Post Prize | External action | Draft exists at `submissions/blog_post_draft.md`; public publication still required |

## Judging Criteria Mapping

| official criterion | weight | strongest evidence |
| --- | ---: | --- |
| Technical Depth & Engineering | 30% | `reports/qwen_integration_audit.md`, `agents/aegisops/openapi.yaml`, `src/server/mcp/aegisopsMcp.ts`, `reports/model_ops_report.md` |
| Innovation & AI Creativity | 30% | `docs/ARCHITECTURE.md`, `src/server/agent/orchestrator.ts`, `reports/ablation_report.md`, `reports/judge_demo_transcript.md` |
| Problem Value & Impact | 25% | `docs/IMPACT_CASE.md`, `src/server/agent/fixtures.ts`, `reports/eval_report.md` |
| Presentation & Documentation | 15% | `docs/JUDGE_PACKET.md`, `docs/JUDGE_QUICKSTART.md`, `docs/RUBRIC_SCORECARD.md`, `docs/VIDEO_UPLOAD_METADATA.md` |

## Final Account-Gated Items

These cannot be completed from the repository alone:

1. Deploy on Alibaba Cloud with `QWEN_API_KEY` or `DASHSCOPE_API_KEY`, then verify with `pnpm run deploy:verify -- https://<your-domain>`.
2. Record the separate Alibaba proof video using `docs/ALIBABA_PROOF_RECORDING.md`.
3. Upload `docs/demo/aegisops-demo-reel-draft.m4v` publicly using `docs/VIDEO_UPLOAD_METADATA.md` and `docs/demo/aegisops-demo-reel-draft.en.srt`.
4. Publish `submissions/blog_post_draft.md` if pursuing the Blog Post Award.
5. Submit the Devpost form from the account-owner session before the deadline.
