import { RuleSet } from '@lib/types/grad-matcher-rule-types';

const defaultMessages = {
  satisfied: '충족됨 — 최소 {min}학점, 현재 {total}학점',
  unsatisfied: '미충족 — 최소 {min}학점 필요, 현재 {total}학점 (부족 {lack}학점)',
  noneRequired: '필수 이수학점이 없는 영역입니다.',
};

export const RULESETS: RuleSet[] = [
  {
    id: '2018-2020',
    cohort: { fromYear: 2018, toYear: 2020 },
    categories: [
      {
        id: 'languageBasic',
        label: '언어의 기초',
        minCredits: 7,
        matchers: [{ type: 'codeIn', value: ['GS1601', 'GS1513', 'GS2652'] }],
        consumes: true,
        messageTemplate: defaultMessages,
      },
      {
        id: 'scienceBasic',
        label: '기초과학',
        minCredits: 17,
        matchers: [
          {
            type: 'codeIn',
            value: [
              'GS1001',
              'GS1101',
              'GS1111',
              'GS1201',
              'GS1302',
              'GS2001',
              'BS2204',
              'GS1301',
              'GS1311',
              'GS1401',
              'GS2002',
              'GS2004',
              'GS2408', // 예시 output에서 scienceBasic에 포함
            ],
          },
        ],
        consumes: true,
        messageTemplate: defaultMessages,
      },
      {
        id: 'major',
        label: '전공',
        minCredits: 36,
        // 기본은 request.userMajor(prefix)로 잡고,
        // 만약 userMajor가 없으면 아래 codePrefix(EC) 같은 fallback을 쓰고 싶다면 matcher를 추가하면 됨.
        matchers: [
          { type: 'dynamicMajorPrefix' }, // userMajor 우선
          { type: 'codePrefix', value: 'EC' }, // fallback (너 프로젝트가 EC인 경우가 많아서)
        ],
        consumes: true,
        messageTemplate: defaultMessages,
      },
      {
        id: 'minor',
        label: '부전공',
        minCredits: 0,
        matchers: [{ type: 'dynamicMinorPrefixes' }],
        consumes: true, // 부전공 과목은 전공/기타와 중복 집계 피하고 싶으면 true
        messageTemplate: defaultMessages,
      },
      {
        id: 'humanities',
        label: '인문사회',
        minCredits: 24,
        matchers: [
          {
            type: 'codeIn',
            value: [
              'GS2734',
              'GS2731',
              'GS3786',
              'GS2544',
              'GS2614',
              'GS2475',
              'GS2707',
              'GS2743',
              'GS3401',
              'GS0700',
            ],
          },
        ],
        consumes: true,
        messageTemplate: defaultMessages,
      },
      {
        id: 'etcMandatory',
        label: '기타필수',
        minCredits: 8,
        matchers: [{ type: 'codeIn', value: ['GS1901', 'UC0901', 'UC0202', 'UC9331'] }],
        consumes: true,
        messageTemplate: defaultMessages,
      },
      {
        id: 'otherUncheckedClass',
        label: '기타(미분류)',
        minCredits: 0,
        matchers: [{ type: 'codeRegex', value: '.*' }], // 남은 과목 전부
        consumes: true,
        messageTemplate: defaultMessages,
      },
    ],
  },

  {
    id: '2021+',
    cohort: { fromYear: 2021 },
    categories: [
      // TODO: 2021+ 규정은 여기에 정의
      // (이 구조는 똑같고, 값만 다르게 넣으면 됨)
      // categories: [...]
    ],
  },
];
