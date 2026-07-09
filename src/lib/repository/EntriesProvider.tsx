"use client";

import { createContext, ReactNode, useContext } from "react";
import { useEntries } from "./useEntries";

type EntriesContextValue = ReturnType<typeof useEntries>;

const EntriesContext = createContext<EntriesContextValue | null>(null);

export function EntriesProvider({ children }: { children: ReactNode }) {
  const value = useEntries();
  return <EntriesContext.Provider value={value}>{children}</EntriesContext.Provider>;
}

export function useEntriesContext(): EntriesContextValue {
  const ctx = useContext(EntriesContext);
  if (!ctx) {
    throw new Error("useEntriesContext는 EntriesProvider 내부에서만 사용할 수 있습니다.");
  }
  return ctx;
}
