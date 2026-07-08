# 심프텀 노트 (Symptom Note)

만성 통증 개선을 위해 일상을 자유롭게 기록하면, 규칙 기반 분석 엔진이 신체 부위 · 증상 ·
생활습관(수면/자세/운동/스트레스/식단/날씨/디지털기기 사용)을 자동으로 태깅하고, 기록이
쌓일수록 어떤 생활습관이 특정 부위의 통증과 자주 함께 나타나는지 통계적으로 찾아내
개선 방안을 추천합니다.

## 어떻게 동작하나요

1. **자유 기록** — 홈 화면에서 그날그날 생각나는 대로 적습니다. 두서없이 적어도 됩니다.
   `"통증 7/10"`, `"8점"`처럼 숫자로 강도를 적거나, `"심하게"/"약간"` 같은 표현만 써도
   강도가 추정됩니다.
2. **자동 분류** — 저장 시점에 `src/lib/analysis/classify.ts`가 키워드 사전
   (`src/lib/analysis/dictionary.ts`)을 기준으로 신체 부위, 증상, 생활습관 태그, 통증
   강도를 추출해 기록과 함께 저장합니다.
3. **패턴 분석** — `src/lib/analysis/insights.ts`는 기록이 5개 이상 쌓이면, 신체 부위별로
   함께 나타나는 생활습관 태그의 연관도(lift, 우연히 나타날 확률 대비 배수)를 계산해
   유력한 원인 후보를 랭킹합니다.
4. **추천** — `src/lib/analysis/recommendations.ts`가 (부위, 원인) 조합 또는 원인 단독
   기준으로 구체적인 개선 조언을 매칭합니다.

키워드 매칭 기반이라 완벽하지 않지만, 별도 서버나 외부 API 없이 즉시 동작하며 이후 AI
연동(예: Claude API로 `classifyEntry`/`computeInsights` 결과를 자연어로 더 깊이 해석하기)을
붙이기 쉽도록 각 단계가 독립된 모듈로 분리되어 있습니다.

## 데이터 저장 방식

기록 저장은 `EntryRepository` 인터페이스(`src/lib/repository/types.ts`) 뒤에 감춰져 있고,
런타임에 환경변수 유무로 구현체가 자동 선택됩니다 (`src/lib/repository/useEntries.ts`).

- **환경변수 미설정 (기본값, 로컬 모드)** — `LocalEntryRepository`가 브라우저
  `localStorage`에 저장합니다. 로그인 불필요, 별도 설정 없이 바로 사용 가능하지만 기기 간
  동기화는 되지 않습니다.
- **`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정 시 (클라우드 모드)** —
  `SupabaseEntryRepository`가 Supabase(Postgres)에 저장합니다. 이메일 매직 링크로 로그인하며,
  여러 기기에서 같은 계정으로 로그인하면 기록이 동기화됩니다.

### Supabase로 전환하는 방법

1. [supabase.com](https://supabase.com)에서 프로젝트를 생성합니다.
2. `supabase/migrations/0001_init.sql`을 프로젝트의 SQL Editor에서 실행합니다.
   (`entries` 테이블 + 사용자별 데이터만 보이도록 하는 RLS 정책이 포함되어 있습니다.)
3. Supabase 프로젝트의 `Project Settings > API`에서 URL과 `anon` 키를 확인해 `.env.local`에
   채웁니다 (`.env.example` 참고).
4. Authentication 설정에서 Email(매직 링크) 로그인이 활성화되어 있는지 확인합니다.
5. 개발 서버를 재시작하면 자동으로 로그인 화면과 클라우드 저장이 활성화됩니다.

## 개발

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build
```

## 프로젝트 구조

```
src/lib/analysis/        기록 분류 · 패턴 분석 · 추천 (프레임워크 독립적인 순수 로직)
src/lib/repository/      저장소 인터페이스 + 로컬/Supabase 구현 + React 훅
src/lib/supabase/        Supabase 브라우저 클라이언트
src/components/          UI 컴포넌트
src/app/                 페이지 (홈 / 기록 / 인사이트 / 로그인)
supabase/migrations/     Supabase 스키마
```
