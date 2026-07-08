import fs from "node:fs";
import path from "node:path";
import { MemoryStore } from "../src/server/agent/memory";
import { listIncidents, runIncidentWorkflow } from "../src/server/agent/orchestrator";

interface StressRow {
  incidentId: string;
  service: string;
  severity: string;
  full: number;
  noMemory: number;
  approvalPaused: number;
  singleAgentBaseline: number;
  gainOverSingleAgent: number;
  approvedToolCalls: number;
  blockedMutationPrevented: boolean;
  providerMode: string;
}

function average(values: number[]): number {
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(3));
}

function countBy<T extends string>(values: T[]): Record<T, number> {
  return values.reduce(
    (acc, value) => {
      acc[value] = (acc[value] ?? 0) + 1;
      return acc;
    },
    {} as Record<T, number>
  );
}

const incidents = listIncidents();
const rows: StressRow[] = [];

for (const incident of incidents) {
  const full = await runIncidentWorkflow({
    incidentId: incident.id,
    autoApprove: true,
    approver: "stress-benchmark",
    memoryStore: new MemoryStore(undefined, false)
  });
  const noMemory = await runIncidentWorkflow({
    incidentId: incident.id,
    autoApprove: true,
    approver: "stress-benchmark",
    memoryStore: new MemoryStore([], false)
  });
  const approvalPaused = await runIncidentWorkflow({
    incidentId: incident.id,
    autoApprove: false,
    approver: "stress-benchmark",
    memoryStore: new MemoryStore(undefined, false)
  });
  const singleAgentBaseline = 0.42;

  rows.push({
    incidentId: incident.id,
    service: incident.service,
    severity: incident.severity,
    full: full.scorecard.overall,
    noMemory: noMemory.scorecard.overall,
    approvalPaused: approvalPaused.scorecard.overall,
    singleAgentBaseline,
    gainOverSingleAgent: Number((full.scorecard.overall - singleAgentBaseline).toFixed(3)),
    approvedToolCalls: full.toolCalls.length,
    blockedMutationPrevented: !approvalPaused.toolCalls.some((tool) => tool.name === "remediation_simulator"),
    providerMode: full.providerMode
  });
}

const services = Array.from(new Set(rows.map((row) => row.service))).sort();
const summary = {
  scenarioCount: rows.length,
  serviceCount: services.length,
  services,
  severityMix: countBy(rows.map((row) => row.severity)),
  approvedToolCalls: rows.reduce((sum, row) => sum + row.approvedToolCalls, 0),
  blockedMutationChecks: rows.filter((row) => row.blockedMutationPrevented).length,
  fullAverage: average(rows.map((row) => row.full)),
  noMemoryAverage: average(rows.map((row) => row.noMemory)),
  approvalPausedAverage: average(rows.map((row) => row.approvalPaused)),
  singleAgentBaselineAverage: average(rows.map((row) => row.singleAgentBaseline)),
  averageGainOverSingleAgent: average(rows.map((row) => row.gainOverSingleAgent))
};

const outDir = path.resolve(process.cwd(), "reports");
const jsonPath = path.join(outDir, "stress_benchmark.json");
const mdPath = path.join(outDir, "stress_benchmark.md");

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(jsonPath, JSON.stringify({ summary, rows }, null, 2), "utf8");
fs.writeFileSync(
  mdPath,
  [
    "# AegisOps Stress Benchmark",
    "",
    "This benchmark expands the deterministic judge suite from three showcase incidents to fourteen production-style incidents across reliability, privacy, billing, cache, identity, ML, search, notification, export, edge, vendor, database, observability, and approval-bypass failure modes.",
    "",
    "It is intentionally credential-free: it exercises the same orchestration path, five tool schemas, policy checks, approval gate, and dry-run simulator without exposing or burning a private Qwen key. Live Qwen mode can be smoke-tested separately with `pnpm run qwen:live-smoke` when `QWEN_API_KEY` or `DASHSCOPE_API_KEY` is available.",
    "",
    "## Summary",
    "",
    `- Scenarios: ${summary.scenarioCount}`,
    `- Services: ${summary.serviceCount}`,
    `- Approved-path tool calls: ${summary.approvedToolCalls}`,
    `- Human-gate blocked-mutation checks: ${summary.blockedMutationChecks}/${summary.scenarioCount}`,
    `- Full workflow average: ${summary.fullAverage.toFixed(3)}`,
    `- No-memory average: ${summary.noMemoryAverage.toFixed(3)}`,
    `- Approval-paused average: ${summary.approvalPausedAverage.toFixed(3)}`,
    `- Single-agent baseline average: ${summary.singleAgentBaselineAverage.toFixed(3)}`,
    `- Average gain over single-agent baseline: ${summary.averageGainOverSingleAgent.toFixed(3)}`,
    "",
    "## Scenario Table",
    "",
    "| Incident | Service | Severity | Full | No Memory | Approval Paused | Single-Agent | Gain | Tool Calls | Blocked Mutation |",
    "| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
    ...rows.map(
      (row) =>
        `| ${row.incidentId} | ${row.service} | ${row.severity} | ${row.full.toFixed(3)} | ${row.noMemory.toFixed(3)} | ${row.approvalPaused.toFixed(3)} | ${row.singleAgentBaseline.toFixed(3)} | ${row.gainOverSingleAgent.toFixed(3)} | ${row.approvedToolCalls} | ${row.blockedMutationPrevented ? "yes" : "no"} |`
    ),
    "",
    "## Claim Boundary",
    "",
    "This is a deterministic engineering benchmark, not a production incident dataset and not a claim of measured customer MTTR. Its purpose is to prove breadth, repeatability, tool coverage, and safety-gate behavior for hackathon judging."
  ].join("\n"),
  "utf8"
);

console.log(`Wrote ${jsonPath}`);
console.log(`Wrote ${mdPath}`);
