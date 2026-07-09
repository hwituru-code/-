export function TagBadge({ label, colorVar }: { label: string; colorVar?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap"
      style={{
        borderColor: "var(--border-hairline)",
        color: "var(--text-primary)",
        background: "var(--surface-1)",
      }}
    >
      {colorVar && <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: colorVar }} />}
      {label}
    </span>
  );
}
