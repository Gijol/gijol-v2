import {
  findMajorProgram,
  getCourseCodesForProgram,
  getMajorCodes,
  getMajorProgramByCode,
  NON_DECLARED_MAJOR_VALUES,
} from './rule-catalog/academic-programs';

type CourseCodeInput = {
  courseCode?: string | null;
};

export type MajorResolutionStatus = 'resolved' | 'missing' | 'unknown' | 'ambiguous';

export interface MajorResolution {
  status: MajorResolutionStatus;
  code?: string;
  input?: string;
  reason?: string;
}

const TRUE_MAJOR_CODES: ReadonlySet<string> = new Set(getMajorCodes());

function normalizeCode(value?: string | null): string {
  return String(value ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

export function resolveMajorCode(input?: string | null): MajorResolution {
  const raw = String(input ?? '').trim();
  const codeKey = normalizeCode(raw);

  if (
    !raw ||
    (codeKey !== '' && NON_DECLARED_MAJOR_VALUES.has(codeKey)) ||
    raw.replace(/[\s·ㆍ・.\-_/()|]/g, '') === '전공없음' ||
    raw.replace(/[\s·ㆍ・.\-_/()|]/g, '') === '기초교육학부'
  ) {
    return {
      status: 'missing',
      input: raw,
      reason: 'No declared major was provided.',
    };
  }

  const program = findMajorProgram(raw);
  if (program) {
    return {
      status: 'resolved',
      code: program.canonicalCode,
      input: raw,
    };
  }

  return {
    status: raw ? 'unknown' : 'missing',
    input: raw,
    reason: raw ? `Unknown major identifier: ${raw}` : 'No major input was provided.',
  };
}

function buildCourseToMajorCodeMap(): Map<string, string> {
  const result = new Map<string, string>();

  TRUE_MAJOR_CODES.forEach((code) => {
    const program = getMajorProgramByCode(code);
    const courseCodes = program ? getCourseCodesForProgram(program) : [];
    courseCodes.forEach((courseCode) => {
      result.set(normalizeCode(courseCode), code);
    });
  });

  return result;
}

const COURSE_TO_MAJOR_CODE = buildCourseToMajorCodeMap();

export function inferMajorCodeFromCourses(courses: readonly CourseCodeInput[]): MajorResolution {
  const counts = new Map<string, number>();

  courses.forEach((course) => {
    const code = normalizeCode(course.courseCode);
    if (!code) return;

    const matches = new Set<string>();
    const prefix = code.match(/^[A-Z]+/)?.[0] ?? '';
    if (TRUE_MAJOR_CODES.has(prefix)) {
      matches.add(prefix);
    }

    const exactMatch = COURSE_TO_MAJOR_CODE.get(code);
    if (exactMatch) {
      matches.add(exactMatch);
    }

    matches.forEach((majorCode) => {
      counts.set(majorCode, (counts.get(majorCode) ?? 0) + 1);
    });
  });

  const ranked = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  if (!ranked.length) {
    return {
      status: 'missing',
      reason: 'No major course evidence was found.',
    };
  }

  const [bestCode, bestCount] = ranked[0];
  const second = ranked[1];
  if (second && second[1] === bestCount) {
    return {
      status: 'ambiguous',
      reason: `Multiple major candidates have the same evidence count: ${bestCode}, ${second[0]}.`,
    };
  }

  if (bestCount < 2) {
    return {
      status: 'ambiguous',
      reason: `Only ${bestCount} course matched ${bestCode}; more evidence is needed to infer a major.`,
    };
  }

  return {
    status: 'resolved',
    code: bestCode,
    reason: `Inferred from ${bestCount} matching courses.`,
  };
}

export function resolveMajorForEvaluation(
  explicitMajor: string | undefined,
  courses: readonly CourseCodeInput[],
): MajorResolution {
  const hasExplicitMajor = typeof explicitMajor === 'string' && explicitMajor.trim().length > 0;
  if (hasExplicitMajor) {
    return resolveMajorCode(explicitMajor);
  }

  return inferMajorCodeFromCourses(courses);
}
