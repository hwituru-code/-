import { LifestyleCategory } from "./types";

/** 고정된 카테고리 색상 순서 (identity 인코딩용, 절대 순환/재배정하지 않음) */
export const CATEGORY_COLOR_VAR: Record<LifestyleCategory, string> = {
  "수면": "var(--series-blue)",
  "자세": "var(--series-aqua)",
  "활동/운동": "var(--series-yellow)",
  "스트레스/정서": "var(--series-green)",
  "식단": "var(--series-violet)",
  "날씨/환경": "var(--series-red)",
  "업무/디지털기기": "var(--series-magenta)",
};
