import { SupabaseClient } from "@supabase/supabase-js";
import { classifyEntry } from "../analysis/classify";
import { EntryAnalysis, NewEntryInput, PainEntry } from "../analysis/types";
import { EntryRepository } from "./types";

interface EntryRow {
  id: string;
  content: string;
  logged_at: string;
  created_at: string;
  analysis: EntryAnalysis;
}

function rowToEntry(row: EntryRow): PainEntry {
  return {
    id: row.id,
    content: row.content,
    loggedAt: row.logged_at,
    createdAt: row.created_at,
    analysis: row.analysis,
  };
}

/** Supabase(Postgres)에 저장, 여러 기기 동기화를 지원. supabase/migrations/0001_init.sql 스키마 필요. */
export class SupabaseEntryRepository implements EntryRepository {
  constructor(private client: SupabaseClient, private userId: string) {}

  async listEntries(): Promise<PainEntry[]> {
    const { data, error } = await this.client
      .from("entries")
      .select("id, content, logged_at, created_at, analysis")
      .eq("user_id", this.userId)
      .order("logged_at", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as EntryRow[]).map(rowToEntry);
  }

  async addEntry(input: NewEntryInput): Promise<PainEntry> {
    const analysis = classifyEntry(input.content);
    const { data, error } = await this.client
      .from("entries")
      .insert({ user_id: this.userId, content: input.content, logged_at: input.loggedAt, analysis })
      .select("id, content, logged_at, created_at, analysis")
      .single();
    if (error) throw error;
    return rowToEntry(data as EntryRow);
  }

  async deleteEntry(id: string): Promise<void> {
    const { error } = await this.client.from("entries").delete().eq("id", id).eq("user_id", this.userId);
    if (error) throw error;
  }
}
