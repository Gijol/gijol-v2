import { extractManualCourseHeadings } from '../features/course-catalog/manual-extraction';
import { buildManualListingsFromSources } from '../features/course-catalog/adapters/manual-listings';
import type { CourseCatalogCourse } from '../features/course-catalog/types';

describe('handbook evidence integrity', () => {
  it('keeps facing-page course credit tuples separate', () => {
    expect(
      extractManualCourseHeadings([
        'GS1202 일반화학 General Chemistry [3:1:3]          GS1311 일반생물학 실험 General Biology Laboratory [0:2:1]',
      ]),
    ).toEqual([
      { courseCode: 'GS1202', page: 1, lectureHours: 3, labHours: 1, credits: 3 },
      { courseCode: 'GS1311', page: 1, lectureHours: 0, labHours: 2, credits: 1 },
    ]);
  });
  it('does not borrow the following course hours for code-only MOOCs or prose mentions', () => {
    expect(
      extractManualCourseHeadings([
        'GS1498 (MOOC 지정) 기계학습을 위한 수학\nGS1511 논리적 글쓰기 Writing [3:0:3]\n선수과목 GS1603을 이수해야 한다.\nGS1607 학술영어 English [3:0:2]',
      ]),
    ).toEqual([
      { courseCode: 'GS1498', page: 1 },
      { courseCode: 'GS1511', page: 1, lectureHours: 3, labHours: 0, credits: 3 },
      { courseCode: 'GS1607', page: 1, lectureHours: 3, labHours: 0, credits: 2 },
    ]);
  });
  it('reads joint codes, single-credit research headings and OCR closing brackets', () => {
    const entries = extractManualCourseHeadings([
      '본문 끝   BS4240/LS5240 생물정보학 [3:0:3]\nBS9101 학사논문연구 [3]\nPS3104 양자물리 [3:0:3)\nMM2001(GS2001) 다변수해석학\nMultivariable Calculus [3:1:3]',
    ]);
    expect(entries.map((e) => e.courseCode)).toEqual(['BS4240', 'BS9101', 'GS2001', 'LS5240', 'MM2001', 'PS3104']);
    expect(entries.every((e) => e.credits === 3)).toBe(true);
  });
  it('preserves historical and zero credits without inventing missing handbook values', () => {
    const catalogCourse: CourseCatalogCourse = {
      courseId: 'md',
      primaryCode: 'MD2101',
      aliases: [],
      titleKo: '현재 과목명',
      credits: 3,
      departments: [],
      tags: [],
      sourceRefs: [],
    };
    const result = buildManualListingsFromSources(
      [
        {
          academicYear: 2020,
          sourcePath: 'manual.pdf',
          extractionMethod: 'pdftotext',
          entries: [{ courseCode: 'MD2101', page: 81, credits: 2 }],
        },
        {
          academicYear: 2021,
          sourcePath: 'manual.pdf',
          extractionMethod: 'pdftotext',
          entries: [{ courseCode: 'MD2101', page: 81, credits: 0 }],
        },
        {
          academicYear: 2022,
          sourcePath: 'manual.pdf',
          extractionMethod: 'ocr',
          entries: [{ courseCode: 'MD2101', page: 81 }],
        },
      ],
      { catalogCourses: [catalogCourse], resolveCourseId: () => 'md' },
    );
    expect(result.map((entry) => entry.credits)).toEqual([2, 0, undefined]);
    expect(result.every((entry) => entry.titleKo === undefined)).toBe(true);
  });
});
