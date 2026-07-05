import { execFileSync, spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";

const reportPath = "reports/alibaba_deployment_proof.md";
const originalReport = fs.existsSync(reportPath) ? fs.readFileSync(reportPath, "utf8") : undefined;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHealth(port: number): Promise<void> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/health`);
      if (response.ok) return;
      lastError = new Error(`health returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await wait(250);
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

function startServer(port: number, env: Record<string, string>): ChildProcess {
  return spawn("pnpm", ["exec", "tsx", "src/server/index.ts"], {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, ...env, PORT: String(port) },
    detached: process.platform !== "win32"
  });
}

async function stopServer(server: ChildProcess): Promise<void> {
  if (server.exitCode !== null || server.signalCode !== null) return;
  const closed = new Promise<void>((resolve) => server.once("close", () => resolve()));
  if (process.platform === "win32") {
    server.kill("SIGTERM");
  } else if (server.pid) {
    process.kill(-server.pid, "SIGTERM");
  }
  await Promise.race([closed, wait(1500)]);
}

function runVerifier(port: number): void {
  execFileSync("pnpm", ["run", "deploy:verify", "--", `http://127.0.0.1:${port}`], {
    stdio: ["ignore", "pipe", "pipe"]
  });
}

async function expectPass(): Promise<void> {
  const server = startServer(8793, {
    FC_FUNCTION_NAME: "aegisops-verifier-smoke",
    ALIBABA_CLOUD_REGION: "ap-southeast-1"
  });
  try {
    await waitForHealth(8793);
    runVerifier(8793);
    const report = fs.readFileSync(reportPath, "utf8");
    if (!report.includes("Alibaba Cloud Function Compute")) {
      throw new Error("proof report did not record Function Compute evidence");
    }
  } finally {
    await stopServer(server);
  }
}

async function expectLocalDevReject(): Promise<void> {
  const server = startServer(8794, {});
  try {
    await waitForHealth(8794);
    let rejected = false;
    try {
      runVerifier(8794);
    } catch {
      rejected = true;
    }
    if (!rejected) {
      throw new Error("local-dev deployment proof was accepted");
    }
  } finally {
    await stopServer(server);
  }
}

try {
  await expectPass();
  await expectLocalDevReject();
  console.log("alibaba deployment verifier smoke passed");
} finally {
  if (originalReport === undefined) {
    fs.rmSync(reportPath, { force: true });
  } else {
    fs.writeFileSync(reportPath, originalReport, "utf8");
  }
}
