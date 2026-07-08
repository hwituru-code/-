import { LifestyleCategory } from "./types";

export interface DictionaryEntry {
  /** 정규화된 태그 이름 (UI에 표시됨) */
  tag: string;
  /** 이 태그로 매칭할 부분 문자열들 (어간/활용형 포함) */
  triggers: string[];
}

export const BODY_PART_DICTIONARY: DictionaryEntry[] = [
  { tag: "목", triggers: ["목이", "목에", "목을", "목뒤", "거북목", "목덜미"] },
  { tag: "어깨", triggers: ["어깨"] },
  { tag: "허리", triggers: ["허리", "요추"] },
  { tag: "등", triggers: ["등이", "등에", "등을", "등쪽", "날개뼈", "견갑"] },
  { tag: "골반/엉덩이", triggers: ["골반", "엉덩이", "고관절"] },
  { tag: "무릎", triggers: ["무릎"] },
  { tag: "손목", triggers: ["손목"] },
  { tag: "팔꿈치", triggers: ["팔꿈치"] },
  { tag: "팔", triggers: ["팔이", "팔에", "팔을", "팔뚝"] },
  { tag: "종아리/발목", triggers: ["종아리", "발목"] },
  { tag: "발바닥", triggers: ["발바닥", "족저"] },
  { tag: "머리/두통", triggers: ["두통", "머리가", "머리 아", "편두통"] },
  { tag: "턱", triggers: ["턱이", "턱관절", "턱을"] },
  { tag: "손가락", triggers: ["손가락"] },
  { tag: "복부", triggers: ["배가", "복통", "속이", "장이"] },
];

export const SYMPTOM_DICTIONARY: DictionaryEntry[] = [
  { tag: "뻐근함", triggers: ["뻐근"] },
  { tag: "쑤심", triggers: ["쑤시", "욱신"] },
  { tag: "저림", triggers: ["저리", "저림", "찌릿"] },
  { tag: "뻣뻣함", triggers: ["뻣뻣", "뻑뻑"] },
  { tag: "화끈거림", triggers: ["화끈", "타는 듯", "열감"] },
  { tag: "붓기", triggers: ["붓", "부었", "부어"] },
  { tag: "무거움", triggers: ["무겁", "묵직"] },
  { tag: "두근거림/긴장", triggers: ["두근", "긴장됨"] },
];

export const LIFESTYLE_DICTIONARY: { category: LifestyleCategory; entries: DictionaryEntry[] }[] = [
  {
    category: "수면",
    entries: [
      { tag: "수면 부족", triggers: ["잠을 못", "못 잤", "밤새", "수면부족", "늦게 잠", "늦게 잤", "잠이 부족"] },
      { tag: "낮은 수면의 질", triggers: ["뒤척", "자주 깼", "선잠", "깊게 못 잤", "얕게 잤"] },
      { tag: "충분한 수면", triggers: ["잘 잤", "푹 잤", "일찍 잤"] },
    ],
  },
  {
    category: "자세",
    entries: [
      { tag: "장시간 앉아있음", triggers: ["오래 앉아", "장시간 앉", "하루종일 앉", "종일 앉"] },
      { tag: "구부정한 자세", triggers: ["구부정", "웅크리", "숙이고"] },
      { tag: "거북목 자세", triggers: ["거북목", "고개를 숙이", "폰을 보느라"] },
      { tag: "다리 꼬기/짝다리", triggers: ["다리를 꼬", "다리꼬", "짝다리"] },
      { tag: "장시간 서있음", triggers: ["오래 서", "장시간 서", "종일 서"] },
    ],
  },
  {
    category: "활동/운동",
    entries: [
      { tag: "운동 부족", triggers: ["운동을 안", "운동 안", "운동 못", "움직임이 없", "하루종일 누워"] },
      { tag: "과격한 운동", triggers: ["무리한 운동", "과격하게", "격하게 운동", "운동을 과하게"] },
      { tag: "가벼운 운동/스트레칭", triggers: ["스트레칭", "산책", "가볍게 걸", "요가", "필라테스"] },
      { tag: "무거운 물건 들기", triggers: ["무거운 걸 들", "무거운 물건", "짐을 들", "들어 올리"] },
    ],
  },
  {
    category: "스트레스/정서",
    entries: [
      { tag: "높은 스트레스", triggers: ["스트레스", "짜증", "예민", "불안", "긴장됐"] },
      { tag: "기분 저조", triggers: ["우울", "기운이 없", "무기력"] },
    ],
  },
  {
    category: "식단",
    entries: [
      { tag: "카페인 섭취", triggers: ["커피", "카페인", "에너지드링크"] },
      { tag: "음주", triggers: ["술을", "술 마", "음주", "숙취"] },
      { tag: "자극적인 음식", triggers: ["매운", "짜게", "자극적인 음식"] },
      { tag: "물 섭취 부족", triggers: ["물을 안", "물 안 마", "수분 부족"] },
      { tag: "야식/폭식", triggers: ["야식", "폭식", "과식"] },
      { tag: "식사 거름", triggers: ["끼니를 거", "밥을 걸렀", "굶었"] },
    ],
  },
  {
    category: "날씨/환경",
    entries: [
      { tag: "추운 날씨", triggers: ["춥", "한파", "쌀쌀"] },
      { tag: "습한 날씨", triggers: ["습했", "장마", "눅눅"] },
      { tag: "냉방/에어컨", triggers: ["에어컨", "냉방"] },
      { tag: "비/기압 변화", triggers: ["비가", "기압", "흐린 날"] },
    ],
  },
  {
    category: "업무/디지털기기",
    entries: [
      { tag: "장시간 화면 사용", triggers: ["컴퓨터를 오래", "모니터를 오래", "장시간 작업", "야근", "화면을 오래"] },
      { tag: "스마트폰 과다 사용", triggers: ["폰을 오래", "스마트폰을 오래", "핸드폰을 계속"] },
    ],
  },
];

/** "심함/약간" 등 강도 표현 -> 1~5 점수, 숫자(예: "7/10", "통증 8")는 classify.ts에서 별도 처리 */
export const SEVERITY_WORD_SCORES: { pattern: string; score: number }[] = [
  { pattern: "극심", score: 5 },
  { pattern: "너무 아프", score: 5 },
  { pattern: "심하게", score: 4 },
  { pattern: "심했", score: 4 },
  { pattern: "많이 아프", score: 4 },
  { pattern: "꽤 아프", score: 3 },
  { pattern: "보통", score: 3 },
  { pattern: "약간", score: 2 },
  { pattern: "살짝", score: 2 },
  { pattern: "가볍게", score: 1 },
];
