# Live Qwen Smoke Proof

Status: `account-gated`

No Qwen/DashScope credential was present in the current shell, so the live smoke was not executed. This is intentional for public-safe CI and local review.

To run the one-shot proof in a private shell:

```bash
QWEN_API_KEY=... pnpm run qwen:live-smoke
```

The generated report records provider mode, model, base URL, latency, and tool-schema count. It never writes the secret value.