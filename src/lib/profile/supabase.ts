import { SupabaseClient } from "@supabase/supabase-js";
import { EMPTY_PROFILE, ProfileInput, ProfileRepository, Sex, UserProfile } from "./types";

const PROFILE_COLUMNS = "birth_date, sex, height_cm, weight_kg, notes, updated_at";

interface ProfileRow {
  birth_date: string | null;
  sex: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  notes: string;
  updated_at: string;
}

function rowToProfile(row: ProfileRow | null): UserProfile {
  if (!row) return EMPTY_PROFILE;
  return {
    birthDate: row.birth_date,
    sex: (row.sex as Sex | null) ?? null,
    heightCm: row.height_cm,
    weightKg: row.weight_kg,
    notes: row.notes,
    updatedAt: row.updated_at,
  };
}

/** Supabase(Postgres)에 저장, 여러 기기 동기화를 지원. supabase/migrations/0002_profile.sql, 0003_profile_birth_sex.sql 스키마 필요. */
export class SupabaseProfileRepository implements ProfileRepository {
  constructor(private client: SupabaseClient, private userId: string) {}

  async getProfile(): Promise<UserProfile> {
    const { data, error } = await this.client
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("user_id", this.userId)
      .maybeSingle();
    if (error) throw error;
    return rowToProfile(data as ProfileRow | null);
  }

  async saveProfile(input: ProfileInput): Promise<UserProfile> {
    const { data, error } = await this.client
      .from("profiles")
      .upsert(
        {
          user_id: this.userId,
          birth_date: input.birthDate,
          sex: input.sex,
          height_cm: input.heightCm,
          weight_kg: input.weightKg,
          notes: input.notes,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select(PROFILE_COLUMNS)
      .single();
    if (error) throw error;
    return rowToProfile(data as ProfileRow);
  }
}
