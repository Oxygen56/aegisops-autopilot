import assert from "node:assert/strict";
import { listIncidents, runIncidentWorkflow } from "../src/server/agent/orchestrator";
import { MemoryStore } from "../src/server/agent/memory";
import { executeAegisTool, listToolDefinitions } from "../src/server/agent/toolRegistry";

const incidentIds = listIncidents().map((incident) => incident.id);
assert.equal(incidentIds.length, 3, "expected three judge fixtures");

const result = await runIncidentWorkflow({
  incidentId: "checkout-tax-latency",
  autoApprove: true,
  approver: "unit-test",
  memoryStore: new MemoryStore(undefined, false)
});

assert.equal(result.incident.id, "checkout-tax-latency");
assert.equal(result.providerMode, "offline-fixture");
assert.ok(result.memories.length >= 3, "should recall cross-session memories");
assert.ok(result.toolCalls.some((tool) => tool.name === "log_search"), "should search logs");
assert.ok(result.toolCalls.some((tool) => tool.name === "metric_probe"), "should probe metrics");
assert.ok(result.toolCalls.some((tool) => tool.name === "change_graph"), "should inspect changes");
assert.ok(result.toolCalls.some((tool) => tool.name === "policy_check"), "should check policy");
assert.ok(result.toolCalls.some((tool) => tool.name === "remediation_simulator"), "should dry-run approved plan");
assert.equal(result.approval.approved, true);
assert.ok(result.plan.actions.every((action) => action.reversible), "judge demo actions should be reversible");
assert.ok(result.scorecard.overall >= 0.9, `overall score too low: ${result.scorecard.overall}`);

const blocked = await runIncidentWorkflow({
  incidentId: "support-pii-leak-risk",
  autoApprove: false,
  memoryStore: new MemoryStore(undefined, false)
});

assert.equal(blocked.approval.required, true);
assert.equal(blocked.approval.approved, false);
assert.ok(!blocked.toolCalls.some((tool) => tool.name === "remediation_simulator"), "must not mutate without approval");

const toolDefinitions = listToolDefinitions();
assert.equal(toolDefinitions.length, 5, "expected five Qwen/MCP tool definitions");
assert.ok(toolDefinitions.every((tool) => tool.inputSchema.required.includes("incidentId")), "tools must be incident-scoped");

const toolCall = await executeAegisTool("policy_check", { incidentId: "support-pii-leak-risk" });
assert.equal(toolCall.name, "policy_check");
assert.equal(toolCall.risk, "medium");
assert.match(String(toolCall.output.summary), /human approval/i);

console.log("orchestrator tests passed");
