import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { listIncidents, runIncidentWorkflow } from "./agent/orchestrator";
import { executeAegisTool, listToolDefinitions } from "./agent/toolRegistry";
import { MemoryStore } from "./agent/memory";
import { getAlibabaDeploymentProof, getQwenRuntimeStatus } from "./cloud/alibabaProof";

const port = Number(process.env.PORT ?? 8787);
const distDir = path.resolve(process.cwd(), "dist");
const memoryStore = new MemoryStore();

function sendJson(res: http.ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
  });
  res.end(JSON.stringify(body, null, 2));
}

async function readBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
}

function contentType(filePath: string): string {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
}

function serveStatic(req: http.IncomingMessage, res: http.ServerResponse): boolean {
  if (!fs.existsSync(distDir)) return false;
  const requestPath = req.url?.split("?")[0] ?? "/";
  const relative = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
  const filePath = path.resolve(distDir, relative);
  if (!filePath.startsWith(distDir)) return false;
  const resolved = fs.existsSync(filePath) && fs.statSync(filePath).isFile() ? filePath : path.join(distDir, "index.html");
  res.writeHead(200, { "Content-Type": contentType(resolved) });
  fs.createReadStream(resolved).pipe(res);
  return true;
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") {
      sendJson(res, 204, {});
      return;
    }

    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

    if (url.pathname === "/api/health") {
      const qwen = getQwenRuntimeStatus();
      sendJson(res, 200, {
        ok: true,
        app: "aegisops-autopilot",
        timestamp: qwen.timestamp,
        qwenMode: qwen.mode,
        qwenProvider: qwen.provider,
        qwenCloud: {
          provider: qwen.provider,
          mode: qwen.mode,
          baseUrl: qwen.baseUrl,
          model: qwen.model,
          timestamp: qwen.timestamp,
          credential: qwen.credential,
          offlineReason: qwen.offlineReason
        },
        alibabaCloud: {
          proofEndpoint: "/api/alibaba/proof",
          computeTarget: "Alibaba Cloud ECS or Function Compute"
        }
      });
      return;
    }

    if (url.pathname === "/api/incidents" && req.method === "GET") {
      sendJson(res, 200, { incidents: listIncidents() });
      return;
    }

    if (url.pathname === "/api/alibaba/proof" && req.method === "GET") {
      sendJson(res, 200, await getAlibabaDeploymentProof());
      return;
    }

    if (url.pathname === "/api/tools" && req.method === "GET") {
      sendJson(res, 200, { tools: listToolDefinitions() });
      return;
    }

    if (url.pathname.startsWith("/api/tools/") && req.method === "POST") {
      const toolName = decodeURIComponent(url.pathname.replace("/api/tools/", ""));
      const body = await readBody(req);
      sendJson(res, 200, { toolCall: await executeAegisTool(toolName, body) });
      return;
    }

    if (url.pathname === "/api/memory" && req.method === "GET") {
      const query = url.searchParams.get("query") ?? "";
      sendJson(res, 200, { memories: query ? memoryStore.recall(query, 8) : memoryStore.all() });
      return;
    }

    if (url.pathname === "/api/memory" && req.method === "POST") {
      const body = await readBody(req);
      const text = String(body.text ?? "");
      if (text.trim().length < 8) {
        sendJson(res, 400, { error: "memory text must be at least 8 characters" });
        return;
      }
      const tags = Array.isArray(body.tags) ? body.tags.map(String) : ["manual"];
      sendJson(res, 201, { memory: memoryStore.remember(text, tags, Number(body.priority ?? 0.8)) });
      return;
    }

    if (url.pathname === "/api/run" && req.method === "POST") {
      const body = await readBody(req);
      const result = await runIncidentWorkflow({
        incidentId: String(body.incidentId ?? "checkout-tax-latency"),
        autoApprove: Boolean(body.autoApprove),
        approver: String(body.approver ?? "demo-incident-manager"),
        memoryStore
      });
      sendJson(res, 200, result);
      return;
    }

    if (serveStatic(req, res)) return;
    sendJson(res, 404, { error: "not found" });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

server.listen(port, () => {
  console.log(`AegisOps API listening on http://127.0.0.1:${port}`);
});
