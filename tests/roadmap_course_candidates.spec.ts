import { readFileSync } from 'fs';
import path from 'path';
import { createRoadmapCatalog } from '../features/course-catalog/roadmap';
import { COURSE_CATALOG_SNAPSHOT } from '../features/course-catalog/generated';
import { createCourseCatalogSearchItems } from '../features/course-catalog/search';

describe('roadmap course candidate interface', () => {
  const items = createCourseCatalogSearchItems(COURSE_CATALOG_SNAPSHOT);
  const catalog = createRoadmapCatalog(items);

  it('resolves alias searches to the canonical roadmap candidate', () => {
    const result = catalog.searchCandidates({ query: 'EC3216', page: 1, pageSize: 10 });

    expect(result.content).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          primaryCourseCode: 'AI3001',
          displayTitleKo: '오토마타 이론',
          aliasCodes: expect.arrayContaining(['EC3216']),
        }),
      ]),
    );
  });

  it('excludes roadmap-only pseudo courses from creation candidates', () => {
    const roadmapOnly = items.find((item) => item.sourceRefs.every((sourceRef) => sourceRef.kind === 'roadmap-preset'));
    expect(roadmapOnly).toBeDefined();

    const result = catalog.searchCandidates({ query: roadmapOnly!.primaryCourseCode, pageSize: 100 });
    expect(result.content.map((candidate) => candidate.courseId)).not.toContain(roadmapOnly!.courseId);
  });

  it('returns stable non-overlapping pages with the minimal drag projection', () => {
    const first = catalog.searchCandidates({ page: 1, pageSize: 20 });
    const second = catalog.searchCandidates({ page: 2, pageSize: 20 });
    const firstIds = first.content.map((course) => course.courseId);

    expect(first.content).toHaveLength(20);
    expect(second.content).toHaveLength(20);
    expect(second.content.some((course) => firstIds.includes(course.courseId))).toBe(false);
    expect(Object.keys(first.content[0]).sort()).toEqual(
      ['aliasCodes', 'courseId', 'creditHours', 'displayTitleEn', 'displayTitleKo', 'primaryCourseCode'].sort(),
    );
    expect(Buffer.byteLength(JSON.stringify(first), 'utf8')).toBeLessThan(16 * 1024);
  });

  it('keeps legacy full-catalog transfers outside roadmap pages and detail rendering', () => {
    const files = [
      'pages/dashboard/roadmap/[slug].tsx',
      'pages/dashboard/roadmap/create.tsx',
      'features/roadmap/CourseDetailSheet.tsx',
    ];

    files.forEach((file) => {
      const source = readFileSync(path.join(process.cwd(), file), 'utf8');
      expect(source).not.toContain("fetch('/api/courses')");
    });

    const detailSource = readFileSync(path.join(process.cwd(), 'features/roadmap/CourseDetailSheet.tsx'), 'utf8');
    expect(detailSource).not.toContain('CourseDB');
  });
});
