import { calcAverageGrade } from '../lib/utils/course/analytics';

describe('calcAverageGrade', () => {
  it('should return null for empty input', () => {
    expect(calcAverageGrade([])).toBeNull();
  });

  it('should ignore non-graded courses', () => {
    const courses = [
      { credit: 3, grade: 'P' },
      { credit: 1, grade: 'NP' },
    ];
    // @ts-ignore
    expect(calcAverageGrade(courses)).toBeNull();
  });

  it('should calculate simple average', () => {
    const courses = [
      { credit: 3, grade: 'A+' }, // 4.5 * 3 = 13.5
      { credit: 3, grade: 'A+' }, // 4.5 * 3 = 13.5
    ];
    // Total: 27 / 6 = 4.5
    expect(calcAverageGrade(courses)).toBe(4.5);
  });

  it('should calculate weighted average correctly', () => {
    const courses = [
      { credit: 3, grade: 'A+' }, // 4.5 * 3 = 13.5
      { credit: 3, grade: 'B+' }, // 3.5 * 3 = 10.5
    ];
    // Total: 24 / 6 = 4.0
    expect(calcAverageGrade(courses)).toBe(4.0);
  });

  it('should truncate (floor) at 3rd decimal place', () => {
    // 3.126... -> 3.12
    // Let's construct a case.
    // 3 credits * 4.5 (A+) = 13.5
    // 3 credits * 3.0 (B0) = 9.0
    // 3 credits * 2.5 (C+) = 7.5
    // Total points: 30
    // Total credits: 9
    // Average: 3.3333... -> 3.33
    
    // Another case for verify flooring vs rounding
    // We need something that ends in >= .xx5
    // Total Points / Total Credits = 3.126
    // 3.126 * 10 = 31.26
    
    // 2 credits * A0(4.0) = 8
    // 1 credit * C+(2.5) = 2.5
    // Total: 10.5 / 3 = 3.5 (Exact)
    
    // Try:
    // 3 credit A+(4.5) = 13.5
    // 3 credit C+(2.5) = 7.5
    // 1 credit D0(1.0) = 1.0
    // Total: 22 / 7 = 3.142857...
    // Expected: 3.14
    
    const courses1 = [
        { credit: 3, grade: 'A+' },
        { credit: 3, grade: 'C+' },
        { credit: 1, grade: 'D0' },
    ];
    expect(calcAverageGrade(courses1)).toBe(3.14);

    // Case for rounding vs flooring difference
    // Need a nuber like 3.126
    // 3.126 * 1000 = 3126
    // 3 credit A+(4.5) = 13.5
    // 3 credit B0(3.0) = 9.0
    // 1 credit C+(2.5) = 2.5
    // Total: 25.0 / 7 = 3.5714... -> 3.57 (Both round and floor are same)
    
    // Let's try to find a case where round gives X+0.01 and floor gives X.
    // e.g. 3.126 -> Round: 3.13, Floor: 3.12
    
    // 1 credit A+(4.5)
    // 1 credit A+(4.5)
    // 1 credit F(0)
    // Total 9 / 3 = 3.0
    
    // 1 cr * 4.5
    // 1 cr * 4.0
    // 1 cr * 3.5
    // Total 12 / 3 = 4.0

    // (4.5 + 4.5 + 2.5) / 3 = 11.5 / 3 = 3.8333... -> 3.83
    
    // (4.5 * 1 + 2.5 * 2) / 3 = 9.5 / 3 = 3.1666...
    // Round: 3.17
    // Floor: 3.16 <--- This is what we want to test
    const courses2 = [
        { credit: 1, grade: 'A+' }, // 4.5
        { credit: 2, grade: 'C+' }, // 2.5 * 2 = 5.0
    ];
    // Total: 9.5 / 3 = 3.16666...
    
    // Current impl (Round) expectation: 3.17
    // New impl (Floor) expectation: 3.16
    
    // I will set expectation to 3.16 assuming I will change the code.
    expect(calcAverageGrade(courses2)).toBe(3.16);
  });
});
