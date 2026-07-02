import { spawn } from "node:child_process";

interface JsonRpcLine {
  id?: number;
  result?: unknown;
  error?: unknown;
}

const child = spawn("pnpm", ["run", "mcp:stdio"], {
  stdio: ["pipe", "pipe", "pipe"]
});

const lines: string[] = [];
const errors: string[] = [];

child.stdout.on("data", (chunk) => {
  lines.push(...String(chunk).split("\n").filter(Boolean));
});

child.stderr.on("data", (chunk) => {
  errors.push(String(chunk));
});

child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} })}\n`);
child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} })}\n`);
child.stdin.write(
  `${JSON.stringify({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "metric_probe",
      arguments: {
        incidentId: "checkout-tax-latency"
      }
    }
  })}\n`
);
child.stdin.end();

const exitCode = await new Promise<number | null>((resolve) => {
  child.on("close", resolve);
});

if (exitCode !== 0) {
  throw new Error(`MCP smoke exited ${exitCode}: ${errors.join("")}`);
}

const parsed = lines
  .filter((line) => line.startsWith("{"))
  .map((line) => JSON.parse(line) as JsonRpcLine);

if (parsed.some((line) => line.error)) {
  throw new Error(`MCP smoke returned errors: ${JSON.stringify(parsed)}`);
}

const toolsList = parsed.find((line) => line.id === 2)?.result as { tools?: Array<{ name?: string }> } | undefined;
if (!toolsList?.tools || toolsList.tools.length !== 5) {
  throw new Error("MCP tools/list did not return five tools");
}

const toolCall = parsed.find((line) => line.id === 3)?.result as { content?: Array<{ text?: string }> } | undefined;
if (!toolCall?.content?.[0]?.text?.includes("checkout-api has 3 critical signals")) {
  throw new Error("MCP tools/call did not return the expected metric probe output");
}

console.log("mcp smoke passed");
