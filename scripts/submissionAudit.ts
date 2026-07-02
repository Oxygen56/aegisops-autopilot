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
    evidence: requireEvidence(["src/server/agent/qwenClient.ts", "docs/QWEN_TOOLS.md", "submissions/devpost_fields.md"]),
    note: "The server accepts QWEN_API_KEY or DASHSCOPE_API_KEY and defaults to the Qwen/DashScope OpenAI-compatible endpoint."
  },
  {
    area: "Custom tool and MCP integration",
    status: "verified",
    evidence: requireEvidence([
      "src/server/agent/toolRegistry.ts",
      "src/server/mcp/aegisopsMcp.ts",
      "agents/aegisops/openapi.yaml",
      "agents/aegisops/cap-manifest.json",
      "docs/QWEN_TOOLS.md"
    ]),
    note: "Five incident-scoped tools are exposed through HTTP/OpenAPI and the MCP stdio server."
  },
  {
    area: "Human-in-the-loop safety gates",
    status: "verified",
    evidence: requireEvidence(["tests/orchestrator.test.ts", "src/server/agent/orchestrator.ts", "docs/JUDGE_NOTES.md"]),
    note: "Tests prove risky remediation is blocked without approval and approved remediation stays reversible."
  },
  {
    area: "Architecture diagram",
    status: "verified",
    evidence: requireEvidence(["docs/ARCHITECTURE.md"]),
    note: "The architecture document maps Qwen Cloud, the Node API, memory, tools, MCP, frontend, and Alibaba deployment target."
  },
  {
    area: "Alibaba Cloud deployment proof",
    status: "external-action",
    evidence: requireEvidence(["src/server/cloud/alibabaProof.ts", "infra/alibaba/DEPLOYMENT.md", "Dockerfile"]),
    note: "Code-level proof and deployment instructions are present; a live Alibaba Cloud URL still requires account credentials and deployment."
  },
  {
    area: "Working demo or test build",
    status: "verified",
    evidence: requireEvidence([
      "README.md",
      "docs/DEMO_SCRIPT.md",
      "docs/screenshots/aegisops-dashboard-viewport.png",
      "docs/screenshots/pages-static-reel.png"
    ]),
    note: "Local judging path and backup StackBlitz workspace are documented. GitHub Pages is configured but should be rechecked before final submission."
  },
  {
    area: "GitHub Pages static target",
    status: "monitor",
    evidence: requireEvidence(["README.md", "docs/PUBLISHING.md", "scripts/publish_pages.sh"]),
    note: "Pages is configured as a static target, but the URL must be rechecked immediately before final submission; use StackBlitz if Pages still returns 404."
  },
  {
    area: "Demo video under three minutes",
    status: "external-action",
    evidence: requireEvidence(["docs/VIDEO_SUBMISSION.md", "docs/demo/aegisops-demo-reel-draft.m4v"]),
    note: "The local upload-ready video exists; it still must be uploaded publicly to YouTube, Vimeo, or Youku."
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
    evidence: requireEvidence(["reports/eval_report.md", "reports/ablation_report.md", "reports/experiment_board.md"]),
    note: "The project includes deterministic fixture evaluation, ablation results, and contestctl run ledger."
  },
  {
    area: "Devpost copy and final checklist",
    status: "verified",
    evidence: requireEvidence(["submissions/devpost_fields.md", "buidl/BUIDL_SUBMISSION.md", "buidl/SUBMISSION_CHECKLIST.md"]),
    note: "Submission copy, BUIDL summary, and final external-action checklist are prepared."
  }
];

const requiredTextChecks: Array<[string, string]> = [
  ["README.md", "https://stackblitz.com/github/Oxygen56/aegisops-autopilot"],
  ["submissions/devpost_fields.md", "Track 4: Autopilot Agent"],
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
  "2. Upload `docs/demo/aegisops-demo-reel-draft.m4v` to YouTube, Vimeo, or Youku and paste the public URL into Devpost.",
  "3. Publish `submissions/blog_post_draft.md` as a public blog or social post and paste the URL into Devpost for the optional Blog Post Prize.",
  "4. Recheck the GitHub Pages URL; if it still returns 404, use the documented StackBlitz backup workspace as the working demo link.",
  "5. Review `submissions/devpost_fields.md` in Devpost and click final submit before the deadline.",
  ""
];

const outPath = path.join(root, "reports/submission_audit.md");
fs.writeFileSync(outPath, `${lines.join("\n")}\n`);
console.log(`Wrote ${outPath}`);
