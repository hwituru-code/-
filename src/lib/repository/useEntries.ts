"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { NewEntryInput, PainEntry } from "../analysis/types";
import { LocalProfileRepository } from "../profile/local";
import { SupabaseProfileRepository } from "../profile/supabase";
import { EMPTY_PROFILE, ProfileInput, ProfileRepository, UserProfile } from "../profile/types";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "../supabase/client";
import { LocalEntryRepository } from "./local";
import { SupabaseEntryRepository } from "./supabase";
import { EntryRepository, ImportResult } from "./types";

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

  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [profileLoading, setProfileLoading] = useState(true);
  const profileRepoRef = useRef<ProfileRepository | null>(null);

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

  const refreshProfile = useCallback(async () => {
    if (!profileRepoRef.current) return;
    setProfileLoading(true);
    try {
      setProfile(await profileRepoRef.current.getProfile());
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      repoRef.current = new LocalEntryRepository();
      profileRepoRef.current = new LocalProfileRepository();
      refresh();
      refreshProfile();
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      if (session?.user) {
        repoRef.current = new SupabaseEntryRepository(supabase, session.user.id);
        profileRepoRef.current = new SupabaseProfileRepository(supabase, session.user.id);
        setAuthState({ mode: "signed-in", email: session.user.email ?? null });
        refresh();
        refreshProfile();
      } else {
        setAuthState({ mode: "signed-out" });
        setEntriesLoading(false);
        setProfileLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        repoRef.current = new SupabaseEntryRepository(supabase, session.user.id);
        profileRepoRef.current = new SupabaseProfileRepository(supabase, session.user.id);
        setAuthState({ mode: "signed-in", email: session.user.email ?? null });
        refresh();
        refreshProfile();
      } else {
        repoRef.current = null;
        profileRepoRef.current = null;
        setAuthState({ mode: "signed-out" });
        setEntries([]);
        setEntriesLoading(false);
        setProfile(EMPTY_PROFILE);
        setProfileLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [refresh, refreshProfile]);

  const addEntry = useCallback(
    async (input: NewEntryInput) => {
      if (!repoRef.current) throw new Error("저장소가 준비되지 않았습니다.");
      await repoRef.current.addEntry(input);
      await refresh();
    },
    [refresh]
  );

  const updateEntry = useCallback(
    async (id: string, input: NewEntryInput) => {
      if (!repoRef.current) throw new Error("저장소가 준비되지 않았습니다.");
      await repoRef.current.updateEntry(id, input);
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

  const importEntries = useCallback(
    async (imported: PainEntry[]): Promise<ImportResult> => {
      if (!repoRef.current) throw new Error("저장소가 준비되지 않았습니다.");
      const result = await repoRef.current.importEntries(imported);
      await refresh();
      return result;
    },
    [refresh]
  );

  const saveProfile = useCallback(async (input: ProfileInput): Promise<UserProfile> => {
    if (!profileRepoRef.current) throw new Error("저장소가 준비되지 않았습니다.");
    const saved = await profileRepoRef.current.saveProfile(input);
    setProfile(saved);
    return saved;
  }, []);

  return {
    authState,
    entries,
    entriesLoading,
    error,
    addEntry,
    updateEntry,
    deleteEntry,
    importEntries,
    refresh,
    profile,
    profileLoading,
    saveProfile,
  };
}
