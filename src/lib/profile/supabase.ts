import { SupabaseClient } from "@supabase/supabase-js";
import { EMPTY_PROFILE, ProfileInput, ProfileRepository, UserProfile } from "./types";

interface ProfileRow {
  height_cm: number | null;
  weight_kg: number | null;
  notes: string;
  updated_at: string;
}

function rowToProfile(row: ProfileRow | null): UserProfile {
  if (!row) return EMPTY_PROFILE;
  return { heightCm: row.height_cm, weightKg: row.weight_kg, notes: row.notes, updatedAt: row.updated_at };
}

/** Supabase(Postgres)에 저장, 여러 기기 동기화를 지원. supabase/migrations/0002_profile.sql 스키마 필요. */
export class SupabaseProfileRepository implements ProfileRepository {
  constructor(private client: SupabaseClient, private userId: string) {}

  async getProfile(): Promise<UserProfile> {
    const { data, error } = await this.client
      .from("profiles")
      .select("height_cm, weight_kg, notes, updated_at")
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
          height_cm: input.heightCm,
          weight_kg: input.weightKg,
          notes: input.notes,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select("height_cm, weight_kg, notes, updated_at")
      .single();
    if (error) throw error;
    return rowToProfile(data as ProfileRow);
  }
}
