# Competition Brief

## Identity

- Slug: `qwencloud-hackathon`
- Platform: `devpost`
- URL: https://qwencloud-hackathon.devpost.com/
- Deadline: 2026-07-20 14:00 PDT / 2026-07-20 17:00 EDT / 2026-07-21 05:00 Beijing time
- Task type: AI agent hackathon

## Metric

- Name: `judge_score`
- Direction: `maximize`
- Local validation: deterministic fixture eval, smoke test, unit tests, build check, demo script dry run
- Public leaderboard: none
- Private/final risk: judges may rely heavily on demo video and documentation, so final package must make Qwen Cloud usage, Alibaba Cloud deployment proof, architecture, and runnable workflow obvious.

## Rules And Constraints

- Required model/tooling: project must use Qwen models available on Qwen Cloud.
- Track selected: Track 4 Autopilot Agent.
- Secondary fit: Track 3 Agent Society and Track 1 MemoryAgent features are included as differentiators, but the submission should identify Track 4.
- Submission requirements: public open-source code repository with license, text description, proof of Alibaba Cloud deployment/API usage, architecture diagram, public demo video under 3 minutes, working demo or test build, English materials.
- Judging: Stage one pass/fail for theme/API fit; stage two applies Technical Depth & Engineering 30%, Innovation & AI Creativity 30%, Problem Value & Impact 25%, Presentation & Documentation 15%.
- Prize target: Track 4 winner, $7,000 cash + $3,000 cloud credits, blog feature, swag, and Ambassador opportunity.
- Allowed external data/models: third-party SDK/API/data only when authorized and licensed.
- Internet at inference/submission: expected for Qwen Cloud API and hosted demo.
- Compute limits: Qwen Cloud credits; avoid requiring paid resources for local judging.
- Team/submission limits: multiple unique submissions allowed, one grand prize maximum per project.
- Required environment: web app plus Node.js API, Docker target for Alibaba Cloud ECS/Function Compute.

## Data And Submission

- Train: none
- Test: deterministic incident fixtures in `src/server/fixtures.ts`
- Sample submission: Devpost form and BUIDL package
- Required columns: not applicable
- Known leakage risks: do not include secrets, private logs, credentials, or proprietary incident data in demo fixtures.

## Current Plan

1. Build AegisOps: Qwen-powered production incident autopilot.
2. Demonstrate ambiguous incident intake, persistent memory recall, multi-agent diagnosis, external tool calls, risk scoring, and human approval gates.
3. Add deterministic offline fixtures so the app remains judge-runnable without private keys.
4. Add Alibaba Cloud deployment proof hook and Docker packaging.
5. Expose custom Qwen tool surfaces via OpenAPI and MCP stdio.
6. Produce architecture docs, demo script, Devpost field copy, tests, ablation evidence, and BUIDL package.

## Sources Checked

- Devpost overview: https://qwencloud-hackathon.devpost.com/
- Devpost official rules: https://qwencloud-hackathon.devpost.com/rules
- Devpost resources and Qwen Cloud API base URL: https://qwencloud-hackathon.devpost.com/resources
- Alibaba Cloud Model Studio OpenAI-compatible API docs: https://www.alibabacloud.com/help/en/model-studio/compatibility-of-openai-with-dashscope
- Last live rule refresh: 2026-07-08
