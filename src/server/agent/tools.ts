import type { Incident, RemediationPlan, ToolCall } from "./types";

async function timedTool(
  name: string,
  incident: Incident,
  risk: ToolCall["risk"],
  output: Record<string, unknown>
): Promise<ToolCall> {
  const started = performance.now();
  await new Promise((resolve) => setTimeout(resolve, 18));
  return {
    name,
    input: { incidentId: incident.id, service: incident.service },
    output,
    risk,
    durationMs: Math.round(performance.now() - started)
  };
}

export async function searchLogs(incident: Incident): Promise<ToolCall> {
  const critical = incident.signals.filter((signal) => signal.source === "logs" || signal.status === "critical");
  return timedTool("log_search", incident, "low", {
    summary: `${critical.length} correlated log patterns found`,
    excerpts: critical.map((signal) => `${signal.name} -> ${signal.value}`),
    retention: "audit-safe synthetic fixture"
  });
}

export async function probeMetrics(incident: Incident): Promise<ToolCall> {
  return timedTool("metric_probe", incident, "low", {
    summary: `${incident.service} has ${incident.signals.filter((signal) => signal.status === "critical").length} critical signals`,
    sli: incident.signals.map((signal) => ({
      name: signal.name,
      value: signal.value,
      status: signal.status
    }))
  });
}

export async function inspectChanges(incident: Incident): Promise<ToolCall> {
  return timedTool("change_graph", incident, "low", {
    summary: `${incident.recentChanges.length} recent changes overlap the alert window`,
    changes: incident.recentChanges,
    likelyChange: incident.recentChanges[0]
  });
}

export async function checkPolicy(incident: Incident): Promise<ToolCall> {
  const needsHuman = incident.constraints.some((constraint) => /approval|human|finance|security/i.test(constraint));
  return timedTool("policy_check", incident, "medium", {
    summary: needsHuman ? "human approval required before production mutation" : "automated action allowed",
    requiredApprovals: incident.constraints.filter((constraint) => /approval|human|finance|security/i.test(constraint)),
    hardStops: incident.constraints.filter((constraint) => /never|no |do not/i.test(constraint))
  });
}

export function buildRemediationPlan(incident: Incident): RemediationPlan {
  if (incident.id === "checkout-tax-latency") {
    return {
      summary: "Rollback the risky tax calculator flag in the affected cell, warm cache, then canary recovery.",
      actions: [
        {
          id: "rollback-flag",
          label: "Set tax_calculator_v2 to 10% in NA cell-3",
          command: "aegisctl flag set tax_calculator_v2 --cell na-3 --percent 10 --reason INC-CHKTAX",
          reversible: true,
          blastRadius: "cell"
        },
        {
          id: "warm-cache",
          label: "Warm tax-rules-cache for top checkout jurisdictions",
          command: "aegisctl cache warm tax-rules-cache --region na --profile checkout-top-100",
          reversible: true,
          blastRadius: "single-service"
        }
      ],
      verification: [
        "checkout.p95_ms below 900 for 5 minutes",
        "tax_cache.miss_rate below 8%",
        "conversion returns within 1% of baseline"
      ],
      rollback: ["Restore flag to 60% only after cache hit-rate soak passes 30 minutes."]
    };
  }

  if (incident.id === "support-pii-leak-risk") {
    return {
      summary: "Fail closed, restore review and redaction, then re-enable generation after security checks.",
      actions: [
        {
          id: "restore-review",
          label: "Force review queue for all enterprise drafts",
          command: "aegisctl policy set support-agent review_queue=true --tier enterprise",
          reversible: true,
          blastRadius: "single-service"
        },
        {
          id: "redaction-template",
          label: "Reinstate redaction-first template",
          command: "aegisctl prompt rollback support_resolution --to v3-redaction-locked",
          reversible: true,
          blastRadius: "single-service"
        }
      ],
      verification: [
        "PII fixture suite passes 100%",
        "all outbound drafts show review_queue=true",
        "security reviewer signs off template diff"
      ],
      rollback: ["Keep generation disabled and route tickets to manual queue if any PII fixture fails."]
    };
  }

  if (incident.id === "billing-duplicate-webhooks") {
    return {
      summary: "Freeze retry amplification, patch idempotency canonicalization, and drain with finance-approved dedupe guard.",
      actions: [
        {
          id: "freeze-retries",
          label: "Increase retry backoff and pause EU replay workers",
          command: "aegisctl queue throttle billing-eu --max-retry-delay 10m --pause-replay-workers",
          reversible: true,
          blastRadius: "region"
        },
        {
          id: "deploy-idempotency-guard",
          label: "Deploy canonical merchant_id idempotency guard",
          command: "aegisctl deploy billing-webhook --patch canonical-idempotency-guard --region eu",
          reversible: true,
          blastRadius: "region"
        }
      ],
      verification: [
        "zero duplicate payment capture attempts",
        "retry_rate below 1.5x baseline",
        "finance-approved dedupe report exported"
      ],
      rollback: ["Disable new guard and keep replay paused if duplicate capture detector fires."]
    };
  }

  const primaryChange = incident.recentChanges[0] ?? "latest risky change";
  const criticalMetric = incident.signals.find((signal) => signal.status === "critical")?.name ?? `${incident.service}.critical_signal`;
  return {
    summary: `${incident.runbookHint} Scope action to ${incident.service} and keep production mutation behind approval.`,
    actions: [
      {
        id: "narrow-risky-change",
        label: `Constrain or roll back: ${primaryChange}`,
        command: `aegisctl change constrain ${incident.service} --incident ${incident.id} --change "${primaryChange}"`,
        reversible: true,
        blastRadius: incident.severity === "sev1" ? "region" : "single-service"
      },
      {
        id: "restore-guardrail",
        label: "Restore policy guardrail and collect verification evidence",
        command: `aegisctl guardrail restore ${incident.service} --incident ${incident.id} --require-approval`,
        reversible: true,
        blastRadius: "single-service"
      }
    ],
    verification: [
      `${criticalMetric} returns to warning or healthy status`,
      "policy_check reports approval and hard-stop constraints are honored",
      "customer-impact metric improves for two consecutive windows"
    ],
    rollback: [`Revert guardrail change and keep ${incident.service} in manual review if verification fails.`]
  };
}

export async function simulateRemediation(incident: Incident, plan: RemediationPlan): Promise<ToolCall> {
  return timedTool("remediation_simulator", incident, "medium", {
    summary: "dry-run accepted with reversible actions only",
    actions: plan.actions.map((action) => ({
      id: action.id,
      reversible: action.reversible,
      blastRadius: action.blastRadius
    })),
    estimatedRecoveryMinutes: incident.severity === "sev1" ? 7 : 14
  });
}
