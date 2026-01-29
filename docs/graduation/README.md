# GIST 학부 졸업요건 가이드

이 디렉토리는 학번별 졸업요건을 모듈화하여 관리합니다. 백오피스 시스템에서 활용할 수 있도록 구조화되어 있습니다.

## 파일 구조

```
docs/graduation/
├── README.md              # 이 파일 (인덱스 및 모듈화 안내)
├── common.md              # 모든 학번 공통 요건
├── 2018-2020.md           # 2018~2020학번 전용 요건
├── 2021-plus.md           # 2021학번 이후 전용 요건
└── schema.json            # 백오피스용 JSON 스키마 (추후 추가)
```

## 모듈화 방안

### 1. 데이터 구조 설계

각 요건은 다음 필드를 포함합니다:

```typescript
interface GraduationRequirement {
  id: string; // 고유 ID (예: "science-economy")
  category: CategoryKey; // 카테고리 (languageBasic, humanities, etc.)
  label: string; // UI 표시 이름
  requiredCredits: number; // 필수 학점 또는 과목 수
  courseCodes?: string[]; // 관련 과목 코드
  description?: string; // 상세 설명
  notes?: string[]; // 주의사항
  yearRange: {
    // 적용 학번 범위
    from: number; // 시작 학번 (예: 2018)
    to?: number; // 종료 학번 (null이면 현재까지)
  };
}
```

### 2. 백오피스 활용 방안

1. **CRUD 인터페이스**: 졸업요건을 DB에 저장하여 관리자가 UI에서 수정 가능
2. **버전 관리**: 학번별 요건 변경 이력 추적
3. **자동 검증 규칙 생성**: JSON 스키마에서 프론트엔드 검증 로직 자동 생성
4. **마크다운 → JSON 변환기**: 이 마크다운 파일들을 JSON으로 변환하는 스크립트 제공

### 3. 프론트엔드 연동

```typescript
// 사용 예시
import { getRequirementsForYear } from '@/lib/graduation/requirements-loader';

const requirements = getRequirementsForYear(2021);
// → 2021학번에 해당하는 모든 요건 반환
```

### 4. 확장 방향

- [ ] JSON 스키마 파일 (`schema.json`) 추가
- [ ] 백오피스 API 엔드포인트 설계
- [ ] 관리자 UI에서 마크다운 편집 기능
- [ ] 변경 이력 추적 (Git 기반 또는 DB 기반)

---

## 참고 링크

- [2018~2020학번 졸업요건 (GIST 공식)](https://www.gist.ac.kr/kr/html/sub05/05021605.html)
- [2021학번 이후 졸업요건 (GIST 공식)](https://www.gist.ac.kr/kr/html/sub05/05021604.html)
- [학사편람](https://www.gist.ac.kr/kr/html/sub05/050211.html)
