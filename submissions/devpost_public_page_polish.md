# Devpost Public Page Polish

Use this file for post-submit edits that improve judge confidence without changing the core claim.

## Creator Contribution Field

```text
I built AegisOps Autopilot end to end: the TypeScript Node API, React judge dashboard, Qwen Cloud OpenAI-compatible Function Calling loop, five incident-scoped tools, MCP/OpenAPI surfaces, deterministic eval and ablation reports, human approval gates, demo video, architecture evidence, and Devpost submission package.
```

## Gallery Files

The public gallery has seven images. The first six come from `docs/screenshots/devpost-gallery/` in this order:

1. `01-dashboard-workflow.png`
2. `02-approved-remediation.png`
3. `03-human-approval-gate.png`
4. `04-openapi-tool-surface.png`
5. `05-architecture-qwen-tools.png`
6. `06-judge-rubric-evidence.png`

The seventh public gallery image is `docs/screenshots/alibaba-workbench-proof.png`, uploaded as `software_photos` ID `4864863` with this caption:

```text
Alibaba Cloud ECS proof: running cn-beijing instance and public IP 101.201.33.56.
```

## Public Page Priority

1. Confirm the embedded YouTube video remains `https://youtu.be/eAqfwJn9sr8`.
2. Confirm the seven-image gallery remains visible.
3. Confirm the creator contribution field remains visible.
4. Keep the live Alibaba Cloud proof links visible.
5. Keep the Blog/Social Post Prize URL visible: `https://oxygen56.github.io/aegisops-autopilot/blog/qwen-cloud-aegisops-autopilot.html`.
6. Keep the adversarial authority benchmark in the first-screen judge summary: `reports/adversarial_authority_benchmark.md`, 56/56 authority-boundary checks, 14/14 active-incident scoping, 14/14 approval-bypass blocks, 14/14 unknown-tool rejections, and 14/14 policy hard-stop checks.

## 2026-07-08 Adversarial Benchmark Refresh

The public Devpost Project Story was updated after commit `6ad55fd391be843e7caec617a78f51e341c068eb` so the first judge-facing summary includes the new adversarial authority benchmark:

```text
The adversarial authority benchmark adds 56 corrupted model/tool-boundary attacks with 56/56 authority-boundary checks passed, 14/14 active-incident scoping checks, 14/14 approval-bypass blocks, 14/14 unknown-tool rejections, and 14/14 policy hard-stop checks.
```

Public verification:

```bash
curl -fsSL https://devpost.com/software/aegisops-autopilot | rg 'adversarial_authority_benchmark|56/56 authority-boundary'
```
