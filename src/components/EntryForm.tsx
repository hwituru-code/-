"use client";

import { FormEvent, useState } from "react";
import { todayISO } from "@/lib/date";
import { useEntriesContext } from "@/lib/repository/EntriesProvider";

export function EntryForm() {
  const { addEntry } = useEntriesContext();
  const [content, setContent] = useState("");
  const [loggedAt, setLoggedAt] = useState(todayISO());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await addEntry({ content: content.trim(), loggedAt });
      setContent("");
      setLoggedAt(todayISO());
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl border p-4"
      style={{ borderColor: "var(--border-hairline)", background: "var(--surface-1)" }}
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={
          "오늘 있었던 일, 몸 상태, 자세, 먹은 것, 수면 등 생각나는 대로 자유롭게 적어보세요.\n예: 어제 야근하느라 계속 앉아있었더니 목이랑 어깨가 뻐근하다. 커피도 3잔 마심."
        }
        rows={4}
        className="resize-none rounded-xl border bg-transparent p-3 text-sm outline-none"
        style={{ borderColor: "var(--border-hairline)", color: "var(--text-primary)" }}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
          날짜
          <input
            type="date"
            value={loggedAt}
            onChange={(e) => setLoggedAt(e.target.value)}
            max={todayISO()}
            className="rounded-lg border bg-transparent px-2 py-1 text-xs"
            style={{ borderColor: "var(--border-hairline)", color: "var(--text-primary)" }}
          />
        </label>
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          style={{ background: "var(--series-blue)" }}
        >
          {submitting ? "저장 중..." : "기록하기"}
        </button>
      </div>
      {error && (
        <p className="text-xs" style={{ color: "var(--status-critical)" }}>
          {error}
        </p>
      )}
    </form>
  );
}
