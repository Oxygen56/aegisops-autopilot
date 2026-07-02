# Qwen Tool And MCP Integration

AegisOps exposes its incident-response capabilities in two judge-verifiable forms:

- HTTP/OpenAPI tool endpoints for Qwen-compatible agent orchestration.
- A lightweight MCP stdio server for environments that can attach MCP tools.

## HTTP Tool Surface

OpenAPI spec: `agents/aegisops/openapi.yaml`

Available tools:

- `log_search`
- `metric_probe`
- `change_graph`
- `policy_check`
- `remediation_simulator`

Example:

```bash
curl -sS http://127.0.0.1:8787/api/tools/policy_check \
  -H 'content-type: application/json' \
  -d '{"incidentId":"support-pii-leak-risk"}'
```

## MCP Stdio Surface

Manifest: `agents/aegisops/cap-manifest.json`

Run:

```bash
pnpm run mcp:stdio
```

Example JSON-RPC line:

```json
{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}
```

Tool call:

```json
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"metric_probe","arguments":{"incidentId":"checkout-tax-latency"}}}
```

## Why This Matters For The Hackathon

The Devpost rubric gives 30% weight to Innovation & AI Creativity and specifically calls out sophisticated Qwen Cloud API usage such as custom skills and MCP integrations. This tool surface makes the agent architecture inspectable and portable instead of hiding tool use inside the UI.

## Automated Integration Audit

Run:

```bash
pnpm run qwen:audit
```

This writes `reports/qwen_integration_audit.md` and verifies the Qwen Cloud OpenAI-compatible endpoint, credential environment variables, deterministic offline judging fallback, five custom tools, OpenAPI paths, MCP stdio methods, and CI coverage.
