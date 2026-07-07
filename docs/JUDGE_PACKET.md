# Judge Packet

This is the fastest evidence path for Qwen Cloud Hackathon judges.

## One-Minute Summary

AegisOps Autopilot is a Track 4 Autopilot Agent safety harness for production operations, not a passive incident dashboard. Qwen Cloud plans through five external incident tools, the same tools are exposed through OpenAPI and MCP for judge verification, and the human approval gate blocks risky mutation before it touches production.

Ablation result for first-pass judging: full workflow `0.988` versus single-agent baseline `0.420`, a `+0.568` absolute gain from memory, tool-backed evidence, policy checks, dry-run remediation, and approval gating.

Primary repository:

```text
https://github.com/Oxygen56/aegisops-autopilot
```

Submitted Devpost project:

```text
https://devpost.com/software/aegisops-autopilot
```

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

Static fallback demo:

```text
https://oxygen56.github.io/aegisops-autopilot/
```

Static demo reel:

```text
https://oxygen56.github.io/aegisops-autopilot/?reel=1
```

## Five-Minute Judge Path

1. Open the live Alibaba ECS demo.
2. Confirm `/api/health` exposes Qwen Cloud provider metadata, model, base URL, timestamp, and redacted credential state.
3. Run the checkout latency incident with human approval enabled.
4. Run the support PII incident without approval.
5. Confirm that risky execution is blocked, but tool evidence and policy reasoning remain visible.

No private key is required for this path. The public ECS deployment exposes the full Node API and Qwen Cloud integration metadata without leaking credentials; when `DASHSCOPE_API_KEY` or `QWEN_API_KEY` is present, the same backend switches to live Qwen Cloud mode through the DashScope OpenAI-compatible endpoint. The StackBlitz path remains as a fallback.

## Prize-Criterion Evidence

| criterion | weight | concrete evidence |
| --- | ---: | --- |
| Technical Depth & Engineering | 30% | Typed Node/React workflow, Qwen Function Calling client, persistent memory, tool registry, OpenAPI, MCP stdio, Docker target, CI/release gate |
| Innovation & AI Creativity | 30% | Agent council, memory-backed diagnosis, live Qwen tool calls, five custom incident tools, human approval, reversible remediation, post-incident learning |
| Problem Value & Impact | 25% | Reliability, privacy, and billing incident scenarios; MTTR reduction without unsafe production mutation |
| Presentation & Documentation | 15% | Judge quickstart, architecture diagram, video pack, scorecard, transcript, submission audit, final runbook |

## Verified Commands

```bash
pnpm run ci
pnpm run judge:evidence
pnpm run judge:transcript
pnpm run submission:audit
pnpm run final:preflight
```

The CI release gate includes:

- secret scan
- unit tests
- production build
- fixture eval
- ablation eval
- Qwen integration audit
- model ops report
- HTTP API smoke
- MCP smoke
- Alibaba deployment verifier smoke
- judge transcript generation
- submission audit

## Current Quantitative Evidence

- Full workflow score: `0.988` in `reports/eval_report.md`.
- Single-agent baseline: `0.420` in `reports/ablation_report.md`.
- Verified improvement: `+0.568` absolute gain in the ablation report.
- Latest final preflight: `reports/final_preflight.md`.

## Key Files

- `docs/JUDGE_QUICKSTART.md`: fastest hands-on path.
- `docs/RUBRIC_SCORECARD.md`: official 30/30/25/15 rubric mapping.
- `docs/OFFICIAL_REQUIREMENTS_MATRIX.md`: official Devpost requirement-to-evidence matrix.
- `docs/BUILD_PROVENANCE.md` and `reports/build_provenance.md`: contest-period build history and significant-update evidence.
- `docs/IMPACT_CASE.md`: problem value, adoption path, KPI model, and impact boundaries.
- `docs/ARCHITECTURE.md`, `docs/architecture/aegisops-architecture.svg`, and `docs/architecture/aegisops-architecture.png`: architecture diagram and component map.
- `docs/QWEN_TOOLS.md`: tool and MCP surface.
- `reports/judge_evidence_bundle.md`: single stable evidence index for viability gate and judging rubric.
- `reports/qwen_integration_audit.md`: automated Qwen endpoint, OpenAPI, and MCP integration audit.
- `reports/model_ops_report.md`: model/provider choices, token estimates, latency budget, and fallback behavior.
- `docs/VIDEO_UPLOAD_METADATA.md`: public video upload title, description, tags, chapters, and captions.
- `reports/video_asset_audit.md`: local video, captions, chapters, and recording-script consistency check.
- `submissions/devpost_submission_receipt.md`: observed Devpost success banner, public project URL, embedded video, and edit window.
- `docs/screenshots/devpost-gallery/README.md`: upload-ready 3:2 Devpost gallery image set.
- `submissions/devpost_public_page_polish.md`: live Devpost seven-image gallery, Workbench proof image, blog link, and creator contribution evidence.
- `reports/alibaba_deployment_proof.md`: live ECS URL, proof endpoint, Qwen Cloud provider metadata, and secret-safe public workflow smoke test.
- `docs/screenshots/alibaba-workbench-proof.png`: public-safe Alibaba ECS screenshot showing the running instance and public IP.
- `public/blog/qwen-cloud-aegisops-autopilot.html`: published Blog/Social Post Prize page.
- `docs/ALIBABA_WORKBENCH_SCREENSHOT.md`: Alibaba Cloud Workbench screenshot proof checklist from the latest Devpost update.
- `docs/ALIBABA_PROOF_RECORDING.md`: separate Alibaba Cloud proof recording checklist and upload metadata.
- `reports/judge_demo_transcript.md`: deterministic approved and blocked workflow transcript.
- `reports/submission_audit.md`: requirement-to-evidence audit.
- `submissions/FINAL_SUBMISSION_RUNBOOK.md`: account-owner submit order.
- `infra/alibaba/DEPLOYMENT.md`: Alibaba Cloud ACR + ECS deployment path and proof verifier.

## Remaining External Upload Item

Upload the separate Alibaba proof recording generated from `docs/ALIBABA_PROOF_RECORDING.md` to YouTube, Vimeo, or Facebook and paste the public-viewable URL into Devpost.
