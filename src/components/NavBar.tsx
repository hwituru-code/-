"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEntriesContext } from "@/lib/repository/EntriesProvider";

const LINKS = [
  { href: "/", label: "홈" },
  { href: "/history", label: "기록" },
  { href: "/insights", label: "인사이트" },
];

export function NavBar() {
  const pathname = usePathname();
  const { authState } = useEntriesContext();

  return (
    <header
      className="sticky top-0 z-10 border-b backdrop-blur"
      style={{ borderColor: "var(--border-hairline)", background: "color-mix(in srgb, var(--surface-1) 90%, transparent)" }}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          통증일지
        </Link>
        <nav className="flex items-center gap-1">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-1.5 text-sm font-medium transition-colors"
                style={{
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                  background: active ? "var(--surface-1)" : "transparent",
                  border: active ? "1px solid var(--border-hairline)" : "1px solid transparent",
                }}
              >
                {link.label}
              </Link>
            );
          })}
          {authState.mode === "signed-in" && (
            <span className="ml-2 hidden text-xs sm:inline" style={{ color: "var(--text-muted)" }}>
              {authState.email}
            </span>
          )}
          {authState.mode === "signed-out" && (
            <Link
              href="/login"
              className="ml-1 rounded-full px-3 py-1.5 text-sm font-medium"
              style={{ color: "var(--text-primary)", border: "1px solid var(--border-hairline)" }}
            >
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
