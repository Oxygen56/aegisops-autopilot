import { spawn } from "node:child_process";

const server = spawn("pnpm", ["run", "serve:api"], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, PORT: "8788", QWEN_OFFLINE: "1" }
});

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, init?: RequestInit): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      const response = await fetch(url, init);
      if (response.ok) return response;
      lastError = new Error(`${url} returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await wait(250);
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

try {
  const health = await fetchWithRetry("http://127.0.0.1:8788/api/health").then((res) => res.json());
  if (!health.ok) throw new Error("health check failed");

  const tools = await fetchWithRetry("http://127.0.0.1:8788/api/tools").then((res) => res.json());
  if (!Array.isArray(tools.tools) || tools.tools.length !== 5) {
    throw new Error("tool listing failed");
  }

  const policyTool = await fetchWithRetry("http://127.0.0.1:8788/api/tools/policy_check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ incidentId: "support-pii-leak-risk" })
  }).then((res) => res.json());
  if (!String(policyTool.toolCall?.output?.summary ?? "").includes("human approval")) {
    throw new Error("policy tool smoke failed");
  }

  const run = await fetchWithRetry("http://127.0.0.1:8788/api/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ incidentId: "billing-duplicate-webhooks", autoApprove: true })
  }).then((res) => res.json());

  if (run.scorecard.overall < 0.9) {
    throw new Error(`scorecard too low: ${run.scorecard.overall}`);
  }

  console.log(`smoke passed: ${run.id} score=${run.scorecard.overall}`);
} finally {
  server.kill("SIGTERM");
}
