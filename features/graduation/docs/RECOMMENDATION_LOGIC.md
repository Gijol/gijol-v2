# 추천 과목 로직 (Recommendation Logic)

이 문서는 졸업요건 미충족 시 추천 과목을 제공하는 로직을 설명합니다.
세부 요건(`fineGrainedRequirements`)을 분석하여 **미충족된 세부 요건에 해당하는 과목만** 추천합니다.

## 1. 개요

### 기존 방식 (Before)
- 영역 전체에 대해 추천 (예: 인문사회 → HUS + PPE 모든 과목)
- 문제: HUS만 부족해도 PPE 과목까지 추천됨

### 개선된 방식 (After)
- 세부 요건별로 미충족 여부 확인
- 미충족 세부 요건에 해당하는 과목만 추천
- 예: HUS 6학점 부족 → HUS 과목만 추천

---

## 2. 동작 원리

### 2.1 데이터 흐름

```
gradStatus.fineGrainedRequirements
        ↓
[미충족 세부 요건 필터링]
        ↓
[세부 요건 ID → 과목 매핑]
        ↓
[이수 과목 제외]
        ↓
추천 과목 목록
```

### 2.2 핵심 함수: `getRecommendationsForDomain(domain)`

```typescript
// 1. 도메인명 → 카테고리키 변환
const categoryKey = DOMAIN_TO_CATEGORY_KEY[domain]; // '인문사회' → 'humanities'

// 2. 해당 카테고리의 미충족 세부 요건 찾기
const unsatisfiedReqs = fineGrainedReqs.filter(
  (req) => req.categoryKey === categoryKey && !req.satisfied
);

// 3. 미충족 세부 요건별 과목 수집
for (const req of unsatisfiedReqs) {
  const courses = FINE_GRAINED_COURSE_MAP[req.id];
  recommendations.push(...courses);
}

// 4. 이수 과목 제외 후 반환
return filterTakenCourses(recommendations);
```

### 2.3 Fallback 동작

`fineGrainedRequirements`가 없는 경우 (예: 구버전 데이터):
- 기존 영역 전체 추천 방식으로 동작
- `DOMAIN_RECOMMENDATIONS[domain]` 사용

---

## 3. 세부 요건 ID와 과목 매핑

### 3.1 언어기초 (languageBasic)

| 세부 요건 ID | 설명 | 과목 |
|-------------|------|------|
| `language-english-i` | English I (2학점) | GS1607, GS1605, GS1606 등 |
| `language-english-ii` | English II (2학점) | GS2652, GS2653, GS2655 등 |
| `language-writing` | 글쓰기 (3학점) | GS1512, GS1513, GS1532 등 |

### 3.2 기초과학 (scienceBasic)

| 세부 요건 ID | 설명 | 과목 |
|-------------|------|------|
| `science-calculus` | 미적분학 | GS1001 |
| `science-core-math` | 수학 선택 필수 | GS2001, GS2004, MM2001 등 |
| `science-sw-basic` | SW 기초와 코딩 | GS1490, GS1401, GS1499 등 |
| `science-total` | 기초과학 총 학점 | 수학+물리+화학+생물+SW 전체 |

### 3.3 인문사회 (humanities)

| 세부 요건 ID | 설명 | 과목 |
|-------------|------|------|
| `humanities-hus` | HUS 6학점 | HS2502, HS2503, HS2506 등 (인문) |
| `humanities-ppe` | PPE 6학점 | HS2620, HS2702, HS2724 등 (사회) |
| `humanities-total` | 인문사회 총 24학점 | HUS + PPE 전체 |

### 3.4 기타필수 (etcMandatory)

| 세부 요건 ID | 설명 | 과목 |
|-------------|------|------|
| `etc-freshman` | GIST 새내기 | GS1901 |
| `etc-major-exploration` | 전공탐색 (2021+) | UC0902 |
| `etc-colloquium` | 콜로퀴움 2회 | UC9331 |
| `etc-science-economy` | 과학기술과 경제 | UC0901 |
| `thesis-i` | 학사논문연구 I | (전공별 상이) |
| `thesis-ii` | 학사논문연구 II | (전공별 상이) |

### 3.5 전공/부전공

| 세부 요건 ID | 설명 | 과목 |
|-------------|------|------|
| `major-credits` | 전공 36학점 | EC, MA, MC, BS, EV, AI 등 |
| `minor-credits-{code}` | 부전공 15학점 | (부전공별 상이) |

---

## 4. 주요 파일

| 파일 | 역할 |
|------|------|
| `lib/hooks/useRecommendedCourses.ts` | 추천 과목 훅 (핵심 로직) |
| `lib/const/course-master.ts` | 과목 마스터 데이터 및 세부 그룹 |
| `features/graduation/domain/requirements.ts` | 세부 요건 생성 로직 |

---

## 5. 필터링 규칙

1. **미충족 세부 요건만**: `satisfied === false`인 요건만 대상
2. **이수 과목 제외**: 이미 들은 과목은 추천하지 않음
3. **개설 과목만**: `isOffered === true`인 과목만 추천
4. **중복 제거**: 같은 과목이 여러 요건에서 나오면 1번만 표시

---

## 6. 예시 시나리오

### 시나리오 1: HUS만 부족

**상황**: 인문사회 영역에서 HUS 3학점/6학점, PPE 6학점/6학점

**세부 요건 상태**:
- `humanities-hus`: satisfied = false, missingCredits = 3
- `humanities-ppe`: satisfied = true
- `humanities-total`: satisfied = false (21/24)

**추천 결과**: HUS 과목만 추천 (HS2502, HS2503, HS2506 등)

### 시나리오 2: 둘 다 부족

**상황**: HUS 3학점, PPE 3학점

**세부 요건 상태**:
- `humanities-hus`: satisfied = false
- `humanities-ppe`: satisfied = false

**추천 결과**: HUS + PPE 모든 과목 추천

### 시나리오 3: 영역 충족

**상황**: 인문사회 영역 전체 충족 (24학점 이상, HUS/PPE 각 6학점 이상)

**추천 결과**: 빈 배열 (추천할 과목 없음)
