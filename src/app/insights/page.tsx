"use client";

import { useMemo } from "react";
import { LifestyleFrequencyChart } from "@/components/LifestyleFrequencyChart";
import { RequireAuth } from "@/components/RequireAuth";
import { TagBadge } from "@/components/TagBadge";
import { CATEGORY_COLOR_VAR } from "@/lib/analysis/categoryColors";
import { computeInsights } from "@/lib/analysis/insights";
import { describeBodyPartInsight, generateRecommendations } from "@/lib/analysis/recommendations";
import { useEntriesContext } from "@/lib/repository/EntriesProvider";

export default function InsightsPage() {
  const { entries } = useEntriesContext();
  const insights = useMemo(() => computeInsights(entries), [entries]);
  const recommendations = useMemo(() => generateRecommendations(insights, 10), [insights]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          인사이트
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          최근 {insights.windowDays}일간 기록 {insights.totalEntries}개를 분석했어요.
        </p>
      </div>

      <RequireAuth>
        {!insights.hasEnoughData ? (
          <div
            className="rounded-2xl border p-6 text-center text-sm"
            style={{ borderColor: "var(--border-hairline)", background: "var(--surface-1)", color: "var(--text-secondary)" }}
          >
            최소 5개 이상의 기록이 쌓이면 패턴 분석을 시작해요. 현재 {insights.totalEntries}개 기록됨.
          </div>
        ) : (
          <>
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                신체 부위별 분석
              </h2>
              {insights.bodyPartInsights.length === 0 && (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  신체 부위가 인식된 기록이 아직 없어요.
                </p>
              )}
              <div className="flex flex-col gap-3">
                {insights.bodyPartInsights.map((bp) => (
                  <div
                    key={bp.bodyPart}
                    className="rounded-2xl border p-4"
                    style={{ borderColor: "var(--border-hairline)", background: "var(--surface-1)" }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {bp.bodyPart}
                      </h3>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {describeBodyPartInsight(bp)}
                      </span>
                    </div>
                    {bp.topFactors.length === 0 ? (
                      <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                        아직 뚜렷한 연관 요인을 찾지 못했어요. 기록이 더 쌓이면 분석이 정교해져요.
                      </p>
                    ) : (
                      <ul className="mt-3 flex flex-col gap-2">
                        {bp.topFactors.map((f) => (
                          <li key={`${f.category}-${f.tag}`} className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <TagBadge label={f.tag} colorVar={CATEGORY_COLOR_VAR[f.category]} />
                            <span style={{ color: "var(--text-secondary)" }}>
                              함께 나타날 확률 {Math.round(f.confidence * 100)}%
                              <span style={{ color: "var(--text-muted)" }}> (평소보다 {f.lift.toFixed(1)}배)</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {recommendations.length > 0 && (
              <section className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  개선 방안 추천
                </h2>
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

            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                생활습관 기록 빈도
              </h2>
              <LifestyleFrequencyChart items={insights.lifestyleFrequency} total={insights.totalEntries} />
            </section>
          </>
        )}
      </RequireAuth>
    </div>
  );
}
