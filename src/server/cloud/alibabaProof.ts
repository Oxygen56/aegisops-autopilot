export interface AlibabaDeploymentProof {
  qwenBaseUrl: string;
  qwenModel: string;
  region: string;
  computeTarget: string;
  ecsInstanceId?: string;
  functionName?: string;
  logProject?: string;
  evidence: string[];
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
  const qwenBaseUrl =
    process.env.QWEN_BASE_URL ?? process.env.DASHSCOPE_API_BASE ?? "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";
  const qwenModel = process.env.QWEN_MODEL ?? "qwen-plus";
  const ecsInstanceId = process.env.ALIBABA_CLOUD_ECS_INSTANCE_ID ?? (await fetchEcsMetadata("instance-id"));
  const region = process.env.ALIBABA_CLOUD_REGION ?? (await fetchEcsMetadata("region-id")) ?? "local-dev";
  const functionName = process.env.FC_FUNCTION_NAME;
  const logProject = process.env.ALIBABA_CLOUD_LOG_PROJECT;
  const computeTarget = functionName ? "Alibaba Cloud Function Compute" : ecsInstanceId ? "Alibaba Cloud ECS" : "local-dev";

  return {
    qwenBaseUrl,
    qwenModel,
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
