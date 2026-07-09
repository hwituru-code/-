import { EMPTY_PROFILE, ProfileInput, ProfileRepository, UserProfile } from "./types";

const STORAGE_KEY = "pain-log-profile";

/** 브라우저 localStorage에 개인 프로필을 저장하는 기본 저장소. */
export class LocalProfileRepository implements ProfileRepository {
  async getProfile(): Promise<UserProfile> {
    if (typeof window === "undefined") return EMPTY_PROFILE;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as UserProfile) : EMPTY_PROFILE;
    } catch {
      return EMPTY_PROFILE;
    }
  }

  async saveProfile(input: ProfileInput): Promise<UserProfile> {
    const profile: UserProfile = { ...input, updatedAt: new Date().toISOString() };
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    }
    return profile;
  }
}
