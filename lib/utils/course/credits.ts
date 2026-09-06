export type HasGradeAndCredit = {
  credit: number;
  grade?: string | null;
  creditRecognition?: { status: 'approved' | 'pending' };
};

const NON_EARNING_GRADES = new Set(['F', 'FAIL', 'U', 'UNSATISFACTORY', '불합격']);

export function isEarnedCreditCourse<T extends Pick<HasGradeAndCredit, 'grade'>>(course: T): boolean {
  const grade = String(course.grade ?? '')
    .trim()
    .toUpperCase();

  return !NON_EARNING_GRADES.has(grade);
}

export function sumEarnedCredits<T extends HasGradeAndCredit>(courses: T[]): number {
  return courses.reduce(
    (total, course) => (isEarnedCreditCourse(course) ? total + (Number(course.credit) || 0) : total),
    0,
  );
}
