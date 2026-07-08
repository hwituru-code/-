"use client";

import { EntryCard } from "@/components/EntryCard";
import { RequireAuth } from "@/components/RequireAuth";
import { useEntriesContext } from "@/lib/repository/EntriesProvider";

export default function HistoryPage() {
  const { entries, entriesLoading, deleteEntry } = useEntriesContext();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
      <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
        전체 기록
      </h1>
      <RequireAuth>
        {entriesLoading ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            불러오는 중...
          </p>
        ) : entries.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            아직 기록이 없어요.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} onDelete={deleteEntry} />
            ))}
          </div>
        )}
      </RequireAuth>
    </div>
  );
}
