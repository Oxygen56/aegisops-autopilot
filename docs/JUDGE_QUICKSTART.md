# Judge Quickstart

This is the shortest path for evaluating AegisOps Autopilot. The live Alibaba Cloud ECS deployment is available without private credentials.

## 1. Open The Live Demo

Use the live Alibaba Cloud deployment:

```text
http://101.201.33.56/
```

The proof endpoint is:

```text
http://101.201.33.56/api/alibaba/proof
```

## 2. Fallback Runnable Workspace

If the live service is unavailable, use the fallback StackBlitz workspace:

```text
https://stackblitz.com/github/Oxygen56/aegisops-autopilot?startScript=dev
```

The repository includes `.stackblitzrc`, so StackBlitz should install dependencies and run:

```bash
pnpm run dev
```

When the preview opens, select an incident and run the workflow.

## 3. What To Verify In The Dashboard

Run `Checkout p95 latency jumped after tax calculator rollout` with human approval enabled.

Expected evidence:

- recalled prior operational memories
- log, metric, change graph, policy, and dry-run tool calls
- multi-role agent council review
- reversible remediation plan
- approval record and verification metrics

Then run `Support automation started attaching raw customer transcripts` without approval.

Expected evidence:

- human approval is required
- remediation execution is blocked
- tool-backed policy evidence remains visible for audit

## 4. Local Verification Commands

For a local clone:

```bash
pnpm install
pnpm run ci
```

For focused checks:

```bash
pnpm run test
pnpm run eval
pnpm run eval:ablation
pnpm run smoke
pnpm run smoke:mcp
pnpm run submission:audit
pnpm run final:preflight
```

## 5. API Evidence

For the live deployment, verify:

```bash
curl -sS http://101.201.33.56/api/health
curl -sS http://101.201.33.56/api/alibaba/proof
curl -sS -X POST http://101.201.33.56/api/run \
  -H 'content-type: application/json' \
  -d '{"incidentId":"checkout-tax-latency","autoApprove":false,"approver":"judge-smoke"}'
```

For local development after `pnpm run dev`, verify these endpoints:

```bash
curl -sS http://127.0.0.1:8787/api/health
curl -sS http://127.0.0.1:8787/api/tools
curl -sS http://127.0.0.1:8787/api/alibaba/proof
curl -sS http://127.0.0.1:8787/api/tools/policy_check \
  -H 'content-type: application/json' \
  -d '{"incidentId":"support-pii-leak-risk"}'
```

Expected evidence:

- `/api/health` reports `offline-fixture` mode unless a Qwen key is configured
- `/api/tools` lists five incident-scoped tools
- `/api/alibaba/proof` returns deployment proof fields without secrets
- `policy_check` explains why human approval is required

## 6. Qwen Cloud Mode

The live Alibaba ECS deployment reports `qwen-cloud` mode and uses:

```text
https://dashscope.aliyuncs.com/compatible-mode/v1
```

Set either `QWEN_API_KEY` or `DASHSCOPE_API_KEY` to enable live Qwen Cloud calls:

```bash
QWEN_API_KEY=<redacted> pnpm run dev
```

The default base URL is:

```text
https://dashscope-intl.aliyuncs.com/compatible-mode/v1
```

Without a key, the deterministic offline fixture mode exercises the same orchestration path for reproducible judging.

## 7. Known External Items

- The public Alibaba Cloud URL is live at `http://101.201.33.56/`.
- Verified deployment evidence is in `reports/alibaba_deployment_proof.md`.
- The submitted Devpost page is https://devpost.com/software/aegisops-autopilot.
- The demo video is uploaded at https://youtu.be/eAqfwJn9sr8, embedded on Devpost, and the final local asset is `docs/demo/aegisops-demo-reel-fixed.mov`.
- Devpost gallery images and the creator contribution note are saved on the public project page.
- GitHub Pages is a static fallback demo deployed by the repository Pages workflow; use StackBlitz for the full local Node API path.
