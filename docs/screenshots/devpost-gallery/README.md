# Devpost Gallery Upload Set

These images are prepared for the Devpost project image gallery. Each file is 1200x800 PNG, matching Devpost's recommended 3:2 display ratio and staying well under the 5 MB per-image limit.

## Upload Order

| order | file | caption |
| ---: | --- | --- |
| 1 | `01-dashboard-workflow.png` | AegisOps dashboard showing the incident queue, Qwen reasoning path, tool evidence, risk scoring, and approval state. |
| 2 | `02-approved-remediation.png` | Approved remediation workflow with memory recall, external tool evidence, agent review, and verification metrics. |
| 3 | `03-human-approval-gate.png` | Human approval gate blocking risky mutation while preserving Qwen diagnosis and policy evidence. |
| 4 | `04-openapi-tool-surface.png` | OpenAPI tool surface exposing the same incident-scoped tools used by the Qwen Function Calling loop. |
| 5 | `05-architecture-qwen-tools.png` | Architecture diagram mapping Qwen Cloud reasoning, scoped tools, memory, MCP/OpenAPI, dashboard, and Alibaba Cloud runtime proof. |
| 6 | `06-judge-rubric-evidence.png` | Judge evidence slide with measured ablation gain over a single-agent baseline. |

## Upload Notes

- Do not upload raw Alibaba Cloud screenshots unless they have been checked for secrets and account identifiers.
- If Devpost asks for a thumbnail, use `01-dashboard-workflow.png`.
- Keep the YouTube demo as the primary media item; this gallery is supporting proof and visual polish.
