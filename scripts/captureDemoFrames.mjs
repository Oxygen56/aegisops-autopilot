import { mkdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";

const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const url = process.env.DEMO_REEL_URL ?? "http://127.0.0.1:5173/?reel=1";
const outDir = path.resolve(process.argv[2] ?? "docs/demo/frames/reel");
const port = Number(process.env.DEMO_CDP_PORT ?? 9234);
const width = Number(process.env.DEMO_FRAME_WIDTH ?? 1280);
const height = Number(process.env.DEMO_FRAME_HEIGHT ?? 720);
const slideCount = Number(process.env.DEMO_SLIDE_COUNT ?? 7);
const firstWaitMs = Number(process.env.DEMO_FIRST_WAIT_MS ?? 1800);
const slideWaitMs = Number(process.env.DEMO_SLIDE_WAIT_MS ?? 8600);
const profileDir = `/tmp/aegisops-cdp-${Date.now()}`;

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
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

async function createTarget() {
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

async function main() {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

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
    const target = await createTarget();
    const cdp = connect(target.webSocketDebuggerUrl);

    await cdp.command("Page.enable");
    await cdp.command("Runtime.enable");
    await cdp.command("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false
    });
    await cdp.command("Page.navigate", { url });
    await sleep(firstWaitMs);

    for (let index = 0; index < slideCount; index += 1) {
      if (index > 0) await sleep(slideWaitMs);
      const text = await cdp.command("Runtime.evaluate", {
        expression: "document.body.innerText",
        returnByValue: true
      });
      const screenshot = await cdp.command("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: false
      });
      const file = path.join(outDir, `slide-${String(index + 1).padStart(2, "0")}.png`);
      await writeFile(file, Buffer.from(screenshot.data, "base64"));
      const footer = String(text.result?.value ?? "").split("\n").find((line) => line.includes("/ 7")) ?? "";
      console.log(`${file}${footer ? ` ${footer.trim()}` : ""}`);
    }

    cdp.close();
  } finally {
    chrome.kill("SIGTERM");
    await rm(profileDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
