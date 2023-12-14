import { ChangeEvent, ComponentType, HTMLInputTypeAttribute } from 'react';
import { Box, Input, NumberInput, Select, TextInput, TextInputProps } from '@mantine/core';

export const section_titles = [
  '신청자 정보',
  '기초 및 교양 학점',
  '전공 | 연구 | 자유선택 학점',
  '무학점 필수',
  '해외대학 학점',
] as const;

export type SectionTitleType = typeof section_titles[number];

export type InputOrUncontrolledComponentProps<C extends ComponentType<any>> = {
  controlled?: boolean;
  rhf_name: string;
  label: string;
  placeholder?: string;
  component?: C;
  type?: HTMLInputTypeAttribute;
  props?: C extends ComponentType<infer P> ? P : never;
};

export const sections: Array<{
  title: string;
  section_label: SectionTitleType;
  inputs: Array<
    InputOrUncontrolledComponentProps<
      typeof TextInput | typeof Select | typeof NumberInput | typeof Box | typeof Input
    >
  >;
}> = [
  {
    title: 'user_info',
    section_label: '신청자 정보',
    inputs: [
      {
        rhf_name: 'date',
        label: '신청 기간',
        type: 'month',
        placeholder: 'YYYY .MM',
        props: {
          w: 'fit-content',
        },
      },
      {
        component: Select,
        rhf_name: 'semester',
        label: '전/후반기',
        placeholder: '전/후반기',
        props: {
          data: [
            { value: '전반기', label: '전반기' },
            { value: '후반기', label: '후반기' },
          ],
        },
      },
      {
        component: Select,
        rhf_name: 'affiliation',
        label: '소속',
        placeholder: '소속을 입력하세요',
        props: {
          data: [
            { value: '전기전자컴퓨터공학부', label: '전기전자컴퓨터공학부' },
            { value: '전기전자컴퓨터공학부-1', label: '전기전자컴퓨터공학부-1' },
            { value: '전기전자컴퓨터공학부-2', label: '전기전자컴퓨터공학부-2' },
            { value: '전기전자컴퓨터공학부-3', label: '전기전자컴퓨터공학부-3' },
          ],
        },
      },
      {
        rhf_name: 'studentNumber',
        label: '학번',
        placeholder: '학번을 입력하세요',
        type: 'text',
        props: {
          maxLength: 8,
        },
      },
      {
        rhf_name: 'name',
        label: '성명',
        placeholder: '성명을 입력하세요',
        type: 'text',
        props: { maxLength: 10 },
      },
      {
        rhf_name: 'contact',
        label: '연락처',
        placeholder: '연락처를 입력하세요',
        type: 'tel',
        props: {
          pattern: '[0-9]{3}-[0-9]{4}-[0-9]{4}',
          maxLength: 13,
          onInput: (e: ChangeEvent<HTMLInputElement>) => {
            e.target.value = autoHypenPhone(e.target.value);
          },
        },
      },
    ],
  },
  {
    title: 'user_b&c_credits',
    section_label: '기초 및 교양 학점',
    inputs: [
      {
        component: NumberInput,
        rhf_name: 'languageBasics.completed',
        label: '언어의 기초(이수 완료)',
        placeholder: '언어의 기초 학점을 입력하세요',
        props: {
          miw: '50%',
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'languageBasics.inProgress',
        label: '언어의 기초(이수 중)',
        placeholder: '언어의 기초 학점을 입력하세요',
        props: {
          miw: '50%',
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: TextInput,
        rhf_name: 'languageBasics.total',
        label: '언어의 기초(합계)',
        props: {
          disabled: true,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'humanitiesAndSocial.completed',
        label: '인문사회(이수 완료)',
        placeholder: '인문사회 학점을 입력하세요',
        props: {
          miw: '50%',
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'humanitiesAndSocial.inProgress',
        label: '인문사회(이수 중)',
        placeholder: '인문사회 학점을 입력하세요',
        props: {
          miw: '50%',
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'software',
        label: '소프트웨어',
        placeholder: '소프트웨어 학점을 입력하세요',
        props: {
          miw: '50%',
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'basicScience',
        label: '기초과학',
        placeholder: '기초과학 학점을 입력하세요',
        props: {
          miw: '50%',
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'gistFreshman',
        label: 'GIST 새내기',
        placeholder: 'GIST 새내기 학점을 입력하세요',
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'gistMajorExploration',
        label: 'GIST 전공탐색',
        placeholder: 'GIST 전공탐색 학점을 입력하세요',
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
    ],
  },
  {
    title: 'mrf_credits',
    section_label: '전공 | 연구 | 자유선택 학점',
    inputs: [
      {
        component: NumberInput,
        rhf_name: 'majorRequired',
        label: '전공필수',
        placeholder: '전공필수 학점을 입력하세요',
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'majorElective',
        label: '전공선택',
        placeholder: '전공선택 학점을 입력하세요',
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'thesisResearch',
        label: '학사논문연구',
        placeholder: '학사논문연구 학점을 입력하세요',
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'universityCommonSubjects',
        label: '대학 공통 교과목',
        placeholder: '대학 공통 교과목 학점을 입력하세요',
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'humanitiesAndSocial',
        label: '인문사회',
        placeholder: '인문사회 학점을 입력하세요',
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'languageSelectionSoftware',
        label: '언어선택/소프트웨어',
        placeholder: '언어선택/소프트웨어 학점을 입력하세요',
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'basicScienceSelection',
        label: '기초과학선택',
        placeholder: '기초과학선택 학점을 입력하세요',
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'otherMajor',
        label: '타전공',
        placeholder: '타전공 학점을 입력하세요',
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'graduateSchoolSubjects',
        label: '대학원 교과목',
        placeholder: '대학원 교과목 학점을 입력하세요',
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
    ],
  },
  {
    title: 'no_credit_required',
    section_label: '무학점 필수',
    inputs: [
      {
        rhf_name: 'artPracticalSkills',
        label: '예능실기',
        placeholder: '예능실기 학점을 입력하세요',
      },
      {
        rhf_name: 'physicalEducationPracticalSkills',
        label: '체육실기',
        placeholder: '체육실기 학점을 입력하세요',
      },
      {
        rhf_name: 'gistCollegeColloquium',
        label: 'GIST대학 콜로퀴움',
        placeholder: 'GIST대학 콜로퀴움 학점을 입력하세요',
      },
    ],
  },
  {
    title: 'overseas_university_credits',
    section_label: '해외대학 학점',
    inputs: [
      {
        rhf_name: 'summerSemesterSubjectsAndCredits',
        label: '해외대학 여름학기 파견 이수 인정 교과목 및 학점',
        placeholder: '해외대학 여름학기 파견 이수 인정 교과목 및 학점을 입력하세요',
      },
      {
        rhf_name: 'dispatchUniversityName',
        label: '파견 대학명',
        placeholder: '파견 대학명을 입력하세요',
      },
      {
        rhf_name: 'overseasSubjectName',
        label: '교과목 명',
        placeholder: '교과목 명을 입력하세요',
      },
      {
        rhf_name: 'overseasDispatchSemester',
        label: '파견학기',
        placeholder: '파견학기를 입력하세요',
      },
      {
        rhf_name: 'studyAbroadProgramSubjectsAndCredits',
        label: 'Study Abroad Program 이수 교과목 및 학점',
        placeholder: 'Study Abroad Program 이수 교과목 및 학점을 입력하세요',
      },
      {
        rhf_name: 'studyAbroadDispatchUniversityName',
        label: '파견 대학명',
        placeholder: '파견 대학명을 입력하세요',
      },
      {
        rhf_name: 'studyAbroadSubjectName',
        label: '교과목 명',
        placeholder: '교과목 명을 입력하세요',
      },
      {
        rhf_name: 'studyAbroadDispatchSemester',
        label: '파견학기',
        placeholder: '파견학기를 입력하세요',
      },
    ],
  },
];

const autoHypenPhone = (str: string) => {
  str = str.replace(/[^0-9]/g, '');
  return str.length < 4
    ? str
    : str.length < 7
    ? str.substring(0, 3) + '-' + str.substring(3)
    : str.length < 11
    ? str.substring(0, 3) + '-' + str.substring(3, 6) + '-' + str.substring(6)
    : str.substring(0, 3) + '-' + str.substring(3, 7) + '-' + str.substring(7);
};
