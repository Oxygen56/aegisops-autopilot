import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

interface Box {
  id: string;
  title: string;
  subtitle: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  stroke: string;
}

interface Edge {
  from: string;
  to: string;
  label?: string;
  stroke?: string;
}

const root = process.cwd();
const outDir = path.join(root, "docs/architecture");
const outPath = path.join(outDir, "aegisops-architecture.svg");
const pngPath = path.join(outDir, "aegisops-architecture.png");

const boxes: Box[] = [
  {
    id: "alert",
    title: "Ambiguous incident alert",
    subtitle: "Reliability, privacy, billing risk",
    x: 48,
    y: 116,
    w: 210,
    h: 82,
    fill: "#fff7ed",
    stroke: "#f97316"
  },
  {
    id: "memory",
    title: "Persistent memory store",
    subtitle: "Lessons, recency, priority, recall",
    x: 48,
    y: 250,
    w: 210,
    h: 82,
    fill: "#ecfdf5",
    stroke: "#10b981"
  },
  {
    id: "api",
    title: "Node.js Autopilot API",
    subtitle: "Workflow state, approval gates, audit trail",
    x: 334,
    y: 116,
    w: 250,
    h: 90,
    fill: "#eff6ff",
    stroke: "#2563eb"
  },
  {
    id: "qwen",
    title: "Qwen Cloud reasoning",
    subtitle: "OpenAI-compatible chat + Function Calling",
    x: 660,
    y: 92,
    w: 278,
    h: 96,
    fill: "#f0fdfa",
    stroke: "#0f766e"
  },
  {
    id: "tools",
    title: "Scoped tool registry",
    subtitle: "Logs, metrics, changes, policy, dry run",
    x: 660,
    y: 244,
    w: 278,
    h: 96,
    fill: "#f8fafc",
    stroke: "#475569"
  },
  {
    id: "council",
    title: "Agent council",
    subtitle: "SRE, security, finance, release review",
    x: 334,
    y: 264,
    w: 250,
    h: 90,
    fill: "#fef2f2",
    stroke: "#dc2626"
  },
  {
    id: "approval",
    title: "Human approval checkpoint",
    subtitle: "Risk score blocks unsafe mutation",
    x: 334,
    y: 430,
    w: 250,
    h: 90,
    fill: "#fffbeb",
    stroke: "#d97706"
  },
  {
    id: "execute",
    title: "Reversible remediation",
    subtitle: "Dry-run first, then verify recovery",
    x: 660,
    y: 430,
    w: 278,
    h: 90,
    fill: "#f5f3ff",
    stroke: "#7c3aed"
  },
  {
    id: "frontend",
    title: "React judge dashboard",
    subtitle: "Visible rubric evidence and workflow trace",
    x: 1014,
    y: 116,
    w: 250,
    h: 90,
    fill: "#fdf2f8",
    stroke: "#db2777"
  },
  {
    id: "surfaces",
    title: "OpenAPI + MCP surfaces",
    subtitle: "Portable tool calls for judges and agents",
    x: 1014,
    y: 264,
    w: 250,
    h: 90,
    fill: "#f0f9ff",
    stroke: "#0284c7"
  },
  {
    id: "alibaba",
    title: "Alibaba Cloud runtime",
    subtitle: "ECS or Function Compute + proof endpoint",
    x: 1014,
    y: 430,
    w: 250,
    h: 90,
    fill: "#fff1f2",
    stroke: "#e11d48"
  }
];

const edges: Edge[] = [
  { from: "alert", to: "api", label: "intake" },
  { from: "memory", to: "api", label: "recall" },
  { from: "api", to: "qwen", label: "diagnose and plan", stroke: "#0f766e" },
  { from: "qwen", to: "tools", label: "tool_choice=auto", stroke: "#0f766e" },
  { from: "tools", to: "council", label: "evidence" },
  { from: "api", to: "council", label: "workflow state" },
  { from: "council", to: "approval", label: "risk review", stroke: "#dc2626" },
  { from: "approval", to: "execute", label: "approved only", stroke: "#d97706" },
  { from: "execute", to: "memory", label: "post-incident learning", stroke: "#10b981" },
  { from: "api", to: "frontend", label: "trace UI" },
  { from: "tools", to: "surfaces", label: "same registry" },
  { from: "alibaba", to: "api", label: "hosts backend", stroke: "#e11d48" },
  { from: "alibaba", to: "qwen", label: "proof + Qwen base URL", stroke: "#e11d48" }
];

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function center(box: Box): { x: number; y: number } {
  return { x: box.x + box.w / 2, y: box.y + box.h / 2 };
}

function edgePoints(from: Box, to: Box): { x1: number; y1: number; x2: number; y2: number } {
  const a = center(from);
  const b = center(to);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const horizontal = Math.abs(dx) >= Math.abs(dy);

  let x1 = a.x;
  let y1 = a.y;
  let x2 = b.x;
  let y2 = b.y;

  if (horizontal) {
    x1 = dx > 0 ? from.x + from.w : from.x;
    y1 = a.y;
    x2 = dx > 0 ? to.x : to.x + to.w;
    y2 = b.y;
  } else {
    x1 = a.x;
    y1 = dy > 0 ? from.y + from.h : from.y;
    x2 = b.x;
    y2 = dy > 0 ? to.y : to.y + to.h;
  }

  return { x1, y1, x2, y2 };
}

function renderBox(box: Box): string {
  return [
    `<rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" rx="8" fill="${box.fill}" stroke="${box.stroke}" stroke-width="2"/>`,
    `<text x="${box.x + 18}" y="${box.y + 34}" font-size="18" font-weight="700" fill="#111827">${escapeXml(box.title)}</text>`,
    `<text x="${box.x + 18}" y="${box.y + 62}" font-size="13" fill="#334155">${escapeXml(box.subtitle)}</text>`
  ].join("\n");
}

function renderEdge(edge: Edge): string {
  const from = boxes.find((box) => box.id === edge.from);
  const to = boxes.find((box) => box.id === edge.to);
  if (!from || !to) {
    throw new Error(`Unknown edge endpoint: ${edge.from} -> ${edge.to}`);
  }
  const { x1, y1, x2, y2 } = edgePoints(from, to);
  const stroke = edge.stroke ?? "#64748b";
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="2.1" stroke-opacity="0.62" marker-end="url(#arrow)"/>`;
}

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1320" height="620" viewBox="0 0 1320 620" role="img" aria-labelledby="title desc">
  <title id="title">AegisOps Autopilot Architecture</title>
  <desc id="desc">Architecture diagram showing incident intake, memory, Qwen Cloud reasoning, scoped tools, human approval, remediation, frontend, OpenAPI, MCP, and Alibaba Cloud proof runtime.</desc>
  <defs>
    <marker id="arrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="strokeWidth">
      <path d="M2,2 L10,6 L2,10 Z" fill="#64748b"/>
    </marker>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0f172a" flood-opacity="0.12"/>
    </filter>
  </defs>
  <rect width="1320" height="620" fill="#f8fafc"/>
  <text x="48" y="58" font-size="30" font-weight="800" fill="#0f172a">AegisOps Autopilot Architecture</text>
  <text x="48" y="86" font-size="15" fill="#475569">Track 4 end-to-end incident workflow: Qwen Cloud reasoning, scoped tools, human checkpoint, Alibaba deployment proof.</text>
  <g>
${edges.map(renderEdge).join("\n")}
  </g>
  <g filter="url(#shadow)">
${boxes.map(renderBox).join("\n")}
  </g>
  <g>
    <rect x="1014" y="542" width="250" height="42" rx="8" fill="#ffffff" stroke="#cbd5e1"/>
    <text x="1032" y="568" font-size="13" fill="#475569">Arrows show evidence and control flow.</text>
  </g>
  <text x="48" y="574" font-size="13" fill="#475569">Public proof links: src/server/agent/qwenClient.ts for Qwen Base URL, src/server/cloud/alibabaProof.ts for Alibaba Cloud proof endpoint.</text>
</svg>
`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, svg, "utf8");

console.log(`Wrote ${outPath}`);

try {
  execFileSync("sips", ["-s", "format", "png", outPath, "--out", pngPath], {
    cwd: root,
    stdio: "ignore"
  });
  console.log(`Wrote ${pngPath}`);
} catch {
  if (fs.existsSync(pngPath)) {
    console.log(`Kept existing ${pngPath}`);
  } else {
    console.log("Skipped PNG export because sips is not available in this environment");
  }
}
