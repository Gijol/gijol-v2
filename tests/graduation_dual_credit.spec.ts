import { evaluateGraduationStatus } from '../features/graduation/domain/engine/index';
import { matchesMinor } from '../features/graduation/domain/classifier';

describe('복수 인정 과목 (Dual-Credit Courses) 테스트', () => {
  describe('matchesMinor with aliases', () => {
    it('HS2544 (문화콘텐츠의 이해)가 CT(문화기술) 부전공에 매칭되어야 함', () => {
      // HS2544는 CT2544의 alias이므로 CT 부전공에 매칭되어야 함
      expect(matchesMinor('HS2544', 'CT')).toBe(true);
    });

    it('GS2544 (레거시 코드)도 CT(문화기술) 부전공에 매칭되어야 함', () => {
      // GS2544 → HS2544 → CT2544 alias chain
      expect(matchesMinor('GS2544', 'CT')).toBe(true);
    });

    it('CT2544가 CT 부전공에 직접 매칭되어야 함', () => {
      expect(matchesMinor('CT2544', 'CT')).toBe(true);
    });

    it('회로이론 (EC2201)이 IR(지능로봇) 부전공에 매칭되어야 함', () => {
      // EC2201 = IR2201 = SE2104 (회로이론)
      expect(matchesMinor('EC2201', 'IR')).toBe(true);
    });

    it('SE2104 (회로이론)이 IR 부전공에 매칭되어야 함', () => {
      expect(matchesMinor('SE2104', 'IR')).toBe(true);
    });
  });

  describe('evaluateGraduationStatus with dual-credit courses', () => {
    it('GS2544 수강 시 부전공(CT)과 인문사회 모두에 반영되어야 함 (복수 인정)', async () => {
      const result = await evaluateGraduationStatus({
        takenCourses: {
          takenCourses: [
            {
              year: 2023,
              semester: '1',
              courseType: '교양',
              courseName: '문화콘텐츠의 이해',
              courseCode: 'GS2544',
              credit: 3,
              grade: 'A',
            },
          ],
        },
        ruleContext: {
          entryYear: 2021,
          userMajor: 'EC',
          userMinors: ['CT'], // 문화기술 부전공
        },
      });

      const minorCourses = result.graduationCategory.minor.userTakenCoursesList.takenCourses;
      const humanitiesCourses = result.graduationCategory.humanities.userTakenCoursesList.takenCourses;

      // GS2544가 부전공(CT)에 분류되어야 함
      expect(minorCourses.some((c) => c.courseCode === 'GS2544')).toBe(true);
      expect(result.graduationCategory.minor.totalCredits).toBe(3);

      // GS2544가 인문사회에도 포함되어야 함 (복수 인정)
      expect(humanitiesCourses.some((c) => c.courseCode === 'GS2544')).toBe(true);
      expect(result.graduationCategory.humanities.totalCredits).toBe(3);
    });

    it('EC2201 (회로이론) 수강 시 지능로봇 부전공에서도 인정되어야 함', async () => {
      const result = await evaluateGraduationStatus({
        takenCourses: {
          takenCourses: [
            {
              year: 2023,
              semester: '1',
              courseType: '전공',
              courseName: '회로이론',
              courseCode: 'EC2201',
              credit: 3,
              grade: 'A',
            },
          ],
        },
        ruleContext: {
          entryYear: 2021,
          userMajor: 'MC', // 기계로봇 전공
          userMinors: ['IR'], // 지능로봇 부전공
        },
      });

      // EC2201이 IR 부전공 과목(IR2201 alias)으로 인정되어 minor로 분류
      const minorCourses = result.graduationCategory.minor.userTakenCoursesList.takenCourses;
      expect(minorCourses.some((c) => c.courseCode === 'EC2201')).toBe(true);
    });
  });
});
