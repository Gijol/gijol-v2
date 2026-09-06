import { buildCourseCatalogSnapshotFromWorkspace } from '../features/course-catalog/node';
import { validateCourseCatalogSnapshot } from '../features/course-catalog/inspect';
import extracted from '../features/course-catalog/generated/manual-listings.extracted.json';

const { snapshot } = buildCourseCatalogSnapshotFromWorkspace();
it('retains every handbook observation even when the course was absent from the current CSV', () => {
  const published = new Set(snapshot.manualListings.map((entry) => `${entry.academicYear}:${entry.courseCode}`));
  const missing = extracted.sources.flatMap((source) =>
    source.entries
      .filter((entry) => !published.has(`${source.academicYear}:${entry.courseCode}`))
      .map((entry) => `${source.academicYear}:${entry.courseCode}`),
  );
  expect(missing).toEqual([]);
  expect(validateCourseCatalogSnapshot(snapshot)).toEqual([]);
});
it.each([
  ['BS3208', 'BS4205'],
  ['HS3767', 'GS3767'],
])('resolves reviewed old/new codes %s and %s to one course across all collections', (current, old) => {
  const owners = snapshot.courses.filter((course) =>
    [current, old].some((code) => course.primaryCode === code || course.aliases.some((alias) => alias.code === code)),
  );
  expect(owners).toHaveLength(1);
  const ids = new Set([
    ...snapshot.manualListings
      .filter((entry) => [current, old].includes(entry.courseCode))
      .map((entry) => entry.courseId),
    ...snapshot.offerings.filter((entry) => [current, old].includes(entry.courseCode)).map((entry) => entry.courseId),
  ]);
  expect(Array.from(ids)).toEqual([owners[0].courseId]);
});

it('keeps handbook MB3767 humanities aliases out of the mathematics namespace', () => {
  const owner = snapshot.courses.find((c) => c.primaryCode === 'HS3767')!;
  expect(owner.aliases.map((a) => a.code)).toEqual(expect.arrayContaining(['GS3767', 'MB3767', 'PP3767', 'SS3767']));
  expect(snapshot.courses.some((c) => c.primaryCode === 'MM3767' || c.aliases.some((a) => a.code === 'MM3767'))).toBe(
    false,
  );
});

it.each([
  ['GS2825', 3],
  ['GS2835', 3],
  ['EV2208', 4],
  ['EV4222', 3],
  ['GS1431', 3],
  ['GS1491', 1],
  ['GS1499', 2],
  ['GS1906', 2],
  ['HS3762', 2],
])('uses the current handbook credit in the %s catalog display', (code, credits) => {
  expect(snapshot.courses.find((c) => c.primaryCode === code)?.credits).toBe(credits);
});
