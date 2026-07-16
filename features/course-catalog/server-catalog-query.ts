import { COURSE_CATALOG_SNAPSHOT } from './generated';
import { createCourseDiscovery, type CourseDiscovery } from './discovery';
import { createCourseCatalogRecommendationIndex, type CourseCatalogRecommendationIndex } from './recommendations';
import { createCourseCatalogSearchItems, type CourseCatalogSearchItem } from './search';

let searchItems: readonly CourseCatalogSearchItem[] | undefined;
let recommendationIndex: CourseCatalogRecommendationIndex | undefined;
let courseDiscovery: CourseDiscovery | undefined;

/**
 * Owns the generated catalog snapshot and process-local indexes.
 *
 * Only server entrypoints may import this module. Browser-safe catalog modules
 * receive data through their interfaces and never import the generated snapshot.
 */
export function getServerCourseCatalogSearchItems(): readonly CourseCatalogSearchItem[] {
  searchItems ??= createCourseCatalogSearchItems(COURSE_CATALOG_SNAPSHOT);
  return searchItems;
}

export function getServerCourseCatalogRecommendationIndex(): CourseCatalogRecommendationIndex {
  recommendationIndex ??= createCourseCatalogRecommendationIndex(COURSE_CATALOG_SNAPSHOT);
  return recommendationIndex;
}

export function getServerCourseDiscovery(): CourseDiscovery {
  courseDiscovery ??= createCourseDiscovery(getServerCourseCatalogSearchItems());
  return courseDiscovery;
}
