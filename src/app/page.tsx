"use client";

import Link from "next/link";
import { useMemo } from "react";
import { EntryCard } from "@/components/EntryCard";
import { EntryForm } from "@/components/EntryForm";
import { RequireAuth } from "@/components/RequireAuth";
import { computeInsights } from "@/lib/analysis/insights";
import { generateRecommendations } from "@/lib/analysis/recommendations";
import { useEntriesContext } from "@/lib/repository/EntriesProvider";

export default function HomePage() {
  const { entries, entriesLoading } = useEntriesContext();

  const insights = useMemo(() => computeInsights(entries), [entries]);
  const recommendations = useMemo(() => generateRecommendations(insights, 3), [insights]);
  const recent = entries.slice(0, 3);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          오늘의 기록
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          증상과 관련 있다고 생각되는 것을 자유롭게 적어보세요. 두서없이, 생각날 때마다 적어도 괜찮아요.
        </p>
      </div>

      <RequireAuth>
        <EntryForm />

        {insights.hasEnoughData && recommendations.length > 0 && (
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                최근 인사이트
              </h2>
              <Link href="/insights" className="text-xs font-medium" style={{ color: "var(--series-blue)" }}>
                전체 보기 →
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              {recommendations.map((rec) => (
                <div
                  key={`${rec.bodyPart}-${rec.tag}`}
                  className="rounded-2xl border p-3 text-sm"
                  style={{ borderColor: "var(--border-hairline)", background: "var(--surface-1)" }}
                >
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                    {rec.bodyPart}
                  </span>
                  <span style={{ color: "var(--text-secondary)" }}> · {rec.tag}</span>
                  <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
                    {rec.message}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {!insights.hasEnoughData && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            기록이 {insights.totalEntries}개 쌓였어요. 5개 이상 쌓이면 패턴 분석을 시작해요.
          </p>
        )}

        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              최근 기록
            </h2>
            <Link href="/history" className="text-xs font-medium" style={{ color: "var(--series-blue)" }}>
              전체 보기 →
            </Link>
          </div>
          {entriesLoading ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              불러오는 중...
            </p>
          ) : recent.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              아직 기록이 없어요. 첫 기록을 남겨보세요.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {recent.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </section>
      </RequireAuth>
    </div>
  );
}
