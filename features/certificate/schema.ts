import { z } from 'zod';

export const creditValueSchema = z.object({
  completed: z.number().nonnegative().default(0),
  inProgress: z.number().nonnegative().default(0),
  total: z.number().nonnegative().default(0),
});

export type CreditValue = z.infer<typeof creditValueSchema>;

export const otherUnitSchema = z.object({
  credits: z.number().optional(),
  university: z.string().default(''),
  subjects: z.array(z.string()).default([]),
  semester: z.string().default(''),
});

export type OtherUnit = z.infer<typeof otherUnitSchema>;

export const certificateFormSchema = z.object({
  USER: z.object({
    date: z.string().min(1, '신청 기간을 입력해주세요'),
    semester: z.enum(['전반기', '후반기'], { error: '전/후반기를 선택해주세요' }),
    affiliation: z.string().min(1, '소속을 선택해주세요'),
    studentNumber: z
      .string()
      .min(1, '학번을 입력해주세요')
      .regex(/^\d{8}$/, '학번은 8자리 숫자여야 합니다')
      .refine(
        (val) => {
          const year = parseInt(val.substring(0, 4));
          const currentYear = new Date().getFullYear();
          return year >= 2018 && year <= currentYear;
        },
        { message: '2018학번 이후부터 서비스 이용이 가능합니다' },
      ),
    name: z.string().min(1, '성명을 입력해주세요'),
    contact: z.string().min(1, '연락처를 입력해주세요'),
    majorDetails: z.string().default(''),
    minorMajor: z.string().default(''), // 부전공
    doubleMajor: z.string().default(''), // 복수전공
    intensiveMajor: z.string().default(''), // 심화전공
  }),
  B_C: z.object({
    languageBasics: creditValueSchema,
    humanitiesAndSocial: creditValueSchema,
    software: creditValueSchema,
    basicScience: creditValueSchema,
    gistFreshman: creditValueSchema,
    gistMajorExploration: creditValueSchema,
    freshmanSeminar: creditValueSchema,
  }),
  M_R_F: z.object({
    majorRequired: creditValueSchema,
    majorElective: creditValueSchema,
    thesisResearch: creditValueSchema,
    universityCommonSubjects: creditValueSchema,
    humanitiesAndSocial: creditValueSchema,
    languageSelectionSoftware: creditValueSchema,
    basicScienceSelection: creditValueSchema,
    otherMajor: creditValueSchema,
    graduateSchoolSubjects: creditValueSchema,
  }),
  NC: z.object({
    arts: creditValueSchema,
    sports: creditValueSchema,
    colloquium: creditValueSchema,
  }),
  OU: z.object({
    summerSession: otherUnitSchema,
    studyAbroad: otherUnitSchema,
  }),
});

export type CertificateFormValues = z.infer<typeof certificateFormSchema>;
