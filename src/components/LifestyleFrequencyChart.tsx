import { CATEGORY_COLOR_VAR } from "@/lib/analysis/categoryColors";
import { LifestyleCategory } from "@/lib/analysis/types";

interface FrequencyItem {
  category: LifestyleCategory;
  tag: string;
  count: number;
}

/** 생활습관 태그 빈도를 보여주는 가로 막대 목록. 색상은 카테고리(identity)를 나타내며, 각 행에 태그 이름을 직접 라벨링해 색상에만 의존하지 않는다. */
export function LifestyleFrequencyChart({ items, total }: { items: FrequencyItem[]; total: number }) {
  if (items.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        아직 인식된 생활습관 태그가 없어요.
      </p>
    );
  }

  const max = Math.max(...items.map((i) => i.count), 1);

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => {
        const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
        const widthPct = (item.count / max) * 100;
        return (
          <div key={`${item.category}-${item.tag}`} className="flex items-center gap-3">
            <div
              className="w-28 shrink-0 truncate text-xs"
              style={{ color: "var(--text-secondary)" }}
              title={`${item.category} · ${item.tag}`}
            >
              {item.tag}
            </div>
            <div className="relative h-4 flex-1 overflow-hidden rounded-full" style={{ background: "var(--gridline)" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${widthPct}%`, background: CATEGORY_COLOR_VAR[item.category] }}
              />
            </div>
            <div className="w-20 shrink-0 text-right text-xs tabular-nums" style={{ color: "var(--text-muted)" }}>
              {item.count}회 ({pct}%)
            </div>
          </div>
        );
      })}
    </div>
  );
}
