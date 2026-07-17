# Gijol v2

GIST 학부생의 성적표를 바탕으로 졸업요건을 판정하고, 과목 탐색·로드맵·시간표 계획을 연결하는 Next.js 서비스입니다.

## 시작하기

```bash
yarn install
yarn dev
```

기본 개발 서버는 `http://localhost:3000`에서 실행됩니다. Node.js 버전은 CI 또는 팀 개발 환경에서 사용하는 버전에 맞추고, 의존성은 `yarn.lock`을 기준으로 설치합니다.

## 주요 명령

```bash
yarn typecheck
yarn jest --runInBand --no-watchman
yarn build
yarn course-catalog:check
yarn graduation:catalog:check
yarn graduation:catalog:snapshot
```

전체 `yarn test`는 포맷, ESLint, 타입 검사, Jest를 순서대로 실행합니다.

## 문서

프로젝트의 최신 구조와 데이터 흐름은 [Wiki 인덱스](docs/wiki/README.md)에서 시작합니다.

- [아키텍처](docs/wiki/architecture.md)
- [데이터 파이프라인](docs/wiki/data-pipelines.md)
- [졸업 판정 엔진](docs/wiki/graduation-engine.md)
- [과목 카탈로그](docs/wiki/course-catalog.md)
- [시간표와 로드맵](docs/wiki/timetable-and-roadmap.md)
- [운영 및 검증](docs/wiki/operations.md)
- [도메인 모델](docs/wiki/domain-model.md)
- [Architecture Decision Records](docs/adr)

## 저장소 정책

Git에는 애플리케이션 코드, 테스트, 게시 가능한 정적 데이터, 생성 결과를 재현하는 스크립트와 의사결정 문서만 둡니다. 학사편람 PDF, 수강신청 원본 XLS, LLM 작업 자료, 브라우저 캡처와 로컬 IDE 설정은 커밋하지 않습니다.
