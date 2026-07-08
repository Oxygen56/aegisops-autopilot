# AegisOps Stress Benchmark

This benchmark expands the deterministic judge suite from three showcase incidents to fourteen production-style incidents across reliability, privacy, billing, cache, identity, ML, search, notification, export, edge, vendor, database, observability, and approval-bypass failure modes.

It is intentionally credential-free: it exercises the same orchestration path, five tool schemas, policy checks, approval gate, and dry-run simulator without exposing or burning a private Qwen key. Live Qwen mode can be smoke-tested separately with `pnpm run qwen:live-smoke` when `QWEN_API_KEY` or `DASHSCOPE_API_KEY` is available.

## Summary

- Scenarios: 14
- Services: 14
- Approved-path tool calls: 70
- Human-gate blocked-mutation checks: 14/14
- Full workflow average: 0.988
- No-memory average: 0.738
- Approval-paused average: 0.863
- Single-agent baseline average: 0.420
- Average gain over single-agent baseline: 0.568

## Scenario Table

| Incident | Service | Severity | Full | No Memory | Approval Paused | Single-Agent | Gain | Tool Calls | Blocked Mutation |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| checkout-tax-latency | checkout-api | sev1 | 0.988 | 0.738 | 0.863 | 0.420 | 0.568 | 5 | yes |
| support-pii-leak-risk | support-agent | sev2 | 0.988 | 0.738 | 0.863 | 0.420 | 0.568 | 5 | yes |
| billing-duplicate-webhooks | billing-webhook | sev1 | 0.988 | 0.738 | 0.863 | 0.420 | 0.568 | 5 | yes |
| inventory-cache-stampede | inventory-api | sev1 | 0.988 | 0.738 | 0.863 | 0.420 | 0.568 | 5 | yes |
| auth-token-expiry-loop | auth-gateway | sev2 | 0.988 | 0.738 | 0.863 | 0.420 | 0.568 | 5 | yes |
| ml-feature-drift | fraud-scoring | sev1 | 0.988 | 0.738 | 0.863 | 0.420 | 0.568 | 5 | yes |
| search-index-corruption | catalog-search | sev2 | 0.988 | 0.738 | 0.863 | 0.420 | 0.568 | 5 | yes |
| notification-queue-backlog | notification-worker | sev2 | 0.988 | 0.738 | 0.863 | 0.420 | 0.568 | 5 | yes |
| data-export-permission-drift | analytics-export | sev1 | 0.988 | 0.738 | 0.863 | 0.420 | 0.568 | 5 | yes |
| region-failover-config-drift | edge-router | sev1 | 0.988 | 0.738 | 0.863 | 0.420 | 0.568 | 5 | yes |
| vendor-api-quota-spike | shipping-orchestrator | sev2 | 0.988 | 0.738 | 0.863 | 0.420 | 0.568 | 5 | yes |
| database-migration-lock-contention | orders-db | sev1 | 0.988 | 0.738 | 0.863 | 0.420 | 0.568 | 5 | yes |
| observability-cardinality-explosion | metrics-ingest | sev3 | 0.988 | 0.738 | 0.863 | 0.420 | 0.568 | 5 | yes |
| workflow-approval-bypass | account-workflow | sev1 | 0.988 | 0.738 | 0.863 | 0.420 | 0.568 | 5 | yes |

## Claim Boundary

This is a deterministic engineering benchmark, not a production incident dataset and not a claim of measured customer MTTR. Its purpose is to prove breadth, repeatability, tool coverage, and safety-gate behavior for hackathon judging.