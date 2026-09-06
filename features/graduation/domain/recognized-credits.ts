import { compareScienceCourseOrder } from './science-allocation';
import { classifyCourse } from './classifier';
import type { ExcludedCourseInfo, TakenCourseType } from './types';
import { isApprovedRecognition } from './credit-recognition';

/** 2026 manual pp.19,33-34,208: earned credits and credits accepted for graduation differ. */
export function calculateRecognizedCredits(courses: TakenCourseType[], entryYear: number, userMajor?: string) {
  const consumed = new Map<string, number>();
  const excluded: ExcludedCourseInfo[] = [];
  let total = 0;
  const ordered = [...courses].sort(compareScienceCourseOrder);
  for (const course of ordered) {
    let accepted = course.credit;
    const reasons: string[] = [];
    const limits: { key: string; max: number; reason: string }[] = [];
    const applyLimit = (key: string, max: number, reason: string) => {
      limits.push({ key, max, reason });
    };
    if (course.creditRecognition?.status === 'pending') {
      accepted = 0;
      reasons.push('타대 학점 인정 승인 확인 전');
    }
    const category = classifyCourse(course, userMajor, undefined, entryYear);
    if (category === 'humanities') applyLimit('humanities', 36, '인문사회 졸업 인정 상한 36학점');
    if (category === 'major') applyLimit('major', 42, '전공 졸업 인정 상한 42학점 (심화전공 예외 확인 필요)');
    if (/^(UC0201|UC0203)$/.test(course.courseCode) || /사회봉사|해외봉사/.test(course.courseName))
      applyLimit('service', 1, '사회·해외봉사 합계 최대 1학점');
    if (course.courseCode === 'UC0202' || /창의함양/.test(course.courseName))
      applyLimit('creativity', 1, '창의함양 최대 1학점');
    if (isApprovedRecognition(course)) applyLimit('transfer', 30, '타대 인정학점 최대 30학점');
    if (
      /^(GS151[123]|GS153[1235])$/.test(course.courseCode) &&
      course.year >= 2026 &&
      !courses.some((c) => /^GS15[13]/.test(c.courseCode) && c.year < 2026)
    )
      applyLimit('writing', 3, '2026년 글쓰기 동일 교과목 추가 이수 확인 필요');
    for (const { key, max, reason } of limits) {
      const allowed = Math.max(0, max - (consumed.get(key) ?? 0));
      if (allowed < accepted) reasons.push(reason);
      accepted = Math.min(accepted, allowed);
    }
    limits.forEach(({ key }) => consumed.set(key, (consumed.get(key) ?? 0) + accepted));
    total += accepted;
    if (accepted < course.credit)
      excluded.push({ ...course, credit: course.credit - accepted, reason: reasons.join('; ') });
  }
  return { total, earned: courses.reduce((sum, c) => sum + c.credit, 0), excluded };
}
