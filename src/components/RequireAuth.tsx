"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useEntriesContext } from "@/lib/repository/EntriesProvider";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { authState } = useEntriesContext();

  if (authState.mode === "loading") {
    return (
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        불러오는 중...
      </p>
    );
  }

  if (authState.mode === "signed-out") {
    return (
      <div
        className="rounded-2xl border p-6 text-center"
        style={{ borderColor: "var(--border-hairline)", background: "var(--surface-1)" }}
      >
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          기록을 여러 기기에서 동기화하려면 로그인이 필요해요.
        </p>
        <Link
          href="/login"
          className="mt-3 inline-block rounded-full px-4 py-2 text-sm font-semibold text-white"
          style={{ background: "var(--series-blue)" }}
        >
          로그인하기
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
