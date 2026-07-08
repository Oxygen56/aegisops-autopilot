# Final Submission Runbook

Use this runbook for post-submit maintenance of the account-owned Devpost submission. It reflects the official Qwen Cloud Hackathon page checked on 2026-07-08 and the submitted Devpost public page observed after final submit.

## Deadline

- Submit before: 2026-07-20 14:00 PDT / 2026-07-20 17:00 EDT / 2026-07-21 05:00 Beijing time.
- Track: Track 4: Autopilot Agent.
- Track prize target: Track 4 winner, $7,000 cash + $3,000 cloud credits, blog feature, swag, and Ambassador opportunity.
- Bonus target: Blog Post Award, $500 cash + $500 cloud credits.

## Official Requirements Map

| requirement | paste or link |
| --- | --- |
| Submitted Devpost page | `https://devpost.com/software/aegisops-autopilot` |
| Submission receipt | `submissions/devpost_submission_receipt.md` |
| Public open-source repo | `https://github.com/Oxygen56/aegisops-autopilot` |
| Open-source license | `LICENSE` in the repo |
| Text description | `submissions/devpost_fields.md` |
| Track | `Track 4: Autopilot Agent` |
| Architecture diagram | `docs/ARCHITECTURE.md`, `docs/architecture/aegisops-architecture.svg`, and `docs/architecture/aegisops-architecture.png` |
| Judge packet | `docs/JUDGE_PACKET.md` |
| Significant update / provenance evidence | `docs/BUILD_PROVENANCE.md` and `reports/build_provenance.md` |
| Working project access | Live Alibaba ECS URL, proof endpoint, StackBlitz fallback, and GitHub Pages fallback below |
| Demo video under 3 minutes | YouTube link: `https://youtu.be/eAqfwJn9sr8`; final local asset: `docs/demo/aegisops-demo-reel-fixed.mov` |
| Devpost image gallery | Live on public page; source images in `docs/screenshots/devpost-gallery/` |
| Creator contribution note | Live on public page; source text in `submissions/devpost_public_page_polish.md` |
| Alibaba Cloud proof | Live demo `http://101.201.33.56/`, proof endpoint `http://101.201.33.56/api/alibaba/proof`, health endpoint `http://101.201.33.56/api/health`, separate proof video `https://youtu.be/KECJK5LgGOA`, evidence report `reports/alibaba_deployment_proof.md`, and Workbench screenshot `docs/screenshots/alibaba-workbench-proof.png` |
| Optional blog/social URL | `https://oxygen56.github.io/aegisops-autopilot/blog/qwen-cloud-aegisops-autopilot.html` |

## Links To Paste

Repository:

```text
https://github.com/Oxygen56/aegisops-autopilot
```

Devpost public page:

```text
https://devpost.com/software/aegisops-autopilot
```

Primary live demo:

```text
http://101.201.33.56/
```

Live proof endpoint:

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

Architecture diagram asset:

```text
https://github.com/Oxygen56/aegisops-autopilot/blob/main/docs/architecture/aegisops-architecture.svg
```

Architecture diagram PNG:

```text
https://github.com/Oxygen56/aegisops-autopilot/blob/main/docs/architecture/aegisops-architecture.png
```

Alibaba Cloud proof code:

```text
https://github.com/Oxygen56/aegisops-autopilot/blob/main/src/server/cloud/alibabaProof.ts
```

Qwen Cloud Base URL code proof:

```text
https://github.com/Oxygen56/aegisops-autopilot/blob/main/src/server/agent/qwenClient.ts
```

## Devpost Post-Submit Edit Order

The project has already been submitted. Devpost allows edits until the deadline, so use this order for public-page improvements:

1. Open the public page: `https://devpost.com/software/aegisops-autopilot`.
2. Confirm the six-image gallery and creator contribution note remain visible.
3. Confirm the embedded demo video remains `https://youtu.be/eAqfwJn9sr8`.
4. Confirm the live Alibaba URL and proof endpoint remain visible in the Devpost "Try it out" links.
5. Confirm the Alibaba Cloud Workbench screenshot remains at `docs/screenshots/alibaba-workbench-proof.png`.
6. Confirm the separate Alibaba Cloud proof video remains visible: `https://youtu.be/KECJK5LgGOA`.
7. Confirm the Blog/Social Post Prize URL remains visible in Devpost.
8. If deploying to ECS, use `infra/alibaba/deploy-acr-ecs.sh` and keep Qwen credentials only in the remote `.env`.

## Final 30-Minute Check

```bash
pnpm run ci
pnpm run final:preflight
pnpm run submission:package
pnpm run submission:validate
```

Before any further public edit, verify:

- `reports/final_preflight.md` has `Fail: 0`.
- `reports/package_validation.md` has `Failures: 0`.
- Live Alibaba ECS URL, StackBlitz, GitHub Pages, and Pages reel return 200.
- The public video link opens in a private/incognito window.
- The public video has the prepared title, description, chapters, thumbnail, and captions.
- The architecture diagram asset opens without login.
- The submitted Devpost page opens at `https://devpost.com/software/aegisops-autopilot`.
- The separate Alibaba proof recording link opens in a private/incognito window: `https://youtu.be/KECJK5LgGOA`.
- The Alibaba Workbench screenshot is attached or publicly linked and does not expose secrets.
- The Blog/Social Post Prize URL opens without login: `https://oxygen56.github.io/aegisops-autopilot/blog/qwen-cloud-aegisops-autopilot.html`.
- The Qwen base URL proof link opens without login.
- The Alibaba proof code link opens without login.
- `reports/alibaba_deployment_proof.md` exists and `/api/alibaba/proof` returns no secrets.

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
