import type { Incident, QwenCompletion, ToolCall } from "./types";
import type { QwenFunctionTool } from "./toolRegistry";

interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_calls?: QwenToolCall[];
  tool_call_id?: string;
}

interface QwenToolCall {
  id?: string;
  type?: "function";
  function?: {
    name?: string;
    arguments?: string | Record<string, unknown>;
  };
}

interface CompletionOptions {
  tools?: QwenFunctionTool[];
  toolChoice?: "none" | "auto";
  toolExecutor?: (name: string, input: Record<string, unknown>) => Promise<unknown>;
  maxToolRounds?: number;
}

function getEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

export class QwenClient {
  readonly baseUrl: string;
  readonly model: string;
  private readonly apiKey?: string;
  private readonly offline: boolean;
  private readonly strict: boolean;

  constructor() {
    this.apiKey = getEnv("QWEN_API_KEY") ?? getEnv("DASHSCOPE_API_KEY");
    this.baseUrl =
      getEnv("QWEN_BASE_URL") ??
      getEnv("DASHSCOPE_API_BASE") ??
      "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";
    this.model = getEnv("QWEN_MODEL") ?? "qwen-plus";
    this.offline = getEnv("QWEN_OFFLINE") === "1" || !this.apiKey;
    this.strict = getEnv("QWEN_STRICT") === "1";
  }

  mode(): "qwen-cloud" | "offline-fixture" {
    return this.offline ? "offline-fixture" : "qwen-cloud";
  }

  async complete(messages: ChatMessage[], fallback: () => string, options: CompletionOptions = {}): Promise<QwenCompletion> {
    const started = performance.now();
    if (this.offline) {
      return this.fallbackCompletion(started, "deterministic-fixture", fallback);
    }

    try {
      const workingMessages = [...messages];
      const toolCallNames: string[] = [];
      let toolRounds = 0;
      const maxToolRounds = options.maxToolRounds ?? 2;

      for (;;) {
        const requestBody = this.buildRequestBody(workingMessages, options);
        const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/chat/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          throw new Error(`Qwen Cloud request failed: ${response.status}`);
        }

        const payload = (await response.json()) as {
          choices?: Array<{ message?: { content?: string | null; tool_calls?: QwenToolCall[] } }>;
        };
        const assistantMessage = payload.choices?.[0]?.message;
        const content = assistantMessage?.content ?? "";
        const toolCalls = assistantMessage?.tool_calls ?? [];

        if (toolCalls.length === 0 || !options.toolExecutor || options.toolChoice === "none") {
          return {
            providerMode: "qwen-cloud",
            model: this.model,
            content: content || fallback(),
            latencyMs: Math.round(performance.now() - started),
            toolRounds,
            toolCallNames
          };
        }

        if (toolRounds >= maxToolRounds) {
          return this.fallbackCompletion(started, `${this.model}-tool-loop-limit-fallback`, fallback);
        }

        toolRounds += 1;
        workingMessages.push({
          role: "assistant",
          content,
          tool_calls: toolCalls
        });
        for (const toolCall of toolCalls) {
          const name = toolCall.function?.name ?? "unknown_tool";
          toolCallNames.push(name);
          const toolResult = await this.executeToolCall(toolCall, options.toolExecutor);
          workingMessages.push({
            role: "tool",
            tool_call_id: toolCall.id ?? `tool-call-${toolCallNames.length}`,
            content: JSON.stringify(toolResult)
          });
        }
      }
    } catch (error) {
      if (this.strict) {
        throw error;
      }
      return this.fallbackCompletion(started, `${this.model}-safe-fallback`, fallback);
    }
  }

  private fallbackCompletion(started: number, model: string, fallback: () => string): QwenCompletion {
    return {
      providerMode: "offline-fixture",
      model,
      content: fallback(),
      latencyMs: Math.round(performance.now() - started),
      toolRounds: 0,
      toolCallNames: []
    };
  }

  private buildRequestBody(messages: ChatMessage[], options: CompletionOptions): Record<string, unknown> {
    const requestBody: Record<string, unknown> = {
      model: this.model,
      temperature: 0.2,
      messages
    };
    if (options.tools && options.tools.length > 0) {
      requestBody.tools = options.tools;
      requestBody.tool_choice = options.toolChoice ?? "none";
    }
    return requestBody;
  }

  private async executeToolCall(
    toolCall: QwenToolCall,
    toolExecutor: (name: string, input: Record<string, unknown>) => Promise<unknown>
  ): Promise<unknown> {
    const name = toolCall.function?.name ?? "unknown_tool";
    try {
      return await toolExecutor(name, parseToolArguments(toolCall.function?.arguments));
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
        tool: name
      };
    }
  }
}

function parseToolArguments(value: string | Record<string, unknown> | undefined): Record<string, unknown> {
  if (!value) return {};
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return {};
  const parsed = JSON.parse(trimmed) as unknown;
  return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
}

export function fallbackDiagnosis(incident: Incident, toolCalls: ToolCall[]): string {
  const criticalSignals = incident.signals
    .filter((signal) => signal.status === "critical")
    .map((signal) => `${signal.name}: ${signal.value}`)
    .join("; ");
  const toolSummary = toolCalls.map((call) => `${call.name}=${String(call.output.summary ?? "ok")}`).join("; ");

  if (incident.id === "checkout-tax-latency") {
    return [
      "Most likely cause: tax_calculator_v2 increased cache pressure in NA cell-3 and Redis timeouts are blocking checkout confirmation.",
      `Evidence: ${criticalSignals}. Tool evidence: ${toolSummary}.`,
      "Recommended action: roll tax_calculator_v2 back to 10% in NA cell-3, keep fraud checks enabled, warm tax-rules-cache, and verify p95 and conversion recovery before wider rollout."
    ].join("\n");
  }

  if (incident.id === "support-pii-leak-risk") {
    return [
      "Most likely cause: support_resolution_v4 removed explicit redaction and bypassed manual review for low-severity enterprise tickets.",
      `Evidence: ${criticalSignals}. Tool evidence: ${toolSummary}.`,
      "Recommended action: fail closed, restore review_queue=true, reinsert redaction policy, run PII regression fixtures, and require security approval before outbound generation resumes."
    ].join("\n");
  }

  return [
    "Most likely cause: idempotency key canonicalization drift created duplicate pending events while aggressive retry settings amplified the storm.",
    `Evidence: ${criticalSignals}. Tool evidence: ${toolSummary}.`,
    "Recommended action: freeze retries, deploy canonicalized merchant_id guard, validate no double capture, then drain the EU queue with finance-approved dedupe checks."
  ].join("\n");
}
