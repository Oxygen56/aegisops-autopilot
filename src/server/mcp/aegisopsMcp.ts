import readline from "node:readline";
import { executeAegisTool, listToolDefinitions } from "../agent/toolRegistry";

interface JsonRpcRequest {
  jsonrpc?: "2.0";
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
}

function writeResponse(id: JsonRpcRequest["id"], result: unknown): void {
  process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id, result })}\n`);
}

function writeError(id: JsonRpcRequest["id"], code: number, message: string): void {
  process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } })}\n`);
}

async function handleRequest(request: JsonRpcRequest): Promise<void> {
  switch (request.method) {
    case "initialize":
      writeResponse(request.id, {
        protocolVersion: "2024-11-05",
        serverInfo: {
          name: "aegisops-autopilot",
          version: "0.1.0"
        },
        capabilities: {
          tools: {}
        }
      });
      return;
    case "tools/list":
      writeResponse(request.id, {
        tools: listToolDefinitions().map((tool) => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema
        }))
      });
      return;
    case "tools/call": {
      const params = request.params ?? {};
      const name = String(params.name ?? "");
      const input = typeof params.arguments === "object" && params.arguments !== null ? (params.arguments as Record<string, unknown>) : {};
      const toolCall = await executeAegisTool(name, input);
      writeResponse(request.id, {
        content: [
          {
            type: "text",
            text: JSON.stringify(toolCall, null, 2)
          }
        ],
        isError: false
      });
      return;
    }
    default:
      writeError(request.id, -32601, `Unsupported method: ${request.method ?? ""}`);
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  crlfDelay: Infinity
});

rl.on("line", (line) => {
  void (async () => {
    try {
      if (!line.trim()) return;
      await handleRequest(JSON.parse(line) as JsonRpcRequest);
    } catch (error) {
      writeError(null, -32000, error instanceof Error ? error.message : String(error));
    }
  })();
});
