# Publishing Checklist

This project is prepared for a public Devpost repository. The remaining publishing actions require account ownership.

## Public Repository

Recommended repository name:

```text
aegisops-autopilot
```

Recommended GitHub description:

```text
Qwen-powered production incident autopilot with memory, Function Calling tools, MCP integration, and human approval gates.
```

Recommended topics:

```text
qwen-cloud, ai-agent, autopilot-agent, mcp, incident-response, alibaba-cloud, hackathon
```

Repository created:

```text
https://github.com/Oxygen56/aegisops-autopilot
```

If pushing from a fresh clone:

```bash
git remote add origin https://github.com/Oxygen56/aegisops-autopilot.git
git push -u origin main
```

Devpost repository URL field:

```text
https://github.com/Oxygen56/aegisops-autopilot
```

## Pre-Push Gate

```bash
pnpm run release:check
pnpm run final:preflight
pnpm run submission:package
pnpm run submission:validate
```

This runs:

- secret scan
- unit tests
- production build
- fixture eval
- ablation eval
- HTTP API smoke
- MCP smoke
- Qwen Function Calling audit
- required artifact checks

## Demo Video

Uploaded:

```text
https://youtu.be/eAqfwJn9sr8
```

The final local asset is `docs/demo/aegisops-demo-reel-fixed.mov`. The video is under three minutes and should be pasted into Devpost.

## Working Demo Links

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

GitHub Pages target:

```text
https://oxygen56.github.io/aegisops-autopilot/
```

Pages demo reel target:

```text
https://oxygen56.github.io/aegisops-autopilot/?reel=1
```

The StackBlitz workspace uses `.stackblitzrc` to run `pnpm run dev` on launch. GitHub Pages is deployed by the repository Pages workflow as a static click-through demo and uses deterministic offline fixtures when `/api/*` is unavailable. It is not a substitute for the Alibaba Cloud proof endpoint, but it gives judges a public fallback demo.

Deployment command:

```bash
pnpm run pages:publish
```

This validates the Pages build locally, ensures the repository is configured for workflow-based Pages deployments, and triggers `.github/workflows/pages.yml` on `main`.

## Alibaba Cloud Deployment

Deploy the Docker container following `infra/alibaba/DEPLOYMENT.md`.

Devpost deployment proof code link:

```text
https://github.com/Oxygen56/aegisops-autopilot/blob/main/src/server/cloud/alibabaProof.ts
```

Live deployment:

```text
http://101.201.33.56/
http://101.201.33.56/api/alibaba/proof
```

Generate or refresh the proof report:

```bash
pnpm run deploy:verify -- http://101.201.33.56
```

## Devpost Final Fields

Use `docs/JUDGE_PACKET.md`, `submissions/FINAL_SUBMISSION_RUNBOOK.md`, `submissions/devpost_fields.md`, and `buidl/BUIDL_SUBMISSION.md`.

The submitted public page is `https://devpost.com/software/aegisops-autopilot`. Devpost still allows edits until the hackathon deadline, so only make post-submit public-page edits that improve evidence clarity and do not introduce unverified claims.
