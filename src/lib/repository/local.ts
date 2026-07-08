import { classifyEntry } from "../analysis/classify";
import { NewEntryInput, PainEntry } from "../analysis/types";
import { EntryRepository, ImportResult } from "./types";

const STORAGE_KEY = "pain-log-entries";

function loadAll(): PainEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PainEntry[]) : [];
  } catch {
    return [];
  }
}

function saveAll(entries: PainEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function sortEntries(entries: PainEntry[]): PainEntry[] {
  return [...entries].sort(
    (a, b) => b.loggedAt.localeCompare(a.loggedAt) || b.createdAt.localeCompare(a.createdAt)
  );
}

/** 브라우저 localStorage에 기록을 저장하는 기본 저장소. 로그인/서버 없이 즉시 사용 가능. */
export class LocalEntryRepository implements EntryRepository {
  async listEntries(): Promise<PainEntry[]> {
    return sortEntries(loadAll());
  }

  async addEntry(input: NewEntryInput): Promise<PainEntry> {
    const entries = loadAll();
    const entry: PainEntry = {
      id: crypto.randomUUID(),
      content: input.content,
      loggedAt: input.loggedAt,
      createdAt: new Date().toISOString(),
      analysis: classifyEntry(input.content),
    };
    entries.push(entry);
    saveAll(entries);
    return entry;
  }

  async deleteEntry(id: string): Promise<void> {
    saveAll(loadAll().filter((e) => e.id !== id));
  }

  async importEntries(entries: PainEntry[]): Promise<ImportResult> {
    const existing = loadAll();
    const existingIds = new Set(existing.map((e) => e.id));
    let imported = 0;
    let skipped = 0;
    for (const entry of entries) {
      if (existingIds.has(entry.id)) {
        skipped += 1;
        continue;
      }
      existingIds.add(entry.id);
      existing.push(entry);
      imported += 1;
    }
    saveAll(existing);
    return { imported, skipped };
  }
}
