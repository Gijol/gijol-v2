# Gijol Wiki

> 학사 규정의 원문 기준은 학사편람입니다. [2020–2026 정합성 감사](../audits/2026-09-06-2020-2026-integrity-audit.md)에 확인된 오류, 수정 내역과 미해결 경과조치를 기록했습니다. 이 위키와 `DB/minor` 파일은 규정의 독립적 근거가 아닙니다.

이 디렉터리는 현재 코드와 함께 유지하는 개발자용 Wiki입니다. 구현을 설명하는 문서는 여기에서 시작하고, 구체적인 규칙 값은 카탈로그 코드와 생성 snapshot을 직접 확인합니다.

## 문서 지도

| 문서 | 다루는 내용 |
| --- | --- |
| [아키텍처](architecture.md) | Pages Router 런타임, Module 구성, API와 상태 소유권 |
| [데이터 파이프라인](data-pipelines.md) | 성적표·학사편람·수강신청 원천이 정규화되는 과정 |
| [졸업 판정 엔진](graduation-engine.md) | 검증, 정규화, 규칙 선택, 판정, 추천, 브라우저 영속화 |
| [과목 카탈로그](course-catalog.md) | 통합 snapshot 스키마, 서버 질의 Interface, 갱신 절차 |
| [시간표와 로드맵](timetable-and-roadmap.md) | 분반 탐색, 시간표 계획 대안, 로드맵 enrichment |
| [운영 및 검증](operations.md) | 명령, 변경 순서, snapshot과 배포 검증 |
| [도메인 모델](domain-model.md) | 서비스에서 사용하는 핵심 용어와 불변조건 |

## Source of truth

| 정보 | 기준 |
| --- | --- |
| 졸업 규칙 | `features/graduation/domain/rule-catalog/` |
| 졸업 규칙 게시 묶음 | `GRADUATION_CATALOG_PUBLISH_BUNDLE` |
| 과목 identity와 이력 | `features/course-catalog/generated/course-catalog.snapshot.json` |
| 학기별 개설 분반 | `DB/timetable/registration-system/*.normalized.json` |
| 로드맵 preset | `DB/roadmap/presets/*.json` |
| 구조를 선택한 이유 | `docs/adr/*.md` |
| 개발자 설명 | `docs/wiki/*.md` |

Markdown 표에 졸업요건이나 과목 목록을 복제하지 않습니다. 규칙과 데이터가 바뀌면 먼저 source of truth를 갱신하고, Wiki에는 구조·절차·불변조건만 반영합니다.

## 문서 유지 규칙

1. 구현 변경과 같은 커밋에서 관련 Wiki를 갱신합니다.
2. 계획이 완료되면 완료된 계획서를 남기지 않고 ADR 또는 운영 문서에 결과를 반영합니다.
3. 역사적 흐름보다 현재 진입점과 Interface를 우선 설명합니다.
4. 수치가 자동 검증 가능한 경우 문서에 고정하지 않고 검사 명령을 안내합니다.
