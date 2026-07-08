"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { NewEntryInput, PainEntry } from "../analysis/types";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "../supabase/client";
import { LocalEntryRepository } from "./local";
import { SupabaseEntryRepository } from "./supabase";
import { EntryRepository } from "./types";

export type AuthState =
  | { mode: "local" }
  | { mode: "loading" }
  | { mode: "signed-out" }
  | { mode: "signed-in"; email: string | null };

export function useEntries() {
  const [authState, setAuthState] = useState<AuthState>(
    isSupabaseConfigured() ? { mode: "loading" } : { mode: "local" }
  );
  const [entries, setEntries] = useState<PainEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const repoRef = useRef<EntryRepository | null>(null);

  const refresh = useCallback(async () => {
    if (!repoRef.current) return;
    setEntriesLoading(true);
    try {
      const list = await repoRef.current.listEntries();
      setEntries(list);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "기록을 불러오지 못했습니다.");
    } finally {
      setEntriesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      repoRef.current = new LocalEntryRepository();
      refresh();
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      if (session?.user) {
        repoRef.current = new SupabaseEntryRepository(supabase, session.user.id);
        setAuthState({ mode: "signed-in", email: session.user.email ?? null });
        refresh();
      } else {
        setAuthState({ mode: "signed-out" });
        setEntriesLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        repoRef.current = new SupabaseEntryRepository(supabase, session.user.id);
        setAuthState({ mode: "signed-in", email: session.user.email ?? null });
        refresh();
      } else {
        repoRef.current = null;
        setAuthState({ mode: "signed-out" });
        setEntries([]);
        setEntriesLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [refresh]);

  const addEntry = useCallback(
    async (input: NewEntryInput) => {
      if (!repoRef.current) throw new Error("저장소가 준비되지 않았습니다.");
      await repoRef.current.addEntry(input);
      await refresh();
    },
    [refresh]
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      if (!repoRef.current) throw new Error("저장소가 준비되지 않았습니다.");
      await repoRef.current.deleteEntry(id);
      await refresh();
    },
    [refresh]
  );

  return { authState, entries, entriesLoading, error, addEntry, deleteEntry, refresh };
}
