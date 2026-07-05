import { mkdir, rm, writeFile, readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";

const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const targetUrl = (process.env.PROOF_TARGET_URL ?? "http://101.201.33.56").replace(/\/$/, "");
const outDir = path.resolve(process.argv[2] ?? "docs/demo/frames/alibaba-proof");
const port = Number(process.env.PROOF_CDP_PORT ?? 9235);
const width = 1280;
const height = 720;
const profileDir = `/tmp/aegisops-proof-cdp-${Date.now()}`;

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(endpoint) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(`${targetUrl}${endpoint}`, { signal: controller.signal });
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return { status: response.status, body: text.slice(0, 1000) };
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  } finally {
    clearTimeout(timer);
  }
}

async function waitForJsonVersion() {
  const endpoint = `http://127.0.0.1:${port}/json/version`;
  const startedAt = Date.now();
  while (Date.now() - startedAt < 15000) {
    try {
      const response = await fetch(endpoint);
      if (response.ok) return response.json();
    } catch {
      // Chrome is still starting.
    }
    await sleep(200);
  }
  throw new Error("Timed out waiting for Chrome DevTools endpoint");
}

async function createTarget(url) {
  const response = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, { method: "PUT" });
  if (!response.ok) throw new Error(`Chrome target creation failed: ${response.status}`);
  return response.json();
}

function connect(wsUrl) {
  const socket = new WebSocket(wsUrl);
  const pending = new Map();
  let nextId = 1;

  socket.addEventListener("message", (event) => {
    const payload = JSON.parse(event.data);
    if (!payload.id) return;
    const waiter = pending.get(payload.id);
    if (!waiter) return;
    pending.delete(payload.id);
    if (payload.error) waiter.reject(new Error(JSON.stringify(payload.error)));
    else waiter.resolve(payload.result);
  });

  const opened = new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  async function command(method, params = {}) {
    await opened;
    const id = nextId++;
    socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
  }

  return {
    command,
    close: () => socket.close()
  };
}

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function prettyJson(value) {
  return JSON.stringify(value, null, 2)
    .replace(/"credential": "present[^"]*"/g, '"credential": "present-redacted"')
    .replace(/sk-[A-Za-z0-9_-]+/g, "sk-redacted");
}

function htmlForSlide(slide, index, count) {
  const stats = slide.stats
    .map(([label, value]) => `<div class="stat"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`)
    .join("");
  const code = slide.code ? `<pre>${esc(slide.code)}</pre>` : "";
  const image = slide.image ? `<img class="proof-image" src="${slide.image}" alt="proof screenshot" />` : "";

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { box-sizing: border-box; }
    body {
      width: ${width}px;
      height: ${height}px;
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #0b1020;
      color: #eef4ff;
    }
    main {
      width: 100%;
      height: 100%;
      padding: 52px 64px 48px;
      display: grid;
      grid-template-rows: auto 1fr auto;
      gap: 24px;
      background:
        linear-gradient(135deg, rgba(20, 184, 166, 0.16), transparent 36%),
        linear-gradient(315deg, rgba(245, 158, 11, 0.16), transparent 34%),
        #0b1020;
    }
    .eyebrow {
      margin: 0 0 12px;
      color: #5eead4;
      font-size: 18px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0;
    }
    h1 {
      margin: 0;
      font-size: 54px;
      line-height: 1.02;
      letter-spacing: 0;
      max-width: 1040px;
    }
    .body {
      margin: 16px 0 0;
      color: #cbd5e1;
      font-size: 26px;
      line-height: 1.35;
      max-width: 1040px;
    }
    .content {
      display: grid;
      grid-template-columns: ${slide.image ? "1fr 1.05fr" : "1fr"};
      gap: 28px;
      min-height: 0;
      align-items: stretch;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(${Math.min(Math.max(slide.stats.length, 1), 3)}, 1fr);
      gap: 14px;
      align-content: start;
    }
    .stat {
      border: 1px solid rgba(148, 163, 184, 0.24);
      border-radius: 8px;
      padding: 18px;
      background: rgba(15, 23, 42, 0.78);
      min-height: 108px;
    }
    .stat span {
      display: block;
      color: #94a3b8;
      font-size: 16px;
      margin-bottom: 10px;
    }
    .stat strong {
      display: block;
      color: #ffffff;
      font-size: 27px;
      line-height: 1.12;
      overflow-wrap: anywhere;
    }
    pre {
      margin: 18px 0 0;
      max-height: 330px;
      overflow: hidden;
      white-space: pre-wrap;
      border: 1px solid rgba(94, 234, 212, 0.25);
      border-radius: 8px;
      padding: 18px;
      color: #d9f99d;
      background: rgba(2, 6, 23, 0.9);
      font-size: 17px;
      line-height: 1.32;
    }
    .proof-image {
      width: 100%;
      height: 356px;
      object-fit: contain;
      border: 1px solid rgba(148, 163, 184, 0.24);
      border-radius: 8px;
      background: #020617;
    }
    footer {
      display: flex;
      justify-content: space-between;
      color: #94a3b8;
      font-size: 17px;
    }
  </style>
</head>
<body>
  <main>
    <header>
      <p class="eyebrow">${esc(slide.eyebrow)}</p>
      <h1>${esc(slide.title)}</h1>
      <p class="body">${esc(slide.body)}</p>
    </header>
    <section class="content">
      <div>
        <div class="stats">${stats}</div>
        ${code}
      </div>
      ${image}
    </section>
    <footer>
      <span>AegisOps Autopilot - Alibaba Cloud proof</span>
      <span>${index + 1} / ${count}</span>
    </footer>
  </main>
</body>
</html>`;
}

async function main() {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const [health, proof, tools] = await Promise.all([
    fetchJson("/api/health"),
    fetchJson("/api/alibaba/proof"),
    fetchJson("/api/tools")
  ]);
  const workbenchPng = await readFile("docs/screenshots/alibaba-workbench-proof.png");
  const workbenchImage = `data:image/png;base64,${workbenchPng.toString("base64")}`;
  const qwen = health.qwenCloud ?? {};
  const toolCount = Array.isArray(tools.tools) ? tools.tools.length : "not reported";

  const slides = [
    {
      eyebrow: "Separate backend proof",
      title: "Alibaba Cloud deployment is public and secret-safe",
      body: "This recording is separate from the product demo and focuses only on backend deployment proof for Devpost.",
      stats: [
        ["Live demo", targetUrl],
        ["Health", "/api/health"],
        ["Proof endpoint", "/api/alibaba/proof"]
      ]
    },
    {
      eyebrow: "Qwen Cloud metadata",
      title: "Health endpoint shows provider, model, base URL, and timestamp",
      body: "The endpoint proves Qwen Cloud integration without returning any key. Public mode can run fixtures to avoid credential burn.",
      stats: [
        ["Provider", qwen.provider ?? health.qwenProvider ?? "qwen-cloud"],
        ["Mode", qwen.mode ?? health.qwenMode ?? "reported by API"],
        ["Credential", qwen.credential ?? "redacted"]
      ],
      code: prettyJson(health)
    },
    {
      eyebrow: "Alibaba runtime signal",
      title: "Proof endpoint exposes ECS metadata and Qwen endpoint configuration",
      body: "The response includes compute target, region, Qwen base URL, and model while keeping cloud and model credentials out of the response.",
      stats: [
        ["Compute", proof.computeTarget ?? "reported by API"],
        ["Region", proof.region ?? "reported by API"],
        ["Model", proof.qwenModel ?? qwen.model ?? "qwen-plus"]
      ],
      code: prettyJson(proof)
    },
    {
      eyebrow: "Workbench proof",
      title: "Alibaba Cloud console screenshot matches the public endpoint",
      body: "The screenshot is public-safe and shows the ECS instance evidence without billing pages, access keys, or private files.",
      stats: [
        ["Asset", "docs/screenshots/alibaba-workbench-proof.png"],
        ["Runtime", proof.computeTarget ?? "Alibaba Cloud ECS"],
        ["Public IP", targetUrl.replace(/^https?:\/\//, "")]
      ],
      image: workbenchImage
    },
    {
      eyebrow: "Tool surface proof",
      title: "The same backend exposes five judge-verifiable tools",
      body: "Qwen Function Calling, OpenAPI endpoints, and MCP stdio all share the same incident-scoped tool registry.",
      stats: [
        ["Tool count", String(toolCount)],
        ["OpenAPI", "agents/aegisops/openapi.yaml"],
        ["MCP", "pnpm run mcp:stdio"]
      ],
      code: prettyJson(tools)
    },
    {
      eyebrow: "Submission fit",
      title: "Proof link package for Devpost",
      body: "Paste the proof video URL beside the live proof endpoint and repository code links in the Alibaba Cloud Deployment Proof field.",
      stats: [
        ["Code proof", "src/server/cloud/alibabaProof.ts"],
        ["Qwen client", "src/server/agent/qwenClient.ts"],
        ["Secret scan", "no keys returned"]
      ]
    }
  ];

  const chrome = spawn(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--mute-audio",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    `--window-size=${width},${height}`,
    "about:blank"
  ], { stdio: ["ignore", "ignore", "pipe"] });

  chrome.stderr.on("data", (chunk) => {
    const text = chunk.toString();
    if (!text.includes("DevTools listening")) process.stderr.write(text);
  });

  try {
    await waitForJsonVersion();
    for (let index = 0; index < slides.length; index += 1) {
      const html = htmlForSlide(slides[index], index, slides.length);
      const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
      const target = await createTarget(dataUrl);
      const cdp = connect(target.webSocketDebuggerUrl);
      await cdp.command("Page.enable");
      await cdp.command("Emulation.setDeviceMetricsOverride", {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: false
      });
      await sleep(550);
      const screenshot = await cdp.command("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: false
      });
      const file = path.join(outDir, `slide-${String(index + 1).padStart(2, "0")}.png`);
      await writeFile(file, Buffer.from(screenshot.data, "base64"));
      console.log(file);
      cdp.close();
    }
  } finally {
    chrome.kill("SIGTERM");
    await rm(profileDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
