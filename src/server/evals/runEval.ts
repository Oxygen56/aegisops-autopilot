import fs from "node:fs";
import path from "node:path";
import { listIncidents, runIncidentWorkflow } from "../agent/orchestrator";
import { MemoryStore } from "../agent/memory";

const outDir = path.resolve(process.cwd(), "reports");
const outPath = path.join(outDir, "eval_report.json");
const markdownPath = path.join(outDir, "eval_report.md");

const runs = [];
for (const incident of listIncidents()) {
  const result = await runIncidentWorkflow({
    incidentId: incident.id,
    autoApprove: true,
    approver: "eval-suite",
    memoryStore: new MemoryStore(undefined, false)
  });
  runs.push({
    incidentId: incident.id,
    providerMode: result.providerMode,
    model: result.model,
    scorecard: result.scorecard,
    toolCalls: result.toolCalls.map((tool) => tool.name),
    approved: result.approval.approved
  });
}

const average = runs.reduce((sum, run) => sum + run.scorecard.overall, 0) / runs.length;
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, JSON.stringify({ averageOverall: Number(average.toFixed(3)), runs }, null, 2), "utf8");
fs.writeFileSync(
  markdownPath,
  [
    "# AegisOps Eval Report",
    "",
    `Average overall score: ${average.toFixed(3)}`,
    "",
    "| Incident | Mode | Overall | Tools | Approved |",
    "| --- | --- | ---: | --- | --- |",
    ...runs.map(
      (run) =>
        `| ${run.incidentId} | ${run.providerMode} | ${run.scorecard.overall.toFixed(3)} | ${run.toolCalls.join(", ")} | ${run.approved ? "yes" : "no"} |`
    )
  ].join("\n"),
  "utf8"
);

console.log(`Wrote ${outPath}`);
console.log(`Wrote ${markdownPath}`);
