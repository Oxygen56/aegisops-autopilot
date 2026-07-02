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

function nowSlug(): string {
  return run("date", ["+%Y%m%d-%H%M%S"]);
}

fs.mkdirSync(packageDir, { recursive: true });

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
  "scripts",
  "submissions",
  "tsconfig.json",
  "vite.config.ts"
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
  "./.DS_Store",
  "./docs/demo/*.mov",
  "./docs/demo/thumbs/*"
]);

// Second pass records the exact package names created above, then patches both zips.
run("pnpm", ["run", "final:preflight"]);
zipAdd(buidlZip, ["reports/final_preflight.md", "reports/alibaba_deployment_proof.md"]);
zipAdd(fullZip, ["reports/final_preflight.md", "reports/alibaba_deployment_proof.md"]);

run("pnpm", ["run", "submission:validate"]);
zipAdd(buidlZip, ["reports/package_validation.md"]);
zipAdd(fullZip, ["reports/package_validation.md"]);

console.log(`BUIDL package: ${buidlZip}`);
console.log(`Full package: ${fullZip}`);
