import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packageDir = path.join(root, "buidl/package");

function run(command: string, args: string[]): string {
  return execFileSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  }).trim();
}

function newestZip(prefix: string): string {
  const files = fs
    .readdirSync(packageDir)
    .filter((file) => file.startsWith(prefix) && file.endsWith(".zip"))
    .sort();
  const latest = files.at(-1);
  if (!latest) throw new Error(`No package found for ${prefix}`);
  return path.join(packageDir, latest);
}

function zipAdd(zipPath: string, entries: string[]): void {
  const existing = entries.filter((entry) => fs.existsSync(path.join(root, entry)));
  if (existing.length === 0) return;
  run("zip", ["-qr", zipPath, ...existing]);
}

function zipDelete(zipPath: string, patterns: string[]): void {
  for (const pattern of patterns) {
    try {
      run("zip", ["-dq", zipPath, pattern]);
    } catch {
      // zip exits non-zero when a delete pattern does not match; that is fine for cleanup.
    }
  }
}

function nowSlug(): string {
  return run("date", ["+%Y%m%d-%H%M%S"]);
}

fs.mkdirSync(packageDir, { recursive: true });

run("pnpm", ["run", "qwen:audit"]);
run("pnpm", ["run", "model:ops"]);
run("pnpm", ["run", "architecture:diagram"]);
run("pnpm", ["run", "provenance:audit"]);
run("pnpm", ["run", "video:audit"]);
run("pnpm", ["run", "submission:audit"]);
run("pnpm", ["run", "judge:evidence"]);

// First pass creates a report from the current clean repo and remote state.
run("pnpm", ["run", "final:preflight"]);

run(".competition/bin/contestctl", ["package-buidl"]);
const buidlZip = newestZip("qwencloud-hackathon_");
zipAdd(buidlZip, [
  ".github/workflows/pages.yml",
  ".stackblitzrc",
  "agents",
  "docs",
  "infra",
  "Dockerfile",
  "LICENSE",
  "package.json",
  "pnpm-lock.yaml",
  "public",
  "scripts",
  "submissions",
  "tsconfig.json",
  "vite.config.ts"
]);
zipDelete(buidlZip, [
  "docs/deployment/*",
  "docs/deployment/",
  "docs/demo/aegisops-demo-reel-draft.mov",
  "docs/demo/aegisops-demo-reel-draft.m4v",
  "docs/demo/aegisops-demo-reel-draft.en.srt",
  "docs/demo/thumbs/*",
  "docs/demo/thumbs/reel/*",
  "docs/demo/thumbs/reel/",
  "docs/demo/thumbs/"
]);

const fullZip = path.join(packageDir, `aegisops_full_submission_${nowSlug()}.zip`);
run("zip", [
  "-qr",
  fullZip,
  ".",
  "-x",
  "./.git/*",
  "./node_modules/*",
  "./dist/*",
  "./data/runtime/*",
  "./buidl/package/*",
  "./docs/deployment/*",
  "./.DS_Store",
  "./docs/demo/*.mov",
  "./docs/demo/*.m4v",
  "./docs/demo/aegisops-demo-reel-draft.en.srt",
  "./docs/demo/thumbs/*"
]);
zipAdd(fullZip, [
  "docs/demo/aegisops-demo-reel-fixed.mov",
  "docs/demo/aegisops-demo-reel-fixed.en.srt",
  "docs/demo/alibaba-backend-proof.mov"
]);
zipDelete(fullZip, [
  "docs/deployment/*",
  "docs/deployment/",
  "docs/demo/aegisops-demo-reel-draft.mov",
  "docs/demo/aegisops-demo-reel-draft.m4v",
  "docs/demo/aegisops-demo-reel-draft.en.srt",
  "docs/demo/thumbs/*",
  "docs/demo/thumbs/reel/*",
  "docs/demo/thumbs/reel/",
  "docs/demo/thumbs/"
]);

// Second pass records the exact package names created above, then patches both zips.
run("pnpm", ["run", "final:preflight"]);
zipAdd(buidlZip, ["reports/final_preflight.md", "reports/judge_evidence_bundle.md", "reports/alibaba_deployment_proof.md"]);
zipAdd(fullZip, ["reports/final_preflight.md", "reports/judge_evidence_bundle.md", "reports/alibaba_deployment_proof.md"]);

run("pnpm", ["run", "submission:validate"]);
zipAdd(buidlZip, ["reports/package_validation.md"]);
zipAdd(fullZip, ["reports/package_validation.md"]);

console.log(`BUIDL package: ${buidlZip}`);
console.log(`Full package: ${fullZip}`);
