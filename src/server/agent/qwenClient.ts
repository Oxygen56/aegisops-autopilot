import type { Incident, QwenCompletion, ToolCall } from "./types";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
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

  async complete(messages: ChatMessage[], fallback: () => string): Promise<QwenCompletion> {
    const started = performance.now();
    if (this.offline) {
      return this.fallbackCompletion(started, "deterministic-fixture", fallback);
    }

    try {
      const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: this.model,
          temperature: 0.2,
          messages
        })
      });

      if (!response.ok) {
        throw new Error(`Qwen Cloud request failed: ${response.status}`);
      }

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      return {
        providerMode: "qwen-cloud",
        model: this.model,
        content: payload.choices?.[0]?.message?.content ?? fallback(),
        latencyMs: Math.round(performance.now() - started)
      };
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
      latencyMs: Math.round(performance.now() - started)
    };
  }
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
