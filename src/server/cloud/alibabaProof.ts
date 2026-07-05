export interface AlibabaDeploymentProof {
  timestamp: string;
  qwenProvider: "qwen-cloud";
  qwenMode: "qwen-cloud" | "offline-fixture";
  qwenBaseUrl: string;
  qwenModel: string;
  qwenCredential: "present-redacted" | "not-present";
  region: string;
  computeTarget: string;
  ecsInstanceId?: string;
  functionName?: string;
  logProject?: string;
  evidence: string[];
}

export interface QwenRuntimeStatus {
  timestamp: string;
  provider: "qwen-cloud";
  mode: "qwen-cloud" | "offline-fixture";
  baseUrl: string;
  model: string;
  credential: "present-redacted" | "not-present";
  offlineReason?: string;
}

function getEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function envFlag(name: string): boolean {
  const value = getEnv(name)?.toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

export function getQwenRuntimeStatus(now = new Date()): QwenRuntimeStatus {
  const credential = getEnv("QWEN_API_KEY") ?? getEnv("DASHSCOPE_API_KEY");
  const forcedOffline = envFlag("QWEN_OFFLINE");
  const mode = credential && !forcedOffline ? "qwen-cloud" : "offline-fixture";

  return {
    timestamp: now.toISOString(),
    provider: "qwen-cloud",
    mode,
    baseUrl: getEnv("QWEN_BASE_URL") ?? getEnv("DASHSCOPE_API_BASE") ?? "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    model: getEnv("QWEN_MODEL") ?? "qwen-plus",
    credential: credential ? "present-redacted" : "not-present",
    offlineReason:
      mode === "offline-fixture"
        ? "Public verifier mode uses deterministic fixtures unless a Qwen/DashScope credential is present and offline mode is disabled."
        : undefined
  };
}

async function fetchEcsMetadata(path: string): Promise<string | undefined> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 700);
  try {
    const response = await fetch(`http://100.100.100.200/latest/meta-data/${path}`, {
      signal: controller.signal
    });
    if (!response.ok) return undefined;
    return (await response.text()).trim();
  } catch {
    return undefined;
  } finally {
    clearTimeout(timer);
  }
}

export async function getAlibabaDeploymentProof(): Promise<AlibabaDeploymentProof> {
  const qwen = getQwenRuntimeStatus();
  const ecsInstanceId = process.env.ALIBABA_CLOUD_ECS_INSTANCE_ID ?? (await fetchEcsMetadata("instance-id"));
  const region = process.env.ALIBABA_CLOUD_REGION ?? (await fetchEcsMetadata("region-id")) ?? "local-dev";
  const functionName = process.env.FC_FUNCTION_NAME;
  const logProject = process.env.ALIBABA_CLOUD_LOG_PROJECT;
  const computeTarget = functionName ? "Alibaba Cloud Function Compute" : ecsInstanceId ? "Alibaba Cloud ECS" : "local-dev";

  return {
    timestamp: qwen.timestamp,
    qwenProvider: qwen.provider,
    qwenMode: qwen.mode,
    qwenBaseUrl: qwen.baseUrl,
    qwenModel: qwen.model,
    qwenCredential: qwen.credential,
    region,
    computeTarget,
    ecsInstanceId,
    functionName,
    logProject,
    evidence: [
      "Qwen Cloud OpenAI-compatible API endpoint is configured by QWEN_BASE_URL/DASHSCOPE_API_BASE.",
      "Alibaba Cloud ECS metadata service is probed when the app runs on ECS.",
      "Function Compute environment variables are surfaced when the app runs on FC.",
      "No secrets are returned by this proof endpoint."
    ]
  };
}
