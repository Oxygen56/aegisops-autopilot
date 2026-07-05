# Judge Notes

## Innovation & AI Creativity (30%)

- Uses Qwen Cloud as the diagnosis and planning reasoner through an OpenAI-compatible endpoint.
- Provides a capped live Qwen Function Calling loop plus OpenAPI endpoints and a lightweight MCP stdio server.
- Overrides model-supplied tool incident IDs with the active workflow incident before execution.
- Adds persistent memory recall and post-incident learning.
- Uses an agent council pattern with incident commander, diagnostician, reliability engineer, security reviewer, and human approver.
- Includes policy-aware tool calls and approval gates instead of direct unsafe mutation.

## Technical Depth & Engineering (30%)

- Modular server architecture with typed incidents, memories, tools, and workflow results.
- Tool registry exposes five incident-response tools and keeps every Qwen/OpenAPI/MCP tool incident-scoped.
- Deterministic offline mode for repeatable judging.
- Tests cover memory recall, tool coverage, active-incident tool scoping, approval blocking, and reversible remediation.
- Ablation report shows the full workflow average `0.988` versus `0.420` for a single-agent baseline.
- Docker target and Alibaba Cloud proof endpoint are included.

## Problem Value & Impact (25%)

- Incident response is high-value: reducing MTTR while preventing unsafe automation matters to any production engineering team.
- The demo covers latency, privacy, and billing incidents, showing applicability across reliability, security, and finance-risk workflows.
- The product can expand into real integrations with SLS, CloudMonitor, Git providers, ticketing systems, and deployment controllers.
- `docs/IMPACT_CASE.md` maps the value claim to target users, KPI movement, adoption stages, and clear boundaries around synthetic fixture evidence.

## Presentation & Documentation (15%)

- Judge-facing dashboard visualizes the workflow.
- Architecture diagram, Qwen tool docs, demo script, deployment instructions, eval reports, and Devpost field copy are included.
- The app runs without private keys and switches to Qwen Cloud when credentials are available.

## Current Boundaries

- Synthetic fixtures are used for safety and repeatability.
- Live Qwen Cloud calls require `QWEN_API_KEY` or `DASHSCOPE_API_KEY`.
- The public Alibaba Cloud ECS URL is live at `http://101.201.33.56/`; see `reports/alibaba_deployment_proof.md`.
