import { incidents } from "./fixtures";
import { MemoryStore } from "./memory";
import { QwenClient, fallbackDiagnosis } from "./qwenClient";
import { executeAegisTool, listQwenToolSchemas } from "./toolRegistry";
import { buildRemediationPlan, checkPolicy, inspectChanges, probeMetrics, searchLogs, simulateRemediation } from "./tools";
import type { AgentFinding, ApprovalDecision, Incident, ToolCall, WorkflowEvent, WorkflowResult } from "./types";

interface RunOptions {
  incidentId: string;
  autoApprove?: boolean;
  approver?: string;
  memoryStore?: MemoryStore;
  qwenClient?: QwenClient;
}

function event(phase: string, summary: string, detail: string): WorkflowEvent {
  return {
    at: new Date().toISOString(),
    phase,
    summary,
    detail
  };
}

function findIncident(incidentId: string): Incident {
  const incident = incidents.find((candidate) => candidate.id === incidentId);
  if (!incident) {
    throw new Error(`Unknown incident: ${incidentId}`);
  }
  return incident;
}

function buildFindings(diagnosis: string, incident: Incident, toolCalls: ToolCall[]): AgentFinding[] {
  const criticalSignals = incident.signals.filter((signal) => signal.status === "critical");
  const toolNames = toolCalls.map((tool) => tool.name);
  return [
    {
      agent: "incident_commander",
      stance: `Treat as ${incident.severity.toUpperCase()} for ${incident.service}; stabilize customer impact before optimizing root cause.`,
      confidence: 0.91,
      evidence: [incident.alert, incident.customerImpact],
      objections: ["Do not mutate production before approval gates are satisfied."]
    },
    {
      agent: "qwen_diagnostician",
      stance: diagnosis.split("\n")[0] ?? diagnosis,
      confidence: 0.88,
      evidence: criticalSignals.map((signal) => `${signal.name}: ${signal.value}`),
      objections: ["A single metric is insufficient; correlate logs, changes, and policy."]
    },
    {
      agent: "reliability_engineer",
      stance: `Prefer reversible mitigation with narrow blast radius using ${toolNames.join(", ")} evidence.`,
      confidence: 0.86,
      evidence: toolCalls.map((tool) => `${tool.name}: ${String(tool.output.summary)}`),
      objections: ["Avoid broad restarts or queue purges unless dry-run and rollback checks pass."]
    },
    {
      agent: "security_reviewer",
      stance: "Respect hard stops, approval requirements, and audit retention before any automated action.",
      confidence: 0.84,
      evidence: incident.constraints,
      objections: incident.constraints.filter((constraint) => /never|do not|no outbound|approval/i.test(constraint))
    }
  ];
}

function approvalDecision(incident: Incident, autoApprove: boolean, approver: string): ApprovalDecision {
  const checklist = [
    "Root-cause hypothesis references at least two evidence sources.",
    "Action is reversible or includes explicit rollback.",
    "Blast radius is narrower than the incident scope.",
    "Verification metrics are defined before execution.",
    "Policy constraints and hard stops are honored."
  ];
  const mustApprove = incident.constraints.some((constraint) => /approval|human|finance|security|never|do not/i.test(constraint));
  return {
    required: mustApprove,
    approved: mustApprove ? autoApprove : true,
    approver: mustApprove ? approver : "policy-auto",
    reason: mustApprove
      ? autoApprove
        ? "Demo approval granted after checklist evaluation."
        : "Waiting for human approval before production mutation."
      : "No human gate required by policy.",
    checklist
  };
}

function scoreWorkflow(memories: number, toolCalls: ToolCall[], approval: ApprovalDecision): WorkflowResult["scorecard"] {
  const memoryRecall = memories >= 3 ? 1 : memories / 3;
  const toolCoverage = toolCalls.length >= 5 ? 1 : toolCalls.length / 5;
  const riskControl = toolCalls.every((tool) => tool.risk !== "high") ? 0.95 : 0.65;
  const humanGate = approval.required && approval.approved ? 1 : approval.required ? 0.7 : 0.9;
  const overall = Number(((memoryRecall + toolCoverage + riskControl + humanGate) / 4).toFixed(3));
  return {
    memoryRecall: Number(memoryRecall.toFixed(3)),
    toolCoverage: Number(toolCoverage.toFixed(3)),
    riskControl,
    humanGate,
    overall
  };
}

export async function runIncidentWorkflow(options: RunOptions): Promise<WorkflowResult> {
  const incident = findIncident(options.incidentId);
  const memoryStore = options.memoryStore ?? new MemoryStore();
  const qwenClient = options.qwenClient ?? new QwenClient();
  const autoApprove = options.autoApprove ?? false;
  const approver = options.approver ?? "demo-incident-manager";
  const timeline: WorkflowEvent[] = [];

  timeline.push(event("intake", "Incident accepted", `${incident.title} affecting ${incident.service}`));

  const memories = memoryStore.recallForIncident(incident);
  timeline.push(
    event(
      "memory",
      `${memories.length} relevant memories recalled`,
      memories.map((memory) => `${memory.id}:${memory.score}`).join(", ")
    )
  );

  const evidenceTools = await Promise.all([searchLogs(incident), probeMetrics(incident), inspectChanges(incident), checkPolicy(incident)]);
  timeline.push(event("tools", "Evidence collected", evidenceTools.map((tool) => tool.name).join(", ")));

  const qwen = await qwenClient.complete(
    [
      {
        role: "system",
        content:
          "You are AegisOps, a production incident autopilot. Diagnose conservatively, cite evidence, avoid irreversible actions, and preserve human approval gates."
      },
      {
        role: "user",
        content: JSON.stringify(
          {
            incident,
            recalledMemories: memories,
            toolEvidence: evidenceTools.map((tool) => tool.output)
          },
          null,
          2
        )
      }
    ],
    () => fallbackDiagnosis(incident, evidenceTools),
    {
      tools: listQwenToolSchemas(),
      toolChoice: "auto",
      toolExecutor: (name, input) => executeAegisTool(name, { ...input, incidentId: incident.id }),
      maxToolRounds: 2
    }
  );
  timeline.push(event("qwen", `Diagnosis generated via ${qwen.providerMode}`, qwen.content.slice(0, 240)));

  const findings = buildFindings(qwen.content, incident, evidenceTools);
  const plan = buildRemediationPlan(incident);
  const approval = approvalDecision(incident, autoApprove, approver);
  const toolCalls = [...evidenceTools];

  if (approval.approved) {
    const simulation = await simulateRemediation(incident, plan);
    toolCalls.push(simulation);
    timeline.push(event("dry-run", "Remediation dry-run accepted", String(simulation.output.summary)));
  } else {
    timeline.push(event("approval", "Human approval required", approval.reason));
  }

  findings.push({
    agent: "human_approver",
    stance: approval.approved ? "Approved bounded dry-run execution for demo." : "Holding production mutation until an authorized human approves.",
    confidence: approval.approved ? 1 : 0.78,
    evidence: approval.checklist,
    objections: approval.approved ? [] : ["Production action remains paused."]
  });

  const remembered = memoryStore.remember(
    `${incident.service}: ${plan.summary} Verification: ${plan.verification.join("; ")}`,
    [incident.service, "aegisops", "post-incident-learning"],
    0.88
  );
  timeline.push(event("learning", "Post-incident memory stored", remembered.id));

  return {
    id: `run-${Date.now()}-${incident.id}`,
    providerMode: qwen.providerMode,
    model: qwen.model,
    incident,
    memories,
    toolCalls,
    findings,
    plan,
    approval,
    timeline,
    scorecard: scoreWorkflow(memories.length, toolCalls, approval)
  };
}

export function listIncidents(): Incident[] {
  return incidents;
}
