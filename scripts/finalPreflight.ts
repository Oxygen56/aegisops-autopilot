import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

interface Check {
  name: string;
  status: "pass" | "warn" | "fail";
  evidence: string;
}

const root = process.cwd();
const outPath = path.join(root, "reports/final_preflight.md");

function run(command: string, args: string[], timeout = 20_000): string {
  return execFileSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout
  }).trim();
}

function safeRun(command: string, args: string[], timeout = 20_000): { ok: boolean; output: string } {
  try {
    return { ok: true, output: run(command, args, timeout) };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, output: message };
  }
}

function exists(relativePath: string): boolean {
  return fs.existsSync(path.join(root, relativePath));
}

function firstExisting(relativePaths: string[]): string | undefined {
  return relativePaths.find(exists);
}

function newestFile(prefix: string): string | undefined {
  const dir = path.join(root, "buidl/package");
  if (!fs.existsSync(dir)) return undefined;
  const files = fs
    .readdirSync(dir)
    .filter((file) => file.startsWith(prefix) && file.endsWith(".zip"))
    .sort();
  return files.at(-1);
}

function httpStatus(url: string): string {
  const result = safeRun("curl", ["-I", "-L", "--max-time", "30", url], 35_000);
  if (!result.ok) return `curl failed: ${result.output}`;
  const statuses = result.output
    .split(/\r?\n/)
    .filter((line) => line.toLowerCase().startsWith("http/"))
    .map((line) => line.trim());
  return statuses.at(-1) ?? "no HTTP status";
}

function workflowRun(workflow: string): { ok: boolean; fields: string[]; output: string } {
  const result = safeRun("gh", [
    "run",
    "list",
    "--repo",
    "Oxygen56/aegisops-autopilot",
    "--workflow",
    workflow,
    "--branch",
    "main",
    "--limit",
    "1",
    "--json",
    "databaseId,workflowName,status,conclusion,headSha,url",
    "--jq",
    ".[0] | [.databaseId,.workflowName,.status,.conclusion,.headSha,.url] | @tsv"
  ]);
  return { ok: result.ok, fields: result.output.split("\t"), output: result.output };
}

function add(checks: Check[], name: string, status: Check["status"], evidence: string): void {
  checks.push({ name, status, evidence: evidence.replace(/\r?\n/g, " ").slice(0, 500) });
}

const checks: Check[] = [];

const status = safeRun("git", ["status", "--short"]);
add(checks, "Git worktree clean", status.ok && status.output === "" ? "pass" : "fail", status.output || "clean");

const head = safeRun("git", ["rev-parse", "HEAD"]);
const originMain = safeRun("git", ["rev-parse", "origin/main"]);
add(
  checks,
  "Local HEAD matches origin/main",
  head.ok && originMain.ok && head.output === originMain.output ? "pass" : "fail",
  `HEAD=${head.output || "unknown"} origin/main=${originMain.output || "unknown"}`
);

const ciRun = workflowRun("CI");
add(
  checks,
  "Latest GitHub CI run",
  ciRun.ok && ciRun.fields[2] === "completed" && ciRun.fields[3] === "success" ? "pass" : "warn",
  ciRun.output || "no CI run found"
);

const pagesRun = workflowRun("Deploy GitHub Pages");
add(
  checks,
  "Latest GitHub Pages workflow run",
  pagesRun.ok && pagesRun.fields[2] === "completed" && pagesRun.fields[3] === "success" ? "pass" : "warn",
  pagesRun.output || "no Pages workflow run found"
);

const stackblitz = httpStatus("https://stackblitz.com/github/Oxygen56/aegisops-autopilot?startScript=dev");
add(checks, "Primary StackBlitz demo URL", stackblitz.includes(" 200") ? "pass" : "warn", stackblitz);

const pages = httpStatus("https://oxygen56.github.io/aegisops-autopilot/");
add(checks, "GitHub Pages target URL", pages.includes(" 200") ? "pass" : "warn", pages);

const pagesReel = httpStatus("https://oxygen56.github.io/aegisops-autopilot/?reel=1");
add(checks, "GitHub Pages demo reel URL", pagesReel.includes(" 200") ? "pass" : "warn", pagesReel);

const blogPost = httpStatus("https://oxygen56.github.io/aegisops-autopilot/blog/qwen-cloud-aegisops-autopilot.html");
add(checks, "Blog/Social Post Prize URL", blogPost.includes(" 200") ? "pass" : "warn", blogPost);

const devpostPublicPage = httpStatus("https://devpost.com/software/aegisops-autopilot");
add(checks, "Devpost public project URL", devpostPublicPage.includes(" 200") ? "pass" : "warn", devpostPublicPage);

const devpostHtml = safeRun("curl", ["-fsSL", "--max-time", "30", "https://devpost.com/software/aegisops-autopilot"], 35_000);
add(
  checks,
  "Devpost public blog link",
  devpostHtml.ok && devpostHtml.output.includes("qwen-cloud-aegisops-autopilot.html") ? "pass" : "fail",
  devpostHtml.ok ? "Blog/Social Post Prize URL present on public Devpost page" : devpostHtml.output
);
add(
  checks,
  "Devpost public Workbench gallery proof",
  devpostHtml.ok && devpostHtml.output.includes("4864863") && devpostHtml.output.includes("Alibaba Cloud ECS proof") ? "pass" : "fail",
  devpostHtml.ok ? "Workbench proof gallery image present on public Devpost page" : devpostHtml.output
);

const alibabaProofUrl = process.env.ALIBABA_PROOF_URL ?? process.env.DEPLOYMENT_URL ?? "http://101.201.33.56";
if (alibabaProofUrl) {
  const liveProof = safeRun("pnpm", ["run", "deploy:verify", "--", alibabaProofUrl], 30_000);
  add(checks, "Live Alibaba deployment proof URL", liveProof.ok ? "pass" : "fail", liveProof.output);
} else {
  add(
    checks,
    "Live Alibaba deployment proof URL",
    "warn",
    "not provided; set ALIBABA_PROOF_URL to the live Alibaba deployment URL"
  );
}

const workbenchScreenshot = firstExisting([
  "docs/screenshots/alibaba-workbench-proof.png",
  "docs/screenshots/alibaba-workbench-proof.jpg",
  "docs/screenshots/alibaba-workbench-proof.jpeg",
  "docs/screenshots/alibaba-workbench-proof.webp"
]);
add(
  checks,
  "Alibaba Workbench screenshot proof",
  workbenchScreenshot ? "pass" : "warn",
  workbenchScreenshot ?? "optional visual proof not present; capture using docs/ALIBABA_WORKBENCH_SCREENSHOT.md"
);

const buidlZip = newestFile("qwencloud-hackathon_");
add(checks, "Latest BUIDL package", buidlZip ? "pass" : "fail", buidlZip ?? "missing");

const fullZip = newestFile("aegisops_full_submission_");
add(checks, "Latest full submission package", fullZip ? "pass" : "fail", fullZip ?? "missing");

const requiredFiles = [
  "README.md",
  "LICENSE",
  "docs/IMPACT_CASE.md",
  "docs/JUDGE_QUICKSTART.md",
  "docs/JUDGE_PACKET.md",
  "docs/BUILD_PROVENANCE.md",
  "docs/OFFICIAL_REQUIREMENTS_MATRIX.md",
  "docs/RUBRIC_SCORECARD.md",
  "docs/architecture/aegisops-architecture.svg",
  "docs/architecture/aegisops-architecture.png",
  "docs/screenshots/alibaba-workbench-proof.png",
  "docs/VIDEO_UPLOAD_METADATA.md",
  "public/blog/qwen-cloud-aegisops-autopilot.html",
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
  "reports/qwen_integration_audit.md",
  "reports/model_ops_report.md",
  "reports/build_provenance.md",
  "reports/video_asset_audit.md",
  "reports/judge_evidence_bundle.md",
  "reports/judge_demo_transcript.md",
  "reports/submission_audit.md",
  "scripts/qwenIntegrationAudit.ts",
  "scripts/modelOpsReport.ts",
  "scripts/generateArchitectureDiagram.ts",
  "scripts/buildProvenanceReport.ts",
  "scripts/videoAssetAudit.ts",
  "scripts/judgeEvidenceBundle.ts",
  "submissions/devpost_fields.md",
  "submissions/blog_post_draft.md",
  ".github/workflows/pages.yml",
  "docs/demo/aegisops-demo-reel-fixed.mov",
  "docs/demo/aegisops-demo-reel-fixed.en.srt",
  "infra/alibaba/DEPLOYMENT.md",
  "infra/alibaba/deploy-acr-ecs.sh",
  "infra/alibaba/docker-compose.ecs.yml",
  "infra/alibaba/ecs.env.example",
  "scripts/verifyAlibabaDeployment.ts",
  "scripts/validateSubmissionPackages.ts",
  "src/server/cloud/alibabaProof.ts"
];
const missingFiles = requiredFiles.filter((file) => !exists(file));
add(checks, "Required submission files", missingFiles.length === 0 ? "pass" : "fail", missingFiles.length ? missingFiles.join(", ") : "all present");

const envKeys = ["QWEN_API_KEY", "DASHSCOPE_API_KEY", "ALIBABA_CLOUD_ACCESS_KEY_ID", "ALIYUN_ACCESS_KEY_ID"];
const configuredEnv = envKeys.filter((key) => Boolean(process.env[key]));
add(
  checks,
  "Cloud credentials in current shell",
  configuredEnv.length > 0 ? "warn" : "warn",
  configuredEnv.length > 0
    ? `${configuredEnv.join(", ")} present; do not commit secrets`
    : "not present in local shell; live ECS deployment is configured remotely"
);

const passes = checks.filter((check) => check.status === "pass").length;
const warnings = checks.filter((check) => check.status === "warn").length;
const failures = checks.filter((check) => check.status === "fail").length;

const lines = [
  "# Final Preflight",
  "",
  "Generated by `pnpm run final:preflight`.",
  "",
  "## Summary",
  "",
  `- Pass: ${passes}`,
  `- Warn: ${warnings}`,
  `- Fail: ${failures}`,
  "",
  "Warnings may be acceptable when they describe optional public-proof work, but failures should be fixed before packaging or further public edits.",
  "",
  "## Checks",
  "",
  "| status | check | evidence |",
  "| --- | --- | --- |",
  ...checks.map((check) => `| ${check.status.toUpperCase()} | ${check.name} | ${check.evidence.replaceAll("|", "\\|")} |`),
  "",
  "## Final External Actions",
  "",
  "1. Confirm the Alibaba Workbench screenshot remains available at `docs/screenshots/alibaba-workbench-proof.png`.",
  "2. Confirm the Blog/Social Post Prize URL remains visible in Devpost.",
  "",
  "Primary live demo:",
  "",
  "```text",
  "http://101.201.33.56/",
  "```",
  "",
  "Live proof endpoint:",
  "",
  "```text",
  "http://101.201.33.56/api/alibaba/proof",
  "```",
  "",
  "Fallback runnable workspace:",
  "",
  "```text",
  "https://stackblitz.com/github/Oxygen56/aegisops-autopilot?startScript=dev",
  "```",
  "",
  "Blog/Social Post Prize URL:",
  "",
  "```text",
  "https://oxygen56.github.io/aegisops-autopilot/blog/qwen-cloud-aegisops-autopilot.html",
  "```",
  ""
];

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${lines.join("\n")}\n`, "utf8");

console.log(`Wrote ${outPath}`);
if (failures > 0) {
  process.exitCode = 1;
}
