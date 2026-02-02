# 졸업요건 검증 시스템 (Graduation Requirements Verification)

GIST 학사 졸업요건을 검증하고 부족한 영역에 대한 과목을 추천하는 시스템입니다.

## 📁 파일 구조

```
lib/utils/graduation/
├── calculate-grad-status.ts    # 메인 검증 엔진 (calculateGradStatusV2)
├── grad-classifier.ts          # 과목 분류 로직 (classifyCourse)
├── grad-formatter.tsx          # UI 포맷팅 헬퍼
├── grad-requirements.ts        # 세부 요건 검증 (buildFineGrainedRequirements)
├── grad-rules.ts               # 학번별 규칙셋 (YearRuleSet)
├── grad-status-helper.ts       # 상태 헬퍼 함수
├── parse-to-editable-rows.ts   # 성적표 파싱
└── upload-grade-report-via-api.ts

lib/const/
├── course-master.ts            # 과목 마스터 데이터 (CSV 기반)
└── course-code-classification.ts # HUS/PPE/GSC 과목 코드셋

lib/hooks/
└── useRecommendedCourses.ts    # 추천 과목 훅 (이수 과목 제외)
```

## 🔄 검증 흐름

```
1. 성적표 업로드 (ParsedGradeReport)
       ↓
2. 학번 기반 규칙셋 선택 (pickRuleSet)
   - 2021+: ruleSet2021Plus
   - 2018-2020: ruleSet2018to2020
       ↓
3. 과목 분류 (classifyCourse)
   - languageBasic (언어기초)
   - scienceBasic (기초과학)
   - major (전공)
   - minor (부전공)
   - humanities (인문사회)
   - etcMandatory (기타필수)
   - otherUncheckedClass (자유학점)
       ↓
4. 영역별 학점 집계 및 충족 여부 판정
       ↓
5. 세부 요건 검증 (buildFineGrainedRequirements)
   - 필수 과목 이수 여부
   - HUS/PPE 최소 6학점
   - 실험 과목 이수 여부 등
       ↓
6. 미충족 영역에 대한 과목 추천
   - 이수한 과목 제외
   - 개설된 강좌만 추천
```

## 📊 학번별 졸업요건

### 2021학번 이후

| 영역        | 최소 학점 | 비고                           |
| ----------- | --------- | ------------------------------ |
| 총 이수학점 | 130       |                                |
| 언어기초    | 7         | 영어 4 + 글쓰기 3              |
| 인문사회    | 24        | HUS 6 + PPE 6 포함             |
| 기초과학    | 17-18     | 컴프로그 이수시 17             |
| 전공        | 36        | 최대 42까지 인정               |
| 기타필수    | 8         | 논문 6 + 새내기 1 + 전공탐색 1 |

### 2018-2020학번

- 대부분 동일
- 차이점: 신입생 세미나 vs GIST 새내기/전공탐색

## 🎯 주요 함수

### `calculateGradStatusV2(body: GradStatusRequestBody)`

메인 졸업요건 검증 함수. 입력 데이터로 각 영역별 충족 여부를 계산합니다.

### `classifyCourse(course, userMajor, userMinors)`

과목 코드와 이름을 분석하여 적절한 카테고리에 분류합니다.

### `buildFineGrainedRequirements(ctx)`

세부 요건 단위로 충족 여부를 검사합니다 (예: "영어 I 필수", "미적분학 필수").

### `useRecommendedCourses()`

미충족 영역에 대해 추천 과목을 반환합니다. 이미 이수한 과목은 자동 제외됩니다.

## 📝 관련 타입

```typescript
// lib/types/grad.ts
interface TakenCourseType {
  year: number;
  semester: string;
  courseType: string;
  courseName: string;
  courseCode: string;
  credit: number;
}

interface GradStatusResponseType {
  graduationCategory: GradCategoriesType;
  totalCredits: number;
  totalSatisfied: boolean;
}

// lib/types/grad-requirements.ts
interface FineGrainedRequirement {
  id: string;
  categoryKey: CategoryKey;
  label: string;
  requiredCredits: number;
  acquiredCredits: number;
  satisfied: boolean;
  // ...
}
```

## ⚠️ 주의사항

1. **과목 코드 변경**: GIST 과목 코드는 학년도마다 변경될 수 있습니다. 새 학기 시작 전 `course-master.ts` 업데이트 필요.

2. **규칙 변경**: 졸업요건이 변경되면 `grad-rules.ts`와 `grad-requirements.ts` 업데이트 필요.

3. **추천 과목**: `useRecommendedCourses` 훅은 `course-master.ts`의 `isOffered=true` 과목만 추천합니다.
