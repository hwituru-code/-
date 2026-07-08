"use client";

import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
        현재 로컬 모드로 실행 중이라 로그인이 필요 없어요. 기록은 이 브라우저에만 저장돼요.
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    setStatus("sending");
    setErrorMsg(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
    } else {
      setStatus("sent");
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-10">
      <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
        로그인
      </h1>
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        이메일로 매직 링크를 보내드려요. 메일의 링크를 클릭하면 자동으로 로그인돼요.
      </p>
      {status === "sent" ? (
        <p className="text-sm" style={{ color: "var(--status-good)" }}>
          {email}로 로그인 링크를 보냈어요. 메일함을 확인해주세요.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="rounded-xl border bg-transparent px-3 py-2 text-sm outline-none"
            style={{ borderColor: "var(--border-hairline)", color: "var(--text-primary)" }}
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: "var(--series-blue)" }}
          >
            {status === "sending" ? "전송 중..." : "매직 링크 보내기"}
          </button>
          {status === "error" && (
            <p className="text-xs" style={{ color: "var(--status-critical)" }}>
              {errorMsg}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
