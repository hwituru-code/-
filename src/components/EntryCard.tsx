import { CATEGORY_COLOR_VAR } from "@/lib/analysis/categoryColors";
import { PainEntry } from "@/lib/analysis/types";
import { TagBadge } from "./TagBadge";

function severityColor(severity: number): string {
  if (severity >= 7) return "var(--status-critical)";
  if (severity >= 4) return "var(--status-warning)";
  return "var(--status-good)";
}

export function EntryCard({ entry, onDelete }: { entry: PainEntry; onDelete?: (id: string) => void }) {
  const { bodyParts, symptoms, lifestyleTags, severity } = entry.analysis;
  const hasTags = bodyParts.length > 0 || symptoms.length > 0 || lifestyleTags.length > 0;

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
