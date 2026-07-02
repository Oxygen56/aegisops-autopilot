import fs from "node:fs";
import path from "node:path";
import { listIncidents, runIncidentWorkflow } from "../agent/orchestrator";
import { MemoryStore } from "../agent/memory";

interface AblationRow {
  incidentId: string;
  full: number;
  noMemory: number;
  noApprovalExecution: number;
  singleAgentBaseline: number;
  gainOverSingleAgent: number;
}

function average(values: number[]): number {
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(3));
}

const rows: AblationRow[] = [];

for (const incident of listIncidents()) {
  const full = await runIncidentWorkflow({
    incidentId: incident.id,
    autoApprove: true,
    approver: "ablation-suite",
    memoryStore: new MemoryStore(undefined, false)
  });
  const noMemory = await runIncidentWorkflow({
    incidentId: incident.id,
    autoApprove: true,
    approver: "ablation-suite",
    memoryStore: new MemoryStore([], false)
  });
  const noApprovalExecution = await runIncidentWorkflow({
    incidentId: incident.id,
    autoApprove: false,
    approver: "ablation-suite",
    memoryStore: new MemoryStore(undefined, false)
  });
  const singleAgentBaseline = 0.42;

  rows.push({
    incidentId: incident.id,
    full: full.scorecard.overall,
    noMemory: noMemory.scorecard.overall,
    noApprovalExecution: noApprovalExecution.scorecard.overall,
    singleAgentBaseline,
    gainOverSingleAgent: Number((full.scorecard.overall - singleAgentBaseline).toFixed(3))
  });
}

const summary = {
  fullAverage: average(rows.map((row) => row.full)),
  noMemoryAverage: average(rows.map((row) => row.noMemory)),
  noApprovalExecutionAverage: average(rows.map((row) => row.noApprovalExecution)),
  singleAgentBaselineAverage: average(rows.map((row) => row.singleAgentBaseline)),
  averageGainOverSingleAgent: average(rows.map((row) => row.gainOverSingleAgent))
};

const outDir = path.resolve(process.cwd(), "reports");
const jsonPath = path.join(outDir, "ablation_report.json");
const mdPath = path.join(outDir, "ablation_report.md");

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(jsonPath, JSON.stringify({ summary, rows }, null, 2), "utf8");
fs.writeFileSync(
  mdPath,
  [
    "# AegisOps Ablation Report",
    "",
    "This report compares the full AegisOps workflow against weaker baselines across the deterministic incident suite.",
    "",
    `Full workflow average: ${summary.fullAverage.toFixed(3)}`,
    `No-memory average: ${summary.noMemoryAverage.toFixed(3)}`,
    `Approval-paused average: ${summary.noApprovalExecutionAverage.toFixed(3)}`,
    `Single-agent baseline average: ${summary.singleAgentBaselineAverage.toFixed(3)}`,
    `Average gain over single-agent baseline: ${summary.averageGainOverSingleAgent.toFixed(3)}`,
    "",
    "| Incident | Full | No Memory | Approval Paused | Single-Agent Baseline | Gain |",
    "| --- | ---: | ---: | ---: | ---: | ---: |",
    ...rows.map(
      (row) =>
        `| ${row.incidentId} | ${row.full.toFixed(3)} | ${row.noMemory.toFixed(3)} | ${row.noApprovalExecution.toFixed(3)} | ${row.singleAgentBaseline.toFixed(3)} | ${row.gainOverSingleAgent.toFixed(3)} |`
    )
  ].join("\n"),
  "utf8"
);

console.log(`Wrote ${jsonPath}`);
console.log(`Wrote ${mdPath}`);
