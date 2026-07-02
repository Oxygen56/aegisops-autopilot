# Publishing Checklist

This project is prepared for a public Devpost repository. The remaining publishing actions require account ownership.

## Public Repository

Recommended repository name:

```text
aegisops-autopilot
```

Recommended GitHub description:

```text
Qwen-powered production incident autopilot with memory, custom tools, MCP integration, and human approval gates.
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
```

This runs:

- secret scan
- unit tests
- production build
- fixture eval
- ablation eval
- HTTP API smoke
- MCP smoke
- required artifact checks

## Demo Video

Upload:

```text
docs/demo/aegisops-demo-reel-draft.m4v
```

to YouTube, Vimeo, or Youku. The video is under three minutes. Paste the public URL into Devpost.

## Live Static Demo

GitHub Pages target:

```text
https://oxygen56.github.io/aegisops-autopilot/
```

Demo reel:

```text
https://oxygen56.github.io/aegisops-autopilot/?reel=1
```

The static demo uses deterministic offline fixtures when `/api/*` is unavailable. It is not a substitute for the Alibaba Cloud proof endpoint, but it gives judges a public click-through demo.

## Alibaba Cloud Deployment

Deploy the Docker container following `infra/alibaba/DEPLOYMENT.md`.

Devpost deployment proof code link:

```text
https://github.com/Oxygen56/aegisops-autopilot/blob/main/src/server/cloud/alibabaProof.ts
```

If deployed live, also include:

```text
https://<your-domain>/api/alibaba/proof
```

## Devpost Final Fields

Use `submissions/devpost_fields.md` and `buidl/BUIDL_SUBMISSION.md`.

Final submit is irreversible after the deadline, so the account owner should review and click submit.
