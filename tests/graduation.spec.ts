// Jest globals are typically available without import, or use @jest/globals
// describe, it, expect are available globally.

import { uploadAndEvaluate } from '../features/graduation/usecases/uploadAndEvaluate';
import input from './fixtures/input-20205098.json';

describe('Graduation Logic (20205098)', () => {
  it('should infer user major as EC and calculate credits correctly', async () => {
    // Act
    // We don't provide explicit major to test inference
    const result = await uploadAndEvaluate(input);

    expect(result.success).toBe(true);
    if (!result.success || !result.data) {
      throw new Error('Evaluation failed: ' + (result.errors?.join(', ') || 'Unknown error'));
    }

    const data = result.data;
    const cat = data.graduationCategory;
    const reqs = data.fineGrainedRequirements;

    console.log('Total Credits:', data.totalCredits);
    console.log('Major Credits:', cat.major.totalCredits);

    const husReq = reqs.find((r) => r.id === 'humanities-hus');
    const ppeReq = reqs.find((r) => r.id === 'humanities-ppe');

    console.log('HUS Credits:', husReq?.acquiredCredits);
    console.log('PPE Credits:', ppeReq?.acquiredCredits);

    // Assert: Check Major
    expect(cat.major.totalCredits).toBeGreaterThan(0);

    // Assert: HUS/PPE
    expect(husReq).toBeDefined();
    expect(ppeReq).toBeDefined();

    expect(husReq?.acquiredCredits).toBeGreaterThan(0);
    expect(ppeReq?.acquiredCredits).toBeGreaterThan(0);
    expect(ppeReq?.acquiredCredits).toBeGreaterThan(0);
  });

  it('should classify MOOC courses as free electives', async () => {
    const inputWithMooc = JSON.parse(JSON.stringify(input));
    inputWithMooc.userTakenCourseList.push({
      year: 2023,
      semester: '1',
      courseType: '전선',
      courseName: 'MOOC: Artificial Intelligence',
      courseCode: 'GS9999',
      credit: 1,
      grade: 'S',
    });

    const result = await uploadAndEvaluate(inputWithMooc);
    const data = result.data;
    if (!data) throw new Error('No data returned');

    const freeElectives = data.graduationCategory.otherUncheckedClass.userTakenCoursesList.takenCourses;
    const mooc = freeElectives.find((c) => c.courseName === 'MOOC: Artificial Intelligence');

    expect(mooc).toBeDefined();
    expect(mooc?.courseCode).toBe('GS9999');
  });
});
