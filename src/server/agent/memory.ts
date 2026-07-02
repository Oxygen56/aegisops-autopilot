import fs from "node:fs";
import path from "node:path";
import type { Incident, MemoryItem } from "./types";
import { seedMemories } from "./fixtures";

const runtimePath = path.resolve(process.cwd(), "data/runtime/memory.jsonl");

function tokenize(value: string): Set<string> {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 2)
  );
}

function overlapScore(query: string, memory: MemoryItem): number {
  const queryTokens = tokenize(query);
  const memoryTokens = tokenize(`${memory.text} ${memory.tags.join(" ")}`);
  if (queryTokens.size === 0) return 0;
  let overlap = 0;
  for (const token of queryTokens) {
    if (memoryTokens.has(token)) overlap += 1;
  }
  return overlap / queryTokens.size;
}

export class MemoryStore {
  private items: MemoryItem[];
  private readonly persistRuntime: boolean;

  constructor(items: MemoryItem[] = seedMemories, persistRuntime = true) {
    this.persistRuntime = persistRuntime;
    this.items = [...items, ...(persistRuntime ? this.loadRuntime() : [])];
  }

  recallForIncident(incident: Incident, limit = 4): MemoryItem[] {
    const query = [
      incident.title,
      incident.service,
      incident.alert,
      incident.constraints.join(" "),
      incident.recentChanges.join(" "),
      incident.signals.map((signal) => `${signal.name} ${signal.value}`).join(" ")
    ].join(" ");
    return this.recall(query, limit);
  }

  recall(query: string, limit = 4): MemoryItem[] {
    const now = Date.now();
    return this.items
      .filter((item) => !item.expiresAt || Date.parse(item.expiresAt) > now)
      .map((item) => ({
        ...item,
        score: Number((overlapScore(query, item) * 0.65 + item.priority * 0.35).toFixed(3))
      }))
      .sort((left, right) => (right.score ?? 0) - (left.score ?? 0))
      .slice(0, limit);
  }

  remember(text: string, tags: string[], priority = 0.8): MemoryItem {
    const item: MemoryItem = {
      id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text,
      tags,
      priority,
      createdAt: new Date().toISOString()
    };
    this.items.push(item);
    if (this.persistRuntime) {
      fs.mkdirSync(path.dirname(runtimePath), { recursive: true });
      fs.appendFileSync(runtimePath, `${JSON.stringify(item)}\n`, "utf8");
    }
    return item;
  }

  all(): MemoryItem[] {
    return [...this.items];
  }

  private loadRuntime(): MemoryItem[] {
    if (!fs.existsSync(runtimePath)) return [];
    return fs
      .readFileSync(runtimePath, "utf8")
      .split(/\n+/)
      .filter(Boolean)
      .map((line) => JSON.parse(line) as MemoryItem);
  }
}
