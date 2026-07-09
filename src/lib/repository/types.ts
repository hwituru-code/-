import { NewEntryInput, PainEntry } from "../analysis/types";

export interface ImportResult {
  imported: number;
  skipped: number;
}

export interface EntryRepository {
  listEntries(): Promise<PainEntry[]>;
  addEntry(input: NewEntryInput): Promise<PainEntry>;
  updateEntry(id: string, input: NewEntryInput): Promise<PainEntry>;
  deleteEntry(id: string): Promise<void>;
  /** 이전에 내보낸 기록을 가져온다. 이미 존재하는 id는 건너뛴다(중복 방지). */
  importEntries(entries: PainEntry[]): Promise<ImportResult>;
}
