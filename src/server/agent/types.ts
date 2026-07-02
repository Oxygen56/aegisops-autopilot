export type Severity = "sev1" | "sev2" | "sev3";

export type SignalStatus = "healthy" | "warning" | "critical";

export interface Signal {
  source: "logs" | "metrics" | "traces" | "deploy" | "ticket" | "security";
  name: string;
  value: string;
  status: SignalStatus;
}

export interface Incident {
  id: string;
  title: string;
  service: string;
  severity: Severity;
  startedAt: string;
  alert: string;
  customerImpact: string;
  owner: string;
  constraints: string[];
  recentChanges: string[];
  signals: Signal[];
  runbookHint: string;
}

export interface MemoryItem {
  id: string;
  text: string;
  tags: string[];
  priority: number;
  createdAt: string;
  expiresAt?: string;
  score?: number;
}

export interface ToolCall {
  name: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  durationMs: number;
  risk: "low" | "medium" | "high";
}

export interface AgentFinding {
  agent: "incident_commander" | "qwen_diagnostician" | "reliability_engineer" | "security_reviewer" | "human_approver";
  stance: string;
  confidence: number;
  evidence: string[];
  objections: string[];
}

export interface RemediationPlan {
  summary: string;
  actions: Array<{
    id: string;
    label: string;
    command: string;
    reversible: boolean;
    blastRadius: "single-service" | "cell" | "region" | "global";
  }>;
  verification: string[];
  rollback: string[];
}

export interface ApprovalDecision {
  required: boolean;
  approved: boolean;
  approver: string;
  reason: string;
  checklist: string[];
}

export interface WorkflowEvent {
  at: string;
  phase: string;
  summary: string;
  detail: string;
}

export interface WorkflowResult {
  id: string;
  providerMode: "qwen-cloud" | "offline-fixture";
  model: string;
  incident: Incident;
  memories: MemoryItem[];
  toolCalls: ToolCall[];
  findings: AgentFinding[];
  plan: RemediationPlan;
  approval: ApprovalDecision;
  timeline: WorkflowEvent[];
  scorecard: {
    memoryRecall: number;
    toolCoverage: number;
    riskControl: number;
    humanGate: number;
    overall: number;
  };
}

export interface QwenCompletion {
  providerMode: "qwen-cloud" | "offline-fixture";
  model: string;
  content: string;
  latencyMs: number;
}
