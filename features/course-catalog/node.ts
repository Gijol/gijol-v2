import { readdirSync, readFileSync } from 'fs';
import path from 'path';
import { getAllCourses } from '../../lib/const/course-master';
import { getMinorAllCourses, getSupportedMinorCodes, type MinorCourseInfo } from '../../lib/const/minor-courses';
import { parseCoursesFromCSV } from '../../lib/const/course-db';
import type { RoadmapData } from '../../lib/types/roadmap';
import type { SectionOffering } from '../../lib/types/timetable';
import { COURSE_EQUIVALENCY_CATALOG } from '../graduation/domain';
import { buildCourseCatalogSnapshot, type CourseCatalogBuildResult } from './build';

const DEFAULT_TIMETABLE_SOURCE_PATH = 'DB/timetable/2026_spring_course_info.normalized.json';

function readJsonFile<T>(absolutePath: string): T {
  return JSON.parse(readFileSync(absolutePath, 'utf8')) as T;
}

function loadRoadmapPresets(rootDir: string): Record<string, RoadmapData> {
  const presetsDir = path.join(rootDir, 'DB', 'roadmap', 'presets');
  return Object.fromEntries(
    readdirSync(presetsDir)
      .filter((filename) => filename.endsWith('.json'))
      .sort()
      .map((filename) => [
        filename.replace(/\.json$/, ''),
        readJsonFile<RoadmapData>(path.join(presetsDir, filename)),
      ]),
  );
}

function loadMinorCoursesByCode(): Record<string, MinorCourseInfo[]> {
  return Object.fromEntries(
    getSupportedMinorCodes().map((minorCode) => [minorCode, getMinorAllCourses(minorCode)]),
  );
}

function loadTimetableSections(rootDir: string): SectionOffering[] {
  const timetable = readJsonFile<{ items?: SectionOffering[] }>(path.join(rootDir, DEFAULT_TIMETABLE_SOURCE_PATH));
  return timetable.items ?? [];
}

export function buildCourseCatalogSnapshotFromWorkspace(
  rootDir = process.cwd(),
): CourseCatalogBuildResult {
  const courseDbRows = parseCoursesFromCSV(readFileSync(path.join(rootDir, 'DB', 'course_db.csv'), 'utf8'));

  return buildCourseCatalogSnapshot({
    courseDbRows,
    timetableSections: loadTimetableSections(rootDir),
    timetableTerm: '2026-spring',
    timetableSourcePath: DEFAULT_TIMETABLE_SOURCE_PATH,
    minorCoursesByCode: loadMinorCoursesByCode(),
    roadmapPresets: loadRoadmapPresets(rootDir),
    recommendationCourses: getAllCourses(),
    courseEquivalencies: COURSE_EQUIVALENCY_CATALOG,
  });
}
