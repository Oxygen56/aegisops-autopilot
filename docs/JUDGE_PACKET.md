# Judge Packet

This is the fastest evidence path for Qwen Cloud Hackathon judges.

## One-Minute Summary

AegisOps Autopilot is a Track 4 Autopilot Agent for production incident response. It converts an ambiguous alert into memory recall, Qwen Cloud diagnosis, five external tool calls, agent review, risk scoring, human approval, reversible remediation, verification checks, and post-incident learning.

Primary repository:

```text
https://github.com/Oxygen56/aegisops-autopilot
```

Primary runnable workspace:

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

1. Open the StackBlitz workspace.
2. Let it run `pnpm run dev`.
3. Run the checkout latency incident with human approval enabled.
4. Run the support PII incident without approval.
5. Confirm that risky execution is blocked, but tool evidence and policy reasoning remain visible.

No private key is required for this path. With `QWEN_API_KEY` or `DASHSCOPE_API_KEY`, the same server uses Qwen Cloud through the DashScope OpenAI-compatible endpoint.

## Prize-Criterion Evidence

| criterion | weight | concrete evidence |
| --- | ---: | --- |
| Technical Depth & Engineering | 30% | Typed Node/React workflow, Qwen client, persistent memory, tool registry, OpenAPI, MCP stdio, Docker target, CI/release gate |
| Innovation & AI Creativity | 30% | Agent council, memory-backed diagnosis, five custom incident tools, human approval, reversible remediation, post-incident learning |
| Problem Value & Impact | 25% | Reliability, privacy, and billing incident scenarios; MTTR reduction without unsafe production mutation |
| Presentation & Documentation | 15% | Judge quickstart, architecture diagram, video pack, scorecard, transcript, submission audit, final runbook |

## Verified Commands

```bash
pnpm run ci
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
- `docs/ARCHITECTURE.md`: architecture diagram and component map.
- `docs/QWEN_TOOLS.md`: tool and MCP surface.
- `docs/VIDEO_UPLOAD_METADATA.md`: public video upload title, description, tags, chapters, and captions.
- `reports/judge_demo_transcript.md`: deterministic approved and blocked workflow transcript.
- `reports/submission_audit.md`: requirement-to-evidence audit.
- `submissions/FINAL_SUBMISSION_RUNBOOK.md`: account-owner submit order.
- `infra/alibaba/DEPLOYMENT.md`: Alibaba Cloud deployment and proof-verification instructions.

## Account-Gated Items

These are intentionally not claimed as complete until the account owner performs them:

1. Deploy the container on Alibaba Cloud and run `pnpm run deploy:verify -- https://<your-domain>`.
2. Upload `docs/demo/aegisops-demo-reel-draft.m4v` to YouTube, Vimeo, or Youku.
3. Optionally publish `submissions/blog_post_draft.md` for the Blog Post Award.
4. Submit the Devpost form before 2026-07-09 14:00 PDT.
