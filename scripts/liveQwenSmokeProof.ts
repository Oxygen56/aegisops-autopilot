import fs from "node:fs";
import path from "node:path";
import { QwenClient } from "../src/server/agent/qwenClient";
import { listQwenToolSchemas } from "../src/server/agent/toolRegistry";

const outDir = path.resolve(process.cwd(), "reports");
const jsonPath = path.join(outDir, "live_qwen_smoke_proof.json");
const mdPath = path.join(outDir, "live_qwen_smoke_proof.md");

function hasCredential(): boolean {
  return Boolean(process.env.QWEN_API_KEY || process.env.DASHSCOPE_API_KEY);
}

const startedAt = new Date().toISOString();
const client = new QwenClient();

fs.mkdirSync(outDir, { recursive: true });

if (!hasCredential()) {
  const payload = {
    status: "account-gated",
    startedAt,
    providerMode: client.mode(),
    baseUrl: client.baseUrl,
    model: client.model,
    credential: "not-present",
    note: "Set QWEN_API_KEY or DASHSCOPE_API_KEY to run a one-shot live Qwen smoke proof. No secret is written to this report."
  };
  fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), "utf8");
  fs.writeFileSync(
    mdPath,
    [
      "# Live Qwen Smoke Proof",
      "",
      "Status: `account-gated`",
      "",
      "No Qwen/DashScope credential was present in the current shell, so the live smoke was not executed. This is intentional for public-safe CI and local review.",
      "",
      "To run the one-shot proof in a private shell:",
      "",
      "```bash",
      "QWEN_API_KEY=... pnpm run qwen:live-smoke",
      "```",
      "",
      "The generated report records provider mode, model, base URL, latency, and tool-schema count. It never writes the secret value."
    ].join("\n"),
    "utf8"
  );
  console.log(`Wrote ${jsonPath}`);
  console.log(`Wrote ${mdPath}`);
  process.exit(0);
}

process.env.QWEN_OFFLINE = "0";
process.env.QWEN_STRICT = "1";

const result = await client.complete(
  [
    {
      role: "system",
      content: "You are a smoke-test responder. Keep the answer short and do not include secrets."
    },
    {
      role: "user",
      content: "Return one short sentence confirming AegisOps live Qwen smoke proof is reachable."
    }
  ],
  () => "fallback should not run in strict live smoke",
  {
    tools: listQwenToolSchemas(),
    toolChoice: "none",
    maxToolRounds: 0
  }
);

const payload = {
  status: result.providerMode === "qwen-cloud" ? "verified" : "failed",
  startedAt,
  completedAt: new Date().toISOString(),
  providerMode: result.providerMode,
  baseUrl: client.baseUrl,
  model: result.model,
  credential: "present-redacted",
  latencyMs: result.latencyMs,
  qwenToolSchemaCount: listQwenToolSchemas().length,
  responsePreview: result.content.slice(0, 160)
};

fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), "utf8");
fs.writeFileSync(
  mdPath,
  [
    "# Live Qwen Smoke Proof",
    "",
    `Status: \`${payload.status}\``,
    "",
    `- Provider mode: \`${payload.providerMode}\``,
    `- Model: \`${payload.model}\``,
    `- Base URL: \`${payload.baseUrl}\``,
    `- Credential: \`${payload.credential}\``,
    `- Latency: \`${payload.latencyMs} ms\``,
    `- Qwen tool schemas included: \`${payload.qwenToolSchemaCount}\``,
    `- Completed at: \`${payload.completedAt}\``,
    "",
    "Response preview:",
    "",
    "```text",
    payload.responsePreview,
    "```",
    "",
    "No API key or sensitive header is written to this report."
  ].join("\n"),
  "utf8"
);

console.log(`Wrote ${jsonPath}`);
console.log(`Wrote ${mdPath}`);
