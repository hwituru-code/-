import {
  BODY_PART_DICTIONARY,
  LIFESTYLE_DICTIONARY,
  SEVERITY_WORD_SCORES,
  SYMPTOM_DICTIONARY,
  DictionaryEntry,
} from "./dictionary";
import { EntryAnalysis, LifestyleTag } from "./types";

function matchTags(text: string, dictionary: DictionaryEntry[]): string[] {
  const matched: string[] = [];
  for (const entry of dictionary) {
    if (entry.triggers.some((trigger) => text.includes(trigger))) {
      matched.push(entry.tag);
    }
  }
  return matched;
}

/** "7/10", "통증 7", "8점" 같은 명시적 숫자 표현을 0~10 스케일로 추출 */
function extractExplicitSeverity(text: string): number | null {
  const overTen = text.match(/(\d{1,2})\s*\/\s*10/);
  if (overTen) {
    return Math.max(0, Math.min(10, Number(overTen[1])));
  }
  const withLabel = text.match(/(?:통증|아픔|강도)\s*(?:강도)?\s*(\d{1,2})\s*(?:점)?/);
  if (withLabel) {
    return Math.max(0, Math.min(10, Number(withLabel[1])));
  }
  const scoreOnly = text.match(/(\d{1,2})\s*점/);
  if (scoreOnly) {
    return Math.max(0, Math.min(10, Number(scoreOnly[1])));
  }
  return null;
}

/** 강도를 나타내는 표현("심하게", "약간" 등)에서 가장 강한 표현의 점수를 1~5 -> 0~10 스케일로 변환 */
function extractWordSeverity(text: string): number | null {
  let best: number | null = null;
  for (const { pattern, score } of SEVERITY_WORD_SCORES) {
    if (text.includes(pattern)) {
      if (best === null || score > best) {
        best = score;
      }
    }
  }
  return best === null ? null : best * 2;
}

export function classifyEntry(content: string): EntryAnalysis {
  const text = content.trim();

  const bodyParts = matchTags(text, BODY_PART_DICTIONARY);
  const symptoms = matchTags(text, SYMPTOM_DICTIONARY);

  const lifestyleTags: LifestyleTag[] = [];
  for (const group of LIFESTYLE_DICTIONARY) {
    for (const tag of matchTags(text, group.entries)) {
      lifestyleTags.push({ category: group.category, tag });
    }
  }

  const severity = extractExplicitSeverity(text) ?? extractWordSeverity(text);

  return { bodyParts, symptoms, lifestyleTags, severity };
}
