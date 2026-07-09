"use client";

import { FormEvent, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { ProfileInput, UserProfile } from "@/lib/profile/types";
import { useEntriesContext } from "@/lib/repository/EntriesProvider";

const fieldStyle: React.CSSProperties = {
  borderColor: "var(--border-hairline)",
  color: "var(--text-primary)",
};

function ProfileForm({
  profile,
  onSave,
}: {
  profile: UserProfile;
  onSave: (input: ProfileInput) => Promise<UserProfile>;
}) {
  const [heightCm, setHeightCm] = useState(profile.heightCm !== null ? String(profile.heightCm) : "");
  const [weightKg, setWeightKg] = useState(profile.weightKg !== null ? String(profile.weightKg) : "");
  const [notes, setNotes] = useState(profile.notes);
  const [updatedAt, setUpdatedAt] = useState(profile.updatedAt);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedJustNow, setSavedJustNow] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedJustNow(false);
    try {
      const saved = await onSave({
        heightCm: heightCm.trim() ? Number(heightCm) : null,
        weightKg: weightKg.trim() ? Number(weightKg) : null,
        notes: notes.trim(),
      });
      setUpdatedAt(saved.updatedAt);
      setSavedJustNow(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border p-4"
      style={{ borderColor: "var(--border-hairline)", background: "var(--surface-1)" }}
    >
      <div className="flex flex-wrap gap-4">
        <label className="flex flex-1 flex-col gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
          키 (cm)
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            className="rounded-lg border bg-transparent px-3 py-2 text-sm"
            style={fieldStyle}
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
          몸무게 (kg)
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className="rounded-lg border bg-transparent px-3 py-2 text-sm"
            style={fieldStyle}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
        지병 / 만성통증 / 과거 병력 등 특이사항
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={8}
          placeholder="예: 허리디스크 진단(2022), 편두통약 복용 중, 왼쪽 무릎 수술 이력(2019) 등"
          className="resize-none rounded-xl border bg-transparent p-3 text-sm"
          style={fieldStyle}
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {updatedAt ? `마지막 저장: ${new Date(updatedAt).toLocaleString("ko-KR")}` : "아직 저장된 정보가 없어요."}
        </span>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          style={{ background: "var(--series-blue)" }}
        >
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>

      {savedJustNow && (
        <p className="text-xs" style={{ color: "var(--status-good)" }}>
          저장했어요.
        </p>
      )}
      {error && (
        <p className="text-xs" style={{ color: "var(--status-critical)" }}>
          {error}
        </p>
      )}
    </form>
  );
}

export default function ProfilePage() {
  const { profile, profileLoading, saveProfile } = useEntriesContext();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          내 정보
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          지병, 만성통증, 과거 병력, 키/몸무게처럼 분석에 참고가 될 개인 정보를 적어두세요. 언제든 다시 와서 수정할 수 있어요.
        </p>
      </div>

      <RequireAuth>
        {profileLoading ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            불러오는 중...
          </p>
        ) : (
          <ProfileForm key="ready" profile={profile} onSave={saveProfile} />
        )}
      </RequireAuth>
    </div>
  );
}
