# 공통 강의 원천 Inventory 및 설계 초안

이 문서는 졸업요건, 추천, 시간표, 로드맵이 서로 다른 강의 원천을 참조하면서 생기는 불일치를 줄이기 위한 초기 inventory와 공통 `CourseCatalog` 설계 경계다.

## 현재 원천 Inventory

| 원천 | 현재 사용처 | 규모 | 주요 필드 | 현재 문제 |
| --- | --- | ---: | --- | --- |
| `DB/course_db.csv` + `lib/const/course-db.ts` | catalog legacy adapter, 로드맵 상세 보조 데이터, 기존 개설 이력 | 636 rows | `course_uid`, `primary_course_code`, `alias_course_codes`, `display_title_ko/en`, `credit_hours`, `offered_YYYY_S`, `source_page_first_seen` | `offered_YYYY_S` 컬럼은 `historicalOfferings`로 자동 수집한다. 학사편람 수록 이력은 PDF 추출 snapshot을 별도 원천으로 사용한다 |
| `docs/bachelor_manual/2020_manual.pdf`...`2026_manual.pdf` + `features/course-catalog/generated/manual-listings.extracted.json` | 학사편람 수록 이력 | extracted 3823 raw entries / catalog 3333 listings | `academicYear`, `sourcePath`, `extractionMethod`, `courseCode`, `page`, `credits` | 2021/2022 PDF는 텍스트 레이어가 부족해 OCR fallback으로 추출한다. 2020/2023 일부 PDF는 한 PDF 페이지에 인쇄본 두 쪽이 들어 있어 `page`는 PDF 물리 페이지 기준으로 기록한다 |
| `lib/const/course-master.ts` | catalog recommendation facet ingestion | TS 상수 기반 | `courseCode`, `courseNameKo`, `credits`, `level`, `department`, `isOffered` | 런타임 졸업 추천은 generated `CourseCatalog`의 requirement-level recommendation facet를 조회한다. 이 파일은 snapshot 빌드 입력 원천으로 남아 있다 |
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
- `CourseCatalogHistoricalOffering`: 구조화된 원천에서 확인된 과거 개설 이력. 현재는 `course_db.csv.offered_YYYY_S` 컬럼에서 생성한다.
- `CourseCatalogManualListing`: 학사편람 연도별 수록 이력. 현재는 PDF에서 추출한 `manual-listings.extracted.json`의 연도/source/page를 연결한다.
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
| historical offerings | 374 |
| manual listings | 3333 |
| requirement facets | 1633 |
| relationships | 11 |
| synthetic courses | 380 |
| roadmap nodes without `courseCode` | 324 |

기능별 facet 수는 `minor: 648`, `recommendation: 211`, `roadmap: 774`이다. Recommendation facet은 `requirementId`/`programCode`/`sortOrder`를 포함해 졸업 추천 런타임이 `course-master.ts`를 직접 읽지 않고도 세부 요건별 후보를 복원할 수 있다. 로드맵 raw node 중 `courseCode`가 있는 노드는 777개지만, 동일 preset/node/course 조합 dedupe 이후 snapshot facet은 774개다.

현재 `historicalOfferings`는 `2025: 374`, `manualListings`는 `2020: 387`, `2021: 297`, `2022: 267`, `2023: 521`, `2024: 544`, `2025: 655`, `2026: 662`를 기준선으로 검증한다. 2027년 이후 학사편람이나 개설 플래그가 추가되면 `offered_2027_1`, `offered_2027_2` 같은 컬럼은 parser가 자동으로 이력화하고, 학사편람 수록 source는 `scripts/course-catalog/extract-manual-listings.ts`의 `MANUAL_SOURCES`에 연도/sourcePath를 추가한 뒤 `yarn course-catalog:extract-manual-listings`로 추출 snapshot을 갱신한다.

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

1. 졸업 추천: `course-master.ts` 직접 참조를 catalog adapter로 대체 완료.
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
