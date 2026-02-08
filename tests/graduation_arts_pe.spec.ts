/**
 * 예체능(체육/예능) 무학점 필수 영역 검증 테스트
 * 
 * 요건:
 * - 체육(GS0101~0115): 축구, 테니스, 농구, 배드민턴, 탁구, 요가, 골프, 힙합댄스, 태권도, 헬스, 수영, 볼링, 야구, 암벽등반
 * - 예능(GS0201~0213): 피아노, 플룻, 바이올린, 첼로, 클라리넷, 어쿠스틱기타, 일렉기타, 베이스기타, 드럼, 보컬, 드로잉, 컴퓨터음악 만들기
 * 
 * 학번별 요건:
 * - 2018~2019학번: 예능·체육실기 각 4학기 필수
 * - 2020학번 이후: 예능·체육실기 각 2학기 필수
 */

import { uploadAndEvaluate } from '../features/graduation/usecases/uploadAndEvaluate';

// 기본 필수 과목들 (예체능 제외)
const baseRequiredCourses = [
  { courseCode: 'GS1001', courseName: '미적분학', credit: 3, year: 2020, semester: '1', grade: 'A0', courseType: 'M' },
  { courseCode: 'GS2001', courseName: '다변수해석학', credit: 3, year: 2020, semester: '2', grade: 'A0', courseType: 'M' },
  { courseCode: 'GS1601', courseName: '영어 I', credit: 2, year: 2020, semester: '1', grade: 'A0', courseType: 'M' },
  { courseCode: 'GS2652', courseName: '영어 II', credit: 2, year: 2020, semester: '2', grade: 'A0', courseType: 'M' },
  { courseCode: 'GS1513', courseName: '글쓰기', credit: 3, year: 2020, semester: '1', grade: 'A0', courseType: 'M' },
  { courseCode: 'GS1901', courseName: 'GIST 새내기', credit: 1, year: 2020, semester: '1', grade: 'S', courseType: 'M' },
];

describe('예체능(체육/예능) 무학점 필수 검증', () => {
  describe('2020학번 이후 (각 2학기 필수)', () => {
    it('예능 2과목 이수 시 예능 요건 충족', async () => {
      const input = {
        studentId: '20200001',
        userTakenCourseList: [
          ...baseRequiredCourses,
          // 예능 2과목
          { courseCode: 'GS0201', courseName: '피아노', credit: 0, year: 2020, semester: '1', grade: 'S', courseType: 'M' },
          { courseCode: 'GS0211', courseName: '드로잉', credit: 0, year: 2020, semester: '2', grade: 'S', courseType: 'M' },
          // 체육 2과목
          { courseCode: 'GS0101', courseName: '축구', credit: 0, year: 2020, semester: '1', grade: 'S', courseType: 'M' },
          { courseCode: 'GS0102', courseName: '테니스', credit: 0, year: 2020, semester: '2', grade: 'S', courseType: 'M' },
        ],
      };

      const result = await uploadAndEvaluate(input);
      expect(result.success).toBe(true);

      const reqs = result.data?.fineGrainedRequirements;
      const artsReq = reqs?.find((r) => r.id === 'arts');
      const sportsReq = reqs?.find((r) => r.id === 'sports');

      console.log('Arts Requirement:', artsReq);
      console.log('Sports Requirement:', sportsReq);

      expect(artsReq?.satisfied).toBe(true);
      expect(artsReq?.acquiredCredits).toBe(2); // 2과목
      expect(sportsReq?.satisfied).toBe(true);
      expect(sportsReq?.acquiredCredits).toBe(2); // 2과목
    });

    it('예능 1과목만 이수 시 예능 요건 미충족', async () => {
      const input = {
        studentId: '20200002',
        userTakenCourseList: [
          ...baseRequiredCourses,
          // 예능 1과목만
          { courseCode: 'GS0211', courseName: '드로잉', credit: 0, year: 2020, semester: '1', grade: 'S', courseType: 'M' },
          // 체육 2과목
          { courseCode: 'GS0101', courseName: '축구', credit: 0, year: 2020, semester: '1', grade: 'S', courseType: 'M' },
          { courseCode: 'GS0102', courseName: '테니스', credit: 0, year: 2020, semester: '2', grade: 'S', courseType: 'M' },
        ],
      };

      const result = await uploadAndEvaluate(input);
      expect(result.success).toBe(true);

      const reqs = result.data?.fineGrainedRequirements;
      const artsReq = reqs?.find((r) => r.id === 'arts');
      const sportsReq = reqs?.find((r) => r.id === 'sports');

      console.log('Arts Requirement (1 course):', artsReq);

      expect(artsReq?.satisfied).toBe(false);
      expect(artsReq?.acquiredCredits).toBe(1); // 1과목
      expect(sportsReq?.satisfied).toBe(true);
    });
  });

  describe('2018~2019학번 (각 4학기 필수)', () => {
    it('예능 4과목, 체육 4과목 이수 시 모두 충족', async () => {
      const input = {
        studentId: '20180001',
        userTakenCourseList: [
          ...baseRequiredCourses.map(c => ({ ...c, year: 2018 })),
          // 예능 4과목
          { courseCode: 'GS0201', courseName: '피아노', credit: 0, year: 2018, semester: '1', grade: 'S', courseType: 'M' },
          { courseCode: 'GS0202', courseName: '플룻', credit: 0, year: 2018, semester: '2', grade: 'S', courseType: 'M' },
          { courseCode: 'GS0203', courseName: '바이올린', credit: 0, year: 2019, semester: '1', grade: 'S', courseType: 'M' },
          { courseCode: 'GS0211', courseName: '드로잉', credit: 0, year: 2019, semester: '2', grade: 'S', courseType: 'M' },
          // 체육 4과목
          { courseCode: 'GS0101', courseName: '축구', credit: 0, year: 2018, semester: '1', grade: 'S', courseType: 'M' },
          { courseCode: 'GS0102', courseName: '테니스', credit: 0, year: 2018, semester: '2', grade: 'S', courseType: 'M' },
          { courseCode: 'GS0103', courseName: '농구', credit: 0, year: 2019, semester: '1', grade: 'S', courseType: 'M' },
          { courseCode: 'GS0104', courseName: '배드민턴', credit: 0, year: 2019, semester: '2', grade: 'S', courseType: 'M' },
        ],
      };

      const result = await uploadAndEvaluate(input);
      expect(result.success).toBe(true);

      const reqs = result.data?.fineGrainedRequirements;
      const artsReq = reqs?.find((r) => r.id === 'arts');
      const sportsReq = reqs?.find((r) => r.id === 'sports');

      console.log('2018 Arts Requirement (4 courses):', artsReq);
      console.log('2018 Sports Requirement (4 courses):', sportsReq);

      expect(artsReq?.satisfied).toBe(true);
      expect(artsReq?.acquiredCredits).toBe(4); // 4과목
      expect(sportsReq?.satisfied).toBe(true);
      expect(sportsReq?.acquiredCredits).toBe(4); // 4과목
    });

    it('예능 2과목만 이수 시 2018학번은 미충족', async () => {
      const input = {
        studentId: '20180002',
        userTakenCourseList: [
          ...baseRequiredCourses.map(c => ({ ...c, year: 2018 })),
          // 예능 2과목만 (4개 필요)
          { courseCode: 'GS0201', courseName: '피아노', credit: 0, year: 2018, semester: '1', grade: 'S', courseType: 'M' },
          { courseCode: 'GS0211', courseName: '드로잉', credit: 0, year: 2018, semester: '2', grade: 'S', courseType: 'M' },
          // 체육 4과목
          { courseCode: 'GS0101', courseName: '축구', credit: 0, year: 2018, semester: '1', grade: 'S', courseType: 'M' },
          { courseCode: 'GS0102', courseName: '테니스', credit: 0, year: 2018, semester: '2', grade: 'S', courseType: 'M' },
          { courseCode: 'GS0103', courseName: '농구', credit: 0, year: 2019, semester: '1', grade: 'S', courseType: 'M' },
          { courseCode: 'GS0104', courseName: '배드민턴', credit: 0, year: 2019, semester: '2', grade: 'S', courseType: 'M' },
        ],
      };

      const result = await uploadAndEvaluate(input);
      expect(result.success).toBe(true);

      const reqs = result.data?.fineGrainedRequirements;
      const artsReq = reqs?.find((r) => r.id === 'arts');
      const sportsReq = reqs?.find((r) => r.id === 'sports');

      console.log('2018 Arts Requirement (only 2 courses):', artsReq);

      expect(artsReq?.satisfied).toBe(false); // 2개만 이수 -> 미충족
      expect(artsReq?.acquiredCredits).toBe(2);
      expect(artsReq?.requiredCredits).toBe(4); // 2018학번은 4개 필요
      expect(sportsReq?.satisfied).toBe(true);
    });
  });
});
