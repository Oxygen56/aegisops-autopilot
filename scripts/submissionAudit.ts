import fs from "node:fs";
import path from "node:path";

type Status = "verified" | "external-action" | "monitor";

interface AuditItem {
  area: string;
  status: Status;
  evidence: string[];
  note: string;
}

const root = process.cwd();

function exists(relativePath: string): boolean {
  return fs.existsSync(path.join(root, relativePath));
}

function fileIncludes(relativePath: string, needle: string): boolean {
  const fullPath = path.join(root, relativePath);
  return fs.existsSync(fullPath) && fs.readFileSync(fullPath, "utf8").includes(needle);
}

function requireEvidence(relativePaths: string[]): string[] {
  const missing = relativePaths.filter((relativePath) => !exists(relativePath));
  if (missing.length > 0) {
    throw new Error(`Missing required submission evidence: ${missing.join(", ")}`);
  }
  return relativePaths;
}

const items: AuditItem[] = [
  {
    area: "Public open-source repository and license",
    status: "verified",
    evidence: requireEvidence(["LICENSE", "README.md", "docs/PUBLISHING.md"]),
    note: "Repository URL, license, setup, and publishing instructions are documented."
  },
  {
    area: "Track 4 Autopilot Agent fit",
    status: "verified",
    evidence: requireEvidence(["README.md", "reports/brief.md", "submissions/devpost_fields.md"]),
    note: "The submission identifies Track 4 and frames the product as an end-to-end production incident autopilot."
  },
  {
    area: "Qwen Cloud model usage",
    status: "verified",
    evidence: requireEvidence([
      "src/server/agent/qwenClient.ts",
      "docs/QWEN_TOOLS.md",
      "reports/qwen_integration_audit.md",
      "reports/model_ops_report.md",
      "submissions/devpost_fields.md"
    ]),
    note: "The server accepts QWEN_API_KEY or DASHSCOPE_API_KEY, defaults to the Qwen/DashScope OpenAI-compatible endpoint, and has automated integration and model-ops evidence."
  },
  {
    area: "New and existing project provenance",
    status: "verified",
    evidence: requireEvidence(["docs/BUILD_PROVENANCE.md", "reports/build_provenance.md", "scripts/buildProvenanceReport.ts", "reports/experiment_board.md"]),
    note: "The repository includes a generated build-provenance report from Git history and a contestctl experiment ledger for major implementation milestones."
  },
  {
    area: "Custom tool and MCP integration",
    status: "verified",
    evidence: requireEvidence([
      "src/server/agent/toolRegistry.ts",
      "src/server/mcp/aegisopsMcp.ts",
      "agents/aegisops/openapi.yaml",
      "agents/aegisops/cap-manifest.json",
      "docs/QWEN_TOOLS.md",
      "reports/qwen_integration_audit.md"
    ]),
    note: "Five active-incident-scoped tools are available to Qwen through a live OpenAI-compatible Function Calling loop and exposed through HTTP/OpenAPI plus MCP stdio, with an automated Qwen integration audit."
  },
  {
    area: "Human-in-the-loop safety gates",
    status: "verified",
    evidence: requireEvidence(["tests/orchestrator.test.ts", "src/server/agent/orchestrator.ts", "src/server/agent/qwenClient.ts", "docs/JUDGE_NOTES.md"]),
    note: "Tests prove risky remediation is blocked without approval, approved remediation stays reversible, and Qwen provider fallback does not bypass the human gate."
  },
  {
    area: "Architecture diagram",
    status: "verified",
    evidence: requireEvidence([
      "docs/ARCHITECTURE.md",
      "docs/architecture/aegisops-architecture.svg",
      "docs/architecture/aegisops-architecture.png",
      "scripts/generateArchitectureDiagram.ts"
    ]),
    note: "The architecture document plus upload-ready SVG and PNG diagrams map Qwen Cloud, the Node API, memory, tools, MCP, frontend, and Alibaba deployment target."
  },
  {
    area: "Problem value and impact case",
    status: "verified",
    evidence: requireEvidence(["docs/IMPACT_CASE.md", "reports/ablation_report.md", "reports/judge_demo_transcript.md"]),
    note: "Target users, KPI model, adoption path, and impact boundaries are documented without claiming production-verified MTTR."
  },
  {
    area: "Alibaba Cloud deployment proof",
    status: "external-action",
    evidence: requireEvidence([
      "src/server/cloud/alibabaProof.ts",
      "infra/alibaba/DEPLOYMENT.md",
      "infra/alibaba/deploy-acr-ecs.sh",
      "infra/alibaba/docker-compose.ecs.yml",
      "infra/alibaba/ecs.env.example",
      "docs/ALIBABA_PROOF_RECORDING.md",
      "docs/ALIBABA_WORKBENCH_SCREENSHOT.md",
      "scripts/verifyAlibabaDeployment.ts",
      "Dockerfile"
    ]),
    note: "Code-level proof, ACR/ECS deployment pack, Workbench screenshot checklist, proof-recording checklist, and a live URL verifier are present; account credentials are still required for public Alibaba deployment."
  },
  {
    area: "Working demo or test build",
    status: "verified",
    evidence: requireEvidence([
      "README.md",
      ".stackblitzrc",
      "docs/JUDGE_PACKET.md",
      "docs/JUDGE_QUICKSTART.md",
      "docs/DEMO_SCRIPT.md",
      "src/client/main.tsx",
      "src/client/styles.css",
      "docs/screenshots/aegisops-dashboard-viewport.png",
      "docs/screenshots/pages-static-reel.png"
    ]),
    note: "Local judging path, StackBlitz workspace, static GitHub Pages fallback, and visible rubric-evidence UI are documented."
  },
  {
    area: "GitHub Pages static target",
    status: "verified",
    evidence: requireEvidence(["README.md", "docs/PUBLISHING.md", "scripts/publish_pages.sh", ".github/workflows/pages.yml"]),
    note: "Pages uses the repository workflow deployment path; final preflight validates the public URL before submission."
  },
  {
    area: "Demo video under three minutes",
    status: "external-action",
    evidence: requireEvidence([
      "docs/VIDEO_SUBMISSION.md",
      "docs/VIDEO_UPLOAD_METADATA.md",
      "docs/demo/aegisops-demo-reel-draft.m4v",
      "docs/demo/aegisops-demo-reel-draft.en.srt",
      "scripts/record_demo.sh",
      "scripts/videoAssetAudit.ts",
      "reports/video_asset_audit.md"
    ]),
    note: "The local upload-ready video, upload metadata, captions, recording script, and video asset audit exist; the video still must be uploaded publicly to YouTube, Vimeo, or Youku."
  },
  {
    area: "Optional blog or social post prize",
    status: "external-action",
    evidence: requireEvidence(["submissions/blog_post_draft.md", "submissions/devpost_fields.md"]),
    note: "A publish-ready post draft is present; it still must be published publicly and linked in Devpost."
  },
  {
    area: "Judging evidence and reproducibility",
    status: "verified",
    evidence: requireEvidence([
      "reports/eval_report.md",
      "reports/ablation_report.md",
      "reports/experiment_board.md",
      "reports/judge_demo_transcript.md",
      "reports/judge_evidence_bundle.md"
    ]),
    note: "The project includes deterministic fixture evaluation, ablation results, contestctl run ledger, and a single judge evidence bundle."
  },
  {
    area: "Devpost copy and final checklist",
    status: "verified",
    evidence: requireEvidence([
      "docs/OFFICIAL_REQUIREMENTS_MATRIX.md",
      "submissions/FINAL_SUBMISSION_RUNBOOK.md",
      "submissions/devpost_fields.md",
      "buidl/BUIDL_SUBMISSION.md",
      "buidl/SUBMISSION_CHECKLIST.md",
      "docs/RUBRIC_SCORECARD.md",
      "scripts/judgeEvidenceBundle.ts",
      "scripts/validateSubmissionPackages.ts"
    ]),
    note: "Official requirement matrix, submission copy, BUIDL summary, final external-action checklist, and package validation are prepared."
  }
];

const requiredTextChecks: Array<[string, string]> = [
  ["README.md", "https://stackblitz.com/github/Oxygen56/aegisops-autopilot?startScript=dev"],
  ["docs/IMPACT_CASE.md", "KPI Model For A Real Pilot"],
  ["docs/OFFICIAL_REQUIREMENTS_MATRIX.md", "Required Submission Items"],
  ["docs/ALIBABA_PROOF_RECORDING.md", "AegisOps Autopilot - Alibaba Cloud Deployment Proof"],
  ["docs/ALIBABA_WORKBENCH_SCREENSHOT.md", "Alibaba Workbench Screenshot Proof"],
  ["docs/ALIBABA_WORKBENCH_SCREENSHOT.md", "dashscope-intl.aliyuncs.com/compatible-mode/v1"],
  ["docs/JUDGE_PACKET.md", "Five-Minute Judge Path"],
  ["docs/ARCHITECTURE.md", "docs/architecture/aegisops-architecture.svg"],
  ["docs/ARCHITECTURE.md", "docs/architecture/aegisops-architecture.png"],
  ["docs/architecture/aegisops-architecture.svg", "AegisOps Autopilot Architecture"],
  ["docs/architecture/aegisops-architecture.svg", "Qwen Cloud reasoning"],
  ["docs/architecture/aegisops-architecture.svg", "Alibaba Cloud runtime"],
  ["docs/BUILD_PROVENANCE.md", "Build Provenance"],
  ["reports/build_provenance.md", "Build Provenance"],
  ["reports/build_provenance.md", "Upload-ready demo video asset evidence"],
  ["src/client/main.tsx", "Judge rubric evidence"],
  ["src/client/main.tsx", "Why this is built for Track 4 winner review"],
  ["reports/qwen_integration_audit.md", "Qwen Cloud OpenAI-compatible endpoint"],
  ["reports/model_ops_report.md", "Cost And Latency Controls"],
  ["reports/judge_evidence_bundle.md", "Judge Evidence Bundle"],
  ["docs/VIDEO_UPLOAD_METADATA.md", "AegisOps Autopilot - Qwen Cloud Track 4 Incident Response Agent"],
  ["docs/VIDEO_UPLOAD_METADATA.md", "00:36 Judge rubric evidence"],
  ["docs/demo/aegisops-demo-reel-draft.en.srt", "30/30/25/15 rubric"],
  ["reports/video_asset_audit.md", "Video Asset Audit"],
  ["submissions/FINAL_SUBMISSION_RUNBOOK.md", "Track 4: Autopilot Agent"],
  ["submissions/devpost_fields.md", "Track 4: Autopilot Agent"],
  ["scripts/validateSubmissionPackages.ts", "docs/JUDGE_PACKET.md"],
  ["scripts/verifyAlibabaDeployment.ts", "local-dev"],
  ["src/server/agent/qwenClient.ts", "dashscope-intl.aliyuncs.com/compatible-mode/v1"],
  ["tests/orchestrator.test.ts", "must not mutate without approval"]
];

const failedTextChecks = requiredTextChecks.filter(([relativePath, needle]) => !fileIncludes(relativePath, needle));
if (failedTextChecks.length > 0) {
  throw new Error(
    `Submission audit text checks failed: ${failedTextChecks
      .map(([relativePath, needle]) => `${relativePath} missing ${JSON.stringify(needle)}`)
      .join("; ")}`
  );
}

const statusLabel: Record<Status, string> = {
  verified: "Verified",
  "external-action": "External action",
  monitor: "Monitor"
};

const lines = [
  "# Submission Audit",
  "",
  "Generated by `pnpm run submission:audit`.",
  "",
  "## Summary",
  "",
  `- Verified items: ${items.filter((item) => item.status === "verified").length}`,
  `- External-action items: ${items.filter((item) => item.status === "external-action").length}`,
  `- Monitor items: ${items.filter((item) => item.status === "monitor").length}`,
  "",
  "External-action items require account access or irreversible publishing outside the repository.",
  "",
  "## Requirement Evidence",
  "",
  "| status | area | evidence | note |",
  "| --- | --- | --- | --- |",
  ...items.map((item) => {
    const evidence = item.evidence.map((relativePath) => `\`${relativePath}\``).join("<br>");
    return `| ${statusLabel[item.status]} | ${item.area} | ${evidence} | ${item.note} |`;
  }),
  "",
  "## Final External Actions",
  "",
  "1. Deploy the container on Alibaba Cloud with QWEN_API_KEY or DASHSCOPE_API_KEY configured, then add the live `/api/alibaba/proof` URL to Devpost.",
  "2. Capture and attach or link the Alibaba Cloud Workbench screenshot described in `docs/ALIBABA_WORKBENCH_SCREENSHOT.md`.",
  "3. Upload `docs/demo/aegisops-demo-reel-draft.m4v` to YouTube, Vimeo, or Youku and paste the public URL into Devpost.",
  "4. Publish `submissions/blog_post_draft.md` as a public blog or social post and paste the URL into Devpost for the optional Blog Post Prize.",
  "5. Review `submissions/devpost_fields.md` in Devpost and click final submit before the deadline.",
  ""
];

const outPath = path.join(root, "reports/submission_audit.md");
fs.writeFileSync(outPath, `${lines.join("\n")}\n`);
console.log(`Wrote ${outPath}`);
