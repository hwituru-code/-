export type Sex = "female" | "male" | "other";

export const SEX_LABEL: Record<Sex, string> = {
  female: "여성",
  male: "남성",
  other: "기타",
};

export interface UserProfile {
  birthDate: string | null; // YYYY-MM-DD
  sex: Sex | null;
  heightCm: number | null;
  weightKg: number | null;
  /** 과거병력 및 현재 상태 / 복용 중인 약 / 가족력 / 생활습관 등 분석에 참고할 개인 특이사항 (자유 기술) */
  notes: string;
  updatedAt: string | null;
}

export interface ProfileInput {
  birthDate: string | null;
  sex: Sex | null;
  heightCm: number | null;
  weightKg: number | null;
  notes: string;
}

export const EMPTY_PROFILE: UserProfile = {
  birthDate: null,
  sex: null,
  heightCm: null,
  weightKg: null,
  notes: "",
  updatedAt: null,
};

export interface ProfileRepository {
  getProfile(): Promise<UserProfile>;
  saveProfile(input: ProfileInput): Promise<UserProfile>;
}
