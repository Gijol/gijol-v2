import type { SectionOffering } from '@/lib/types/timetable';

// Explicit imports let Next.js bundle data into the server function without runtime filesystem paths.
export const BUNDLED_TIMETABLE_TERMS = {
  '2020-1': () => import('../../DB/timetable/registration-system/2020_01_course_info.normalized.json'),
  '2020-2': () => import('../../DB/timetable/registration-system/2020_02_course_info.normalized.json'),
  '2021-1': () => import('../../DB/timetable/registration-system/2021_01_course_info.normalized.json'),
  '2021-2': () => import('../../DB/timetable/registration-system/2021_02_course_info.normalized.json'),
  '2022-1': () => import('../../DB/timetable/registration-system/2022_01_course_info.normalized.json'),
  '2022-2': () => import('../../DB/timetable/registration-system/2022_02_course_info.normalized.json'),
  '2023-1': () => import('../../DB/timetable/registration-system/2023_01_course_info.normalized.json'),
  '2023-2': () => import('../../DB/timetable/registration-system/2023_02_course_info.normalized.json'),
  '2024-1': () => import('../../DB/timetable/registration-system/2024_01_course_info.normalized.json'),
  '2024-2': () => import('../../DB/timetable/registration-system/2024_02_course_info.normalized.json'),
  '2025-1': () => import('../../DB/timetable/registration-system/2025_01_course_info.normalized.json'),
  '2025-2': () => import('../../DB/timetable/registration-system/2025_02_course_info.normalized.json'),
  '2026-1': () => import('../../DB/timetable/registration-system/2026_01_course_info.normalized.json'),
  '2026-2': () => import('../../DB/timetable/registration-system/2026_02_course_info.normalized.json'),
};

export async function loadBundledTimetable(term: string): Promise<readonly SectionOffering[] | null> {
  const loader = BUNDLED_TIMETABLE_TERMS[term as keyof typeof BUNDLED_TIMETABLE_TERMS];
  if (!loader) return null;
  const module = await loader();
  return module.items as unknown as readonly SectionOffering[];
}
