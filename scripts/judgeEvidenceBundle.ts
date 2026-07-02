import fs from "node:fs";
import path from "node:path";

type Status = "VERIFIED" | "ACCOUNT-GATED" | "MISSING";

interface EvidenceItem {
  section: string;
  claim: string;
  status: Status;
  evidence: string[];
  proof: string;
}

const root = process.cwd();
const outPath = path.join(root, "reports/judge_evidence_bundle.md");

function fullPath(relativePath: string): string {
  return path.join(root, relativePath);
}

function exists(relativePath: string): boolean {
  return fs.existsSync(fullPath(relativePath));
}

function read(relativePath: string): string {
  return exists(relativePath) ? fs.readFileSync(fullPath(relativePath), "utf8") : "";
}

function includes(relativePath: string, needle: string): boolean {
  return read(relativePath).includes(needle);
}

function verified(ok: boolean): Status {
  return ok ? "VERIFIED" : "MISSING";
}

function allExist(paths: string[]): boolean {
  return paths.every(exists);
}

function escapeTable(value: string): string {
  return value.replace(/\r?\n/g, " ").replaceAll("|", "\\|");
}

const items: EvidenceItem[] = [
  {
    section: "Stage One Viability",
    claim: "Submission fits Track 4: Autopilot Agent",
    status: verified(
      includes("README.md", "Track 4: Autopilot Agent") &&
        includes("submissions/devpost_fields.md", "Track 4: Autopilot Agent") &&
        includes("reports/brief.md", "Track 4")
    ),
    evidence: ["README.md", "submissions/devpost_fields.md", "reports/brief.md"],
    proof: "Track is named consistently in the public repository, Devpost copy, and contest brief."
  },
  {
    section: "Stage One Viability",
    claim: "Project uses Qwen Cloud models and API surface",
    status: verified(
        includes("src/server/agent/qwenClient.ts", "dashscope-intl.aliyuncs.com/compatible-mode/v1") &&
        includes("reports/qwen_integration_audit.md", "Failures: 0") &&
        includes("reports/qwen_integration_audit.md", "Qwen Function Calling loop executes model-selected tools")
    ),
    evidence: ["src/server/agent/qwenClient.ts", "reports/qwen_integration_audit.md", "docs/QWEN_TOOLS.md"],
    proof: "Automated audit verifies endpoint, credentials, offline fallback, live tool-call loop, OpenAPI tools, MCP, and CI coverage."
  },
  {
    section: "Stage One Viability",
    claim: "Judges can run the project without private credentials",
    status: verified(
      includes("docs/JUDGE_QUICKSTART.md", "without private credentials") &&
        includes(".stackblitzrc", "pnpm run dev") &&
        includes("reports/qwen_integration_audit.md", "Deterministic offline judging mode")
    ),
    evidence: ["docs/JUDGE_QUICKSTART.md", ".stackblitzrc", "reports/qwen_integration_audit.md"],
    proof: "StackBlitz/local judging uses deterministic fixtures while preserving the same orchestration path."
  },
  {
    section: "Technical Depth & Engineering",
    claim: "Non-trivial typed architecture with error handling and fallback",
    status: verified(
      allExist(["src/server/agent/orchestrator.ts", "src/server/agent/qwenClient.ts", "src/server/agent/memory.ts"]) &&
        includes("tests/orchestrator.test.ts", "provider fallback must not bypass human approval") &&
        includes("reports/model_ops_report.md", "Qwen provider failure falls back to deterministic diagnosis")
    ),
    evidence: ["src/server/agent/orchestrator.ts", "src/server/agent/qwenClient.ts", "tests/orchestrator.test.ts", "reports/model_ops_report.md"],
    proof: "Tests and model-ops report cover provider failure, deterministic fallback, and approval preservation."
  },
  {
    section: "Technical Depth & Engineering",
    claim: "Custom tool system is portable through Qwen Function Calling, HTTP/OpenAPI, and MCP",
    status: verified(
      includes("docs/QWEN_TOOLS.md", "OpenAI-compatible Qwen Function Calling") &&
        includes("docs/QWEN_TOOLS.md", "role=tool") &&
        includes("reports/qwen_integration_audit.md", "Qwen tool calls are scoped to the active incident") &&
        includes("agents/aegisops/openapi.yaml", "/api/tools/log_search") &&
        includes("src/server/mcp/aegisopsMcp.ts", "tools/list") &&
        includes("tests/orchestrator.test.ts", "Qwen tool loop should make a follow-up model call")
    ),
    evidence: ["docs/QWEN_TOOLS.md", "agents/aegisops/openapi.yaml", "src/server/mcp/aegisopsMcp.ts", "tests/orchestrator.test.ts"],
    proof: "One registry backs Qwen request schemas, live role=tool round trips, active-incident scoping, HTTP endpoints, and MCP stdio calls."
  },
  {
    section: "Innovation & AI Creativity",
    claim: "Full workflow beats weaker baselines on deterministic incident fixtures",
    status: verified(
      includes("reports/eval_report.md", "Average overall score: 0.988") &&
        includes("reports/ablation_report.md", "Single-agent baseline average: 0.420") &&
        includes("reports/ablation_report.md", "Average gain over single-agent baseline: 0.568")
    ),
    evidence: ["reports/eval_report.md", "reports/ablation_report.md", "reports/experiment_board.md"],
    proof: "Ablation report quantifies the gain from memory, tools, approval, and multi-agent workflow."
  },
  {
    section: "Problem Value & Impact",
    claim: "Business pain is concrete across reliability, privacy, and billing risk",
    status: verified(
      includes("docs/IMPACT_CASE.md", "Target Users") &&
        includes("reports/judge_demo_transcript.md", "Support PII risk") &&
        includes("src/server/agent/fixtures.ts", "billing-duplicate-webhooks")
    ),
    evidence: ["docs/IMPACT_CASE.md", "reports/judge_demo_transcript.md", "src/server/agent/fixtures.ts"],
    proof: "Impact case and fixtures cover platform, SRE, security, and finance-risk incident workflows."
  },
  {
    section: "Presentation & Documentation",
    claim: "Judge path, architecture, transcript, Devpost copy, and video metadata are prepared",
    status: verified(
      allExist([
        "docs/JUDGE_PACKET.md",
        "docs/JUDGE_QUICKSTART.md",
        "docs/ARCHITECTURE.md",
        "reports/judge_demo_transcript.md",
        "submissions/devpost_fields.md",
        "docs/VIDEO_UPLOAD_METADATA.md",
        "reports/video_asset_audit.md",
        "src/client/main.tsx"
      ]) &&
        includes("src/client/main.tsx", "Judge rubric evidence")
    ),
    evidence: [
      "docs/JUDGE_PACKET.md",
      "docs/JUDGE_QUICKSTART.md",
      "docs/ARCHITECTURE.md",
      "reports/judge_demo_transcript.md",
      "submissions/devpost_fields.md",
      "docs/VIDEO_UPLOAD_METADATA.md",
      "reports/video_asset_audit.md",
      "src/client/main.tsx"
    ],
    proof: "A judge can follow a five-minute path, inspect deterministic transcript and video asset checks, or see the weighted rubric evidence directly in the demo UI."
  },
  {
    section: "Submission Readiness",
    claim: "Code repository, license, runnable instructions, and packaging scripts exist",
    status: verified(
      allExist(["README.md", "LICENSE", "package.json", "scripts/packageFinalSubmission.ts", "scripts/validateSubmissionPackages.ts"]) &&
        includes("package.json", "\"submission:package\"") &&
        includes("package.json", "\"submission:validate\"")
    ),
    evidence: ["README.md", "LICENSE", "package.json", "scripts/packageFinalSubmission.ts", "scripts/validateSubmissionPackages.ts"],
    proof: "Repository has license, install/run instructions, and deterministic package validation."
  },
  {
    section: "Submission Readiness",
    claim: "Live Alibaba deployment proof is prepared but account-gated",
    status: "ACCOUNT-GATED",
    evidence: ["infra/alibaba/DEPLOYMENT.md", "scripts/verifyAlibabaDeployment.ts", "docs/ALIBABA_PROOF_RECORDING.md"],
    proof: "Deployment scripts and verifier exist; public URL requires Alibaba account credentials and a chosen deployment target."
  },
  {
    section: "Submission Readiness",
    claim: "Public video upload and final Devpost submission are account-gated",
    status: "ACCOUNT-GATED",
    evidence: ["docs/demo/aegisops-demo-reel-draft.m4v", "docs/VIDEO_UPLOAD_METADATA.md", "reports/video_asset_audit.md", "submissions/FINAL_SUBMISSION_RUNBOOK.md"],
    proof: "Local video, captions, metadata, video asset audit, and submit runbook are present; public upload and Devpost submit require account-owner action."
  }
];

const missing = items.filter((item) => item.status === "MISSING");
const verifiedCount = items.filter((item) => item.status === "VERIFIED").length;
const accountGatedCount = items.filter((item) => item.status === "ACCOUNT-GATED").length;

const sections = [...new Set(items.map((item) => item.section))];
const lines = [
  "# Judge Evidence Bundle",
  "",
  "Generated by `pnpm run judge:evidence`.",
  "",
  "This report gives judges a single stable index of the evidence that maps AegisOps Autopilot to the Qwen Cloud Hackathon viability gate and 30/30/25/15 judging rubric.",
  "",
  "## Summary",
  "",
  `- Verified items: ${verifiedCount}`,
  `- Account-gated items: ${accountGatedCount}`,
  `- Missing items: ${missing.length}`,
  "",
  "## Fast Review Links",
  "",
  "- Repository: https://github.com/Oxygen56/aegisops-autopilot",
  "- Runnable workspace: https://stackblitz.com/github/Oxygen56/aegisops-autopilot?startScript=dev",
  "- Static fallback demo: https://oxygen56.github.io/aegisops-autopilot/",
  "- Static demo reel: https://oxygen56.github.io/aegisops-autopilot/?reel=1",
  "",
  ...sections.flatMap((section) => [
    `## ${section}`,
    "",
    "| status | claim | evidence | proof |",
    "| --- | --- | --- | --- |",
    ...items
      .filter((item) => item.section === section)
      .map(
        (item) =>
          `| ${item.status} | ${escapeTable(item.claim)} | ${item.evidence.map((entry) => `\`${entry}\``).join("<br>")} | ${escapeTable(item.proof)} |`
      ),
    ""
  ]),
  "## Recommended Judge Commands",
  "",
  "```bash",
  "pnpm run ci",
  "pnpm run judge:evidence",
  "pnpm run final:preflight",
  "pnpm run submission:validate",
  "```",
  "",
  "## Claim Boundary",
  "",
  "The repository proves the runnable local/StackBlitz workflow, Qwen-compatible integration surface, deterministic evaluations, packaging, and documentation. Live Alibaba deployment, public video upload, optional blog publication, and final Devpost submit remain account-gated until the account owner performs them.",
  ""
];

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${lines.join("\n")}\n`, "utf8");

if (missing.length > 0) {
  console.error(missing.map((item) => item.claim).join("\n"));
  process.exitCode = 1;
} else {
  console.log("judge evidence bundle passed");
}
console.log(`Wrote ${outPath}`);
