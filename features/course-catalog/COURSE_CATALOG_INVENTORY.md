# 공통 강의 원천 Inventory 및 설계 초안

이 문서는 졸업요건, 추천, 시간표, 로드맵이 서로 다른 강의 원천을 참조하면서 생기는 불일치를 줄이기 위한 초기 inventory와 공통 `CourseCatalog` 설계 경계다.

## 현재 원천 Inventory

| 원천 | 현재 사용처 | 규모 | 주요 필드 | 현재 문제 |
| --- | --- | ---: | --- | --- |
| `DB/course_db.csv` + `lib/const/course-db.ts` | catalog legacy adapter, 로드맵 상세 보조 데이터, legacy 개설 플래그 | 636 rows | `course_uid`, `primary_course_code`, `alias_course_codes`, `display_title_ko/en`, `credit_hours`, `offered_YYYY_S`, `source_page_first_seen` | `offered_YYYY_S` 컬럼은 legacy backfill로 `historicalOfferings`에 합쳐진다. 실제 개설 이력의 1차 원천은 수강신청 시스템 엑셀 import다 |
| `docs/bachelor_manual/2020_manual.pdf`...`2026_manual.pdf` + `features/course-catalog/generated/manual-listings.extracted.json` | 학사편람 수록 이력 | extracted 3823 raw entries / catalog 3583 listings | `academicYear`, `sourcePath`, `extractionMethod`, `courseCode`, `page`, `credits` | 2021/2022 PDF는 텍스트 레이어가 부족해 OCR fallback으로 추출한다. 2020/2023 일부 PDF는 한 PDF 페이지에 인쇄본 두 쪽이 들어 있어 `page`는 PDF 물리 페이지 기준으로 기록한다 |
| `lib/const/course-master.ts` | catalog recommendation facet ingestion | TS 상수 기반 | `courseCode`, `courseNameKo`, `credits`, `level`, `department`, `isOffered` | 런타임 졸업 추천은 generated `CourseCatalog`의 requirement-level recommendation facet를 조회한다. 이 파일은 snapshot 빌드 입력 원천으로 남아 있다 |
| `DB/minor/*.json` + `lib/const/minor-courses.ts` | 부전공 추천 후보 | 18 files / raw 617 entries / loader 648 facets | `courseCode`, `courseName`, `credits`, `category`, `classification` | 부전공 분류는 풍부하지만 canonical course id나 alias 관계가 없음. 현재 loader는 `SE -> eecs` 매핑을 별도 부전공 코드로 재사용함 |
| `llm/course_info_from_registration_system/*.xls` + `DB/timetable/registration-system/*.normalized.json` | `/dashboard/timetable`, `/api/timetable/[term]`, 시간표 conflict/store, 실제 개설 이력 | 14 terms / 5448 sections / 1135 unique course codes | `course_code`, `section`, `title`, `category`, `program`, `hours`, `meetings`, `capacity`, `instructors`, `sourceSha256` | 수강신청 시스템 엑셀을 `yarn course-catalog:import-registration-offerings`로 정규화한다. 과목명/학점/부서는 term-specific 관측값이며 canonical identity에 자동 덮어쓰지 않는다 |
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
- `CourseCatalogHistoricalOffering`: 구조화된 원천에서 확인된 과거 개설 이력. 수강신청 시스템 엑셀의 distinct `(term, courseCode)`를 1차 원천으로 생성하고 `course_db.csv.offered_YYYY_S`는 legacy backfill로 합친다.
- `CourseCatalogManualListing`: 학사편람 연도별 수록 이력. 현재는 PDF에서 추출한 `manual-listings.extracted.json`의 연도/source/page를 연결한다.
- `CourseCatalogRequirementFacet`: 졸업요건, 부전공, 추천, 로드맵에서 쓰는 기능별 분류. canonical course에 붙는 feature-specific tag.
- `CourseCatalogSourceRef`: CSV, 학사편람, timetable JSON, roadmap preset 등 원천 provenance.

초기 타입 초안은 `features/course-catalog/types.ts`에 둔다.

## 현재 Read-only Snapshot 기준선

`yarn course-catalog:check` 기준 현재 공통 원천 snapshot은 아래 수치를 검증한다.

| 항목 | 수 |
| --- | ---: |
| courses | 1213 |
| aliases | 1463 |
| offerings | 5448 |
| historical offerings | 4221 |
| manual listings | 3590 |
| requirement facets | 1633 |
| relationships | 11 |
| synthetic courses | 599 |
| roadmap nodes without `courseCode` | 324 |

기능별 facet 수는 `minor: 648`, `recommendation: 211`, `roadmap: 774`이다. Recommendation facet은 `requirementId`/`programCode`/`sortOrder`를 포함해 졸업 추천 런타임이 `course-master.ts`를 직접 읽지 않고도 세부 요건별 후보를 복원할 수 있다. 로드맵 raw node 중 `courseCode`가 있는 노드는 777개지만, 동일 preset/node/course 조합 dedupe 이후 snapshot facet은 774개다.

현재 `historicalOfferings`는 `2020: 484`, `2021: 514`, `2022: 591`, `2023: 603`, `2024: 636`, `2025: 676`, `2026: 717`, `manualListings`는 `2020: 446`, `2021: 328`, `2022: 303`, `2023: 567`, `2024: 591`, `2025: 666`, `2026: 689`를 기준선으로 검증한다. 2027년 이후 학사편람이 추가되면 `scripts/course-catalog/extract-manual-listings.ts`의 `MANUAL_SOURCES`에 연도/sourcePath를 추가한 뒤 `yarn course-catalog:extract-manual-listings`로 추출 snapshot을 갱신한다. 수강신청 시스템 엑셀은 `llm/course_info_from_registration_system/YYYY_SS_개설강좌정보.xls`로 추가한 뒤 `yarn course-catalog:import-registration-offerings`를 실행하면 normalized JSON과 timetable source manifest가 함께 갱신된다.

## Runtime 질의 seam

`features/course-catalog/server-catalog-query.ts`만 generated snapshot을 import한다. 이 module은 프로세스 단위로 검색 목록과 추천 인덱스를 한 번 생성해 재사용한다. `search.ts`, `recommendations.ts`, `roadmap.ts`, `legacy-course-db.ts`는 원천을 직접 소유하지 않고 호출자가 전달한 데이터만 처리한다.

- API route와 졸업 평가 use case만 서버 질의 module을 import한다.
- 대시보드는 졸업 평가 API가 반환한 추천 결과를 표시하며 브라우저에서 추천 인덱스를 다시 만들지 않는다.
- 수강 이력, 전공, 부전공 또는 선언 학기가 바뀌면 서버 재평가가 성공한 뒤 저장된 파생 결과를 교체해야 한다.
- `tests/course_catalog_server_boundary.spec.ts`가 import seam을, `yarn course-catalog:check-browser-bundle`이 production browser chunk를 검증한다.

`features/course-catalog/discovery.ts`는 과목 탐색의 검색 조건, facet, 안정 정렬, page size 제한, list/detail projection을 한 Interface에 집중한다. `/api/courses/search`는 기본 24개 목록과 전체 개수만 반환하고, `/api/courses/detail`은 사용자가 과목을 선택한 뒤 상세 이력을 반환한다.

- 목록 projection에는 과목 ID/코드/명칭, 별칭, 학과, 학점, 실습시간, lifecycle, 개설 학기와 과정만 포함한다.
- 설명, sourceRefs, 전체 offering/offeringGroups, manualListings, requirement facets, matchText는 상세 응답에만 포함한다.
- 기본 24개 목록 응답은 facet metadata를 포함해 64 KiB 미만이어야 한다.
- 서버 page는 1부터 시작하고 page size는 최대 100개로 제한하며, 과목코드와 courseId 순서로 안정 정렬한다.

## Source of Truth 제안

1. Course identity의 1차 원천은 `DB/course_db.csv`로 둔다.
2. 학기별 개설/분반/시간 정보와 실제 개설 이력은 수강신청 시스템 엑셀에서 생성한 `DB/timetable/registration-system/*.normalized.json`을 신뢰한다.
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
- `DB/timetable/registration-system/*.normalized.json`를 `CourseCatalogOffering[]`과 `CourseCatalogHistoricalOffering[]`으로 변환한다.
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

## 반복 갱신 절차

학사편람 PDF와 수강신청 시스템 엑셀은 서로 다른 의미의 원천이다. 학사편람은 예정/수록 교과목의 근거이고, 수강신청 시스템 엑셀은 실제 학기별 개설/분반/시간표의 근거다. 갱신 시 두 원천을 같은 파일에 덮어쓰기보다 아래 순서로 source layer를 갱신한다.

### 수강신청 시스템 엑셀 추가

1. 원본 파일을 `llm/course_info_from_registration_system/YYYY_SS_개설강좌정보.xls`에 추가한다. `SS`는 `01`, `02` 형식을 사용한다.
2. `yarn course-catalog:import-registration-offerings`를 실행한다.
3. 생성된 `DB/timetable/registration-system/YYYY_SS_course_info.normalized.json`의 `count`, `sourceFile`, `sourceSha256`를 확인한다.
4. `features/course-catalog/generated/registration-timetable-sources.json`에 새 학기와 `count`가 추가됐는지 확인한다. 가장 최신 학기는 `defaultForTimetable: true`가 된다.

### 학사편람 추가

1. PDF를 `docs/bachelor_manual/YYYY_manual.pdf`에 추가한다.
2. `scripts/course-catalog/extract-manual-listings.ts`의 source 목록에 연도와 경로를 추가한다.
3. `yarn course-catalog:extract-manual-listings`로 `manual-listings.extracted.json`을 갱신한다.

### 공통 catalog 게시 전 검증

1. `yarn course-catalog:export -- --out features/course-catalog/generated/course-catalog.snapshot.json`
2. `yarn course-catalog:check`
3. `yarn course-catalog:report -- --out output/course-catalog-source-diff.md`
4. `yarn typecheck`
5. `yarn jest --watchman=false`
6. `yarn build` 후 자동 실행되는 browser catalog boundary 검사를 확인한다.

`course-catalog:report`는 학사편람 수록 교과목과 실제 개설 교과목의 차이를 사람이 검토할 수 있게 Markdown으로 출력한다. 특히 아래 항목은 새 학기 업로드 때마다 확인한다.

- 학사편람에는 있지만 실제 개설 이력이 없는 과목
- 실제 개설됐지만 학사편람 listing에 매칭되지 않는 과목
- 같은 학수번호의 실제 개설 과목명 변형
- 같은 학수번호의 실제 개설 강/실/학 변형
- 학사편람 추출 결과 안에서의 과목명/강실학 변형

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
3. `course_db.csv.offered_YYYY_S` legacy 플래그를 언제 제거하거나 read-only 보조 원천으로만 남길지 정해야 한다.
4. 대학원 과목을 같은 catalog에 넣되 `program`으로 분리할지, 별도 layer로 둘지 정해야 한다.
5. graduation rule catalog의 `sourceRefs`와 course catalog의 `sourceRefs`를 같은 shape로 통합할지 결정해야 한다.

## 다음 구현 단위

1. `features/course-catalog/adapters/course-db.ts`: CSV row를 `CourseCatalogCourse`로 변환.
2. `features/course-catalog/adapters/timetable.ts`: timetable JSON을 `CourseCatalogOffering`으로 변환.
3. `features/course-catalog/inspect.ts`: 원천별 unique code, missing code, alias collision report.
4. `tests/course_catalog_inventory.spec.ts`: 현재 inventory count와 핵심 collision을 snapshot성으로 고정.
