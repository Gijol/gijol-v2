import { normalizeTakenCourses } from '../features/graduation/middlewares/validation';
import { evaluateGraduationStatus } from '../features/graduation/domain/engine';
import { uploadAndEvaluate } from '../features/graduation/usecases/uploadAndEvaluate';
import { toTakenCourses } from '../lib/utils/graduation/grad-status-helper';
import { extractOverallStatus } from '../lib/utils/graduation/grad-formatter';

describe('graduation grade policy', () => {
  it('keeps a U thesis out of the dashboard total after transcript projection', async () => {
    const takenCourses = toTakenCourses({
      studentId: '20251234',
      userTakenCourseList: [
        {
          courseCode: 'EC9102',
          courseName: '학사논문연구 I',
          courseType: '연구',
          credit: 3,
          grade: 'U',
          semester: '1',
          year: 2025,
        },
        {
          courseCode: 'EC2201',
          courseName: '회로이론',
          courseType: '전공',
          credit: 3,
          grade: 'A0',
          semester: '1',
          year: 2025,
        },
      ],
    });

    const result = await uploadAndEvaluate({ takenCourses }, { entryYear: 2025, userMajor: 'EC' });

    expect(result.success).toBe(true);
    expect(extractOverallStatus(result.data)?.totalCredits).toBe(3);
  });

  it('does not count an F attempt toward total earned credits at the engine boundary', async () => {
    const result = await evaluateGraduationStatus({
      takenCourses: {
        takenCourses: [
          {
            courseCode: 'EC2201',
            courseName: 'Circuits',
            courseType: 'major',
            credit: 3,
            grade: 'A0',
            semester: '1',
            year: 2025,
          },
          {
            courseCode: 'EC2999',
            courseName: 'Failed elective',
            courseType: 'major',
            credit: 3,
            grade: 'F',
            semester: '1',
            year: 2025,
          },
        ],
      },
      ruleContext: { entryYear: 2025, userMajor: 'EC' },
    });

    expect(result.totalCredits).toBe(3);
  });

  it('keeps unsuccessful U courses out of graduation credit evaluation', () => {
    const result = normalizeTakenCourses({
      takenCourses: [
        {
          courseCode: 'EC2999',
          courseName: 'S/U Research Practice',
          courseType: 'elective',
          credit: 3,
          grade: 'U',
          semester: '1',
          year: 2025,
        },
        {
          courseCode: 'EC2201',
          courseName: 'Circuits',
          courseType: 'major',
          credit: 3,
          grade: 'A0',
          semester: '1',
          year: 2025,
        },
      ],
    });

    expect(result.takenCourses.map((course) => course.courseCode)).toEqual(['EC2201']);
  });
});
