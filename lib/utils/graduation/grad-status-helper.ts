import { UserStatusType } from '@lib/types/index';
import {
  type GradStatusRequestBody,
  type GradStatusResponseType,
  TakenCourseType,
} from '@lib/types/grad';

export const inferEntryYear = (p: UserStatusType): number | null => {
  // 1) 타입에 entryYear가 직접 들어있다면 사용
  if ((p as any).entryYear) {
    const v = Number((p as any).entryYear);
    return Number.isFinite(v) && v > 1900 ? v : null;
  }
  // 2) studentId의 앞 4자리를 학번으로 사용 (예: 2021****)
  if (p.studentId && String(p.studentId).length >= 4) {
    const year = Number(String(p.studentId).slice(0, 4));
    return Number.isFinite(year) && year > 1900 ? year : null;
  }
  return null;
};

// -------------------------
// 헬퍼: UserStatusType -> TakenCourseType[]
// TODO: 여러 포맷 대응 목적으로 두긴 좋은데, 좀 더 깔끔한 방법 고민 필요
// -------------------------
export const toTakenCourses = (p: UserStatusType): TakenCourseType[] => {
  const list = (p as any).userTakenCourseList ?? [];
  return list.map((c: any) => ({
    year: Number(c.year) || 0,
    semester: c.semester || '',
    courseType: c.courseType || '기타',
    courseName: c.courseName || c.course || '',
    courseCode: c.courseCode || c.code || '',
    credit: Number(c.credit) || 0,
  }));
};

export const gradStatusFetchFn = async (payload: GradStatusRequestBody) => {
  try {
    const res = await fetch('/api/graduation/grad-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`grad-status ${res.status}: ${text}`);
    }

    return (await res.json()) as GradStatusResponseType;
  } catch (error) {
    console.error('grad-status api error:', error);
    throw error;
  }
};
