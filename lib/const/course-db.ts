/**
 * Course Database Types and Client-side Utilities
 * - Shared types and functions that can be used in both client and server
 */

export interface CourseDB {
  courseUid: string;
  displayTitleKo: string;
  displayTitleEn: string;
  primaryCourseCode: string;
  aliasCodes: string[];
  participatingDepartments: string[];
  tags: string[];
  creditHours: number;
  lectureHours: number;
  labHours: number;
  departmentContext: string;
  offered2025_1: boolean;
  offered2025_2: boolean;
  description: string;
  offeredTerms?: string[];
  sourcePageFirstSeen?: number;
  rawTitleKo?: string;
  rawTitleEn?: string;
}

/**
 * CSV 문자열을 파싱하여 CourseDB 배열을 반환
 */
export function parseCoursesFromCSV(csvContent: string): CourseDB[] {
  const lines = csvContent.split('\n');
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0].replace(/^\uFEFF/, ''));
  const indexByHeader = new Map(headers.map((header, index) => [header, index]));
  const fieldValue = (fields: readonly string[], header: string): string => {
    const index = indexByHeader.get(header);
    return index === undefined ? '' : fields[index] ?? '';
  };
  const booleanField = (fields: readonly string[], header: string): boolean =>
    fieldValue(fields, header).toLowerCase() === 'true';
  const numberField = (fields: readonly string[], header: string): number | undefined => {
    const rawValue = fieldValue(fields, header);
    if (!rawValue) return undefined;
    const parsed = Number(rawValue);
    return Number.isFinite(parsed) ? parsed : undefined;
  };
  const offeredHeaders = headers
    .map((header) => ({
      header,
      match: header.match(/^offered_(\d{4})_(\d+)$/),
    }))
    .filter((entry): entry is { header: string; match: RegExpMatchArray } => Boolean(entry.match));

  const courses: CourseDB[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // CSV 파싱 (quoted 필드 처리)
    const fields = parseCSVLine(line);
    if (fields.length < 4) continue;

    const offeredTerms = offeredHeaders
      .filter(({ header }) => booleanField(fields, header))
      .map(({ match }) => `${match[1]}-${match[2]}`);

    const course: CourseDB = {
      courseUid: fieldValue(fields, 'course_uid'),
      displayTitleKo: fieldValue(fields, 'display_title_ko'),
      displayTitleEn: fieldValue(fields, 'display_title_en'),
      primaryCourseCode: fieldValue(fields, 'primary_course_code'),
      aliasCodes: fieldValue(fields, 'alias_course_codes').split('|').filter(Boolean),
      participatingDepartments: fieldValue(fields, 'participating_departments').split('|').filter(Boolean),
      tags: fieldValue(fields, 'tags').split('|').filter(Boolean),
      creditHours: numberField(fields, 'credit_hours') ?? 0,
      lectureHours: numberField(fields, 'lecture_hours') ?? 0,
      labHours: numberField(fields, 'lab_hours') ?? 0,
      departmentContext: fieldValue(fields, 'department_context'),
      offered2025_1: booleanField(fields, 'offered_2025_1'),
      offered2025_2: booleanField(fields, 'offered_2025_2'),
      description: fieldValue(fields, 'description'),
      offeredTerms,
      sourcePageFirstSeen: numberField(fields, 'source_page_first_seen'),
      rawTitleKo: fieldValue(fields, 'raw_title_ko'),
      rawTitleEn: fieldValue(fields, 'raw_title_en'),
    };

    courses.push(course);
  }

  return courses;
}

/**
 * CSV 라인을 파싱 (quoted 필드 지원)
 */
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  fields.push(current.trim());
  return fields;
}

/**
 * 과목 코드에서 레벨 추출 (예: EC4209 -> 4000)
 */
export function getCourseLevel(code: string): number {
  const match = code.match(/\d/);
  if (!match) return 0;
  const firstDigit = parseInt(match[0], 10);
  return firstDigit * 1000;
}

/**
 * 학과명에서 표시용 이름 추출
 */
export function getDepartmentDisplayName(dept: string): string {
  if (!dept) return '';
  // "정보컴퓨팅대학 | 전기전자컴퓨터공학과" -> "전기전자컴퓨터공학과"
  const parts = dept.split('|');
  if (parts.length > 1) {
    return parts[1].trim();
  }
  return parts[0].trim();
}

/**
 * 검색어로 강의 필터링 (클라이언트 사이드)
 */
export function filterCourses(courses: CourseDB[], query: string): CourseDB[] {
  if (!query.trim()) return courses;

  const lowerQuery = query.toLowerCase();
  return courses.filter((course) => {
    return (
      course.displayTitleKo.toLowerCase().includes(lowerQuery) ||
      course.displayTitleEn.toLowerCase().includes(lowerQuery) ||
      course.primaryCourseCode.toLowerCase().includes(lowerQuery) ||
      course.aliasCodes.some((code) => code.toLowerCase().includes(lowerQuery)) ||
      course.departmentContext.toLowerCase().includes(lowerQuery)
    );
  });
}

/**
 * 모든 과목에서 유니크한 학과 목록 추출
 */
export function getUniqueDepartments(courses: CourseDB[]): string[] {
  const departments = new Set<string>();
  courses.forEach((course) => {
    if (course.departmentContext) {
      departments.add(course.departmentContext.trim());
    }
  });
  return Array.from(departments).sort();
}

/**
 * 모든 과목에서 유니크한 개설 학과 목록 추출 (participatingDepartments)
 */
export function getUniqueParticipatingDepartments(courses: CourseDB[]): string[] {
  const departments = new Set<string>();
  courses.forEach((course) => {
    course.participatingDepartments.forEach((dept) => {
      const trimmed = dept.trim();
      if (trimmed) {
        departments.add(trimmed);
      }
    });
  });
  return Array.from(departments).sort();
}
