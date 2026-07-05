# Impact Case

This document explains why AegisOps Autopilot is a high-value Track 4 project and how judges can evaluate the impact claim without relying on private production data.

## Real-World Pain

Production incident response has two conflicting pressures:

- Teams need fast diagnosis because latency, privacy, and billing incidents become more expensive every minute they remain unresolved.
- Teams cannot let an autonomous agent mutate production blindly, because a wrong rollback, unsafe retry, or leaked customer context can make the incident worse.

AegisOps targets the operational gap between a read-only chatbot and a fully autonomous production bot. It automates the repetitive evidence-gathering and planning work while preserving human approval for risky mutation.

## Target Users

| user | current pain | AegisOps value |
| --- | --- | --- |
| On-call SRE | Manually jumps between logs, metrics, deploy history, and runbooks during an alert | One traced workflow gathers evidence, ranks risk, and proposes a narrow reversible plan |
| Platform engineering lead | Wants automation but needs controls before production mutation | Approval gates, rollback notes, and audit-friendly tool evidence make automation governable |
| Security or privacy reviewer | Needs proof that sensitive data is not exposed during response | Policy checks and blocked execution paths keep PII-sensitive incidents from unsafe remediation |
| FinOps or revenue owner | Needs fast triage for duplicate charge, webhook, or billing anomalies | Billing fixture demonstrates risk-aware diagnosis and dry-run remediation without hiding evidence |

## Verified Impact Evidence

| impact claim | current repository evidence | boundary |
| --- | --- | --- |
| Shortens triage loop | `reports/judge_demo_transcript.md` shows memory recall, tool evidence, diagnosis, plan, approval state, and verification in one run | Synthetic fixtures, not a production MTTR measurement |
| Prevents unsafe autonomous mutation | `tests/orchestrator.test.ts` proves risky remediation is blocked without approval | Human approval policy is implemented for the demo workflow; production policy integrations would be added per team |
| Keeps evidence inspectable | Dashboard, OpenAPI, MCP, and transcript expose tool outputs instead of only final answers | External production tools are represented by deterministic fixtures for judge repeatability |
| Improves over a thin single-agent baseline | `reports/ablation_report.md` shows full workflow average `0.988` versus baseline `0.420` | Local eval measures fixture behavior and safety checks, not live customer incidents |
| Fits Alibaba/Qwen Cloud productization | Live ECS demo `http://101.201.33.56/`, proof endpoint `http://101.201.33.56/api/alibaba/proof`, Docker target, Qwen OpenAI-compatible client, and `reports/alibaba_deployment_proof.md` | Public demo is verified; production adoption still needs customer-owned credentials and controls |

## KPI Model For A Real Pilot

These are the metrics a team would track during a controlled pilot after connecting real observability and deployment tools:

| KPI | baseline source | expected movement |
| --- | --- | --- |
| Mean time to first hypothesis | Incident timeline and alert timestamps | Down, because memory and tool evidence are assembled automatically |
| Mean time to safe remediation proposal | Ticket or incident-management timeline | Down, because the agent produces a scoped plan and rollback notes |
| Unsafe action attempts blocked | Approval and policy logs | Up initially, because risky actions become visible and enforceable |
| Evidence completeness per incident | Postmortem checklist coverage | Up, because logs, metrics, changes, policy checks, and verification are collected in one trace |
| Repeat incident learning | Memory hit rate on recurring symptoms | Up, because resolved incidents write reusable lessons |

The repository does not claim these KPI movements as production-verified. It provides the instrumented workflow needed to measure them in a pilot.

## Adoption Path

1. Read-only advisor: connect Alibaba Cloud SLS, CloudMonitor, ARMS, and deployment metadata as read-only tools.
2. Approval-gated dry run: allow AegisOps to propose remediations and run simulation checks, but require human approval for all mutation.
3. Limited reversible actions: allow a narrow allowlist such as rollback to previous deployment, traffic shift, or feature-flag disable.
4. Policy expansion: add team-specific privacy, finance, compliance, and blast-radius policies.
5. Continuous learning: write post-incident memories and evaluate recurring incident classes before widening automation.

## Why This Is More Than A Chatbot

- It uses Qwen Cloud as the reasoning layer, but the winning value comes from the surrounding system: scoped tools, memory, risk scoring, approval gates, and verification.
- It exposes the same incident tool surface through Qwen Function Calling, HTTP/OpenAPI, and MCP stdio, making the agent composable instead of dashboard-only.
- It demonstrates three business-relevant incident categories: reliability latency, privacy/PII handling, and billing-risk workflows.
- It is designed for conservative production adoption: every risky step is visible, reversible, and accountable.

## Judge Verification Path

1. Read `docs/JUDGE_PACKET.md` for the fastest evidence map.
2. Run `pnpm run judge:transcript` to regenerate the approved and blocked workflow transcript.
3. Run `pnpm run eval:ablation` to compare the full workflow against the single-agent baseline.
4. Open the dashboard or StackBlitz workspace and run the checkout latency and support PII incidents.
5. Inspect `infra/alibaba/DEPLOYMENT.md` for the Alibaba Cloud deployment path and `/api/alibaba/proof` verifier.
