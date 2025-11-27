import { useMutation, useQuery } from '@tanstack/react-query';

import { instance } from '@utils/instance';
import { UserTakenCourseWithGradeType } from '@lib/types/score-status';
import { CourseHistory, CourseResponse, CourseSearchCodeType } from '@lib/types/course';
import type { UserStatusType } from '@lib/types/index';
import {
  gradStatusFetchFn,
  inferEntryYear,
  STORAGE_KEY,
  toTakenCourses,
} from '../../pages/dashboard/graduation';
import type { GradStatusResponseType } from '@lib/types/grad';

//TODO: 로컬 스토리지 대신 전역 상태 관리 라이브러리로 변경 고려
// 로컬 스토리지에 저장된 사용자 수강 현황을 기반으로 졸업 요건 상태를 가져오는 훅
export function useCourseStatus() {
  const courseStatusFetcher = async () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return console.log('로컬 저장된 데이터가 없습니다.');
    const obj = JSON.parse(raw) as UserStatusType;
    // 기존 로직과 중복된 api 호출 부분
    // TODO: 리팩토링 고려 지점
    try {
      const gradP = await gradStatusFetchFn({
        entryYear: inferEntryYear(obj) ?? new Date().getFullYear(),
        takenCourses: toTakenCourses(obj),
        userMajor: (obj as any).major || (obj as any).department || undefined,
        userMinors: [],
      });

      // grad-status result
      const j = gradP as GradStatusResponseType;
      console.log('grad-status api response:', j);
      return gradP;
    } catch (e) {
      console.error('grad status fetch error', e);
    }
  };

  return useQuery<UserTakenCourseWithGradeType>(['course-status'], () => courseStatusFetcher(), {
    retry: 0,
    refetchOnWindowFocus: false,
  });
}

const fetchCourses = async (
  courseSearchCode: CourseSearchCodeType,
  page: number,
  size: number,
  searchString: string
) => {
  const params = new URLSearchParams({
    courseSearchCode: courseSearchCode,
    courseSearchString: searchString,
    page: page.toString(),
    size: size.toString(),
  });
  const res = await instance.get('/api/v1/courses', { params });
  if (res.status !== 200) {
    throw new Error(res.status.toString());
  }
  return res.data;
};
export function useCourseList(
  page: number = 0,
  size: number = 20,
  minorType: CourseSearchCodeType = 'NONE',
  searchString: string = ''
) {
  return useQuery<CourseResponse>({
    queryKey: ['courses', page],
    queryFn: () => fetchCourses(minorType, page, size, searchString),
    refetchOnWindowFocus: false,
  });
}

const fetchCourseWithId = async (
  id: number
): Promise<{ courseHistoryResponses: CourseHistory[] }> => {
  const res = await instance.get(`/api/v1/courses/${id.toString()}`);
  return res.data;
};
export function useSingleCourse() {
  return useMutation(fetchCourseWithId);
}
