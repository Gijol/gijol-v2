# 도메인 모델

## 졸업 판정

| 용어 | 의미 |
| --- | --- |
| 입학년도 | 학생에게 적용할 졸업요건 구간을 판단하는 학번 기준 연도 |
| 학교 이수구분 | 성적표가 제공하거나 parser가 보정한 표시값 |
| 이수영역 | 졸업요건에서 학점을 집계하는 영역 |
| 이수영역 후보 | 수강 이력이 규칙상 배정될 수 있는 영역 목록 |
| 대표 이수영역 배정 | 후보 중 기본 반영할 하나의 영역 |
| 규칙 카탈로그 | source와 적용조건을 가진 정적 졸업요건 데이터 |
| 판정기 | 선언형 규칙으로 표현하기 어려운 계산을 수행하는 등록 로직 |
| 학적 컨텍스트 | 입학년도, 전공·부전공, 선언 학기 등 적용조건 입력 |
| 판정 불가 | 필요한 컨텍스트가 없어 규칙 결과를 확정할 수 없는 상태 |
| 최종 판정 | `satisfied`, `unsatisfied`, `needs_review` 중 하나 |

### 불변조건

- 하나의 수강 이력은 기본적으로 하나의 대표 이수영역에 반영합니다.
- 동등과목 관계는 matching을 허용하지만 자동 중복인정을 뜻하지 않습니다.
- 규칙 적용 정보가 부족하면 임의로 충족/미충족 처리하지 않습니다.
- 규칙 source의 학사편람 연도와 학생에게 적용되는 입학년도는 서로 다른 축입니다.
- 브라우저가 아니라 서버의 규칙 및 과목 카탈로그가 추천 근거를 소유합니다.

## 과목과 개설

| 용어 | 의미 |
| --- | --- |
| 과목 identity | 학기별 코드나 분반과 독립적인 canonical course |
| 개설 분반 | 특정 term의 과목·분반·교수·시간 정보 |
| 동등과목 | 서로 다른 코드가 같은 요건을 matching할 수 있는 관계 |
| 교차개설 | 한 학기에 여러 코드로 함께 열린 같은 과목 관계 |
| 학수번호 변경 | 시간에 따라 기존 코드가 새 코드로 바뀐 관계 |
| requirement facet | 과목이 졸업·부전공·로드맵·추천에서 쓰이는 분류 근거 |

과목 catalog의 alias/relationship은 identity와 matching의 근거입니다. 졸업 판정의 영역 배정과 시간표 후보 병합은 각자의 규칙으로 별도 처리합니다.

## 시간표

| 용어 | 의미 |
| --- | --- |
| 이수 학기 기록 | 성적표 등으로 실제 이수가 확인된 과목 묶음 |
| 시간표 계획 | 특정 학기에 수강하려고 선택한 개설 분반과 시간 배치안 |
| 시간표 계획 대안 | 같은 학기의 비교 가능한 계획 하나 |
| 대표 시간표 계획 | 시간표 홈에서 우선 보여주는 계획 대안 |
| 과목 후보 | 로드맵·졸업요건·직접 추가 근거로 plan에 들어온 과목 |
| 분반 선택 | 후보에 대응하는 실제 개설 분반을 사용자가 고르는 행위 |
| 선호 빈 시간대 | 사용자가 비워두고 싶어 하는 부드러운 선호 |
| 시간 충돌 | 같은 계획 안의 둘 이상의 분반 시간이 겹치는 상태 |

### 불변조건

- 계획은 저장하거나 대표 지정해도 이수 기록이 되지 않습니다.
- 성적표 업로드 뒤에도 겹치는 계획을 자동 삭제·병합하지 않습니다.
- 로드맵과 졸업요건은 과목 후보를 만들 뿐 분반을 자동 선택하지 않습니다.
- 같은 과목의 여러 추천 근거는 하나의 후보에 병합합니다.
- 선호 빈 시간대 위반은 경고이며 시간 충돌처럼 선택을 막지 않습니다.

## 관련 결정

- [ADR-0001: static rule catalog](../adr/0001-static-rule-catalog.md)
- [ADR-0002: declarative rules with evaluators](../adr/0002-declarative-rules-with-evaluators.md)
- [ADR-0003: three-state outcome](../adr/0003-three-state-graduation-outcome.md)
- [ADR-0004: timetable plans and completed records](../adr/0004-separate-timetable-plans-from-completed-term-records.md)
- [ADR-0006: server-owned course catalog](../adr/0006-server-owned-course-catalog-query.md)
- [ADR-0008: durable graduation inputs](../adr/0008-separate-durable-graduation-inputs.md)
- [ADR-0009: shared section browsing](../adr/0009-share-section-browsing-not-plan-storage.md)
