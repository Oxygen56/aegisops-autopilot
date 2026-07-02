# Building AegisOps Autopilot with Qwen Cloud

Production incident response is a high-stakes workflow where speed and caution have to coexist. A thin chatbot is not enough: the system needs memory, tools, approval gates, and evidence that a human can audit.

AegisOps is my Qwen Cloud hackathon project for Track 4: Autopilot Agent. It accepts ambiguous production alerts, recalls prior operational lessons, gathers evidence from simulated logs, metrics, change graph, and policy checks, asks Qwen Cloud to produce a conservative diagnosis, and then proposes a reversible remediation plan. Risky actions are paused behind a human approval gate.

The project is built so judges can run it two ways. With a Qwen Cloud key, the backend calls the OpenAI-compatible Qwen endpoint. Without a key, deterministic fixtures exercise the same orchestration path for reproducible review.

The most important design decision was to make every agent action inspectable. The dashboard shows recalled memories, tool outputs, agent council findings, approval status, remediation commands, and verification metrics. The repository also includes tests, eval fixtures, Docker packaging, an architecture diagram, and Alibaba Cloud deployment proof code.

Link to project: TODO
