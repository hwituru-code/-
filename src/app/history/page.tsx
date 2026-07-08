"use client";

import { ChangeEvent, useRef, useState } from "react";
import { EntryCard } from "@/components/EntryCard";
import { RequireAuth } from "@/components/RequireAuth";
import {
  exportAllEntries,
  exportAllEntriesAsText,
  exportEntriesByBodyPart,
  exportEntriesByBodyPartAsText,
  parseImportFiles,
} from "@/lib/backup";
import { useEntriesContext } from "@/lib/repository/EntriesProvider";

const buttonStyle: React.CSSProperties = {
  borderColor: "var(--border-hairline)",
  color: "var(--text-primary)",
};

interface ImportSummary {
  imported: number;
  skipped: number;
  fileErrors: { fileName: string; message: string }[];
}

export default function HistoryPage() {
  const { entries, entriesLoading, deleteEntry, importEntries } = useEntriesContext();
  const [importing, setImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFilesSelected(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setImporting(true);
    setImportSummary(null);
    try {
      const { entries: parsed, fileErrors } = await parseImportFiles(files);
      const { imported, skipped } = await importEntries(parsed);
      setImportSummary({ imported, skipped, fileErrors });
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          전체 기록
        </h1>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="w-24 shrink-0" style={{ color: "var(--text-muted)" }}>
              백업 (JSON)
            </span>
            <button
              type="button"
              onClick={() => exportAllEntries(entries)}
              disabled={entries.length === 0}
              className="rounded-full border px-3 py-1.5 font-medium disabled:opacity-40"
              style={buttonStyle}
            >
              전체 다운로드
            </button>
            <button
              type="button"
              onClick={() => exportEntriesByBodyPart(entries)}
              disabled={entries.length === 0}
              className="rounded-full border px-3 py-1.5 font-medium disabled:opacity-40"
              style={buttonStyle}
            >
              부위별로 다운로드
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="rounded-full border px-3 py-1.5 font-medium disabled:opacity-40"
              style={buttonStyle}
            >
              {importing ? "가져오는 중..." : "파일 업로드"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json,.zip,application/zip"
              multiple
              hidden
              onChange={handleFilesSelected}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="w-24 shrink-0" style={{ color: "var(--text-muted)" }}>
              텍스트로 보기
            </span>
            <button
              type="button"
              onClick={() => exportAllEntriesAsText(entries)}
              disabled={entries.length === 0}
              className="rounded-full border px-3 py-1.5 font-medium disabled:opacity-40"
              style={buttonStyle}
            >
              전체 텍스트 다운로드
            </button>
            <button
              type="button"
              onClick={() => exportEntriesByBodyPartAsText(entries)}
              disabled={entries.length === 0}
              className="rounded-full border px-3 py-1.5 font-medium disabled:opacity-40"
              style={buttonStyle}
            >
              부위별 텍스트 다운로드
            </button>
          </div>
        </div>
      </div>

      {importSummary && (
        <div
          className="rounded-2xl border p-3 text-xs"
          style={{ borderColor: "var(--border-hairline)", background: "var(--surface-1)", color: "var(--text-secondary)" }}
        >
          <p>
            {importSummary.imported}개 가져옴
            {importSummary.skipped > 0 && `, ${importSummary.skipped}개는 이미 있어 건너뜀`}.
          </p>
          {importSummary.fileErrors.map((err) => (
            <p key={err.fileName} style={{ color: "var(--status-critical)" }}>
              {err.fileName}: {err.message}
            </p>
          ))}
        </div>
      )}

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
