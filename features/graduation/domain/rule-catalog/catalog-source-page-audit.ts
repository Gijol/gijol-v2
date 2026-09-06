export type CatalogSourcePageAuditStatus = 'covered' | 'partial' | 'catalog-gap' | 'deferred' | 'out-of-scope';

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
    layerId: 'gist-bachelor-manual-2020',
    page: 69,
    title: 'MC3212 기계공학실험 I',
    status: 'covered',
    reason: '2020년까지 이수한 MC3212를 MC3106 실험 I로 연결한다. 이후 동일 코드의 I/II 충돌은 일괄 병합하지 않는다.',
  },
  {
    layerId: 'gist-bachelor-manual-2021',
    page: 135,
    title: '기계공학실험 I/II 과목 개요',
    status: 'covered',
    reason: 'MC3106 실험 I와 MC3107 실험 II의 실험 내용을 2020 편람과 대조했다.',
  },
  {
    layerId: 'gist-bachelor-manual-2023',
    page: 42,
    title: '면역학 이수체계도',
    status: 'covered',
    reason: 'BS3208(BS4205) 병기를 근거로 두 코드의 검색·개설·수록 identity를 통합했다.',
  },
  {
    layerId: 'gist-bachelor-manual-2024',
    page: 25,
    title: 'GS2003 수학 부전공 특례',
    status: 'covered',
    reason: '결합 과목 기이수자의 필수 조합과 추가 선택학점을 반영하며 기초교육과 부전공 학점을 중복하지 않는다.',
  },
  {
    layerId: 'gist-bachelor-manual-2024',
    page: 98,
    title: 'GS3767 과목 개요',
    status: 'covered',
    reason: '2025 HS3767과 과목명·영문명·설명을 대조하여 코드 변경을 연결했다.',
  },
  {
    layerId: 'gist-bachelor-manual-2025',
    page: 110,
    title: 'HS3767 과목 개요',
    status: 'covered',
    reason: '종전 GS3767의 과목명·영문명·설명 및 실제 개설 코드 변경을 대조했다.',
  },
  {
    layerId: 'gist-bachelor-manual-2026',
    page: 15,
    title: '에너지 부전공 신규 선언 종료',
    status: 'covered',
    reason: '2025-1부터 취소만 가능함을 선택지·안내·선언 학기 입력과 판정에 반영했다.',
  },

  {
    layerId: 'gist-bachelor-manual-2024',
    page: 55,
    title: '개편 전 AI 부전공 필수 교과목(인쇄 54쪽)',
    status: 'covered',
    reason:
      'AI4020/EC4209의 과목 설명 및 2022~2025 실제 교차개설을 대조하여 필수A로 연결했다. AI2002/AI4001의 2024년까지 기이수 조건과 선언 학기를 함께 확인한다.',
  },
  {
    layerId: 'gist-bachelor-manual-2021',
    page: 19,
    title: '영어 I 개편 전 이수요건(인쇄 18쪽)',
    status: 'covered',
    reason: '신입생 영어 또는 발표와 토론 중 1과목 2학점 인정. GS1601과 GS1603을 모두 요구하던 오류를 수정했다.',
  },
  {
    layerId: 'gist-bachelor-manual-2026',
    page: 167,
    title: '학술영어 GS1607의 개편 관계',
    status: 'covered',
    reason: 'Replaces both GS1601 and GS1603은 개편 과목 설명이며 기존 두 과목의 동시 이수 요건으로 해석하지 않는다.',
  },
  {
    layerId: 'gist-bachelor-manual-2026',
    page: 22,
    title: '전기전자컴퓨터, AI융합, 반도체, 물리 전공필수 및 공유과목 제한',
    status: 'partial',
    reason:
      'EC/SE/PS 전공필수를 반영하고 SE1102의 2024학번 예외를 분리했다. 인문사회 모 과목의 분류와 선언 부전공 요건 반영을 분리했으나 전체 공유과목의 모/자 관계 원장은 정밀화가 남아 있다.',
    nextAction: '교차코드의 모/자 관계를 과목별 원문과 연결한다.',
  },
  {
    layerId: 'gist-bachelor-manual-2026',
    page: 23,
    title: '화학, 수리과학 전공필수 및 대체/중복수강 제한',
    status: 'partial',
    reason:
      'CH/MM 전공필수와 주요 대체/동일과목은 source-backed rule/equivalency로 분리됐지만, 2012~2017학번 화학과 과거 요건과 2025-2 복수전공 신청자 MM2701 대체 특례는 별도 컨텍스트가 필요하다.',
    nextAction:
      '복수전공 신청 학기 컨텍스트가 생기면 MM2701 대체 특례를 조건부 evaluator 또는 appliesTo 확장으로 모델링한다.',
  },
  {
    layerId: 'gist-bachelor-manual-2026',
    page: 24,
    title: '신소재, 기계로봇, 환경·에너지 전공필수',
    status: 'partial',
    reason:
      'MA 전공필수 6과목과 MC의 2025학번 전후 필수 6/택3 조건을 반영했다. 2018 이전 학번은 별도 지원 범위로 남긴다.',
    nextAction: '2018 이전 학번 및 심화·복수전공 예외를 별도 컨텍스트로 모델링한다.',
  },
  {
    layerId: 'gist-bachelor-manual-2026',
    page: 25,
    title: '환경·에너지 continuation, 생명과학 전공필수, 콜로퀴움/과학기술과 경제 설명',
    status: 'partial',
    reason:
      'BS/EV 전공필수와 주요 대체 조건은 source-backed rule/equivalency로 분리됐지만, 2010~2017학번 EV 과거 요건과 생명-화학 복수전공 중복인정 예외는 별도 컨텍스트가 필요하다.',
    nextAction:
      '복수전공/과거 학번 지원 범위를 확장할 때 EV 2010~2017 요건과 생명-화학 중복인정 예외를 별도 rule/evaluator로 분리한다.',
  },
  {
    layerId: 'gist-bachelor-manual-2026',
    page: 26,
    title: '학사논문연구 수강자격과 이수 절차',
    status: 'deferred',
    reason:
      '현재 catalog는 학사논문연구 I/II 필수 이수만 표현하고, 90학점/GPA/계절학기/심사 절차는 evaluator scope가 따로 필요하다.',
    nextAction: '학사논문연구 자격 판정을 졸업판정에 포함할지 결정한 뒤 evaluatorId 계약을 설계한다.',
  },
  {
    layerId: 'gist-bachelor-manual-2026',
    page: 27,
    title: '부전공 일반, EC, AI융합, 물리 부전공',
    status: 'partial',
    reason:
      'EC 최소 18학점, 2천번대 6학점/3·4천번대 12학점 및 2023 이후 성적부가 조건을 반영했다. 물리 필수 택3과 역학·전자기/양자 선택 조건을 바로잡았다. 선언 후 정규 1학기 수학 여부는 입력 컨텍스트가 부족하다.',
    nextAction: '선언 후 정규 1학기 수학 여부의 입력 컨텍스트를 추가한다.',
  },
  {
    layerId: 'gist-bachelor-manual-2026',
    page: 28,
    title: '화학, 수리과학, 신소재, 기계로봇, 환경·에너지 부전공',
    status: 'partial',
    reason:
      '2026 수학 필수 2+1+1과목과 선택 6학점, 이전 GS2003 특례, 2018학번 이후 MA 필수2+상위3 조건을 반영했다. EV 대체 조건과 일부 부전공의 세부 분배는 정밀화가 남아 있다.',
    nextAction: 'EV 대체 조건과 나머지 부전공 세부 분배를 source-backed rule 후보로 분리한다.',
  },
  {
    layerId: 'gist-bachelor-manual-2026',
    page: 29,
    title: '생명, 의생명, 에너지, 문화기술, 지능로봇, 인문사회 부전공',
    status: 'partial',
    reason:
      '생명 강의2+실험1, 의생명/에너지 5과목, CT·인문사회 편람 과목표를 반영했다. IR 임의 AI 코드 인정은 제거하고 지정·기이수 경과조치는 needs_review로 표시한다.',
    nextAction: 'IR 지정 AI 전체 목록과 2020 이전 인문사회 단일/연계/개편 선택 컨텍스트를 확인한다.',
  },
  {
    layerId: 'gist-bachelor-manual-2026',
    page: 30,
    title: '복수전공과 심화전공',
    status: 'deferred',
    reason:
      'rule schema는 복수전공/심화전공 program kind와 program-kind별 선언 학기 컨텍스트를 표현할 수 있지만, p.30의 실제 판정 rule/evaluator는 아직 publish catalog에 넣지 않았다.',
    nextAction:
      '복수전공/심화전공을 런타임 판정에 포함할 때 p.30의 이수학점/신청 조건을 source-backed rule 또는 evaluator 계약으로 분리한다.',
  },
  {
    layerId: 'gist-bachelor-manual-2026',
    page: 31,
    title: '예체능 수업 운영과 편성 현황',
    status: 'out-of-scope',
    reason:
      '동일 학기 수강 제한, 수강료, 개설 변동은 수강신청 운영 규칙이며 현재 졸업요건 evaluator는 이수 학기 수만 판정한다.',
    nextAction: '수강계획 추천에서 필요해질 때 schedule/advising rule로 분리한다.',
  },
  {
    layerId: 'gist-bachelor-manual-2026',
    page: 32,
    title: '졸업요건 장 시작, 총학점/GPA, 체육실기 목록',
    status: 'partial',
    reason:
      '총학점과 GPA는 p.33~34 표를 주 근거로 두고 p.32를 보조 sourceRef로 추가했다. 체육실기 목록은 course set 운영 데이터로 분리되어 있다.',
    nextAction:
      '체육실기 과목 목록까지 publish catalog provenance로 관리할지 결정되면 별도 course set catalog로 분리한다.',
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
