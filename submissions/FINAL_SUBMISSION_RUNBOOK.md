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
| Working project access | StackBlitz URL and GitHub Pages URL below |
| Demo video under 3 minutes | Upload `docs/demo/aegisops-demo-reel-draft.m4v` publicly |
| Alibaba Cloud proof | Code link below; add live `/api/alibaba/proof` URL after deployment |
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
7. Upload the public demo video link after publishing the local `.m4v`.
8. Add the optional blog/social link if published.
9. Run `pnpm run final:preflight` immediately before clicking submit.
10. Submit before the deadline.

## Final 30-Minute Check

```bash
pnpm run ci
pnpm run final:preflight
pnpm run submission:package
```

Then verify:

- `reports/final_preflight.md` has `Fail: 0`.
- StackBlitz, GitHub Pages, and Pages reel return 200.
- The public video link opens in a private/incognito window.
- The Alibaba proof code link opens without login.
- If a live Alibaba URL is available, `/api/alibaba/proof` returns no secrets.

## Judge Narrative

Lead with the Track 4 fit:

```text
AegisOps Autopilot automates a real production incident workflow end to end:
ambiguous alert intake, memory recall, Qwen Cloud diagnosis, five external tools,
agent review, risk scoring, human approval, reversible remediation, verification,
and post-incident learning.
```

Then point judges to:

- `docs/JUDGE_QUICKSTART.md` for the fastest test path.
- `docs/RUBRIC_SCORECARD.md` for the 30/30/25/15 rubric mapping.
- `reports/judge_demo_transcript.md` for deterministic evidence.
- `reports/submission_audit.md` for requirement coverage.
