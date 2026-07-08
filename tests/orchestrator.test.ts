import assert from "node:assert/strict";
import { listIncidents, runIncidentWorkflow } from "../src/server/agent/orchestrator";
import { MemoryStore } from "../src/server/agent/memory";
import { QwenClient } from "../src/server/agent/qwenClient";
import { executeAegisTool, listQwenToolSchemas, listToolDefinitions } from "../src/server/agent/toolRegistry";

const incidentIds = listIncidents().map((incident) => incident.id);
assert.equal(incidentIds.length, 14, "expected fourteen judge stress fixtures");
assert.ok(incidentIds.includes("workflow-approval-bypass"), "stress suite should include approval-bypass scenario");

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

const stressRuns = await Promise.all(
  incidentIds.map((incidentId) =>
    runIncidentWorkflow({
      incidentId,
      autoApprove: true,
      approver: "stress-unit-test",
      memoryStore: new MemoryStore(undefined, false)
    })
  )
);
assert.equal(stressRuns.length, 14);
assert.ok(stressRuns.every((run) => run.toolCalls.length === 5), "approved stress runs should execute five tools");
assert.ok(stressRuns.every((run) => run.scorecard.overall >= 0.95), "stress suite should keep high workflow score");

const originalFetch = globalThis.fetch;
const originalQwenApiKey = process.env.QWEN_API_KEY;
const originalDashscopeApiKey = process.env.DASHSCOPE_API_KEY;
const originalQwenBaseUrl = process.env.QWEN_BASE_URL;
const originalQwenOffline = process.env.QWEN_OFFLINE;
const originalQwenStrict = process.env.QWEN_STRICT;

try {
  process.env.QWEN_API_KEY = "unit-test-key";
  delete process.env.DASHSCOPE_API_KEY;
  process.env.QWEN_BASE_URL = "https://unit-test-qwen.invalid/compatible-mode/v1";
  delete process.env.QWEN_OFFLINE;
  delete process.env.QWEN_STRICT;
  const qwenRequestBodies: Array<Record<string, unknown>> = [];
  globalThis.fetch = async (_url, init) => {
    qwenRequestBodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
    return Response.json({ choices: [{ message: { content: "unit-test diagnosis" } }] });
  };

  const qwenResult = await new QwenClient().complete([{ role: "user", content: "diagnose checkout" }], () => "fallback", {
    tools: listQwenToolSchemas()
  });

  assert.equal(qwenResult.providerMode, "qwen-cloud");
  assert.equal(qwenResult.content, "unit-test diagnosis");
  assert.equal(qwenRequestBodies.length, 1);
  assert.equal(qwenRequestBodies[0].tool_choice, "none");
  const qwenTools = qwenRequestBodies[0].tools as Array<{
    type?: string;
    function?: { name?: string; parameters?: { required?: string[] } };
  }>;
  assert.equal(qwenTools.length, 5, "Qwen request should carry five OpenAI-compatible tool schemas");
  assert.ok(qwenTools.every((tool) => tool.type === "function"));
  assert.ok(
    qwenTools.some(
      (tool) => tool.function?.name === "log_search" && tool.function.parameters?.required?.includes("incidentId")
    )
  );

  const qwenToolLoopBodies: Array<Record<string, unknown>> = [];
  globalThis.fetch = async (_url, init) => {
    qwenToolLoopBodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
    if (qwenToolLoopBodies.length === 1) {
      return Response.json({
        choices: [
          {
            message: {
              content: "",
              tool_calls: [
                {
                  id: "call-policy",
                  type: "function",
                  function: {
                    name: "policy_check",
                    arguments: '{"incidentId":"support-pii-leak-risk"}'
                  }
                }
              ]
            }
          }
        ]
      });
    }
    return Response.json({ choices: [{ message: { content: "tool-grounded diagnosis" } }] });
  };

  const qwenToolLoopResult = await new QwenClient().complete(
    [{ role: "user", content: "Should support automation send customer drafts?" }],
    () => "fallback",
    {
      tools: listQwenToolSchemas(),
      toolChoice: "auto",
      toolExecutor: executeAegisTool
    }
  );

  assert.equal(qwenToolLoopResult.providerMode, "qwen-cloud");
  assert.equal(qwenToolLoopResult.content, "tool-grounded diagnosis");
  assert.equal(qwenToolLoopResult.toolRounds, 1);
  assert.deepEqual(qwenToolLoopResult.toolCallNames, ["policy_check"]);
  assert.equal(qwenToolLoopBodies.length, 2, "Qwen tool loop should make a follow-up model call");
  assert.equal(qwenToolLoopBodies[0].tool_choice, "auto");
  const secondMessages = qwenToolLoopBodies[1].messages as Array<{ role?: string; tool_call_id?: string; content?: string }>;
  assert.ok(secondMessages.some((message) => message.role === "tool" && message.tool_call_id === "call-policy"));
  assert.ok(secondMessages.some((message) => message.role === "tool" && /human approval/i.test(String(message.content))));

  const scopedWorkflowBodies: Array<Record<string, unknown>> = [];
  globalThis.fetch = async (_url, init) => {
    scopedWorkflowBodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
    if (scopedWorkflowBodies.length === 1) {
      return Response.json({
        choices: [
          {
            message: {
              content: "",
              tool_calls: [
                {
                  id: "call-policy-scope",
                  type: "function",
                  function: {
                    name: "policy_check",
                    arguments: '{"incidentId":"support-pii-leak-risk"}'
                  }
                }
              ]
            }
          }
        ]
      });
    }
    return Response.json({ choices: [{ message: { content: "incident-scoped diagnosis" } }] });
  };

  const scopedWorkflow = await runIncidentWorkflow({
    incidentId: "checkout-tax-latency",
    autoApprove: false,
    memoryStore: new MemoryStore(undefined, false)
  });

  assert.equal(scopedWorkflow.providerMode, "qwen-cloud");
  assert.equal(scopedWorkflow.findings[1].stance, "incident-scoped diagnosis");
  assert.equal(scopedWorkflowBodies.length, 2, "workflow tool call should be followed by a Qwen summary request");
  const scopedSecondMessages = scopedWorkflowBodies[1].messages as Array<{ role?: string; content?: string }>;
  const scopedToolMessage = scopedSecondMessages.find((message) => message.role === "tool");
  assert.ok(scopedToolMessage, "workflow should append a tool result message");
  assert.match(String(scopedToolMessage.content), /Do not disable fraud checks/i);
  assert.doesNotMatch(String(scopedToolMessage.content), /No outbound customer message/i);

  globalThis.fetch = async () => new Response("provider unavailable", { status: 503 });

  const providerFailure = await runIncidentWorkflow({
    incidentId: "billing-duplicate-webhooks",
    autoApprove: false,
    memoryStore: new MemoryStore(undefined, false)
  });

  assert.equal(providerFailure.providerMode, "offline-fixture", "Qwen provider failure should fall back safely by default");
  assert.equal(providerFailure.model, "qwen-plus-safe-fallback");
  assert.equal(providerFailure.approval.required, true);
  assert.equal(providerFailure.approval.approved, false);
  assert.ok(
    !providerFailure.toolCalls.some((tool) => tool.name === "remediation_simulator"),
    "provider fallback must not bypass human approval"
  );
} finally {
  globalThis.fetch = originalFetch;
  if (originalQwenApiKey === undefined) delete process.env.QWEN_API_KEY;
  else process.env.QWEN_API_KEY = originalQwenApiKey;
  if (originalDashscopeApiKey === undefined) delete process.env.DASHSCOPE_API_KEY;
  else process.env.DASHSCOPE_API_KEY = originalDashscopeApiKey;
  if (originalQwenBaseUrl === undefined) delete process.env.QWEN_BASE_URL;
  else process.env.QWEN_BASE_URL = originalQwenBaseUrl;
  if (originalQwenOffline === undefined) delete process.env.QWEN_OFFLINE;
  else process.env.QWEN_OFFLINE = originalQwenOffline;
  if (originalQwenStrict === undefined) delete process.env.QWEN_STRICT;
  else process.env.QWEN_STRICT = originalQwenStrict;
}

const toolDefinitions = listToolDefinitions();
assert.equal(toolDefinitions.length, 5, "expected five Qwen/MCP tool definitions");
assert.ok(toolDefinitions.every((tool) => tool.inputSchema.required.includes("incidentId")), "tools must be incident-scoped");

const toolCall = await executeAegisTool("policy_check", { incidentId: "support-pii-leak-risk" });
assert.equal(toolCall.name, "policy_check");
assert.equal(toolCall.risk, "medium");
assert.match(String(toolCall.output.summary), /human approval/i);

console.log("orchestrator tests passed");
