import type { RoadmapCourseCandidatePage } from '@/features/course-catalog/roadmap';

export async function fetchRoadmapCourseCandidates(
  query: string,
  page: number,
  signal?: AbortSignal,
): Promise<RoadmapCourseCandidatePage> {
  const params = new URLSearchParams({ q: query, page: String(page) });
  const response = await fetch(`/api/roadmap/courses?${params.toString()}`, { signal });

  if (!response.ok) throw new Error(`로드맵 과목 후보 조회 실패: ${response.status}`);
  return response.json();
}
