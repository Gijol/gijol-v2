import { evaluateGraduationStatus } from '../features/graduation/domain/engine/index';
import { matchesMinor } from '../features/graduation/domain/classifier';

describe('교차 개설 과목 코드 매칭 테스트', () => {
  describe('matchesMinor with aliases', () => {
    it('HS2544 (문화콘텐츠의 이해)는 CT(문화기술) 부전공에 매칭되지 않아야 함', () => {
      // 인문사회 코드로 적용한 과목은 문화기술 부전공 학점으로 중복 인정하지 않음
      expect(matchesMinor('HS2544', 'CT')).toBe(false);
    });

    it('GS2544 (레거시 코드)는 CT(문화기술) 부전공에 매칭되지 않아야 함', () => {
      // GS2544 → HS2544 계열 인문사회 코드로 적용되면 CT 부전공으로 간주하지 않음
      expect(matchesMinor('GS2544', 'CT')).toBe(false);
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

    it('FE energy minor does not absorb MD biomedical courses through the FE major code collision', () => {
      expect(matchesMinor('FE2301', 'FE')).toBe(true);
      expect(matchesMinor('MD2101', 'FE')).toBe(false);
      expect(matchesMinor('MD2101', 'MD')).toBe(true);
    });
  });

  describe('evaluateGraduationStatus with cross-listed courses', () => {
    it('GS2544 수강 시 인문사회에만 반영되고 CT 부전공에는 반영되지 않아야 함', async () => {
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

      // GS2544가 부전공(CT)에 중복 분류되지 않아야 함
      expect(minorCourses.some((c) => c.courseCode === 'GS2544')).toBe(false);
      expect(result.graduationCategory.minor.totalCredits).toBe(0);

      // GS2544는 인문사회로만 포함되어야 함
      expect(humanitiesCourses.some((c) => c.courseCode === 'GS2544')).toBe(true);
      expect(result.graduationCategory.humanities.totalCredits).toBe(3);
    });

    it('CT2544 수강 시 CT 부전공에만 반영되고 인문사회에는 반영되지 않아야 함', async () => {
      const result = await evaluateGraduationStatus({
        takenCourses: {
          takenCourses: [
            {
              year: 2023,
              semester: '1',
              courseType: '전공선택',
              courseName: '문화콘텐츠의 이해',
              courseCode: 'CT2544',
              credit: 3,
              grade: 'A',
            },
          ],
        },
        ruleContext: {
          entryYear: 2021,
          userMajor: 'EC',
          userMinors: ['CT'],
        },
      });

      const minorCourses = result.graduationCategory.minor.userTakenCoursesList.takenCourses;
      const humanitiesCourses = result.graduationCategory.humanities.userTakenCoursesList.takenCourses;

      expect(minorCourses.some((c) => c.courseCode === 'CT2544')).toBe(true);
      expect(result.graduationCategory.minor.totalCredits).toBe(3);
      expect(humanitiesCourses.some((c) => c.courseCode === 'CT2544')).toBe(false);
      expect(result.graduationCategory.humanities.totalCredits).toBe(0);
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
