# 과목 카탈로그

> 2026-09-06 재점검: 이 위키는 구현 설명이며 학사 규정의 원문이 아닙니다. 학사편람이 우선합니다. [2020–2026 편람·데이터 정합성 감사 및 남은 한계](../audits/2026-09-06-2020-2026-integrity-audit.md)를 먼저 확인하세요.

## 목적

과목 카탈로그는 과목 identity, 코드 관계, 학사편람 수록 이력, 학기별 개설 분반과 기능별 facet을 하나의 게시 가능한 snapshot으로 연결합니다. 브라우저는 snapshot을 직접 import하지 않고 서버 질의 결과만 소비합니다.

## Snapshot schema

현재 `CourseCatalogSnapshot`의 `schemaVersion`은 2이며 다음 collection을 가집니다.

| collection            | 내용                                                                   |
| --------------------- | ---------------------------------------------------------------------- |
| `courses`             | canonical `courseId`, primary code, alias, 제목, 학점, 부서, lifecycle |
| `offerings`           | term·분반·시간·교수·정원 등 실제 개설 정보                             |
| `historicalOfferings` | 연도·학기별 개설 관측 이력                                             |
| `manualListings`      | 학사편람 연도·페이지별 수록 이력                                       |
| `requirementFacets`   | 졸업·부전공·로드맵·추천 분류                                           |
| `relationships`       | cross-listed, renumbered, legacy equivalent, same course, substitute   |

모든 항목은 가능한 경우 `sourceRefs`를 가져야 합니다. code alias는 identity 연결에 사용하지만, 하나의 수강 이력을 여러 이수영역에 자동 중복 반영한다는 뜻은 아닙니다.

## 빌드 입력

| 입력                                      | Adapter 역할                 |
| ----------------------------------------- | ---------------------------- |
| `DB/course_db.csv`                        | 기본 과목 identity와 설명    |
| `DB/timetable/registration-system/*.json` | 개설 분반과 역사적 개설 이력 |
| `manual-listings.extracted.json`          | 학사편람 수록 이력           |
| 부전공·추천 상수                          | requirement facet            |
| `DB/roadmap/presets/*.json`               | roadmap facet                |
| graduation course equivalencies           | 과목 relationship            |

`features/course-catalog/build.ts`의 accumulator가 primary code와 alias를 정규화하고 관측값을 병합합니다. identity가 없는 과목도 누락시키지 않고 synthetic course로 남겨 진단할 수 있게 합니다.

## 서버 질의 Interface

`server-catalog-query.ts`는 snapshot을 한 번 import하고 다음 index를 process-local singleton으로 만듭니다.

- 검색용 `CourseCatalogSearchItem[]`
- 졸업 추천 index
- `CourseDiscovery`
- roadmap catalog

`CourseDiscovery.search()`는 filter, facet, stable ordering, page 제한과 목록 projection을 소유합니다. `getDetail(courseId)`만 설명, 전체 개설 이력과 manual listing을 반환합니다.

| API                                    | 반환                                 |
| -------------------------------------- | ------------------------------------ |
| `GET /api/courses/search`              | page 단위 목록과 facet               |
| `GET /api/courses/detail?courseId=...` | 선택한 과목의 상세 projection        |
| `GET /api/courses`                     | 구형 caller를 위한 legacy projection |
| `GET /api/roadmap/courses`             | roadmap 편집용 과목 후보 page        |

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

## 편람 수록 이력의 해석과 감사

`manualListings.credits`는 해당 편람에서 추출한 값이다. 현재 CSV 학점으로 덮어쓰지 않으며 0과 미상을 구별한다. 역사적 과목명은 해당 편람의 제목에서 추출하여 `titleKo`에 보존한다. 추출 불가 시 현재 제목으로 채우지 않는다. OCR 제목은 원문 이미지 검수가 필요할 수 있다. 학과는 현재 catalog에서 가져오는 표시 정보다. 최신 편람 근거가 있는 canonical 과목의 제목·학점·강의/실험 시간은 해당 근거를 우선한다. 과거 판정 학점은 성적 이력을 사용하며 현재 표시값으로 덮어쓰지 않는다.

스캔된 2021/2022 편람에는 한국어 OCR이 필요하다. `scripts/course-catalog/ocr-handbook.swift` 또는 Tesseract `kor+eng`를 사용하고, 외부 캐시를 지정할 때는 `--ocr-cache-root /tmp/handbooks`를 사용한다. 각 연도 캐시는 PDF 해시와 전체 페이지 수가 일치해야 한다. 상세 재현 명령은 [감사 보고서](../audits/2026-09-06-2020-2026-integrity-audit.md)에 있다.

```sh
npm run course-catalog:audit-handbooks -- --out /tmp/handbook-integrity.json
```

이 검사는 원본 해시, 참조 범위, 수록 학점 보존과 snapshot 재현성을 검증한다. 미연결 수록 이력과 alias 소유 충돌은 구조 실패로 처리한다. 연도별 학점 차이와 기존 부전공 JSON 차이는 별도 관측 목록으로 출력한다. 편람에만 있는 과목은 개설 여부 미확인으로 보존한다. 구조 검사 통과를 학사 규정 전수 검증으로 표현하지 않는다.
