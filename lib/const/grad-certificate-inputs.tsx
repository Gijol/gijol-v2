import { ChangeEvent, ComponentType, HTMLInputTypeAttribute, ReactNode } from 'react';
import {
  Box,
  Col,
  Divider,
  Input,
  MultiSelect,
  NumberInput,
  Select,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { MonthPickerInput } from '@mantine/dates';
import { UseFormReturn } from 'react-hook-form';

export const section_titles = [
  '신청자 정보',
  '기초 및 교양 학점',
  '전공 | 연구 | 자유선택 학점',
  '무학점 필수',
  '기타 학점',
] as const;

export type SectionTitleType = typeof section_titles[number];

export type InputOrUncontrolledComponentProps<C extends ComponentType<any>> = {
  controlled?: boolean;
  rhf_name?: string;
  label?: string;
  placeholder?: string;
  component?: C;
  type?: HTMLInputTypeAttribute;
  props?: C extends ComponentType<infer P> ? P : never;
  laterThan2021?: boolean;
};

export const generateInputSections: (context: UseFormReturn<any, undefined>) => Array<{
  title: string;
  section_label: SectionTitleType;
  inputs: Array<
    InputOrUncontrolledComponentProps<
      | typeof TextInput
      | typeof Select
      | typeof NumberInput
      | typeof Box
      | typeof Input
      | typeof MonthPickerInput
      | typeof Divider
      | typeof Col
      | typeof Title
      | typeof MultiSelect
    >
  >;
}> = (context) => [
  {
    title: 'USER',
    section_label: '신청자 정보',
    inputs: [
      {
        rhf_name: 'USER.date',
        type: 'month',
        label: '신청 기간',
        placeholder: 'YYYY .MM',
        props: {
          w: 'fit-content',
        },
      },
      {
        component: Select,
        rhf_name: 'USER.semester',
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
        rhf_name: 'USER.affiliation',
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
        rhf_name: 'USER.student_number',
        label: '학번',
        placeholder: '학번을 입력하세요',
        type: 'text',
        props: {
          maxLength: 8,
        },
      },
      {
        rhf_name: 'USER.name',
        label: '성명',
        placeholder: '성명을 입력하세요',
        type: 'text',
        props: { maxLength: 10 },
      },
      {
        rhf_name: 'USER.contact',
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
    title: 'user_b_c_credits',
    section_label: '기초 및 교양 학점',
    inputs: [
      {
        component: NumberInput,
        rhf_name: 'B_C.languageBasics.completed',
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
        rhf_name: 'B_C.languageBasics.inProgress',
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
        rhf_name: 'B_C.languageBasics.total',
        label: '언어의 기초(합계)',
        props: {
          disabled: true,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'B_C.humanitiesAndSocial.completed',
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
        rhf_name: 'B_C.humanitiesAndSocial.inProgress',
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
        component: TextInput,
        rhf_name: 'B_C.humanitiesAndSocial.total',
        label: '인문사회(합계)',
        props: {
          disabled: true,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'B_C.software.completed',
        label: '소프트웨어(이수 완료)',
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
        rhf_name: 'B_C.software.inProgress',
        label: '소프트웨어(이수 중)',
        placeholder: '소프트웨어 학점을 입력하세요',
        props: {
          miw: '50%',
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: TextInput,
        rhf_name: 'B_C.software.total',
        label: '소프트웨어(합계)',
        props: {
          disabled: true,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'B_C.basicScience.completed',
        label: '기초과학(이수 완료)',
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
        rhf_name: 'B_C.basicScience.inProgress',
        label: '기초과학(이수 중)',
        placeholder: '기초과학 학점을 입력하세요',
        props: {
          miw: '50%',
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: TextInput,
        rhf_name: 'B_C.basicScience.total',
        label: '기초과학(합계)',
        props: {
          disabled: true,
        },
      },
      {
        component: Divider,
        controlled: false,
        props: {
          mt: 'md',
          labelPosition: 'center',
          label: '이 부분은 학번에 따라 다르니 유의하세요! ⚠️',
          color: 'red',
        },
      },
      {
        component: NumberInput,
        rhf_name: 'B_C.gistFreshman.completed',
        label: 'GIST 새내기(이수 완료)',
        placeholder: 'GIST 새내기 학점을 입력하세요',
        laterThan2021: true,
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'B_C.gistFreshman.inProgress',
        label: 'GIST 새내기(이수 중)',
        placeholder: 'GIST 새내기 학점을 입력하세요',
        laterThan2021: true,
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: TextInput,
        rhf_name: 'B_C.gistFreshman.total',
        label: 'GIST 새내기(합계)',
        laterThan2021: true,
        props: {
          disabled: true,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'B_C.gistMajorExploration.completed',
        label: 'GIST 전공탐색(이수 완료)',
        placeholder: 'GIST 전공탐색 학점을 입력하세요',
        laterThan2021: true,
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'B_C.gistMajorExploration.inProgress',
        label: 'GIST 전공탐색(이수 중)',
        placeholder: 'GIST 전공탐색 학점을 입력하세요',
        laterThan2021: true,
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'B_C.newcomer_seminar.completed',
        label: '신입생세미나(이수 완료)',
        placeholder: '신입생 세미나 학점',
        laterThan2021: false,
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'B_C.newcomer_seminar.inProgress',
        label: '신입생세미나(이수 중)',
        placeholder: '신입생 세미나 학점',
        laterThan2021: false,
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: TextInput,
        rhf_name: 'B_C.newcomer_seminar.total',
        label: '신입생세미나(합계)',
        laterThan2021: false,
        props: {
          disabled: true,
        },
      },
      {
        component: TextInput,
        rhf_name: 'B_C.gistMajorExploration.total',
        label: 'GIST 전공탐색(합계)',
        laterThan2021: true,
        props: {
          disabled: true,
        },
      },
    ],
  },
  {
    title: 'mrf_credits',
    section_label: '전공 | 연구 | 자유선택 학점',
    inputs: [
      {
        component: Title,
        controlled: false,
        props: {
          order: 5,
          children: '전공학점',
          mt: 'md',
        },
      },
      {
        component: NumberInput,
        rhf_name: 'M_R_F.majorRequired.completed',
        label: '전공필수(이수완료)',
        placeholder: '전공필수 학점을 입력하세요',
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'M_R_F.majorRequired.inProgress',
        label: '전공필수(이수중)',
        placeholder: '전공필수 학점을 입력하세요',
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: TextInput,
        rhf_name: 'M_R_F.majorRequired.total',
        label: '전공필수(합계)',
        props: {
          disabled: true,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'M_R_F.majorElective.completed',
        label: '전공선택(이수완료)',
        placeholder: '전공선택 학점을 입력하세요',
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'M_R_F.majorElective.inProgress',
        label: '전공선택(이수중)',
        placeholder: '전공선택 학점을 입력하세요',
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: TextInput,
        rhf_name: 'M_R_F.majorElective.total',
        label: '전공선택(합계)',
        props: {
          disabled: true,
        },
      },
      {
        component: Title,
        controlled: false,
        props: {
          order: 5,
          children: '연구학점',
          mt: 40,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'M_R_F.thesisResearch.completed',
        label: '학사논문연구(이수완료)',
        placeholder: '학사논문연구 학점을 입력하세요',
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'M_R_F.thesisResearch.inProgress',
        label: '학사논문연구(이수중)',
        placeholder: '학사논문연구 학점을 입력하세요',
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: TextInput,
        rhf_name: 'M_R_F.thesisResearch.total',
        label: '학사논문연구(합계)',
        props: { disabled: true },
      },
      {
        component: Title,
        controlled: false,
        props: {
          order: 5,
          children: '자유선택 학점',
          mt: 40,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'M_R_F.universityCommonSubjects.completed',
        label: '대학 공통 교과목(이수완료)',
        placeholder: '대학 공통 교과목 학점을 입력하세요',
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'M_R_F.universityCommonSubjects.inProgress',
        label: '대학 공통 교과목(이수중)',
        placeholder: '대학 공통 교과목 학점을 입력하세요',
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: TextInput,
        rhf_name: 'M_R_F.universityCommonSubjects.total',
        label: '대학 공통 교과목(합계)',
        props: { disabled: true },
      },
      {
        component: NumberInput,
        rhf_name: 'M_R_F.humanitiesAndSocial.completed',
        label: '인문사회(이수완료)',
        placeholder: '인문사회 학점을 입력하세요',
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'M_R_F.humanitiesAndSocial.inProgress',
        label: '인문사회(이수중)',
        placeholder: '인문사회 학점을 입력하세요',
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: TextInput,
        rhf_name: 'M_R_F.humanitiesAndSocial.total',
        label: '인문사회(합계)',
        props: { disabled: true },
      },
      {
        component: NumberInput,
        rhf_name: 'M_R_F.languageSelectionSoftware.completed',
        label: '언어선택/소프트웨어(이수완료)',
        placeholder: '언어선택/소프트웨어 학점을 입력하세요',
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: NumberInput,
        label: 'M_R_F.언어선택/소프트웨어(이수중)',
        rhf_name: 'M_R_F.languageSelectionSoftware.inProgress',
        placeholder: '언어선택/소프트웨어 학점을 입력하세요',
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: TextInput,
        rhf_name: 'M_R_F.languageSelectionSoftware.total',
        label: '언어선택/소프트웨어(합계)',
        props: { disabled: true },
      },
      {
        component: NumberInput,
        rhf_name: 'M_R_F.basicScienceSelection.completed',
        label: '기초과학선택(이수완료)',
        placeholder: '기초과학선택 학점을 입력하세요',
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'M_R_F.basicScienceSelection.inProgress',
        label: '기초과학선택(이수중)',
        placeholder: '기초과학선택 학점을 입력하세요',
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: TextInput,
        rhf_name: 'M_R_F.basicScienceSelection.total',
        label: '기초과학선택(합계)',
        props: { disabled: true },
      },
      {
        component: NumberInput,
        rhf_name: 'M_R_F.otherMajor.completed',
        label: '타전공(이수완료)',
        placeholder: '타전공 학점을 입력하세요',
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'M_R_F.otherMajor.inProgress',
        label: '타전공(이수중)',
        placeholder: '타전공 학점을 입력하세요',
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: TextInput,
        rhf_name: 'M_R_F.otherMajor.total',
        label: '타전공(합계)',
        props: { disabled: true },
      },
      {
        component: NumberInput,
        rhf_name: 'M_R_F.graduateSchoolSubjects.completed',
        label: '대학원 교과목(이수완료)',
        placeholder: '대학원 교과목 학점을 입력하세요',
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'M_R_F.graduateSchoolSubjects.inProgress',
        label: '대학원 교과목(이수중)',
        placeholder: '대학원 교과목 학점을 입력하세요',
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: TextInput,
        rhf_name: 'M_R_F.graduateSchoolSubjects.total',
        label: '대학원 교과목(합계)',
        props: { disabled: true },
      },
    ],
  },
  {
    title: 'no_credit_required',
    section_label: '무학점 필수',
    inputs: [
      {
        component: NumberInput,
        rhf_name: 'NOC.artPracticalSkills.completed',
        label: '예능실기(이수완료)',
        placeholder: '예능실기 학점을 입력하세요',
        props: {
          defaultValue: 0,
          min: 0,
          max: 200,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'NOC.artPracticalSkills.inProgress',
        label: '예능실기(이수중)',
        placeholder: '예능실기 학점을 입력하세요',
        props: {
          defaultValue: 0,
          min: 0,
          max: 200,
        },
      },
      {
        component: TextInput,
        rhf_name: 'NOC.artPracticalSkills.total',
        label: '예능실기(합계)',
        props: {
          disabled: true,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'NOC.physicalEducationPracticalSkills.completed',
        label: '체육실기(이수완료)',
        placeholder: '체육실기 학점을 입력하세요',
        props: {
          defaultValue: 0,
          min: 0,
          max: 200,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'NOC.physicalEducationPracticalSkills.inProgress',
        label: '체육실기(이수중)',
        placeholder: '체육실기 학점을 입력하세요',
        props: {
          defaultValue: 0,
          min: 0,
          max: 200,
        },
      },
      {
        component: TextInput,
        rhf_name: 'NOC.physicalEducationPracticalSkills.total',
        label: '체육실기(합계)',
        props: {
          disabled: true,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'NOC.gistCollegeColloquium.completed',
        label: 'GIST 대학 콜로퀴움',
        placeholder: 'GIST 대학 콜로퀴움 학점을 입력하세요',
        props: {
          defaultValue: 0,
          min: 0,
          max: 200,
        },
      },
      {
        component: NumberInput,
        rhf_name: 'NOC.gistCollegeColloquium.inProgress',
        label: 'GIST 대학 콜로퀴움',
        placeholder: 'GIST 대학 콜로퀴움 학점을 입력하세요',
        props: {
          defaultValue: 0,
          min: 0,
          max: 200,
        },
      },
      {
        component: TextInput,
        rhf_name: 'NOC.gistCollegeColloquium.total',
        label: 'GIST 대학 콜로퀴움',
        props: { disabled: true },
      },
    ],
  },
  {
    title: 'overseas_university',
    section_label: '기타 학점',
    inputs: [
      {
        component: Title,
        controlled: false,
        props: { order: 5, children: '해외대학 여름학기 파견 관련 학점', mt: 'md' },
      },
      {
        component: NumberInput,
        rhf_name: 'OU.summer_session.total_credits',
        label: '총 이수 학점',
        placeholder: '해외대학 여름학기 파견 이수 인정 교과목 및 학점을 입력하세요',
        props: {
          min: 0,
          max: 200,
          defaultValue: 0,
        },
      },
      {
        component: Select,
        rhf_name: 'OU.summer_session.university_name',
        label: '대학명',
        placeholder: '파견된 대학명을 입력하세요',
        props: {
          data: ['UC Berkeley', 'Boston University'],
          searchable: true,
          creatable: true,
          getCreateLabel: (query: string) => `+ ${query} 생성하기`,
          onCreate: (query: string) => {
            context.setValue('OU.summer_session.university_name', query);
          },
        },
      },
      {
        component: MultiSelect,
        rhf_name: 'OU.summer_session.subjects',
        label: '이수한 강의들',
        placeholder: '교과목 명을 입력하세요',
        props: {
          data: context.watch('OU.summer_session.subjects') ?? [],
          searchable: true,
          creatable: true,
          getCreateLabel: (query: string) => `+ ${query} 생성하기`,
          onCreate: (query: string) => {
            context.setValue('OU.summer_session.subjects', [
              ...context.getValues('OU.summer_session.subjects'),
              query,
            ]);
          },
        },
      },
      {
        rhf_name: 'OU.summer_session.semester',
        label: '파견학기',
        placeholder: '파견학기를 입력하세요',
      },
      {
        component: Title,
        controlled: false,
        props: { order: 5, children: 'Study Abroad Program 관련 학점', mt: 40 },
      },
      {
        rhf_name: 'OU.study_abroad_program.total_credits',
        label: '총 이수 학점',
        placeholder: 'Study Abroad Program 이수 교과목 및 학점을 입력하세요',
      },
      {
        rhf_name: 'OU.study_abroad_program.university_name',
        label: '파견 대학명',
        placeholder: '파견 대학명을 입력하세요',
      },
      {
        rhf_name: 'OU.study_abroad_program.subjects',
        label: '교과목 명',
        placeholder: '교과목 명을 입력하세요',
      },
      {
        rhf_name: 'OU.study_abroad_program.semester',
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
