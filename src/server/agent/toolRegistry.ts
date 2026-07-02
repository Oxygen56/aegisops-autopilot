import { incidents } from "./fixtures";
import { buildRemediationPlan, checkPolicy, inspectChanges, probeMetrics, searchLogs, simulateRemediation } from "./tools";
import type { Incident, ToolCall } from "./types";

export type AegisToolName = "log_search" | "metric_probe" | "change_graph" | "policy_check" | "remediation_simulator";

export interface ToolDefinition {
  name: AegisToolName;
  description: string;
  risk: ToolCall["risk"];
  inputSchema: {
    type: "object";
    required: string[];
    properties: Record<string, { type: string; description: string }>;
  };
}

const toolDefinitions: ToolDefinition[] = [
  {
    name: "log_search",
    description: "Search incident-correlated log patterns and return audit-safe excerpts.",
    risk: "low",
    inputSchema: incidentInputSchema()
  },
  {
    name: "metric_probe",
    description: "Probe SLI and health signals for the affected service.",
    risk: "low",
    inputSchema: incidentInputSchema()
  },
  {
    name: "change_graph",
    description: "Inspect recent changes overlapping the alert window.",
    risk: "low",
    inputSchema: incidentInputSchema()
  },
  {
    name: "policy_check",
    description: "Evaluate hard stops, approval requirements, and mutation policy.",
    risk: "medium",
    inputSchema: incidentInputSchema()
  },
  {
    name: "remediation_simulator",
    description: "Dry-run a reversible remediation plan without mutating production.",
    risk: "medium",
    inputSchema: incidentInputSchema()
  }
];

function incidentInputSchema(): ToolDefinition["inputSchema"] {
  return {
    type: "object",
    required: ["incidentId"],
    properties: {
      incidentId: {
        type: "string",
        description: "ID of one incident fixture returned by GET /api/incidents."
      }
    }
  };
}

function getIncident(incidentId: string): Incident {
  const incident = incidents.find((candidate) => candidate.id === incidentId);
  if (!incident) {
    throw new Error(`Unknown incident: ${incidentId}`);
  }
  return incident;
}

export function listToolDefinitions(): ToolDefinition[] {
  return toolDefinitions;
}

export async function executeAegisTool(name: string, input: Record<string, unknown>): Promise<ToolCall> {
  if (!isAegisToolName(name)) {
    throw new Error(`Unknown AegisOps tool: ${name}`);
  }
  const incident = getIncident(String(input.incidentId ?? ""));
  switch (name) {
    case "log_search":
      return searchLogs(incident);
    case "metric_probe":
      return probeMetrics(incident);
    case "change_graph":
      return inspectChanges(incident);
    case "policy_check":
      return checkPolicy(incident);
    case "remediation_simulator":
      return simulateRemediation(incident, buildRemediationPlan(incident));
  }
}

export function isAegisToolName(name: string): name is AegisToolName {
  return toolDefinitions.some((tool) => tool.name === name);
}
