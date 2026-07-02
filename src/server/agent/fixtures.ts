import type { Incident, MemoryItem } from "./types";

export const incidents: Incident[] = [
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

export const seedMemories: MemoryItem[] = [
  {
    id: "mem-tax-rollback",
    text: "For checkout-api latency isolated to one cell, feature flag rollback is safer than pod restarts and usually restores p95 within two minutes.",
    tags: ["checkout-api", "latency", "feature-flag", "rollback"],
    priority: 0.94,
    createdAt: "2026-06-25T10:00:00Z"
  },
  {
    id: "mem-support-fail-closed",
    text: "Support-agent outbound generation must fail closed when PII redaction or human review is unavailable.",
    tags: ["support-agent", "security", "pii", "human-review"],
    priority: 0.98,
    createdAt: "2026-06-26T16:30:00Z"
  },
  {
    id: "mem-billing-idempotency",
    text: "Billing webhook retry storms often come from idempotency key drift; validate canonicalized merchant_id before draining queues.",
    tags: ["billing-webhook", "idempotency", "retry", "finance"],
    priority: 0.96,
    createdAt: "2026-06-30T09:20:00Z"
  },
  {
    id: "mem-human-approval",
    text: "Production routing, payment, queue purge, and outbound customer communication changes require human approval and rollback evidence.",
    tags: ["approval", "production", "risk-control"],
    priority: 0.99,
    createdAt: "2026-07-01T08:00:00Z"
  }
];
