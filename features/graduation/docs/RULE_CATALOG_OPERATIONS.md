# Graduation Rule Catalog Operations

이 문서는 졸업요건 rule catalog를 Admin UI 없이 검토, 갱신, publish artifact로 고정하기 위한 운영 규칙이다.

## Current Phase

현재 단계의 관리 경계는 TypeScript catalog, validator/compiler, JSON publish bundle, read-only report, golden snapshot이다.

Admin UI, API, DB 저장소, 권한 모델은 아직 구현하지 않는다. Admin은 아래 draft/publish 저장소 설계가 검증된 뒤에 붙인다.

## Commands

| 목적 | 명령 |
|------|------|
| catalog validator/compiler/export boundary 확인 | `yarn graduation:catalog:check` |
| 사람이 읽는 CLI 요약 확인 | `yarn graduation:catalog:inspect` |
| 브라우저용 read-only report 생성 | `yarn graduation:catalog:report --out <path>` |
| publish bundle JSON 생성 | `yarn graduation:catalog:export --out <path>` |
| golden snapshot diff 확인 | `yarn graduation:catalog:snapshot` |
| golden snapshot 승인 갱신 | `yarn graduation:catalog:export --out tests/fixtures/graduation-catalog-publish-bundle.snapshot.json` |

## Source Layer Rules

Source layer는 학사편람 같은 원문 문서의 provenance 단위다. 학생에게 규칙이 적용되는지 결정하는 version key가 아니다.

Report의 referenced pages는 매뉴얼 전체 페이지가 아니라 현재 publish bundle의 `sourceRefs`가 실제로 참조한 페이지다. 페이지가 추적 대상이지만 아직 rule/equivalency sourceRef가 아니면 `Manual Page Audit`에서 `catalog-gap`, `partial`, `deferred`, `out-of-scope` 상태와 이유를 확인한다.

운영 규칙:

1. 하나의 source layer는 하나의 원문 문서를 가리킨다.
2. `manualYear`는 증거 문서의 연도이며, 적용 학번이나 적용 학기를 뜻하지 않는다.
3. `sourcePath`는 repo 안의 실제 근거 문서 경로를 가리켜야 한다.
4. publish 가능한 rule과 course equivalency의 모든 `sourceRefs`는 등록된 source layer의 `(manualYear, sourcePath)`와 일치해야 한다.
5. source layer를 추가할 때 기존 rule의 적용 여부를 바꾸지 않는다. 적용 여부는 rule의 `appliesTo`와 학생 학적 컨텍스트가 결정한다.
6. source layer가 등록됐지만 어떤 rule/equivalency에서도 참조되지 않으면 report와 snapshot diff에서 검토 대상으로 본다.

## Applicability Context Rules

`appliesTo`는 학생별 적용조건이고, `sourceRefs.manualYear`와 분리한다. 학사편람 연도는 evidence provenance이며, evaluator가 특정 연도 PDF 하나를 고르는 방식으로 적용 여부를 결정하지 않는다.

운영 규칙:

1. `RuleProgramKind`는 현재 `major`, `minor`, `double-major`, `advanced-major`를 표현할 수 있다.
2. 기존 런타임은 전공/부전공 판정을 중심으로 동작하며, `double-major`와 `advanced-major`는 p.30 복수전공/심화전공 규칙을 source-backed rule로 분리하기 위한 schema 기반이다.
3. `programCodes` 컨텍스트는 program kind별 선택 프로그램을 담는다. compiler는 scope가 `global`이 아닌 rule을 선택할 때 이 값을 사용해 실제 학생에게 해당하는 rule만 applicable로 분리한다.
4. 프로그램 정보가 없으면 program-scoped rule은 `needs_context`로 분리한다. 특정 program kind가 명시적으로 빈 배열이면 해당 kind의 rule은 `does_not_apply`로 본다.
5. 선언 학기 조건은 기본 `declarationTerm` 또는 program kind별 `declarationTerms` 컨텍스트로 판정한다. 부전공 선언 학기와 복수전공 선언 학기를 같은 필드에 섞지 않는다.
6. 복수전공/심화전공 rule을 추가할 때는 p.30 sourceRefs와 적용조건을 먼저 catalog에 넣고, 계산형 특수 로직이 필요하면 새 `evaluatorId` 계약을 registry에 등록한다.
7. 새 program kind를 runtime 판정에 연결할 때는 기존 전공/부전공 evaluator 결과가 바뀌지 않는다는 회귀 테스트를 먼저 고정한다.

## Course Equivalency Rules

Course equivalency catalog는 과목 코드 관계를 source-backed data로 관리하기 위한 별도 catalog다. 현재 runtime classifier/evaluator에는 연결하지 않는다.

운영 규칙:

1. `alias-mappings.ts`는 현재 런타임 교차개설/동일과목 alias 매칭 용도로 유지한다.
2. 연도별 학수번호 변경, 과거 코드 인정, legacy equivalent, 대체과목 후보는 `course-equivalencies.ts`에 둔다.
3. `crossListed`와 `renumbered`를 같은 relation shape로 섞지 않는다.
4. 대체과목은 `substitute` relation으로 기록하고, 동일과목(`sameCourse`)이나 학수번호 변경(`renumbered`)과 섞지 않는다.
5. 모든 equivalency는 sourceRefs를 가져야 하며, source layer coverage validator를 통과해야 한다.
6. equivalency를 runtime 판정에 연결할 때는 별도 회귀 테스트로 기존 졸업판정 결과 변화 범위를 먼저 고정한다.
7. 하나의 과목 코드 관계가 있다고 해서 중복인정이 자동 허용되지는 않는다. 중복인정은 별도 rule/evaluator 근거가 필요하다.

## Golden Snapshot Workflow

Catalog 변경 시 순서:

1. rule/equivalency/source layer를 수정한다.
2. `yarn graduation:catalog:check`로 validator/compiler/export boundary를 확인한다.
3. `yarn graduation:catalog:inspect`와 read-only report로 source/applicability/evaluator 분포를 검토한다.
4. `Manual Page Audit`에서 `catalog-gap` 또는 `partial` 상태가 의도된 것인지 확인한다.
5. `yarn graduation:catalog:snapshot`이 실패하면 diff의 added/removed/changed ID를 검토한다.
6. 변경이 의도된 것이라고 확인한 뒤 golden snapshot을 갱신한다.
7. `yarn typecheck`, `yarn jest --runInBand --no-watchman`, `git diff --check`를 통과시킨다.

Golden snapshot은 reviewer가 catalog의 의미 있는 변경을 놓치지 않게 하는 안전장치다. Snapshot mismatch 자체는 버그가 아닐 수 있지만, 검토 없이 fixture를 갱신하면 안 된다.

## Draft/Publish Storage Design

미래 Admin은 임의 코드를 수정하는 화면이 아니라 검증 가능한 rule primitive를 draft/publish하는 도구여야 한다.

### Storage Boundaries

| Boundary | 역할 | 쓰기 가능 시점 |
|----------|------|----------------|
| Draft catalog | 편집 중인 rule/source/equivalency data | Admin draft 저장 |
| Validation result | draft를 validator/compiler/export boundary에 통과시킨 결과 | draft 저장 또는 검증 실행 |
| Publish bundle | evaluator가 읽는 immutable JSON artifact | publish 승인 시 |
| Publish metadata | 누가, 언제, 어떤 source/diff를 승인했는지 | publish 승인 시 |
| Golden snapshot | repo에서 검토하는 기준 artifact | 코드 리뷰에서 승인 시 |

### Draft State

Draft는 최소한 다음 상태를 가진다.

| State | 의미 |
|-------|------|
| `draft` | 저장됐지만 아직 publish 검증을 통과하지 않았거나 검증 전 |
| `validation_failed` | sourceRefs, appliesTo, evaluator contract, JSON serialization 등 검증 실패 |
| `validated` | publish 가능한 bundle 후보 생성 가능 |
| `published` | immutable publish bundle로 승격 |
| `superseded` | 더 최신 publish bundle에 의해 대체 |

### Publish Invariants

Publish는 다음 조건을 모두 만족해야 한다.

1. 모든 publishable rule은 sourceRefs를 가진다.
2. 모든 publishable rule은 명시적 `appliesTo`를 가진다.
3. 계산형 특수 로직은 등록된 `evaluatorId`만 참조한다.
4. evaluator contract가 rule `kind`, `scope`, `parameters`와 맞아야 한다.
5. 모든 sourceRefs는 등록된 source layer에 속해야 한다.
6. publish bundle은 JSON-serializable해야 한다.
7. publish bundle은 immutable artifact로 보관하고, 수정은 새 draft와 새 publish로만 한다.
8. publish 전후 diff는 source layer/rule/equivalency ID 단위로 검토 가능해야 한다.

### Admin UI Entry Point

Admin UI는 다음 조건이 만족된 뒤 진행한다.

1. read-only report가 catalog reviewer에게 충분한 검토 화면을 제공한다.
2. golden snapshot/diff workflow가 안정적으로 동작한다.
3. source layer와 course equivalency 운영 규칙이 문서화되어 있다.
4. draft/publish 저장소의 상태, 불변조건, rollback 방식이 합의되어 있다.
5. runtime evaluator가 publish bundle만 읽는 경계가 명확하다.

그 전에는 Admin UI를 만들지 않는다. 현재 단계에서 필요한 화면은 read-only report다.
