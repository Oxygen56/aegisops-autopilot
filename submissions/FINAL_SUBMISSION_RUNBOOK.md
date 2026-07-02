# Final Submission Runbook

Use this runbook for the account-owned Devpost submission. It reflects the official Qwen Cloud Hackathon page checked on 2026-07-03.

## Deadline

- Submit before: 2026-07-09 14:00 PDT / 2026-07-10 05:00 Beijing time.
- Track: Track 4: Autopilot Agent.
- Track prize target: Track 4 winner, $7,000 cash + $3,000 cloud credits, blog feature, swag, and Ambassador opportunity.
- Bonus target: Blog Post Award, $500 cash + $500 cloud credits.

## Official Requirements Map

| requirement | paste or link |
| --- | --- |
| Public open-source repo | `https://github.com/Oxygen56/aegisops-autopilot` |
| Open-source license | `LICENSE` in the repo |
| Text description | `submissions/devpost_fields.md` |
| Track | `Track 4: Autopilot Agent` |
| Architecture diagram | `docs/ARCHITECTURE.md` |
| Judge packet | `docs/JUDGE_PACKET.md` |
| Significant update / provenance evidence | `docs/BUILD_PROVENANCE.md` and `reports/build_provenance.md` |
| Working project access | StackBlitz URL and GitHub Pages URL below |
| Demo video under 3 minutes | Upload `docs/demo/aegisops-demo-reel-draft.m4v` publicly using `docs/VIDEO_UPLOAD_METADATA.md` |
| Alibaba Cloud proof | Use `infra/alibaba/DEPLOYMENT.md`, record proof with `docs/ALIBABA_PROOF_RECORDING.md`, then run `pnpm run deploy:verify -- https://<your-domain>` |
| Optional blog/social URL | Publish `submissions/blog_post_draft.md` and paste the public URL |

## Links To Paste

Repository:

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

Alibaba Cloud proof code:

```text
https://github.com/Oxygen56/aegisops-autopilot/blob/main/src/server/cloud/alibabaProof.ts
```

Live proof endpoint after account deployment:

```text
https://<your-domain>/api/alibaba/proof
```

## Devpost Field Order

1. Join the hackathon with the account owner session.
2. Open the submission form.
3. Project name: `AegisOps Autopilot`.
4. Track: `Track 4: Autopilot Agent`.
5. Paste the relevant sections from `submissions/devpost_fields.md`.
6. Add repository, StackBlitz, GitHub Pages, architecture, and proof-code links.
7. Upload the public demo video using `docs/VIDEO_UPLOAD_METADATA.md`, attach `docs/demo/aegisops-demo-reel-draft.en.srt`, then paste the public video link.
8. Record and upload the separate Alibaba Cloud proof video using `docs/ALIBABA_PROOF_RECORDING.md`.
9. Add the optional blog/social link if published.
10. If the Alibaba service is live, run `pnpm run deploy:verify -- https://<your-domain>`.
11. If deploying to ECS, use `infra/alibaba/deploy-acr-ecs.sh` and keep Qwen credentials only in the remote `.env`.
12. Run `pnpm run final:preflight` immediately before clicking submit.
13. Submit before the deadline.

## Final 30-Minute Check

```bash
pnpm run ci
pnpm run final:preflight
pnpm run submission:package
pnpm run submission:validate
```

Then verify:

- `reports/final_preflight.md` has `Fail: 0`.
- `reports/package_validation.md` has `Failures: 0`.
- StackBlitz, GitHub Pages, and Pages reel return 200.
- The public video link opens in a private/incognito window.
- The public video has the prepared title, description, chapters, thumbnail, and captions.
- The separate Alibaba proof recording link opens in a private/incognito window.
- The Alibaba proof code link opens without login.
- If a live Alibaba URL is available, `reports/alibaba_deployment_proof.md` exists and `/api/alibaba/proof` returns no secrets.

## Judge Narrative

Lead with the Track 4 fit:

```text
AegisOps Autopilot automates a real production incident workflow end to end:
ambiguous alert intake, memory recall, Qwen Cloud diagnosis, five external tools,
agent review, risk scoring, human approval, reversible remediation, verification,
and post-incident learning.
```

Then point judges to:

- `docs/OFFICIAL_REQUIREMENTS_MATRIX.md` for official Devpost requirement coverage.
- `docs/JUDGE_QUICKSTART.md` for the fastest test path.
- `docs/JUDGE_PACKET.md` for the one-page evidence map.
- `docs/BUILD_PROVENANCE.md` and `reports/build_provenance.md` for the build history and significant-update evidence.
- `docs/RUBRIC_SCORECARD.md` for the 30/30/25/15 rubric mapping.
- `reports/judge_demo_transcript.md` for deterministic evidence.
- `reports/submission_audit.md` for requirement coverage.
