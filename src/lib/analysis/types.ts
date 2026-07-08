export type LifestyleCategory =
  | "수면"
  | "자세"
  | "활동/운동"
  | "스트레스/정서"
  | "식단"
  | "날씨/환경"
  | "업무/디지털기기";

export interface LifestyleTag {
  category: LifestyleCategory;
  tag: string;
}

export interface EntryAnalysis {
  bodyParts: string[];
  symptoms: string[];
  lifestyleTags: LifestyleTag[];
  severity: number | null;
}

export interface PainEntry {
  id: string;
  content: string;
  loggedAt: string; // YYYY-MM-DD, the day this entry describes
  createdAt: string; // ISO timestamp, when it was written
  analysis: EntryAnalysis;
}

export interface NewEntryInput {
  content: string;
  loggedAt: string;
}
