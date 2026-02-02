/**
 * 추천 과목 타입 정의
 * - 과목 DB 연동 및 로드맵 기능에서 재사용
 */

export interface RecommendedCourse {
  courseCode: string; // 과목 코드 (예: "EC2101")
  courseName: string; // 강의명 (예: "미시경제학")
  credit: number; // 학점 (예: 3)
  // 추후 확장을 위한 선택적 필드
  category?: string; // 이수 영역
  courseId?: number; // 과목 DB 연동용 ID
}

export interface DomainRecommendation {
  domain: string; // 졸업요건 영역
  recommendedCourses: RecommendedCourse[]; // 추천 과목 목록
}
