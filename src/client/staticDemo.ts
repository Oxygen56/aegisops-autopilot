import type { AgentFinding, ApprovalDecision, Incident, MemoryItem, RemediationPlan, ToolCall, WorkflowEvent, WorkflowResult } from "../server/agent/types";

export const staticIncidents: Incident[] = [
  {
    id: "checkout-tax-latency",
    title: "Checkout p95 latency jumped after tax calculator rollout",
    service: "checkout-api",
    severity: "sev1",
    startedAt: "2026-07-02T13:10:00Z",
    alert: "p95 latency above 2.4s for 18 minutes; conversion drop detected in NA cell-3.",
    customerImpact: "Customers can browse products but checkout confirmations are timing out for about 9% of NA traffic.",
    owner: "payments-platform",
    constraints: [
      "Do not disable fraud checks.",
      "Human approval is required before changing production routing.",
      "Preserve audit logs for finance reconciliation."
    ],
    recentChanges: [
      "feature_flag tax_calculator_v2 raised from 10% to 60% in NA cell-3",
      "dependency tax-rules-cache switched from local LRU to regional Redis",
      "new dashboard annotation: cache miss rate alert threshold changed"
    ],
    signals: [
      { source: "metrics", name: "checkout.p95_ms", value: "2480", status: "critical" },
      { source: "metrics", name: "tax_cache.miss_rate", value: "38%", status: "critical" },
      { source: "logs", name: "redis timeout", value: "ETIMEDOUT tax-rules-cache:6379", status: "critical" },
      { source: "deploy", name: "last rollout", value: "tax_calculator_v2 60%", status: "warning" }
    ],
    runbookHint: "Prefer feature-flag rollback before pod restarts when only one cell is affected."
  },
  {
    id: "support-pii-leak-risk",
    title: "Support automation started attaching raw customer transcripts",
    service: "support-agent",
    severity: "sev2",
    startedAt: "2026-07-02T17:45:00Z",
    alert: "Outbound support drafts include unsanitized transcript chunks after a prompt template update.",
    customerImpact: "Drafts are paused, but queue time is rising for enterprise accounts.",
    owner: "customer-ops-ai",
    constraints: [
      "No outbound customer message may be sent without human approval.",
      "PII redaction must run before any generated draft leaves the system.",
      "Security reviewer must approve template changes."
    ],
    recentChanges: [
      "prompt_template support_resolution_v4 removed explicit redaction instruction",
      "retriever top_k changed from 4 to 9",
      "manual review queue was bypassed for low-severity tickets"
    ],
    signals: [
      { source: "security", name: "pii_detector", value: "email and phone tokens in 12 drafts", status: "critical" },
      { source: "logs", name: "policy bypass", value: "review_queue=false for enterprise tier", status: "critical" },
      { source: "metrics", name: "queue_wait_min", value: "41", status: "warning" },
      { source: "deploy", name: "template hash", value: "support_resolution_v4:19c0", status: "warning" }
    ],
    runbookHint: "Fail closed: restore review queue, then re-enable generation with redaction checks."
  },
  {
    id: "billing-duplicate-webhooks",
    title: "Duplicate billing webhooks are creating retry storms",
    service: "billing-webhook",
    severity: "sev1",
    startedAt: "2026-07-02T21:05:00Z",
    alert: "Webhook retries increased 12x; duplicate invoice attempts detected for EU merchants.",
    customerImpact: "Invoices are not double-charged, but merchants see repeated pending events and delayed settlement.",
    owner: "billing-core",
    constraints: [
      "Never replay payment capture without idempotency validation.",
      "EU settlement window closes in 45 minutes.",
      "Any queue purge needs finance approval."
    ],
    recentChanges: [
      "idempotency-key generation migrated to new canonicalization helper",
      "Kafka consumer group billing-eu-blue scaled from 6 to 14 pods",
      "retry backoff maximum reduced from 10 minutes to 90 seconds"
    ],
    signals: [
      { source: "metrics", name: "webhook.retry_rate", value: "12x baseline", status: "critical" },
      { source: "traces", name: "idempotency mismatch", value: "merchant_id casing differs", status: "critical" },
      { source: "logs", name: "duplicate pending event", value: "invoice.pending emitted repeatedly", status: "critical" },
      { source: "deploy", name: "consumer scale", value: "6 -> 14 pods", status: "warning" }
    ],
    runbookHint: "Freeze retries, fix idempotency canonicalization, then drain with dedupe guard."
  }
];

const staticMemories: MemoryItem[] = [
  {
    id: "mem-tax-rollback",
    text: "For checkout-api latency isolated to one cell, feature flag rollback is safer than pod restarts.",
    tags: ["checkout-api", "latency", "rollback"],
    priority: 0.94,
    createdAt: "2026-06-25T10:00:00Z",
    score: 0.96
  },
  {
    id: "mem-support-fail-closed",
    text: "Support-agent outbound generation must fail closed when PII redaction or human review is unavailable.",
    tags: ["support-agent", "security", "pii"],
    priority: 0.98,
    createdAt: "2026-06-26T16:30:00Z",
    score: 0.92
  },
  {
    id: "mem-billing-idempotency",
    text: "Billing webhook retry storms often come from idempotency key drift.",
    tags: ["billing-webhook", "idempotency", "retry"],
    priority: 0.96,
    createdAt: "2026-06-30T09:20:00Z",
    score: 0.9
  },
  {
    id: "mem-human-approval",
    text: "Production routing, payment, queue purge, and outbound customer communication changes require human approval.",
    tags: ["approval", "production", "risk-control"],
    priority: 0.99,
    createdAt: "2026-07-01T08:00:00Z",
    score: 0.89
  }
];

function planFor(incident: Incident): RemediationPlan {
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
        }
      ],
      verification: ["PII fixture suite passes 100%", "security reviewer signs off template diff"],
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
        }
      ],
      verification: ["zero duplicate payment capture attempts", "retry_rate below 1.5x baseline"],
      rollback: ["Disable new guard and keep replay paused if duplicate capture detector fires."]
    };
  }

  return {
    summary: "Rollback the risky tax calculator flag in the affected cell, warm cache, then canary recovery.",
    actions: [
      {
        id: "rollback-flag",
        label: "Set tax_calculator_v2 to 10% in NA cell-3",
        command: "aegisctl flag set tax_calculator_v2 --cell na-3 --percent 10 --reason INC-CHKTAX",
        reversible: true,
        blastRadius: "cell"
      }
    ],
    verification: ["checkout.p95_ms below 900 for 5 minutes", "tax_cache.miss_rate below 8%"],
    rollback: ["Restore flag to 60% only after cache hit-rate soak passes 30 minutes."]
  };
}

function toolCallsFor(incident: Incident, includeSimulator: boolean): ToolCall[] {
  const calls: ToolCall[] = [
    {
      name: "log_search",
      input: { incidentId: incident.id, service: incident.service },
      output: {
        summary: `${incident.signals.filter((signal) => signal.status === "critical").length} correlated log patterns found`
      },
      durationMs: 19,
      risk: "low"
    },
    {
      name: "metric_probe",
      input: { incidentId: incident.id, service: incident.service },
      output: {
        summary: `${incident.service} has ${incident.signals.filter((signal) => signal.status === "critical").length} critical signals`
      },
      durationMs: 18,
      risk: "low"
    },
    {
      name: "change_graph",
      input: { incidentId: incident.id, service: incident.service },
      output: {
        summary: `${incident.recentChanges.length} recent changes overlap the alert window`
      },
      durationMs: 17,
      risk: "low"
    },
    {
      name: "policy_check",
      input: { incidentId: incident.id, service: incident.service },
      output: {
        summary: "human approval required before production mutation"
      },
      durationMs: 20,
      risk: "medium"
    }
  ];

  if (includeSimulator) {
    calls.push({
      name: "remediation_simulator",
      input: { incidentId: incident.id, service: incident.service },
      output: {
        summary: "dry-run accepted with reversible actions only"
      },
      durationMs: 21,
      risk: "medium"
    });
  }

  return calls;
}

function findingsFor(incident: Incident, toolCalls: ToolCall[], approval: ApprovalDecision): AgentFinding[] {
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
      stance: `Most likely cause: ${incident.recentChanges[0]}.`,
      confidence: 0.88,
      evidence: incident.signals.filter((signal) => signal.status === "critical").map((signal) => `${signal.name}: ${signal.value}`),
      objections: ["A single metric is insufficient; correlate logs, changes, and policy."]
    },
    {
      agent: "reliability_engineer",
      stance: `Prefer reversible mitigation with narrow blast radius using ${toolCalls.map((tool) => tool.name).join(", ")} evidence.`,
      confidence: 0.86,
      evidence: toolCalls.map((tool) => `${tool.name}: ${String(tool.output.summary)}`),
      objections: ["Avoid broad restarts or queue purges unless dry-run and rollback checks pass."]
    },
    {
      agent: "human_approver",
      stance: approval.approved ? "Approved bounded dry-run execution for demo." : "Holding production mutation until an authorized human approves.",
      confidence: approval.approved ? 1 : 0.78,
      evidence: approval.checklist,
      objections: approval.approved ? [] : ["Production action remains paused."]
    }
  ];
}

export function runStaticWorkflow(incidentId: string, autoApprove: boolean): WorkflowResult {
  const incident = staticIncidents.find((candidate) => candidate.id === incidentId) ?? staticIncidents[0];
  const memories = staticMemories.slice(0, 4);
  const approval: ApprovalDecision = {
    required: true,
    approved: autoApprove,
    approver: "static-demo",
    reason: autoApprove ? "Demo approval granted after checklist evaluation." : "Waiting for human approval before production mutation.",
    checklist: [
      "Root-cause hypothesis references at least two evidence sources.",
      "Action is reversible or includes explicit rollback.",
      "Blast radius is narrower than the incident scope.",
      "Verification metrics are defined before execution.",
      "Policy constraints and hard stops are honored."
    ]
  };
  const toolCalls = toolCallsFor(incident, approval.approved);
  const timeline: WorkflowEvent[] = [
    { at: new Date().toISOString(), phase: "intake", summary: "Incident accepted", detail: `${incident.title} affecting ${incident.service}` },
    { at: new Date().toISOString(), phase: "memory", summary: "4 relevant memories recalled", detail: memories.map((memory) => memory.id).join(", ") },
    { at: new Date().toISOString(), phase: "tools", summary: "Evidence collected", detail: toolCalls.map((tool) => tool.name).join(", ") },
    {
      at: new Date().toISOString(),
      phase: approval.approved ? "dry-run" : "approval",
      summary: approval.approved ? "Remediation dry-run accepted" : "Human approval required",
      detail: approval.reason
    }
  ];

  return {
    id: `static-${incident.id}`,
    providerMode: "offline-fixture",
    model: "static-github-pages-fixture",
    incident,
    memories,
    toolCalls,
    findings: findingsFor(incident, toolCalls, approval),
    plan: planFor(incident),
    approval,
    timeline,
    scorecard: {
      memoryRecall: 1,
      toolCoverage: approval.approved ? 1 : 0.8,
      riskControl: 0.95,
      humanGate: approval.approved ? 1 : 0.7,
      overall: approval.approved ? 0.988 : 0.863
    }
  };
}
