"use client";

import { useEffect, useRef, useState } from "react";

interface DownloadOption {
  label: string;
  onClick: () => void;
}

export function DownloadMenu({
  label,
  disabled,
  options,
}: {
  label: string;
  disabled?: boolean;
  options: DownloadOption[];
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  return (
    <div className="relative inline-block" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        className="rounded-full border px-3 py-1.5 text-xs font-medium disabled:opacity-40"
        style={{ borderColor: "var(--border-hairline)", color: "var(--text-primary)" }}
      >
        {label} ▾
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 z-20 mt-1 flex min-w-[10rem] flex-col overflow-hidden rounded-xl border text-xs"
          style={{ borderColor: "var(--border-hairline)", background: "var(--surface-1)" }}
        >
          {options.map((opt) => (
            <button
              key={opt.label}
              type="button"
              role="menuitem"
              onClick={() => {
                opt.onClick();
                setOpen(false);
              }}
              className="px-3 py-2 text-left font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
