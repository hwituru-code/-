"use client";

import { useState } from "react";
import { CATEGORY_COLOR_VAR } from "@/lib/analysis/categoryColors";
import { NewEntryInput, PainEntry } from "@/lib/analysis/types";
import { todayISO } from "@/lib/date";
import { TagBadge } from "./TagBadge";

function severityColor(severity: number): string {
  if (severity >= 7) return "var(--status-critical)";
  if (severity >= 4) return "var(--status-warning)";
  return "var(--status-good)";
}

interface EntryCardProps {
  entry: PainEntry;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, input: NewEntryInput) => Promise<unknown>;
}

export function EntryCard({ entry, onDelete, onEdit }: EntryCardProps) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(entry.content);
  const [loggedAt, setLoggedAt] = useState(entry.loggedAt);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { bodyParts, symptoms, lifestyleTags, severity } = entry.analysis;
  const hasTags = bodyParts.length > 0 || symptoms.length > 0 || lifestyleTags.length > 0;

  function startEditing() {
    setContent(entry.content);
    setLoggedAt(entry.loggedAt);
    setError(null);
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setError(null);
  }

  async function handleSave() {
    if (!onEdit || !content.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onEdit(entry.id, { content: content.trim(), loggedAt });
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border p-4" style={{ borderColor: "var(--border-hairline)", background: "var(--surface-1)" }}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
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
          <div className="flex gap-2">
            <button
              type="button"
              onClick={cancelEditing}
              disabled={saving}
              className="rounded-full border px-3 py-1.5 text-xs font-medium disabled:opacity-40"
              style={{ borderColor: "var(--border-hairline)", color: "var(--text-primary)" }}
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !content.trim()}
              className="rounded-full px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
              style={{ background: "var(--series-blue)" }}
            >
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
        {error && (
          <p className="text-xs" style={{ color: "var(--status-critical)" }}>
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: "var(--border-hairline)", background: "var(--surface-1)" }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
          {entry.loggedAt}
        </span>
        <div className="flex items-center gap-3">
          {severity !== null && (
            <span className="text-xs font-semibold" style={{ color: severityColor(severity) }}>
              통증 {severity}/10
            </span>
          )}
          {onEdit && (
            <button onClick={startEditing} className="text-xs hover:underline" style={{ color: "var(--text-muted)" }}>
              수정
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(entry.id)} className="text-xs hover:underline" style={{ color: "var(--text-muted)" }}>
              삭제
            </button>
          )}
        </div>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
        {entry.content}
      </p>
      {hasTags ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {bodyParts.map((bp) => (
            <TagBadge key={`bp-${bp}`} label={bp} />
          ))}
          {symptoms.map((s) => (
            <TagBadge key={`sym-${s}`} label={s} />
          ))}
          {lifestyleTags.map((lt) => (
            <TagBadge key={`lt-${lt.category}-${lt.tag}`} label={lt.tag} colorVar={CATEGORY_COLOR_VAR[lt.category]} />
          ))}
        </div>
      ) : (
        <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
          인식된 태그가 없어요. 신체 부위나 증상을 조금 더 구체적으로 적으면 분석이 정확해져요.
        </p>
      )}
    </div>
  );
}
