import { MANUAL_PROGRAM_COURSES } from './manual-program-courses';

export type AcademicProgramKind = 'major' | 'minor';
export type CourseSetKind = 'majors' | 'minors';

export interface AcademicProgramDefinition {
  id: string;
  kind: AcademicProgramKind;
  canonicalCode: string;
  label: string;
  fullName: string;
  courseSetKind: CourseSetKind;
  courseSetName: string;
  coursePrefixes: readonly string[];
  codeAliases?: readonly string[];
  textAliases?: readonly string[];
  selectable?: boolean;
}

export type AcademicProgramOption = {
  value: string;
  label: string;
};

export const MAJOR_PROGRAMS = [
  {
    id: 'major.mc',
    kind: 'major',
    canonicalCode: 'MC',
    label: '기계로봇공학과',
    fullName: '공과대학 기계로봇공학과',
    courseSetKind: 'majors',
    courseSetName: '공과대학 기계로봇공학과',
    coursePrefixes: ['MC'],
    codeAliases: ['ME', 'MECH'],
    textAliases: ['기계로봇공학과', '기계로봇'],
  },
  {
    id: 'major.ma',
    kind: 'major',
    canonicalCode: 'MA',
    label: '신소재공학과',
    fullName: '공과대학 신소재공학과',
    courseSetKind: 'majors',
    courseSetName: '공과대학 신소재공학과',
    coursePrefixes: ['MA'],
    codeAliases: ['MSE', 'MT'],
    textAliases: ['신소재공학과', '신소재'],
  },
  {
    id: 'major.ev',
    kind: 'major',
    canonicalCode: 'EV',
    label: '환경·에너지공학과',
    fullName: '공과대학 환경·에너지공학과',
    courseSetKind: 'majors',
    courseSetName: '공과대학 환경·에너지공학과',
    coursePrefixes: ['EV'],
    textAliases: ['환경에너지공학과', '환경에너지'],
  },
  {
    id: 'major.bs',
    kind: 'major',
    canonicalCode: 'BS',
    label: '생명과학과',
    fullName: '생명·의과학융합대학 생명과학과',
    courseSetKind: 'majors',
    courseSetName: '생명·의과학융합대학 생명과학과',
    coursePrefixes: ['BS'],
    codeAliases: ['BIO'],
    textAliases: ['생명과학과', '생명과학'],
  },
  {
    id: 'major.fe',
    selectable: false,
    kind: 'major',
    canonicalCode: 'FE',
    label: '의생명공학과',
    fullName: '생명·의과학융합대학 의생명공학과',
    courseSetKind: 'majors',
    courseSetName: '생명·의과학융합대학 의생명공학과',
    coursePrefixes: ['FE', 'MD'],
    codeAliases: ['BE', 'BIOMED', 'BIOMEDICAL'],
    textAliases: ['의생명공학과', '의생명'],
  },
  {
    id: 'major.ps',
    kind: 'major',
    canonicalCode: 'PS',
    label: '물리·광과학과',
    fullName: '자연과학대학 물리·광과학과',
    courseSetKind: 'majors',
    courseSetName: '자연과학대학 물리·광과학과',
    coursePrefixes: ['PS'],
    codeAliases: ['PH', 'PHYSICS'],
    textAliases: ['물리광과학과', '물리광과학'],
  },
  {
    id: 'major.mm',
    kind: 'major',
    canonicalCode: 'MM',
    label: '수리과학과',
    fullName: '자연과학대학 수리과학과',
    courseSetKind: 'majors',
    courseSetName: '자연과학대학 수리과학과',
    coursePrefixes: ['MM'],
    textAliases: ['수리과학과', '수리과학'],
  },
  {
    id: 'major.ch',
    kind: 'major',
    canonicalCode: 'CH',
    label: '화학과',
    fullName: '자연과학대학 화학과',
    courseSetKind: 'majors',
    courseSetName: '자연과학대학 화학과',
    coursePrefixes: ['CH'],
    textAliases: ['화학과'],
  },
  {
    id: 'major.ai',
    kind: 'major',
    canonicalCode: 'AI',
    label: 'AI융합학과',
    fullName: '정보컴퓨팅대학 AI융합학과',
    courseSetKind: 'majors',
    courseSetName: '정보컴퓨팅대학 AI융합학과',
    coursePrefixes: ['AI'],
    textAliases: ['ai융합학과', 'ai융합'],
  },
  {
    id: 'major.se',
    kind: 'major',
    canonicalCode: 'SE',
    label: '반도체공학과',
    fullName: '정보컴퓨팅대학 반도체공학과',
    courseSetKind: 'majors',
    courseSetName: '정보컴퓨팅대학 반도체공학과',
    coursePrefixes: ['SE'],
    textAliases: ['반도체공학과', '반도체'],
  },
  {
    id: 'major.ec',
    kind: 'major',
    canonicalCode: 'EC',
    label: '전기전자컴퓨터공학과',
    fullName: '정보컴퓨팅대학 전기전자컴퓨터공학과',
    courseSetKind: 'majors',
    courseSetName: '정보컴퓨팅대학 전기전자컴퓨터공학과',
    coursePrefixes: ['EC'],
    codeAliases: ['CS', 'CSE', 'ECE', 'EE', 'EEC', 'EECS'],
    textAliases: [
      '전기전자컴퓨터공학과',
      '전기전자컴퓨터공학부',
      '전기전자컴퓨터',
      '컴퓨터공학과',
      '컴퓨터공학',
      '컴퓨터과학과',
      '컴퓨터과학',
    ],
  },
] as const satisfies readonly AcademicProgramDefinition[];

export const MINOR_PROGRAMS = [
  {
    id: 'minor.ec',
    kind: 'minor',
    canonicalCode: 'EC',
    label: '전기전자컴퓨터공학',
    fullName: '전기전자컴퓨터 부전공',
    courseSetKind: 'minors',
    courseSetName: '전기전자컴퓨터 부전공',
    coursePrefixes: ['EC'],
  },
  {
    id: 'minor.ma',
    kind: 'minor',
    canonicalCode: 'MA',
    label: '신소재공학',
    fullName: '신소재공학 부전공',
    courseSetKind: 'minors',
    courseSetName: '신소재공학 부전공',
    coursePrefixes: ['MA'],
  },
  {
    id: 'minor.mc',
    kind: 'minor',
    canonicalCode: 'MC',
    label: '기계로봇공학',
    fullName: '기계로봇공학 부전공',
    courseSetKind: 'minors',
    courseSetName: '기계로봇공학 부전공',
    coursePrefixes: ['MC'],
  },
  {
    id: 'minor.ev',
    kind: 'minor',
    canonicalCode: 'EV',
    label: '환경·에너지공학',
    fullName: '환경에너지공학 부전공',
    courseSetKind: 'minors',
    courseSetName: '환경에너지공학 부전공',
    coursePrefixes: ['EV'],
  },
  {
    id: 'minor.bs',
    kind: 'minor',
    canonicalCode: 'BS',
    label: '생명과학',
    fullName: '생명과학 부전공',
    courseSetKind: 'minors',
    courseSetName: '생명과학 부전공',
    coursePrefixes: ['BS'],
  },
  {
    id: 'minor.ps',
    kind: 'minor',
    canonicalCode: 'PS',
    label: '물리·광과학',
    fullName: '물리·광과학 부전공',
    courseSetKind: 'minors',
    courseSetName: '물리·광과학 부전공',
    coursePrefixes: ['PS'],
  },
  {
    id: 'minor.ch',
    kind: 'minor',
    canonicalCode: 'CH',
    label: '화학',
    fullName: '화학 부전공',
    courseSetKind: 'minors',
    courseSetName: '화학 부전공',
    coursePrefixes: ['CH'],
  },
  {
    id: 'minor.mm',
    kind: 'minor',
    canonicalCode: 'MM',
    label: '수리과학',
    fullName: '수리과학 부전공',
    courseSetKind: 'minors',
    courseSetName: '수리과학 부전공',
    coursePrefixes: ['MM'],
  },
  {
    id: 'minor.ct',
    kind: 'minor',
    canonicalCode: 'CT',
    label: '문화기술',
    fullName: '문화기술 부전공',
    courseSetKind: 'minors',
    courseSetName: '문화기술 부전공',
    coursePrefixes: ['CT'],
  },
  {
    id: 'minor.lh_lit',
    kind: 'minor',
    canonicalCode: 'LH_LIT',
    label: '인문사회-문학과 역사',
    fullName: '인문사회과학-문학과 역사 부전공',
    courseSetKind: 'minors',
    courseSetName: '인문사회과학-문학과 역사 부전공',
    coursePrefixes: ['LH'],
  },
  {
    id: 'minor.lh_pp',
    kind: 'minor',
    canonicalCode: 'LH_PP',
    label: '인문사회-공공정책',
    fullName: '인문사회과학-공공정책 부전공',
    courseSetKind: 'minors',
    courseSetName: '인문사회과학-공공정책 부전공',
    coursePrefixes: ['LH'],
  },
  {
    id: 'minor.lh_eb',
    kind: 'minor',
    canonicalCode: 'LH_EB',
    label: '인문사회-경제경영',
    fullName: '인문사회과학-경제경영 부전공',
    courseSetKind: 'minors',
    courseSetName: '인문사회과학-경제경영 부전공',
    coursePrefixes: ['EB'],
  },
  {
    id: 'minor.lh_ss',
    kind: 'minor',
    canonicalCode: 'LH_SS',
    label: '인문사회-과학기술과 사회',
    fullName: '인문사회과학-과학기술과 사회 부전공',
    courseSetKind: 'minors',
    courseSetName: '인문사회과학-과학기술과 사회 부전공',
    coursePrefixes: ['SS'],
  },
  {
    id: 'minor.lh_mb',
    kind: 'minor',
    canonicalCode: 'LH_MB',
    label: '인문사회-마음과 행동',
    fullName: '인문사회과학-마음과 행동 부전공',
    courseSetKind: 'minors',
    courseSetName: '인문사회과학-마음과 행동 부전공',
    coursePrefixes: ['MB'],
  },
  {
    id: 'minor.ir',
    kind: 'minor',
    canonicalCode: 'IR',
    label: '지능로봇',
    fullName: '지능로봇 부전공',
    courseSetKind: 'minors',
    courseSetName: '지능로봇 부전공',
    coursePrefixes: ['IR', 'AI'],
  },
  {
    id: 'minor.ai',
    kind: 'minor',
    canonicalCode: 'AI',
    label: 'AI융합',
    fullName: 'AI융합 부전공',
    courseSetKind: 'minors',
    courseSetName: 'AI융합 부전공',
    coursePrefixes: ['AI', 'EC'],
  },
  {
    id: 'minor.fe',
    kind: 'minor',
    canonicalCode: 'FE',
    label: '에너지 (기존 선언자)',
    textAliases: ['에너지'],
    fullName: '에너지 부전공',
    courseSetKind: 'minors',
    courseSetName: '에너지 부전공',
    coursePrefixes: ['FE'],
  },
  {
    id: 'minor.md',
    kind: 'minor',
    canonicalCode: 'MD',
    label: '의생명',
    fullName: '의생명 부전공',
    courseSetKind: 'minors',
    courseSetName: '의생명 부전공',
    coursePrefixes: ['MD'],
  },
  {
    id: 'minor.se',
    selectable: false,
    kind: 'minor',
    canonicalCode: 'SE',
    label: '반도체공학',
    fullName: '반도체공학 부전공',
    courseSetKind: 'majors',
    courseSetName: '정보컴퓨팅대학 반도체공학과',
    coursePrefixes: ['SE'],
  },
] as const satisfies readonly AcademicProgramDefinition[];

export const ACADEMIC_PROGRAMS = [...MAJOR_PROGRAMS, ...MINOR_PROGRAMS] as const;

export const NON_DECLARED_MAJOR_VALUES = new Set(['', 'NONE', 'NO', 'NOMAJOR', 'UNDECLARED']);

function normalizeCode(value?: string | null): string {
  return String(value ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, '');
}

export function normalizeProgramText(value?: string | null): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s·ㆍ・.\-_/()|]/g, '');
}

function normalizeCodeAlias(value: string): string {
  return normalizeCode(value).replace(/_/g, '');
}

function codeMatches(input: string, program: AcademicProgramDefinition): boolean {
  const codeKey = normalizeCode(input);
  const compactKey = normalizeCodeAlias(input);
  const aliases = [program.canonicalCode, ...(program.codeAliases ?? [])];

  return aliases.some((alias) => codeKey === normalizeCode(alias) || compactKey === normalizeCodeAlias(alias));
}

function textMatches(input: string, program: AcademicProgramDefinition): boolean {
  const textKey = normalizeProgramText(input);
  const aliases = [program.label, program.fullName, program.courseSetName, ...(program.textAliases ?? [])];

  return aliases.some((alias) => {
    const aliasKey = normalizeProgramText(alias);
    return textKey === aliasKey || textKey.includes(aliasKey);
  });
}

function findProgramByInput(
  programs: readonly AcademicProgramDefinition[],
  input?: string | null,
): AcademicProgramDefinition | undefined {
  const raw = String(input ?? '').trim();
  if (!raw) return undefined;

  return programs.find((program) => codeMatches(raw, program)) ?? programs.find((program) => textMatches(raw, program));
}

export function findMajorProgram(input?: string | null): AcademicProgramDefinition | undefined {
  return findProgramByInput(MAJOR_PROGRAMS, input);
}

export function findMinorProgram(input?: string | null): AcademicProgramDefinition | undefined {
  return findProgramByInput(MINOR_PROGRAMS, input);
}

export function getMajorProgramByCode(code?: string | null): AcademicProgramDefinition | undefined {
  const normalized = normalizeCode(code);
  return MAJOR_PROGRAMS.find((program) => normalizeCode(program.canonicalCode) === normalized);
}

export function getMinorProgramByCode(code?: string | null): AcademicProgramDefinition | undefined {
  const normalized = normalizeCode(code);
  return MINOR_PROGRAMS.find((program) => normalizeCode(program.canonicalCode) === normalized);
}

export function getCourseCodesForProgram(program: AcademicProgramDefinition): readonly string[] {
  if (program.kind === 'minor')
    return (MANUAL_PROGRAM_COURSES[program.canonicalCode] ?? []).filter((code) => /^[A-Z]+[234]\d{3}$/.test(code));
  return Array.from(new Set(program.coursePrefixes.flatMap((prefix) => MANUAL_PROGRAM_COURSES[prefix] ?? [])));
}

export function getMajorCourseCodes(code?: string | null): readonly string[] {
  const program = getMajorProgramByCode(code);
  return program ? getCourseCodesForProgram(program) : [];
}

export function getMinorCourseCodes(code?: string | null): readonly string[] {
  const program = getMinorProgramByCode(code);
  return program ? getCourseCodesForProgram(program) : [];
}

export function getMajorCourseSetName(code?: string | null): string | undefined {
  return getMajorProgramByCode(code)?.courseSetName;
}

export function getMinorCourseSetName(code?: string | null): string | undefined {
  return getMinorProgramByCode(code)?.courseSetName;
}

export function getMajorCodes(): string[] {
  return MAJOR_PROGRAMS.map((program) => program.canonicalCode);
}

export function getMajorCoursePrefixes(): string[] {
  return Array.from(new Set(MAJOR_PROGRAMS.flatMap((program) => program.coursePrefixes)));
}

function isSelectable(program: AcademicProgramDefinition): boolean {
  return program.selectable !== false;
}

export function getMajorOptions(): AcademicProgramOption[] {
  return [
    { value: 'NONE', label: '전공 없음 (기초교육학부)' },
    ...MAJOR_PROGRAMS.filter(isSelectable).map((program) => ({
      value: program.canonicalCode,
      label: program.label,
    })),
  ];
}

export function getMinorOptions(): AcademicProgramOption[] {
  return MINOR_PROGRAMS.filter(isSelectable).map((program) => ({
    value: program.canonicalCode,
    label: program.label,
  }));
}

export function getMajorNameMap(): Record<string, string> {
  return Object.fromEntries(MAJOR_PROGRAMS.map((program) => [program.canonicalCode, program.courseSetName]));
}

export function getMinorNameMap(): Record<string, string> {
  return Object.fromEntries(MINOR_PROGRAMS.map((program) => [program.canonicalCode, program.courseSetName]));
}
