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
  },
  {
    id: "inventory-cache-stampede",
    title: "Inventory cache stampede is overselling flash-sale items",
    service: "inventory-api",
    severity: "sev1",
    startedAt: "2026-07-03T02:20:00Z",
    alert: "Cache hit rate collapsed during a flash sale; stock reservation conflicts increased 18x.",
    customerImpact: "Shoppers can place orders for items that may no longer be available, creating refund and trust risk.",
    owner: "commerce-platform",
    constraints: [
      "Do not disable checkout globally.",
      "Human approval is required before changing reservation policy.",
      "Preserve order and stock audit trails for reconciliation."
    ],
    recentChanges: [
      "inventory_cache_ttl reduced from 120s to 15s for flash-sale SKUs",
      "reservation worker concurrency increased from 8 to 32",
      "cache dogpile lock was disabled for low-latency mode"
    ],
    signals: [
      { source: "metrics", name: "inventory.cache_hit_rate", value: "42%", status: "critical" },
      { source: "logs", name: "reservation conflict", value: "stock_version mismatch for sku flash-8842", status: "critical" },
      { source: "traces", name: "cache stampede", value: "parallel origin reads 18x baseline", status: "critical" },
      { source: "deploy", name: "ttl rollout", value: "flash-sale ttl 15s", status: "warning" }
    ],
    runbookHint: "Re-enable dogpile lock, restore safe TTL for flash-sale SKUs, and verify reservation conflict rate before resuming scale-up."
  },
  {
    id: "auth-token-expiry-loop",
    title: "Auth refresh tokens are expiring users in a retry loop",
    service: "auth-gateway",
    severity: "sev2",
    startedAt: "2026-07-03T04:35:00Z",
    alert: "Mobile clients are refreshing tokens repeatedly after a signing-key rotation.",
    customerImpact: "Some users can browse cached pages but cannot complete authenticated actions.",
    owner: "identity-platform",
    constraints: [
      "Do not roll back key rotation without security approval.",
      "Human approval is required before widening token grace periods.",
      "Never log raw tokens or personally identifiable payloads."
    ],
    recentChanges: [
      "jwks cache max-age lowered from 10 minutes to 30 seconds",
      "new signing key kid-20260703 activated for mobile clients",
      "mobile refresh retry backoff changed to immediate retry on 401"
    ],
    signals: [
      { source: "metrics", name: "auth.refresh_401_rate", value: "27%", status: "critical" },
      { source: "logs", name: "kid mismatch", value: "unknown kid kid-20260703 at edge cache", status: "critical" },
      { source: "security", name: "token redaction", value: "raw token logging disabled", status: "healthy" },
      { source: "deploy", name: "key rotation", value: "kid-20260703 active", status: "warning" }
    ],
    runbookHint: "Warm JWKS caches, add bounded refresh backoff, and require security approval before grace-period changes."
  },
  {
    id: "ml-feature-drift",
    title: "Fraud model feature drift is rejecting legitimate card payments",
    service: "fraud-scoring",
    severity: "sev1",
    startedAt: "2026-07-03T07:15:00Z",
    alert: "Authorization decline rate jumped after a feature-store schema update.",
    customerImpact: "Legitimate card payments are being declined for high-value customers in APAC.",
    owner: "risk-ml-platform",
    constraints: [
      "Do not disable fraud checks.",
      "Risk lead approval is required before switching to a fallback model.",
      "Keep audit evidence for model decisions and feature values."
    ],
    recentChanges: [
      "feature_store merchant_velocity_v3 switched from hourly to 5-minute aggregation",
      "fraud_model_2026_07 canary increased from 5% to 35% in APAC",
      "missing-value imputation changed from median to zero for three features"
    ],
    signals: [
      { source: "metrics", name: "card_decline_rate", value: "2.8x baseline", status: "critical" },
      { source: "traces", name: "feature null spike", value: "merchant_velocity_v3 nulls 31%", status: "critical" },
      { source: "logs", name: "model fallback", value: "fallback not enabled for APAC canary", status: "warning" },
      { source: "deploy", name: "model canary", value: "fraud_model_2026_07 35%", status: "warning" }
    ],
    runbookHint: "Reduce canary, restore feature imputation, and verify decline rate against fraud-loss guardrails."
  },
  {
    id: "search-index-corruption",
    title: "Search index corruption is hiding in-stock products",
    service: "catalog-search",
    severity: "sev2",
    startedAt: "2026-07-03T09:50:00Z",
    alert: "Search zero-result rate spiked after a partial reindex of localized product fields.",
    customerImpact: "Customers in LATAM cannot find in-stock products for high-demand categories.",
    owner: "marketplace-search",
    constraints: [
      "Do not drop the global index.",
      "Human approval is required before switching all traffic to the stale replica.",
      "Preserve query and index-diff evidence for merchant support."
    ],
    recentChanges: [
      "localized title field analyzer changed for es-419",
      "partial reindex skipped 14% of product documents after a worker timeout",
      "search ranking feature product_popularity_v2 promoted to primary sort"
    ],
    signals: [
      { source: "metrics", name: "search.zero_result_rate", value: "19%", status: "critical" },
      { source: "logs", name: "reindex timeout", value: "worker shard-17 timed out at doc 883421", status: "critical" },
      { source: "traces", name: "missing localized field", value: "title_es_419 absent in 14% docs", status: "critical" },
      { source: "deploy", name: "analyzer rollout", value: "es-419 analyzer v2", status: "warning" }
    ],
    runbookHint: "Route affected locale to healthy replica, repair missing localized fields, and verify zero-result rate before full reindex."
  },
  {
    id: "notification-queue-backlog",
    title: "Notification queue backlog is delaying critical security emails",
    service: "notification-worker",
    severity: "sev2",
    startedAt: "2026-07-03T12:05:00Z",
    alert: "Password-reset and security-alert emails are delayed behind marketing batches.",
    customerImpact: "Users cannot quickly complete password resets or receive suspicious-login alerts.",
    owner: "growth-messaging",
    constraints: [
      "Never drop security notifications.",
      "Human approval is required before pausing paid marketing campaigns.",
      "Preserve delivery and unsubscribe compliance logs."
    ],
    recentChanges: [
      "marketing_batch_priority changed from 5 to 9",
      "smtp provider failover disabled after transient bounces",
      "worker autoscaling max replicas reduced from 40 to 12"
    ],
    signals: [
      { source: "metrics", name: "security_email_lag_min", value: "37", status: "critical" },
      { source: "logs", name: "priority inversion", value: "marketing batch ahead of transactional queue", status: "critical" },
      { source: "ticket", name: "password reset complaints", value: "184 tickets in 30 minutes", status: "warning" },
      { source: "deploy", name: "autoscale cap", value: "12 max replicas", status: "warning" }
    ],
    runbookHint: "Prioritize transactional queues, restore autoscale cap, and pause marketing batches only after approval."
  },
  {
    id: "data-export-permission-drift",
    title: "Data export permissions drifted after a role-mapping migration",
    service: "analytics-export",
    severity: "sev1",
    startedAt: "2026-07-03T14:40:00Z",
    alert: "Enterprise exports include fields outside the customer's purchased data scope.",
    customerImpact: "A small number of admins may access columns they are not entitled to export.",
    owner: "data-platform",
    constraints: [
      "No export may proceed until entitlement checks pass.",
      "Security and legal approval are required before re-enabling exports.",
      "Preserve all access logs and generated files for audit."
    ],
    recentChanges: [
      "role_mapper_v5 migrated from workspace role to account role precedence",
      "export field whitelist cached per account instead of per workspace",
      "manual approval step was skipped for low-volume enterprise exports"
    ],
    signals: [
      { source: "security", name: "entitlement mismatch", value: "12 exports include restricted columns", status: "critical" },
      { source: "logs", name: "role precedence", value: "account-admin overrides workspace-scope deny", status: "critical" },
      { source: "metrics", name: "exports_paused", value: "true", status: "warning" },
      { source: "deploy", name: "role mapper", value: "role_mapper_v5", status: "warning" }
    ],
    runbookHint: "Fail closed, invalidate entitlement cache, restore per-workspace checks, and require security/legal approval."
  },
  {
    id: "region-failover-config-drift",
    title: "Region failover config drift is routing traffic to cold capacity",
    service: "edge-router",
    severity: "sev1",
    startedAt: "2026-07-03T16:25:00Z",
    alert: "EU failover policy shifted traffic to a cold standby region with insufficient warm pods.",
    customerImpact: "EU users see elevated 5xx rates and slow page loads during regional brownout.",
    owner: "edge-platform",
    constraints: [
      "Do not route payment traffic to regions without data residency approval.",
      "Human approval is required before changing global failover weights.",
      "Keep edge config diffs for incident review."
    ],
    recentChanges: [
      "failover weight eu-west -> eu-central changed from 20% to 70%",
      "warm pool minimum lowered from 60 pods to 18",
      "edge config promotion skipped residency policy precheck"
    ],
    signals: [
      { source: "metrics", name: "edge.5xx_rate", value: "6.2%", status: "critical" },
      { source: "traces", name: "cold start", value: "p95 3.8s in eu-central", status: "critical" },
      { source: "logs", name: "policy precheck skipped", value: "residency_precheck=false", status: "critical" },
      { source: "deploy", name: "failover config", value: "eu-central 70%", status: "warning" }
    ],
    runbookHint: "Restore safe failover weights, warm standby capacity, and verify residency policy before routing payment traffic."
  },
  {
    id: "vendor-api-quota-spike",
    title: "Vendor API quota spike is blocking shipping label creation",
    service: "shipping-orchestrator",
    severity: "sev2",
    startedAt: "2026-07-03T18:10:00Z",
    alert: "Carrier label creation is failing after quote-refresh jobs started polling too aggressively.",
    customerImpact: "Merchants can accept orders, but labels are delayed and fulfillment SLA is at risk.",
    owner: "logistics-platform",
    constraints: [
      "Do not retry carrier label purchase without idempotency token.",
      "Human approval is required before switching all traffic to backup carriers.",
      "Preserve carrier request IDs for dispute resolution."
    ],
    recentChanges: [
      "quote_refresh_interval lowered from 15 minutes to 1 minute",
      "carrier fallback disabled for oversize packages",
      "label purchase retry count increased from 2 to 8"
    ],
    signals: [
      { source: "metrics", name: "carrier.quota_remaining", value: "0 for carrier-a", status: "critical" },
      { source: "logs", name: "429 rate limit", value: "carrier-a label endpoint throttled", status: "critical" },
      { source: "traces", name: "quote polling", value: "poll rate 14x baseline", status: "critical" },
      { source: "deploy", name: "refresh interval", value: "1m", status: "warning" }
    ],
    runbookHint: "Throttle quote refresh, restore fallback carriers for safe classes, and keep label purchases idempotent."
  },
  {
    id: "database-migration-lock-contention",
    title: "Database migration lock contention is stalling checkout writes",
    service: "orders-db",
    severity: "sev1",
    startedAt: "2026-07-03T20:30:00Z",
    alert: "DDL migration is holding locks on the orders table during peak traffic.",
    customerImpact: "Customers intermittently fail to place orders; support sees duplicate order retries.",
    owner: "database-platform",
    constraints: [
      "Never kill writer sessions without database lead approval.",
      "Human approval is required before pausing checkout writes.",
      "Preserve migration logs and lock graphs for postmortem."
    ],
    recentChanges: [
      "orders_add_tax_breakdown migration started with lock_timeout disabled",
      "online migration guard was bypassed for a hotfix release",
      "checkout writer pool max connections increased from 80 to 180"
    ],
    signals: [
      { source: "metrics", name: "orders_db.lock_wait_ms", value: "9200", status: "critical" },
      { source: "logs", name: "ddl lock wait", value: "ALTER TABLE orders ADD COLUMN tax_breakdown", status: "critical" },
      { source: "traces", name: "checkout write timeout", value: "insert order timeout 8s", status: "critical" },
      { source: "deploy", name: "migration guard", value: "bypassed", status: "warning" }
    ],
    runbookHint: "Pause the unsafe migration, restore online guard, reduce writer pressure, and resume with lock timeout."
  },
  {
    id: "observability-cardinality-explosion",
    title: "Observability cardinality explosion is degrading incident visibility",
    service: "metrics-ingest",
    severity: "sev3",
    startedAt: "2026-07-03T23:00:00Z",
    alert: "A new trace label increased metric cardinality and delayed dashboard updates.",
    customerImpact: "Internal responders have stale dashboards during an unrelated customer-impacting incident.",
    owner: "observability-platform",
    constraints: [
      "Do not drop sev1 business metrics.",
      "Human approval is required before applying a global label denylist.",
      "Preserve raw samples for the active incident window."
    ],
    recentChanges: [
      "trace_to_metric added user_session_id as a metric label",
      "metrics_ingest shard count reduced for cost saving",
      "dashboard cache TTL increased from 30s to 5m"
    ],
    signals: [
      { source: "metrics", name: "series_cardinality", value: "9.4x baseline", status: "critical" },
      { source: "logs", name: "label explosion", value: "user_session_id cardinality unbounded", status: "critical" },
      { source: "traces", name: "dashboard staleness", value: "p95 freshness 7m", status: "warning" },
      { source: "deploy", name: "label mapper", value: "trace_to_metric v8", status: "warning" }
    ],
    runbookHint: "Drop the high-cardinality label at ingest, protect business metrics, and verify dashboard freshness."
  },
  {
    id: "workflow-approval-bypass",
    title: "Workflow engine bypassed approval on high-risk account merges",
    service: "account-workflow",
    severity: "sev1",
    startedAt: "2026-07-04T01:15:00Z",
    alert: "High-risk account merge jobs moved from review_required to executed after a rule migration.",
    customerImpact: "A small number of enterprise accounts may have incorrect identity merges that require rollback.",
    owner: "enterprise-workflows",
    constraints: [
      "No high-risk merge may execute without human approval.",
      "Security reviewer must approve any rule migration rollback.",
      "Preserve merge decision logs and rollback evidence."
    ],
    recentChanges: [
      "approval_rule_engine migrated from boolean review_required to enum review_state",
      "legacy rule adapter treated unknown review_state as approved",
      "merge rollback worker was disabled during schema migration"
    ],
    signals: [
      { source: "security", name: "approval bypass", value: "17 high-risk merges executed without approver", status: "critical" },
      { source: "logs", name: "unknown review_state", value: "review_state=needs_security_review mapped to approved", status: "critical" },
      { source: "metrics", name: "merge_rollback_available", value: "false", status: "critical" },
      { source: "deploy", name: "rule migration", value: "approval_rule_engine enum rollout", status: "warning" }
    ],
    runbookHint: "Fail closed, disable merge execution, restore rollback worker, and require security-reviewed rule mapping."
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
  },
  {
    id: "mem-cache-stampede",
    text: "Cache stampedes during traffic spikes should be mitigated with dogpile locks, safe TTL restoration, and narrow SKU or cell rollback before broad service changes.",
    tags: ["cache", "inventory-api", "latency", "stampede", "rollback"],
    priority: 0.92,
    createdAt: "2026-07-01T11:30:00Z"
  },
  {
    id: "mem-auth-rotation",
    text: "Signing-key rotations require warmed JWKS caches, bounded refresh retry backoff, token redaction, and security approval for grace-period changes.",
    tags: ["auth-gateway", "security", "token", "jwks", "approval"],
    priority: 0.93,
    createdAt: "2026-07-01T13:05:00Z"
  },
  {
    id: "mem-ml-canary",
    text: "ML model canaries that affect payments should reduce traffic, restore feature-store defaults, and compare decision metrics to guardrails before promotion.",
    tags: ["fraud-scoring", "ml", "feature-store", "canary", "payments"],
    priority: 0.91,
    createdAt: "2026-07-01T15:45:00Z"
  },
  {
    id: "mem-permission-fail-closed",
    text: "Entitlement, export, and account-merge workflows must fail closed when role mapping or approval state is ambiguous.",
    tags: ["analytics-export", "account-workflow", "security", "approval", "entitlement"],
    priority: 0.95,
    createdAt: "2026-07-01T17:20:00Z"
  },
  {
    id: "mem-database-locks",
    text: "Unsafe database migrations should be paused before killing writer sessions; restore online migration guards and resume with lock timeout and rollback evidence.",
    tags: ["orders-db", "database", "migration", "lock", "approval"],
    priority: 0.9,
    createdAt: "2026-07-01T19:10:00Z"
  }
];
