# 과목 카탈로그

## 목적

과목 카탈로그는 과목 identity, 코드 관계, 학사편람 수록 이력, 학기별 개설 분반과 기능별 facet을 하나의 게시 가능한 snapshot으로 연결합니다. 브라우저는 snapshot을 직접 import하지 않고 서버 질의 결과만 소비합니다.

## Snapshot schema

현재 `CourseCatalogSnapshot`의 `schemaVersion`은 2이며 다음 collection을 가집니다.

| collection | 내용 |
| --- | --- |
| `courses` | canonical `courseId`, primary code, alias, 제목, 학점, 부서, lifecycle |
| `offerings` | term·분반·시간·교수·정원 등 실제 개설 정보 |
| `historicalOfferings` | 연도·학기별 개설 관측 이력 |
| `manualListings` | 학사편람 연도·페이지별 수록 이력 |
| `requirementFacets` | 졸업·부전공·로드맵·추천 분류 |
| `relationships` | cross-listed, renumbered, legacy equivalent, same course, substitute |

모든 항목은 가능한 경우 `sourceRefs`를 가져야 합니다. code alias는 identity 연결에 사용하지만, 하나의 수강 이력을 여러 이수영역에 자동 중복 반영한다는 뜻은 아닙니다.

## 빌드 입력

| 입력 | Adapter 역할 |
| --- | --- |
| `DB/course_db.csv` | 기본 과목 identity와 설명 |
| `DB/timetable/registration-system/*.json` | 개설 분반과 역사적 개설 이력 |
| `manual-listings.extracted.json` | 학사편람 수록 이력 |
| 부전공·추천 상수 | requirement facet |
| `DB/roadmap/presets/*.json` | roadmap facet |
| graduation course equivalencies | 과목 relationship |

`features/course-catalog/build.ts`의 accumulator가 primary code와 alias를 정규화하고 관측값을 병합합니다. identity가 없는 과목도 누락시키지 않고 synthetic course로 남겨 진단할 수 있게 합니다.

## 서버 질의 Interface

`server-catalog-query.ts`는 snapshot을 한 번 import하고 다음 index를 process-local singleton으로 만듭니다.

- 검색용 `CourseCatalogSearchItem[]`
- 졸업 추천 index
- `CourseDiscovery`
- roadmap catalog

`CourseDiscovery.search()`는 filter, facet, stable ordering, page 제한과 목록 projection을 소유합니다. `getDetail(courseId)`만 설명, 전체 개설 이력과 manual listing을 반환합니다.

| API | 반환 |
| --- | --- |
| `GET /api/courses/search` | page 단위 목록과 facet |
| `GET /api/courses/detail?courseId=...` | 선택한 과목의 상세 projection |
| `GET /api/courses` | 구형 caller를 위한 legacy projection |
| `GET /api/roadmap/courses` | roadmap 편집용 과목 후보 page |

## 갱신 절차

### 수강신청 원본 추가

1. 로컬 `llm/course_info_from_registration_system/`에 `YYYY_SS_*.xls`를 둡니다.
2. `yarn course-catalog:import-registration-offerings`를 실행합니다.
3. 생성된 term JSON과 manifest의 count, source hash를 검토합니다.
4. 과목 카탈로그를 export하고 검사합니다.

### 학사편람 추가

1. 로컬 `docs/bachelor_manual/YYYY_manual.pdf`를 준비합니다.
2. `extract-manual-listings.ts`의 source 목록을 갱신합니다.
3. `yarn course-catalog:extract-manual-listings`를 실행합니다.
4. OCR fallback, 물리 페이지 번호와 추출 진단을 검토합니다.

### 게시 검증

```bash
yarn course-catalog:check
yarn course-catalog:export --out features/course-catalog/generated/course-catalog.snapshot.json
yarn course-catalog:report --out /tmp/course-catalog-report.html
yarn course-catalog:check-browser-bundle
```

snapshot 변경은 원천·Adapter 변경과 같은 커밋에 포함하고, 변경된 count와 synthetic/unresolved 진단을 리뷰합니다.
