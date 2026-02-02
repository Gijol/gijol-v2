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
}

/**
 * CSV 문자열을 파싱하여 CourseDB 배열을 반환
 */
export function parseCoursesFromCSV(csvContent: string): CourseDB[] {
  const lines = csvContent.split('\n');
  if (lines.length < 2) return [];

  // Skip header
  const courses: CourseDB[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // CSV 파싱 (quoted 필드 처리)
    const fields = parseCSVLine(line);
    if (fields.length < 14) continue;

    const course: CourseDB = {
      courseUid: fields[0] || '',
      displayTitleKo: fields[1] || '',
      displayTitleEn: fields[2] || '',
      primaryCourseCode: fields[3] || '',
      aliasCodes: fields[4] ? fields[4].split('|').filter(Boolean) : [],
      participatingDepartments: fields[5] ? fields[5].split('|').filter(Boolean) : [],
      tags: fields[6] ? fields[6].split('|').filter(Boolean) : [],
      creditHours: parseInt(fields[7], 10) || 0,
      lectureHours: parseInt(fields[8], 10) || 0,
      labHours: parseInt(fields[9], 10) || 0,
      departmentContext: fields[10] || '',
      offered2025_1: fields[11]?.toLowerCase() === 'true',
      offered2025_2: fields[12]?.toLowerCase() === 'true',
      description: fields[13] || '',
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
