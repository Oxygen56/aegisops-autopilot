import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

type PackageKind = "BUIDL" | "Full";

interface PackageCheck {
  kind: PackageKind;
  file: string;
  entries: Set<string>;
  missing: string[];
  forbidden: string[];
}

const root = process.cwd();
const packageDir = path.join(root, "buidl/package");
const outPath = path.join(root, "reports/package_validation.md");

const requiredShared = [
  "README.md",
  "LICENSE",
  "Dockerfile",
  "package.json",
  "pnpm-lock.yaml",
  ".stackblitzrc",
  ".github/workflows/pages.yml",
  "docs/IMPACT_CASE.md",
  "docs/OFFICIAL_REQUIREMENTS_MATRIX.md",
  "docs/JUDGE_PACKET.md",
  "docs/JUDGE_QUICKSTART.md",
  "docs/BUILD_PROVENANCE.md",
  "docs/RUBRIC_SCORECARD.md",
  "docs/ARCHITECTURE.md",
  "docs/architecture/aegisops-architecture.svg",
  "docs/architecture/aegisops-architecture.png",
  "docs/screenshots/alibaba-workbench-proof.png",
  "docs/QWEN_TOOLS.md",
  "docs/VIDEO_SUBMISSION.md",
  "docs/VIDEO_UPLOAD_METADATA.md",
  "submissions/devpost_submission_receipt.md",
  "submissions/devpost_public_page_polish.md",
  "docs/screenshots/devpost-gallery/README.md",
  "docs/screenshots/devpost-gallery/01-dashboard-workflow.png",
  "docs/screenshots/devpost-gallery/02-approved-remediation.png",
  "docs/screenshots/devpost-gallery/03-human-approval-gate.png",
  "docs/screenshots/devpost-gallery/04-openapi-tool-surface.png",
  "docs/screenshots/devpost-gallery/05-architecture-qwen-tools.png",
  "docs/screenshots/devpost-gallery/06-judge-rubric-evidence.png",
  "docs/ALIBABA_PROOF_RECORDING.md",
  "docs/ALIBABA_WORKBENCH_SCREENSHOT.md",
  "public/blog/qwen-cloud-aegisops-autopilot.html",
  "docs/demo/aegisops-demo-reel-fixed.mov",
  "docs/demo/aegisops-demo-reel-fixed.en.srt",
  "docs/demo/alibaba-backend-proof.mov",
  "agents/aegisops/openapi.yaml",
  "agents/aegisops/cap-manifest.json",
  "infra/alibaba/DEPLOYMENT.md",
  "infra/alibaba/deploy-acr-ecs.sh",
  "infra/alibaba/docker-compose.ecs.yml",
  "infra/alibaba/ecs.env.example",
  "scripts/qwenIntegrationAudit.ts",
  "scripts/modelOpsReport.ts",
  "scripts/generateArchitectureDiagram.ts",
  "scripts/buildProvenanceReport.ts",
  "scripts/videoAssetAudit.ts",
  "scripts/judgeEvidenceBundle.ts",
  "scripts/verifyAlibabaDeployment.ts",
  "submissions/FINAL_SUBMISSION_RUNBOOK.md",
  "submissions/devpost_fields.md",
  "submissions/blog_post_draft.md",
  "reports/final_preflight.md",
  "reports/judge_evidence_bundle.md",
  "reports/submission_audit.md",
  "reports/qwen_integration_audit.md",
  "reports/model_ops_report.md",
  "reports/build_provenance.md",
  "reports/video_asset_audit.md",
  "reports/judge_demo_transcript.md",
  "reports/eval_report.md",
  "reports/ablation_report.md",
  "reports/experiment_board.md",
  "src/client/main.tsx",
  "src/client/styles.css",
  "src/server/cloud/alibabaProof.ts",
  "src/server/agent/qwenClient.ts",
  "src/server/agent/orchestrator.ts",
  "tests/orchestrator.test.ts"
];

const requiredBuidl = [
  "README.md",
  "buidl/BUIDL_SUBMISSION.md",
  "buidl/SUBMISSION_CHECKLIST.md",
  "reports/brief.md",
  "reports/final_preflight.md",
  "reports/judge_evidence_bundle.md",
  "reports/submission_audit.md",
  "reports/video_asset_audit.md",
  "reports/qwen_integration_audit.md",
  "reports/model_ops_report.md",
  "reports/build_provenance.md",
  "reports/eval_report.md",
  "reports/ablation_report.md",
  "reports/experiment_board.md",
  "reports/judge_demo_transcript.md",
  "submissions/devpost_submission_receipt.md",
  "docs/screenshots/devpost-gallery/README.md",
  "docs/screenshots/alibaba-workbench-proof.png",
  "public/blog/qwen-cloud-aegisops-autopilot.html",
  "docs/demo/alibaba-backend-proof.mov",
  "src/client/main.tsx",
  "src/client/styles.css",
  "src/server/index.ts",
  "src/server/agent/orchestrator.ts",
  "src/server/agent/qwenClient.ts",
  "src/server/cloud/alibabaProof.ts",
  "tests/orchestrator.test.ts"
];

const forbiddenPrefixes = [".git/", "node_modules/", "dist/", "data/runtime/", "buidl/package/", "docs/deployment/", "docs/demo/thumbs/"];
const forbiddenExact = [
  ".env",
  "docs/demo/aegisops-demo-reel-draft.mov",
  "docs/demo/aegisops-demo-reel-draft.m4v",
  "docs/demo/aegisops-demo-reel-draft.en.srt"
];
const forbiddenPatterns = [/^\.env\.(?!example$)/, /(^|\/)\.DS_Store$/];

function run(command: string, args: string[]): string {
  return execFileSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  }).trim();
}

function newestZip(prefix: string): string {
  if (!fs.existsSync(packageDir)) throw new Error("buidl/package does not exist");
  const files = fs
    .readdirSync(packageDir)
    .filter((file) => file.startsWith(prefix) && file.endsWith(".zip"))
    .sort();
  const latest = files.at(-1);
  if (!latest) throw new Error(`Missing package with prefix ${prefix}`);
  return latest;
}

function listEntries(file: string): Set<string> {
  const output = run("unzip", ["-Z1", path.join(packageDir, file)]);
  return new Set(output.split(/\r?\n/).filter(Boolean));
}

function forbiddenEntries(entries: Set<string>): string[] {
  return [...entries].filter((entry) => {
    if (forbiddenExact.includes(entry)) return true;
    if (forbiddenPrefixes.some((prefix) => entry.startsWith(prefix))) return true;
    return forbiddenPatterns.some((pattern) => pattern.test(entry));
  });
}

function checkPackage(kind: PackageKind, file: string): PackageCheck {
  const entries = listEntries(file);
  const required = kind === "BUIDL" ? requiredBuidl : requiredShared;
  const missing = required.filter((entry) => !entries.has(entry));
  const forbidden = forbiddenEntries(entries);
  return { kind, file, entries, missing, forbidden };
}

const checks = [
  checkPackage("BUIDL", newestZip("qwencloud-hackathon_")),
  checkPackage("Full", newestZip("aegisops_full_submission_"))
];

const failures = checks.flatMap((check) => [
  ...check.missing.map((entry) => `${check.kind} package missing ${entry}`),
  ...check.forbidden.map((entry) => `${check.kind} package contains forbidden ${entry}`)
]);

const rows = checks
  .map((check) => {
    const status = check.missing.length === 0 && check.forbidden.length === 0 ? "PASS" : "FAIL";
    return `| ${status} | ${check.kind} | ${check.file} | ${check.entries.size} | ${check.missing.length} | ${check.forbidden.length} |`;
  })
  .join("\n");

const lines = [
  "# Package Validation",
  "",
  "Generated by `pnpm run submission:validate`.",
  "",
  "## Summary",
  "",
  `- Packages checked: ${checks.length}`,
  `- Failures: ${failures.length}`,
  "",
  "## Packages",
  "",
  "| status | kind | file | entries | missing | forbidden |",
  "| --- | --- | --- | ---: | ---: | ---: |",
  rows,
  "",
  "## Required Entries",
  "",
  "### BUIDL",
  "",
  ...requiredBuidl.map((entry) => `- \`${entry}\``),
  "",
  "### Full",
  "",
  ...requiredShared.map((entry) => `- \`${entry}\``),
  "",
  "## Failures",
  "",
  ...(failures.length ? failures.map((failure) => `- ${failure}`) : ["- None"]),
  ""
];

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${lines.join("\n")}\n`, "utf8");

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`submission packages validated: ${checks.map((check) => check.file).join(", ")}`);
}
console.log(`Wrote ${outPath}`);
