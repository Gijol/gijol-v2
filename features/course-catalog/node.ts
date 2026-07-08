import { readdirSync, readFileSync } from 'fs';
import path from 'path';
import {
  BIOLOGY_COURSES,
  CALCULUS_COURSES,
  CHEMISTRY_COURSES,
  COLLOQUIUM_COURSES,
  CORE_MATH_COURSES,
  ENGLISH_I_COURSES,
  ENGLISH_II_COURSES,
  EXPLORATION_COURSES,
  FRESHMAN_COURSES,
  HUS_COURSES,
  MAJOR_RECOMMENDATION_COURSES_BY_CODE,
  MATH_COURSES,
  PHYSICS_COURSES,
  PPE_COURSES,
  SCIENCE_ECONOMY_COURSES,
  SOFTWARE_COURSES,
  WRITING_COURSES,
  getAllCourses,
} from '../../lib/const/course-master';
import { getMinorAllCourses, getSupportedMinorCodes, type MinorCourseInfo } from '../../lib/const/minor-courses';
import { parseCoursesFromCSV } from '../../lib/const/course-db';
import type { RoadmapData } from '../../lib/types/roadmap';
import type { SectionOffering } from '../../lib/types/timetable';
import { COURSE_EQUIVALENCY_CATALOG } from '../graduation/domain';
import { buildCourseCatalogSnapshot, type CourseCatalogBuildResult } from './build';
import manualListingExtraction from './generated/manual-listings.extracted.json';
import type { ManualListingExtractionSnapshot } from './adapters/manual-listings';
import type { RecommendationCourseGroup } from './adapters/recommendations';
import { TIMETABLE_SOURCES } from './timetable-sources';

const MANUAL_LISTING_SOURCES = (manualListingExtraction as ManualListingExtractionSnapshot).sources;

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

function loadTimetableSources(rootDir: string): {
  sections: SectionOffering[];
  term: string;
  sourcePath: string;
}[] {
  return TIMETABLE_SOURCES.map((source) => {
    const timetable = readJsonFile<{ items?: SectionOffering[] }>(path.join(rootDir, source.path));

    return {
      sections: timetable.items ?? [],
      term: source.term,
      sourcePath: source.path,
    };
  });
}

function loadRecommendationCourseGroups(): RecommendationCourseGroup[] {
  const groups: RecommendationCourseGroup[] = [
    { requirementId: 'language-english-i', courses: ENGLISH_I_COURSES },
    { requirementId: 'language-english-ii', courses: ENGLISH_II_COURSES },
    { requirementId: 'language-writing', courses: WRITING_COURSES },
    { requirementId: 'science-calculus', courses: CALCULUS_COURSES },
    { requirementId: 'science-core-math', courses: CORE_MATH_COURSES },
    { requirementId: 'science-sw-basic', courses: SOFTWARE_COURSES },
    {
      requirementId: 'science-total',
      courses: [
        ...MATH_COURSES,
        ...PHYSICS_COURSES,
        ...CHEMISTRY_COURSES,
        ...BIOLOGY_COURSES,
        ...SOFTWARE_COURSES,
      ],
    },
    { requirementId: 'humanities-hus', courses: HUS_COURSES },
    { requirementId: 'humanities-ppe', courses: PPE_COURSES },
    { requirementId: 'humanities-total', courses: [...HUS_COURSES, ...PPE_COURSES] },
    { requirementId: 'etc-freshman', courses: FRESHMAN_COURSES },
    { requirementId: 'etc-major-exploration', courses: EXPLORATION_COURSES },
    { requirementId: 'etc-colloquium', courses: COLLOQUIUM_COURSES },
    { requirementId: 'etc-science-economy', courses: SCIENCE_ECONOMY_COURSES },
  ];

  Object.entries(MAJOR_RECOMMENDATION_COURSES_BY_CODE).forEach(([programCode, courses]) => {
    groups.push({
      requirementId: 'major-credits',
      programCode,
      courses,
    });
  });

  return groups;
}

export function buildCourseCatalogSnapshotFromWorkspace(
  rootDir = process.cwd(),
): CourseCatalogBuildResult {
  const courseDbRows = parseCoursesFromCSV(readFileSync(path.join(rootDir, 'DB', 'course_db.csv'), 'utf8'));

  return buildCourseCatalogSnapshot({
    courseDbRows,
    timetableSources: loadTimetableSources(rootDir),
    manualListingSources: MANUAL_LISTING_SOURCES,
    minorCoursesByCode: loadMinorCoursesByCode(),
    roadmapPresets: loadRoadmapPresets(rootDir),
    recommendationCourses: getAllCourses(),
    recommendationGroups: loadRecommendationCourseGroups(),
    courseEquivalencies: COURSE_EQUIVALENCY_CATALOG,
  });
}
