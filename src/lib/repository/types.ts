import { NewEntryInput, PainEntry } from "../analysis/types";

export interface EntryRepository {
  listEntries(): Promise<PainEntry[]>;
  addEntry(input: NewEntryInput): Promise<PainEntry>;
  deleteEntry(id: string): Promise<void>;
}
