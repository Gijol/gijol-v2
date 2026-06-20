import {
  COURSE_EQUIVALENCY_CATALOG,
  COURSE_EQUIVALENCY_PUBLISH_SNAPSHOT,
  createCourseEquivalencyPublishSnapshot,
  validateCourseEquivalencyCatalog,
  type CourseEquivalency,
} from '../features/graduation/domain';

const sourceRef = {
  manualYear: 2026,
  page: 49,
  path: 'docs/bachelor_manual/2026_manual.pdf',
};

function issueCodes(equivalencies: readonly CourseEquivalency[]): string[] {
  return validateCourseEquivalencyCatalog(equivalencies).issues.map((issue) => issue.code);
}

describe('graduation course equivalency catalog', () => {
  it('keeps the current catalog publishable with manual-backed entries', () => {
    expect(validateCourseEquivalencyCatalog(COURSE_EQUIVALENCY_CATALOG)).toMatchObject({
      ok: true,
      issues: [],
    });
    expect(COURSE_EQUIVALENCY_PUBLISH_SNAPSHOT.schemaVersion).toBe(1);
    expect(COURSE_EQUIVALENCY_PUBLISH_SNAPSHOT.equivalencies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'ch-physical-chemistry-a-same-course',
          relation: 'sameCourse',
          courseCodes: ['CH2102', 'CH3104'],
          sourceRefs: [expect.objectContaining({ manualYear: 2026, page: 23 })],
        }),
        expect.objectContaining({
          id: 'mm-advanced-multivariable-analysis-substitute',
          relation: 'substitute',
          fromCourseCode: 'MM2011',
          toCourseCode: 'MM2001',
          sourceRefs: [expect.objectContaining({ manualYear: 2026, page: 23 })],
        }),
        expect.objectContaining({
          id: 'bs-biochemistry-i-renumbered',
          relation: 'renumbered',
          fromCourseCode: 'BS3113',
          toCourseCode: 'BS2104',
          sourceRefs: [expect.objectContaining({ manualYear: 2026, page: 25 })],
        }),
      ]),
    );
  });

  it('accepts each supported relation shape with source evidence', () => {
    const equivalencies: readonly CourseEquivalency[] = [
      {
        id: 'cross-listed-cultural-content',
        relation: 'crossListed',
        courseCodes: ['GS2544', 'HS2544', 'CT2544'],
        sourceRefs: [sourceRef],
      },
      {
        id: 'renumbered-example',
        relation: 'renumbered',
        fromCourseCode: 'GS1001',
        toCourseCode: 'GS1011',
        effectiveFrom: { year: 2026, semester: '1' },
        sourceRefs: [sourceRef],
      },
      {
        id: 'legacy-equivalent-example',
        relation: 'legacyEquivalent',
        fromCourseCode: 'UC0901',
        toCourseCode: 'GS1701',
        sourceRefs: [sourceRef],
      },
      {
        id: 'substitute-example',
        relation: 'substitute',
        fromCourseCode: 'MM2011',
        toCourseCode: 'MM2001',
        sourceRefs: [sourceRef],
      },
      {
        id: 'same-course-example',
        relation: 'sameCourse',
        courseCodes: ['MM2001', 'GS2001'],
        sourceRefs: [sourceRef],
      },
    ];

    expect(validateCourseEquivalencyCatalog(equivalencies)).toMatchObject({
      ok: true,
      issues: [],
    });
    expect(JSON.parse(JSON.stringify(createCourseEquivalencyPublishSnapshot(equivalencies)))).toEqual(
      createCourseEquivalencyPublishSnapshot(equivalencies),
    );
  });

  it('rejects missing evidence, duplicate IDs, and invalid course code groups', () => {
    const codes = issueCodes([
      {
        id: 'duplicate-id',
        relation: 'sameCourse',
        courseCodes: ['MM2001', 'GS2001'],
        sourceRefs: [sourceRef],
      },
      {
        id: 'duplicate-id',
        relation: 'sameCourse',
        courseCodes: ['MM2002', 'GS2002'],
        sourceRefs: [sourceRef],
      },
      {
        id: 'missing-source',
        relation: 'sameCourse',
        courseCodes: ['MM2004', 'GS2004'],
        sourceRefs: [],
      },
      {
        id: 'duplicate-course-code',
        relation: 'sameCourse',
        courseCodes: ['MM2001', 'mm-2001'],
        sourceRefs: [sourceRef],
      },
      {
        id: 'empty-course-code',
        relation: 'sameCourse',
        courseCodes: ['MM2001', ''],
        sourceRefs: [sourceRef],
      },
    ]);

    expect(codes).toContain('duplicate-equivalency-id');
    expect(codes).toContain('missing-source-ref');
    expect(codes).toContain('duplicate-course-code');
    expect(codes).toContain('invalid-course-code');
  });

  it('rejects invalid relation types and mixed relation shapes', () => {
    const codes = issueCodes([
      {
        id: 'unknown-relation',
        relation: 'replacement',
        courseCodes: ['GS1001', 'GS1011'],
        sourceRefs: [sourceRef],
      } as unknown as CourseEquivalency,
      {
        id: 'cross-listed-with-pair-fields',
        relation: 'crossListed',
        courseCodes: ['GS2544', 'HS2544'],
        fromCourseCode: 'GS2544',
        toCourseCode: 'HS2544',
        sourceRefs: [sourceRef],
      } as unknown as CourseEquivalency,
      {
        id: 'renumbered-with-group-fields',
        relation: 'renumbered',
        courseCodes: ['GS1001', 'GS1011'],
        fromCourseCode: 'GS1001',
        toCourseCode: 'GS1011',
        sourceRefs: [sourceRef],
      } as unknown as CourseEquivalency,
      {
        id: 'same-pair-code',
        relation: 'legacyEquivalent',
        fromCourseCode: 'GS1701',
        toCourseCode: 'gs-1701',
        sourceRefs: [sourceRef],
      },
    ]);

    expect(codes).toContain('invalid-relation');
    expect(codes.filter((code) => code === 'conflicting-relation-shape')).toHaveLength(2);
    expect(codes).toContain('invalid-course-code-pair');
  });

  it('rejects non-JSON values before publish', () => {
    const codes = issueCodes([
      {
        id: 'undefined-note',
        relation: 'sameCourse',
        courseCodes: ['MM2001', 'GS2001'],
        sourceRefs: [sourceRef],
        note: undefined,
      },
    ]);

    expect(codes).toContain('not-json-serializable');
  });
});
