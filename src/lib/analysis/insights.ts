import { LifestyleCategory, PainEntry } from "./types";

export interface FactorCorrelation {
  category: LifestyleCategory;
  tag: string;
  support: number;
  confidence: number; // P(tag | bodyPart 발생)
  baseRate: number; // P(tag) 전체 기록 대비
  lift: number; // confidence / baseRate, 1보다 크면 해당 부위 통증과 함께 나타나는 경향
  avgSeverityWith: number | null;
  avgSeverityWithout: number | null;
}

export interface BodyPartInsight {
  bodyPart: string;
  occurrenceCount: number;
  avgSeverity: number | null;
  topFactors: FactorCorrelation[];
}

export interface InsightsResult {
  totalEntries: number;
  windowDays: number;
  hasEnoughData: boolean;
  bodyPartInsights: BodyPartInsight[];
  lifestyleFrequency: { category: LifestyleCategory; tag: string; count: number }[];
}

const MIN_ENTRIES_FOR_INSIGHTS = 5;
const DEFAULT_WINDOW_DAYS = 90;
const DEFAULT_MIN_SUPPORT = 2;
const MIN_LIFT_TO_SHOW = 1.2;
const MAX_FACTORS_PER_BODY_PART = 5;

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function withinWindow(loggedAt: string, windowDays: number): boolean {
  const cutoff = Date.now() - windowDays * 24 * 60 * 60 * 1000;
  const time = new Date(loggedAt).getTime();
  return Number.isFinite(time) && time >= cutoff;
}

function tagKey(category: LifestyleCategory, tag: string): string {
  return `${category}::${tag}`;
}

export function computeInsights(
  allEntries: PainEntry[],
  opts: { windowDays?: number; minSupport?: number } = {}
): InsightsResult {
  const windowDays = opts.windowDays ?? DEFAULT_WINDOW_DAYS;
  const minSupport = opts.minSupport ?? DEFAULT_MIN_SUPPORT;

  const entries = allEntries.filter((e) => withinWindow(e.loggedAt, windowDays));
  const totalEntries = entries.length;
  const hasEnoughData = totalEntries >= MIN_ENTRIES_FOR_INSIGHTS;

  // 전체 생활습관 태그 빈도 (base rate 계산용)
  const overallTagCounts = new Map<string, { category: LifestyleCategory; tag: string; count: number }>();
  for (const entry of entries) {
    const seen = new Set<string>();
    for (const lt of entry.analysis.lifestyleTags) {
      const key = tagKey(lt.category, lt.tag);
      if (seen.has(key)) continue;
      seen.add(key);
      const existing = overallTagCounts.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        overallTagCounts.set(key, { category: lt.category, tag: lt.tag, count: 1 });
      }
    }
  }

  const lifestyleFrequency = Array.from(overallTagCounts.values()).sort((a, b) => b.count - a.count);

  if (!hasEnoughData) {
    return { totalEntries, windowDays, hasEnoughData, bodyPartInsights: [], lifestyleFrequency };
  }

  const bodyParts = Array.from(new Set(entries.flatMap((e) => e.analysis.bodyParts)));

  const bodyPartInsights: BodyPartInsight[] = bodyParts.map((bodyPart) => {
    const subset = entries.filter((e) => e.analysis.bodyParts.includes(bodyPart));
    const occurrenceCount = subset.length;
    const avgSeverity = average(subset.map((e) => e.analysis.severity).filter((s): s is number => s !== null));

    const factors: FactorCorrelation[] = [];
    for (const { category, tag, count: overallCount } of overallTagCounts.values()) {
      const withTag = subset.filter((e) => e.analysis.lifestyleTags.some((lt) => lt.category === category && lt.tag === tag));
      const withoutTag = subset.filter((e) => !e.analysis.lifestyleTags.some((lt) => lt.category === category && lt.tag === tag));
      const support = withTag.length;
      if (support < minSupport) continue;

      const confidence = support / occurrenceCount;
      const baseRate = overallCount / totalEntries;
      const lift = baseRate > 0 ? confidence / baseRate : 0;
      if (lift < MIN_LIFT_TO_SHOW) continue;

      factors.push({
        category,
        tag,
        support,
        confidence,
        baseRate,
        lift,
        avgSeverityWith: average(withTag.map((e) => e.analysis.severity).filter((s): s is number => s !== null)),
        avgSeverityWithout: average(withoutTag.map((e) => e.analysis.severity).filter((s): s is number => s !== null)),
      });
    }

    factors.sort((a, b) => b.lift - a.lift);

    return {
      bodyPart,
      occurrenceCount,
      avgSeverity,
      topFactors: factors.slice(0, MAX_FACTORS_PER_BODY_PART),
    };
  });

  bodyPartInsights.sort((a, b) => b.occurrenceCount - a.occurrenceCount);

  return { totalEntries, windowDays, hasEnoughData, bodyPartInsights, lifestyleFrequency };
}
