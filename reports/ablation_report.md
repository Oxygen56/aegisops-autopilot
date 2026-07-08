# AegisOps Ablation Report

This report compares the full AegisOps workflow against weaker baselines across the deterministic incident suite.

Full workflow average: 0.988
No-memory average: 0.738
Approval-paused average: 0.863
Single-agent baseline average: 0.420
Average gain over single-agent baseline: 0.568

| Incident | Full | No Memory | Approval Paused | Single-Agent Baseline | Gain |
| --- | ---: | ---: | ---: | ---: | ---: |
| checkout-tax-latency | 0.988 | 0.738 | 0.863 | 0.420 | 0.568 |
| support-pii-leak-risk | 0.988 | 0.738 | 0.863 | 0.420 | 0.568 |
| billing-duplicate-webhooks | 0.988 | 0.738 | 0.863 | 0.420 | 0.568 |
| inventory-cache-stampede | 0.988 | 0.738 | 0.863 | 0.420 | 0.568 |
| auth-token-expiry-loop | 0.988 | 0.738 | 0.863 | 0.420 | 0.568 |
| ml-feature-drift | 0.988 | 0.738 | 0.863 | 0.420 | 0.568 |
| search-index-corruption | 0.988 | 0.738 | 0.863 | 0.420 | 0.568 |
| notification-queue-backlog | 0.988 | 0.738 | 0.863 | 0.420 | 0.568 |
| data-export-permission-drift | 0.988 | 0.738 | 0.863 | 0.420 | 0.568 |
| region-failover-config-drift | 0.988 | 0.738 | 0.863 | 0.420 | 0.568 |
| vendor-api-quota-spike | 0.988 | 0.738 | 0.863 | 0.420 | 0.568 |
| database-migration-lock-contention | 0.988 | 0.738 | 0.863 | 0.420 | 0.568 |
| observability-cardinality-explosion | 0.988 | 0.738 | 0.863 | 0.420 | 0.568 |
| workflow-approval-bypass | 0.988 | 0.738 | 0.863 | 0.420 | 0.568 |