# Official Requirements Matrix

Source: Qwen Cloud Hackathon Devpost page, last checked on 2026-07-05.

## Contest Facts

| official item | current submission choice |
| --- | --- |
| Hackathon | Global AI Hackathon Series with Qwen Cloud |
| Deadline | 2026-07-09 14:00 PDT / 2026-07-10 05:00 Beijing time |
| Project | AegisOps Autopilot |
| Selected track | Track 4: Autopilot Agent |
| Submitted Devpost page | `https://devpost.com/software/aegisops-autopilot` |
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
| New or significantly updated project evidence | Verified | `docs/BUILD_PROVENANCE.md`, `reports/build_provenance.md`, `reports/experiment_board.md` |
| Proof of Alibaba Cloud deployment/API usage | Verified | Live ECS demo: `http://101.201.33.56/`; live proof endpoint: `http://101.201.33.56/api/alibaba/proof`; evidence report: `reports/alibaba_deployment_proof.md`; Qwen Base URL proof exists in `src/server/agent/qwenClient.ts`; Alibaba proof code exists in `src/server/cloud/alibabaProof.ts` |
| Architecture diagram | Verified | `docs/ARCHITECTURE.md`, `docs/architecture/aegisops-architecture.svg`, `docs/architecture/aegisops-architecture.png` |
| Public demo video about 3 minutes | Verified | YouTube link: `https://youtu.be/eAqfwJn9sr8`; final 59.5-second video exists at `docs/demo/aegisops-demo-reel-fixed.mov`; consistency audit exists at `reports/video_asset_audit.md`; oEmbed access check returned 200 on 2026-07-04 |
| Text description explaining features and functionality | Verified | `submissions/devpost_fields.md` |
| Track identification | Verified | `Track 4: Autopilot Agent` in `README.md`, `reports/brief.md`, and `submissions/devpost_fields.md` |
| Final Devpost submission | Verified | `submissions/devpost_submission_receipt.md`; observed `Project submitted!` banner and public page `https://devpost.com/software/aegisops-autopilot` |
| Project image gallery polish | Verified | Six gallery images and the creator contribution note are live on `https://devpost.com/software/aegisops-autopilot`; source images are in `docs/screenshots/devpost-gallery/` |
| Optional blog/social post for Blog Post Prize | External action | Draft exists at `submissions/blog_post_draft.md`; public publication still required |

## Judging Criteria Mapping

| official criterion | weight | strongest evidence |
| --- | ---: | --- |
| Technical Depth & Engineering | 30% | `reports/judge_evidence_bundle.md`, `reports/qwen_integration_audit.md`, `agents/aegisops/openapi.yaml`, `src/server/mcp/aegisopsMcp.ts`, `reports/model_ops_report.md` |
| Innovation & AI Creativity | 30% | `reports/judge_evidence_bundle.md`, `docs/ARCHITECTURE.md`, `src/server/agent/orchestrator.ts`, `reports/ablation_report.md`, `reports/judge_demo_transcript.md` |
| Problem Value & Impact | 25% | `reports/judge_evidence_bundle.md`, `docs/IMPACT_CASE.md`, `src/server/agent/fixtures.ts`, `reports/eval_report.md` |
| Presentation & Documentation | 15% | `reports/judge_evidence_bundle.md`, `docs/JUDGE_PACKET.md`, `docs/JUDGE_QUICKSTART.md`, `docs/RUBRIC_SCORECARD.md`, `src/client/main.tsx`, `docs/VIDEO_UPLOAD_METADATA.md` |

## Final External Items

These remain outside the repository:

1. Optionally capture the Alibaba Cloud Workbench screenshot using `docs/ALIBABA_WORKBENCH_SCREENSHOT.md`.
2. Optionally record the separate Alibaba proof video using `docs/ALIBABA_PROOF_RECORDING.md`.
3. Publish `submissions/blog_post_draft.md` if pursuing the Blog Post Award.
