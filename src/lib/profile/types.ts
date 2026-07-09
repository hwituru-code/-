export interface UserProfile {
  heightCm: number | null;
  weightKg: number | null;
  /** 지병, 만성통증, 과거 병력 등 분석에 참고할 개인 특이사항 (자유 기술) */
  notes: string;
  updatedAt: string | null;
}

export interface ProfileInput {
  heightCm: number | null;
  weightKg: number | null;
  notes: string;
}

export const EMPTY_PROFILE: UserProfile = {
  heightCm: null,
  weightKg: null,
  notes: "",
  updatedAt: null,
};

export interface ProfileRepository {
  getProfile(): Promise<UserProfile>;
  saveProfile(input: ProfileInput): Promise<UserProfile>;
}
