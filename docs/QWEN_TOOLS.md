# Qwen Tool And MCP Integration

AegisOps exposes its incident-response capabilities in three judge-verifiable forms:

- OpenAI-compatible Qwen Function Calling tool schemas in the `/chat/completions` request body.
- HTTP/OpenAPI tool endpoints for Qwen-compatible agent orchestration.
- A lightweight MCP stdio server for environments that can attach MCP tools.

## Qwen Function Tool Loop

Source: `src/server/agent/toolRegistry.ts`

The workflow passes five incident-scoped tools to Qwen Cloud with the OpenAI-compatible `tools` request field:

- `log_search`
- `metric_probe`
- `change_graph`
- `policy_check`
- `remediation_simulator`

In live Qwen mode, AegisOps sets `tool_choice=auto`, accepts Qwen `tool_calls`, executes only the incident-scoped server-side tools from the registry, appends tool results as `role=tool` messages, and asks Qwen for the final diagnosis. The loop is capped at two tool-call rounds.

The production-safety design still executes the core evidence tools server-side before diagnosis. Qwen-selected tools are read-only evidence probes or dry-run simulations, and production mutation remains behind the separate human approval gate. The server also overrides any model-supplied `incidentId` with the active workflow incident before executing tools, so a model-selected tool cannot pivot into another incident fixture.

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

This writes `reports/qwen_integration_audit.md` and verifies the Qwen Cloud OpenAI-compatible endpoint, credential environment variables, deterministic offline judging fallback, Qwen Function Calling tool schemas, live tool-call loop, active-incident scoping, five custom tools, OpenAPI paths, MCP stdio methods, and CI coverage.

## Model Ops Report

Run:

```bash
pnpm run model:ops
```

This writes `reports/model_ops_report.md` with model/provider choices, estimated token footprint, local latency budget, fallback behavior, and cost controls for the deterministic judge incidents.
