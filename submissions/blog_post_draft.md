# Building AegisOps Autopilot with Qwen Cloud

Production incident response is a high-stakes workflow where speed and caution have to coexist. A thin chatbot is not enough: the system needs memory, tool-backed evidence, approval gates, and an audit trail that a human can trust.

AegisOps Autopilot is my Qwen Cloud hackathon project for Track 4: Autopilot Agent. It accepts ambiguous production alerts, recalls prior operational lessons, gathers evidence from simulated logs, metrics, change graphs, and policy checks, asks Qwen Cloud to produce a conservative diagnosis, and proposes a reversible remediation plan. Risky actions pause behind a human approval checkpoint instead of mutating production blindly.

The project is built for two judging paths. With a Qwen Cloud key, the backend calls the OpenAI-compatible Qwen endpoint. Without a key, deterministic offline fixtures exercise the same orchestration path so judges can reproduce the workflow without private credentials.

The most important design decision was to make every agent action inspectable. The dashboard shows recalled memories, tool outputs, agent-council findings, approval status, remediation commands, and verification metrics. The repository also includes an OpenAPI tool surface, an MCP stdio server, eval fixtures, ablation results, Docker packaging, an architecture diagram, and Alibaba Cloud deployment proof code.

What I learned while building it:

- An Autopilot Agent should not be a black box. Evidence and reversibility matter as much as model quality.
- Qwen Cloud fits naturally as the reasoning layer when the surrounding system provides scoped tools, memory, and policy constraints.
- Offline deterministic fixtures are useful for judging because they make the same workflow testable even when private cloud credentials are unavailable.
- Human-in-the-loop design is not a limitation; it is the control surface that makes production automation credible.

Project repository: https://github.com/Oxygen56/aegisops-autopilot

Runnable workspace: https://stackblitz.com/github/Oxygen56/aegisops-autopilot?startScript=dev

Submitted Devpost page: https://devpost.com/software/aegisops-autopilot

The next step is to deploy the container on Alibaba Cloud with a live Qwen Cloud key, then attach the `/api/alibaba/proof` endpoint and public-safe Workbench proof to the submitted Devpost page.
