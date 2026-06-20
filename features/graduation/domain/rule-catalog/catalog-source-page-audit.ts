export type CatalogSourcePageAuditStatus =
  | 'covered'
  | 'partial'
  | 'catalog-gap'
  | 'deferred'
  | 'out-of-scope';

export interface CatalogSourcePageAudit {
  layerId: string;
  page: number;
  title: string;
  status: CatalogSourcePageAuditStatus;
  reason: string;
  nextAction?: string;
}

export const CATALOG_SOURCE_PAGE_AUDITS = Object.freeze([
  {
    layerId: 'gist-bachelor-manual-2026',
    page: 22,
    title: '전기전자컴퓨터, AI융합, 반도체, 물리 전공필수 및 공유과목 제한',
    status: 'partial',
    reason: 'EC 전공필수는 sourceRef로 연결됐지만 SE/PS 전공필수와 인문사회 모 과목 공유 제한은 아직 rule catalog로 분리되지 않았다.',
    nextAction: 'SE/PS 전공필수와 공유과목 제한을 major rule 또는 별도 evaluator 후보로 분리한다.',
  },
  {
    layerId: 'gist-bachelor-manual-2026',
    page: 23,
    title: '화학, 수리과학 전공필수 및 대체/중복수강 제한',
    status: 'partial',
    reason: 'CH/MM 전공필수와 주요 대체/동일과목은 source-backed rule/equivalency로 분리됐지만, 2012~2017학번 화학과 과거 요건과 2025-2 복수전공 신청자 MM2701 대체 특례는 별도 컨텍스트가 필요하다.',
    nextAction: '복수전공 신청 학기 컨텍스트가 생기면 MM2701 대체 특례를 조건부 evaluator 또는 appliesTo 확장으로 모델링한다.',
  },
  {
    layerId: 'gist-bachelor-manual-2026',
    page: 24,
    title: '신소재, 기계로봇, 환경·에너지 전공필수',
    status: 'partial',
    reason: 'MC 전공필수와 일부 부전공 요건은 참조됐지만 MA/EV 전공필수와 과거 학번 대체 조건은 아직 완성되지 않았다.',
    nextAction: 'MA/EV 전공필수와 EV 과거 학번 대체 조건을 source-backed rule/equivalency 후보로 정리한다.',
  },
  {
    layerId: 'gist-bachelor-manual-2026',
    page: 25,
    title: '환경·에너지 continuation, 생명과학 전공필수, 콜로퀴움/과학기술과 경제 설명',
    status: 'partial',
    reason: 'BS/EV 전공필수와 주요 대체 조건은 source-backed rule/equivalency로 분리됐지만, 2010~2017학번 EV 과거 요건과 생명-화학 복수전공 중복인정 예외는 별도 컨텍스트가 필요하다.',
    nextAction: '복수전공/과거 학번 지원 범위를 확장할 때 EV 2010~2017 요건과 생명-화학 중복인정 예외를 별도 rule/evaluator로 분리한다.',
  },
  {
    layerId: 'gist-bachelor-manual-2026',
    page: 26,
    title: '학사논문연구 수강자격과 이수 절차',
    status: 'deferred',
    reason: '현재 catalog는 학사논문연구 I/II 필수 이수만 표현하고, 90학점/GPA/계절학기/심사 절차는 evaluator scope가 따로 필요하다.',
    nextAction: '학사논문연구 자격 판정을 졸업판정에 포함할지 결정한 뒤 evaluatorId 계약을 설계한다.',
  },
  {
    layerId: 'gist-bachelor-manual-2026',
    page: 27,
    title: '부전공 일반, EC, AI융합, 물리 부전공',
    status: 'partial',
    reason: '부전공 학점/필수 일부는 sourceRef로 연결됐지만 EC 2천/3~4천번대 세부 분배 같은 제한은 아직 evaluator로 분리되지 않았다.',
    nextAction: '세부 학점 분배 제한을 declarative parameter로 충분히 표현할지, evaluator가 필요한지 결정한다.',
  },
  {
    layerId: 'gist-bachelor-manual-2026',
    page: 28,
    title: '화학, 수리과학, 신소재, 기계로봇, 환경·에너지 부전공',
    status: 'partial',
    reason: '각 부전공의 학점과 필수과목 일부는 참조됐지만 2026학번 수리과학 세부 선택 구조와 EV 대체 조건은 아직 정밀화 여지가 있다.',
    nextAction: 'MM 2026학번 이후 세부 규칙과 EV 대체 조건을 source-backed rule 후보로 분리한다.',
  },
  {
    layerId: 'gist-bachelor-manual-2026',
    page: 29,
    title: '생명, 의생명, 에너지, 문화기술, 지능로봇, 인문사회 부전공',
    status: 'partial',
    reason: '부전공 학점/필수/IR AI-code 제한은 참조됐지만 일부 course set과 중복인정/공유과목 예외는 별도 정밀화가 남아 있다.',
    nextAction: 'CT/LH 세부 course set과 공유과목 예외를 alias가 아니라 course-equivalencies 또는 evaluator 후보로 검토한다.',
  },
  {
    layerId: 'gist-bachelor-manual-2026',
    page: 30,
    title: '복수전공과 심화전공',
    status: 'deferred',
    reason: 'rule schema는 복수전공/심화전공 program kind와 program-kind별 선언 학기 컨텍스트를 표현할 수 있지만, p.30의 실제 판정 rule/evaluator는 아직 publish catalog에 넣지 않았다.',
    nextAction: '복수전공/심화전공을 런타임 판정에 포함할 때 p.30의 이수학점/신청 조건을 source-backed rule 또는 evaluator 계약으로 분리한다.',
  },
  {
    layerId: 'gist-bachelor-manual-2026',
    page: 31,
    title: '예체능 수업 운영과 편성 현황',
    status: 'out-of-scope',
    reason: '동일 학기 수강 제한, 수강료, 개설 변동은 수강신청 운영 규칙이며 현재 졸업요건 evaluator는 이수 학기 수만 판정한다.',
    nextAction: '수강계획 추천에서 필요해질 때 schedule/advising rule로 분리한다.',
  },
  {
    layerId: 'gist-bachelor-manual-2026',
    page: 32,
    title: '졸업요건 장 시작, 총학점/GPA, 체육실기 목록',
    status: 'partial',
    reason: '총학점과 GPA는 p.33~34 표를 주 근거로 두고 p.32를 보조 sourceRef로 추가했다. 체육실기 목록은 course set 운영 데이터로 분리되어 있다.',
    nextAction: '체육실기 과목 목록까지 publish catalog provenance로 관리할지 결정되면 별도 course set catalog로 분리한다.',
  },
  {
    layerId: 'gist-bachelor-manual-2026',
    page: 33,
    title: '2021학번 이후 졸업요건 표',
    status: 'covered',
    reason: '2021학번 이후 기본요건, 전공학점, 학사논문연구, 무학점 필수 sourceRef의 주 근거로 사용한다.',
  },
  {
    layerId: 'gist-bachelor-manual-2026',
    page: 34,
    title: '2018~2020학번 졸업요건 표',
    status: 'covered',
    reason: '2018~2020학번 기본요건, 전공학점, 학사논문연구, 예체능 이수 학기 sourceRef의 주 근거로 사용한다.',
  },
  {
    layerId: 'gist-bachelor-manual-2026',
    page: 49,
    title: '인문사회 문학과 역사/공공정책 부전공 과목표',
    status: 'partial',
    reason: 'LH_LIT/LH_PP 필수 course set은 참조됐지만 인문사회 전체 세부 분야 course set 정밀화는 계속 진행 중이다.',
    nextAction: 'LH_SS/LH_MB와 선택과목 인정 범위를 별도 source-backed course set으로 정리한다.',
  },
  {
    layerId: 'gist-bachelor-manual-2026',
    page: 50,
    title: '인문사회 경제·경영 부전공 과목표',
    status: 'partial',
    reason: 'LH_EB 필수 course set은 참조됐지만 선택과목과 다른 인문사회 세부분야 정밀화는 계속 진행 중이다.',
    nextAction: 'LH 계열 선택과목 범위를 course set catalog로 분리할지 결정한다.',
  },
] as const satisfies readonly CatalogSourcePageAudit[]);
