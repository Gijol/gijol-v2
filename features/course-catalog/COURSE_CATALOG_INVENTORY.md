# 공통 강의 원천 Inventory 및 설계 초안

이 문서는 졸업요건, 추천, 시간표, 로드맵이 서로 다른 강의 원천을 참조하면서 생기는 불일치를 줄이기 위한 초기 inventory와 공통 `CourseCatalog` 설계 경계다.

## 현재 원천 Inventory

| 원천 | 현재 사용처 | 규모 | 주요 필드 | 현재 문제 |
| --- | --- | ---: | --- | --- |
| `DB/course_db.csv` + `lib/const/course-db.ts` | catalog legacy adapter, 로드맵 상세 보조 데이터 | 636 rows | `course_uid`, `primary_course_code`, `alias_course_codes`, `display_title_ko/en`, `credit_hours`, `offered_2025_1/2`, `source_page_first_seen` | 2025 개설 플래그 보존용 legacy metadata로 사용. `/api/courses`는 catalog snapshot을 기준으로 하되 기존 `CourseDB` shape를 유지함 |
| `lib/const/course-master.ts` | 졸업요건 추천, fine-grained recommendation map | TS 상수 기반 | `courseCode`, `courseNameKo`, `credits`, `level`, `department`, `isOffered` | 추천 전용으로 중복 관리됨. `course_db.csv`, 시간표, 로드맵과 코드/명칭 drift 가능 |
| `DB/minor/*.json` + `lib/const/minor-courses.ts` | 부전공 추천 후보 | 18 files / raw 617 entries / loader 648 facets | `courseCode`, `courseName`, `credits`, `category`, `classification` | 부전공 분류는 풍부하지만 canonical course id나 alias 관계가 없음. 현재 loader는 `SE -> eecs` 매핑을 별도 부전공 코드로 재사용함 |
| `DB/timetable/2026_spring_course_info.normalized.json` | `/dashboard/timetable` static props, 시간표 conflict/store | 459 sections / 306 unique courses | `course_code`, `section`, `title`, `category`, `program`, `hours`, `meetings`, `capacity`, `instructors` | offering/section 정보는 가장 풍부하지만 term-specific이고 졸업요건/로드맵 과목 identity와 분리됨 |
| `DB/roadmap/presets/*.json` | `/api/roadmap/[slug]`, 로드맵 화면 | 28 presets / 1101 nodes / 485 unique course codes / 324 nodes without `courseCode` | React Flow `nodes`, `edges`, node `label`, `credits`, `category`, `semester`, optional `courseCode` | 노드 payload가 과목 정보를 복제함. 일부 노드는 courseCode가 없고, `GS(EB)2739` 같은 composite code가 존재 |
| `features/graduation/domain/rule-catalog/*` | 졸업 판정 source-backed rule | rule/sourceRef 중심 | `courses`, `sourceRefs`, `appliesTo`, `scope`, equivalency relation | 졸업요건 판정 근거는 좋지만 일반 강의 master/section/offering 정보가 아님 |
| `lib/const/course.ts` | 제거됨 | TS fake data | `courseCode`, `courseDescription` | `/api/courses/search`가 catalog 기반으로 전환되며 stale mock 원천을 제거함 |

## 문제 정의

1. 같은 학수번호의 이름, 학점, 개설 여부가 기능마다 다르게 존재한다.
2. 졸업요건 추천은 `course-master.ts`, 시간표는 term-specific timetable JSON, 로드맵은 preset JSON을 각각 신뢰한다.
3. alias/cross-list/renumbered 관계가 graduation rule catalog와 `course_db.csv`에 분산되어 있다.
4. 로드맵은 course node 자체에 과목 정보를 복제하고 있어 원천 갱신 시 preset 전체가 stale해질 수 있다.
5. Admin UI를 만들기 전에도 publish/check/report 가능한 canonical artifact가 필요하다.

## Canonical CourseCatalog 경계

`CourseCatalog`는 강의의 정적 identity와 학기별 offering을 분리한다.

- `CourseCatalogCourse`: 강의 identity. `courseId`, `primaryCode`, alias, 한/영명, 학점, 학과, 태그, 설명, lifecycle, sourceRefs.
- `CourseCatalogOffering`: 특정 학기/분반. `courseId`, `term`, `section`, 시간/강의실/교원/정원/언어.
- `CourseCatalogRequirementFacet`: 졸업요건, 부전공, 추천, 로드맵에서 쓰는 기능별 분류. canonical course에 붙는 feature-specific tag.
- `CourseCatalogSourceRef`: CSV, 학사편람, timetable JSON, roadmap preset 등 원천 provenance.

초기 타입 초안은 `features/course-catalog/types.ts`에 둔다.

## 현재 Read-only Snapshot 기준선

`yarn course-catalog:check` 기준 현재 공통 원천 snapshot은 아래 수치를 검증한다.

| 항목 | 수 |
| --- | ---: |
| courses | 994 |
| aliases | 1128 |
| offerings | 459 |
| requirement facets | 1570 |
| relationships | 11 |
| synthetic courses | 380 |
| roadmap nodes without `courseCode` | 324 |

기능별 facet 수는 `minor: 648`, `recommendation: 148`, `roadmap: 774`이다. 로드맵 raw node 중 `courseCode`가 있는 노드는 777개지만, 동일 preset/node/course 조합 dedupe 이후 snapshot facet은 774개다.

## Source of Truth 제안

1. Course identity의 1차 원천은 `DB/course_db.csv`로 둔다.
2. 학기별 개설/분반/시간 정보는 `DB/timetable/*.json`을 `CourseCatalogOffering`으로 normalize한다.
3. 졸업요건/부전공/추천 분류는 course 자체가 아니라 `CourseCatalogRequirementFacet`으로 연결한다.
4. alias/equivalency는 `course_db.csv.alias_course_codes`와 `features/graduation/domain/rule-catalog/course-equivalencies.ts`를 합쳐 canonical alias layer로 만든다.
5. 로드맵 preset은 장기적으로 course payload를 복제하지 않고 `courseId` 또는 canonical `primaryCode`를 참조한다.

## Migration Plan

### Phase 0: Inventory 고정

- 이 문서와 `features/course-catalog/types.ts`를 기준으로 source inventory를 추적한다.
- 원천별 row count, unique code count, missing code count를 CI에서 점검할 수 있는 스크립트를 추가한다.
- Admin UI는 백로그로 두고, 현재는 JSON/TS source와 validator/report 기반으로 운영한다.

### Phase 1: Read-only Catalog Adapter

- `DB/course_db.csv`를 읽어 `CourseCatalogCourse[]`로 변환한다.
- `DB/timetable/2026_spring_course_info.normalized.json`를 `CourseCatalogOffering[]`으로 변환한다.
- `DB/minor/*.json`, `course-master.ts`, graduation catalog course sets를 `CourseCatalogRequirementFacet[]`으로 변환한다.
- 중복/누락 report를 만든다.

### Phase 2: 기능별 Consumer 전환

우선순위:

1. 졸업 추천: `course-master.ts` 직접 참조를 catalog adapter로 대체.
2. 시간표: `SectionOffering` 생성 전에 `CourseCatalogOffering`을 거치게 변경.
3. 로드맵: preset node의 `courseCode`를 canonical lookup으로 enrich하고, courseCode 없는 노드는 report로 분리.
4. `/api/courses/search`: catalog search로 대체 완료.

### Phase 3: 운영 Boundary

- `yarn course-catalog:check`
- `yarn course-catalog:inspect`
- `yarn course-catalog:report`
- `yarn course-catalog:export`

위 명령은 graduation catalog 운영 방식과 동일하게 read-only 검증/게시 artifact를 만든다.

### Phase 4: Admin UI Backlog

Admin UI는 단기 구현 대상이 아니라 backlog로 둔다. 단, 아래 capability를 backlog 항목으로 명시한다.

- canonical course 생성/수정/비활성화
- alias/equivalency 관계 관리
- 학기별 offering import/review/publish
- 기능별 requirement facet 관리
- roadmap preset의 stale course reference 점검
- publish 전 diff/report 검토

## Open Questions

1. `course_uid`를 영구 ID로 사용할지, 자체 `courseId`를 새로 생성할지 결정해야 한다.
2. `GS(EB)2739` 같은 composite roadmap code를 alias로 볼지, display-only code로 볼지 정해야 한다.
3. 학기별 개설 여부는 `course_db.csv.offered_2025_*`와 timetable JSON 중 어느 쪽을 우선할지 정해야 한다.
4. 대학원 과목을 같은 catalog에 넣되 `program`으로 분리할지, 별도 layer로 둘지 정해야 한다.
5. graduation rule catalog의 `sourceRefs`와 course catalog의 `sourceRefs`를 같은 shape로 통합할지 결정해야 한다.

## 다음 구현 단위

1. `features/course-catalog/adapters/course-db.ts`: CSV row를 `CourseCatalogCourse`로 변환.
2. `features/course-catalog/adapters/timetable.ts`: timetable JSON을 `CourseCatalogOffering`으로 변환.
3. `features/course-catalog/inspect.ts`: 원천별 unique code, missing code, alias collision report.
4. `tests/course_catalog_inventory.spec.ts`: 현재 inventory count와 핵심 collision을 snapshot성으로 고정.
