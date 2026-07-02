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

const buidlZip = newestFile("qwencloud-hackathon_");
add(checks, "Latest BUIDL package", buidlZip ? "pass" : "fail", buidlZip ?? "missing");

const fullZip = newestFile("aegisops_full_submission_");
add(checks, "Latest full submission package", fullZip ? "pass" : "fail", fullZip ?? "missing");

const requiredFiles = [
  "README.md",
  "LICENSE",
  "docs/JUDGE_QUICKSTART.md",
  "docs/RUBRIC_SCORECARD.md",
  "reports/judge_demo_transcript.md",
  "reports/submission_audit.md",
  "submissions/devpost_fields.md",
  "submissions/blog_post_draft.md",
  ".github/workflows/pages.yml",
  "docs/demo/aegisops-demo-reel-draft.m4v",
  "infra/alibaba/DEPLOYMENT.md",
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
  configuredEnv.length > 0 ? `${configuredEnv.join(", ")} present; do not commit secrets` : "not present; live Qwen/Alibaba deployment requires account credentials"
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
  "Warnings may be acceptable when they describe account-gated work, but failures should be fixed before packaging or submitting.",
  "",
  "## Checks",
  "",
  "| status | check | evidence |",
  "| --- | --- | --- |",
  ...checks.map((check) => `| ${check.status.toUpperCase()} | ${check.name} | ${check.evidence.replaceAll("|", "\\|")} |`),
  "",
  "## Final Account-Gated Actions",
  "",
  "1. Deploy on Alibaba Cloud with `QWEN_API_KEY` or `DASHSCOPE_API_KEY`, then paste the live `/api/alibaba/proof` URL into Devpost.",
  "2. Upload `docs/demo/aegisops-demo-reel-draft.m4v` to YouTube, Vimeo, or Youku and paste the public video URL into Devpost.",
  "3. Publish `submissions/blog_post_draft.md` and paste the public URL into Devpost for the optional Blog Post Prize.",
  "4. Submit the Devpost form from the account owner session before the deadline.",
  "",
  "Primary runnable workspace:",
  "",
  "```text",
  "https://stackblitz.com/github/Oxygen56/aegisops-autopilot?startScript=dev",
  "```",
  ""
];

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${lines.join("\n")}\n`, "utf8");

console.log(`Wrote ${outPath}`);
if (failures > 0) {
  process.exitCode = 1;
}
