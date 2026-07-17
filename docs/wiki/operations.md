# 운영 및 검증

## 기본 검증

```bash
yarn prettier:check
yarn lint
yarn typecheck
yarn jest --runInBand --no-watchman
yarn build
```

Watchman을 사용할 수 없는 sandbox/CI에서는 Jest에 `--no-watchman`을 전달합니다.

## 졸업 규칙 카탈로그

```bash
yarn graduation:catalog:check
yarn graduation:catalog:inspect
yarn graduation:catalog:snapshot
yarn graduation:catalog:export --out /tmp/graduation-catalog.json
yarn graduation:catalog:report --out /tmp/graduation-catalog.html
```

### 변경 순서

1. 학사편람 페이지와 적용 대상을 확인합니다.
2. `catalog-source-layers.ts`에 provenance layer가 있는지 확인합니다.
3. rule의 `scope`, `parameters`, `appliesTo`, `sourceRefs`를 갱신합니다.
4. 계산형 규칙이면 evaluator registry의 계약과 테스트를 함께 수정합니다.
5. catalog check와 golden snapshot diff를 검토합니다.
6. 의도된 변경일 때만 fixture를 갱신합니다.

학사편람 연도는 증거의 버전이며 학생 적용 버전이 아닙니다. 실제 적용 여부는 입학년도, program code, 선언 학기와 평가 학기의 컨텍스트로 판단합니다.

course equivalency는 `crossListed`, `renumbered`, `legacyEquivalent`, `sameCourse`, `substitute`를 구분합니다. 새로운 관계에는 source가 필요하며, 관계를 추가했다고 자동 중복인정되는 것은 아닙니다.

## 과목 카탈로그

```bash
yarn course-catalog:check
yarn course-catalog:export --out /tmp/course-catalog.json
yarn course-catalog:report --out /tmp/course-catalog.html
yarn course-catalog:check-browser-bundle
```

원본 XLS/PDF에서 정규화 데이터를 다시 만들 때는 원천 hash, 항목 수, unresolved/synthetic 항목과 snapshot diff를 함께 검토합니다. 자세한 순서는 [과목 카탈로그](course-catalog.md#갱신-절차)에 있습니다.

## 브라우저 bundle

production build의 `postbuild`는 sitemap 생성 뒤 다음을 검사합니다.

- 과목 catalog snapshot이 browser chunk로 유입되지 않는지
- 공개 route에 dashboard runtime fingerprint가 포함되지 않는지
- 공개 route JavaScript gzip 예산을 넘지 않는지

```bash
yarn build
```

새 페이지는 반드시 필요한 `getLayout` runtime만 선택합니다. 새 browser Module에서 `server-catalog-query.ts`나 `generated/course-catalog.snapshot.json`을 import하지 않습니다.

## Git에 포함하는 자료

포함:

- 실행 코드와 테스트
- `DB/`의 정규화된 배포 데이터
- 검증된 generated snapshot과 manifest
- 생성·검증 스크립트
- `docs/wiki/`와 `docs/adr/`

제외:

- `llm/`의 작업 자료와 원본 XLS
- `docs/bachelor_manual/`의 원본 PDF
- `.next/`, `output/`, `.playwright-cli/`, coverage
- IDE 설정, 디버그 JSON, 임시 HTML/이미지 보고서

## 문서 검토 체크리스트

- 경로와 명령이 현재 `package.json`에 존재하는가?
- 규칙 값이나 과목 목록을 카탈로그와 중복 관리하고 있지 않은가?
- 완료된 계획이나 legacy 흐름을 현재 아키텍처처럼 설명하지 않는가?
- 새 ADR과 충돌하는 설명이 없는가?
- 링크가 저장소 상대 경로로 열리는가?
