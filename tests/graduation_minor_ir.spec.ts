
import { uploadAndEvaluate } from '../features/graduation/usecases/uploadAndEvaluate';
import input from './fixtures/input-20205098.json'; // using as template

describe('Intelligent Robot Minor Requirements', () => {
    it('should fail IR minor if credits < 15', async () => {
        const testInput = JSON.parse(JSON.stringify(input));
        // Set minor to IR
        testInput.userMinors = ['IR'];
        // Remove existing IR courses (if any) and add just a few
        testInput.userTakenCourseList = [
            // Mandatory 1
            { year: 2023, semester: '1', courseCode: 'IR4201', courseName: 'Deep Learning', credit: 3, grade: 'A+' },
             // Mandatory 2
            { year: 2023, semester: '1', courseCode: 'IR4202', courseName: 'Mechatronics', credit: 3, grade: 'A+' },
        ]; // Total 6 credits

        const result = await uploadAndEvaluate(testInput, { userMinors: ['IR'] });
        if (!result.data) throw new Error('Result data is undefined');
        const reqs = result.data.fineGrainedRequirements;
        const minorCreditReq = reqs.find(r => r.id === 'minor-credits-IR');
        
        expect(minorCreditReq).toBeDefined();
        expect(minorCreditReq?.satisfied).toBe(false);
        expect(minorCreditReq?.acquiredCredits).toBe(6);
    });

    it('should fail IR minor if mandatory courses < 3 (even if credits >= 15)', async () => {
        const testInput = JSON.parse(JSON.stringify(input));
        testInput.userMinors = ['IR'];
        testInput.userTakenCourseList = [
            // Mandatory 1
            { year: 2023, semester: '1', courseCode: 'IR4201', courseName: 'Deep Learning', credit: 3, grade: 'A+' },
             // Mandatory 2
            { year: 2023, semester: '1', courseCode: 'IR4202', courseName: 'Mechatronics', credit: 3, grade: 'A+' },
            // Electives to reach 15 credits
            { year: 2023, semester: '1', courseCode: 'IR2201', courseName: 'Circuit Theory', credit: 3, grade: 'A+' },
            { year: 2023, semester: '1', courseCode: 'IR2202', courseName: 'Dynamics', credit: 3, grade: 'A+' },
            { year: 2023, semester: '1', courseCode: 'IR3202', courseName: 'System Modeling', credit: 3, grade: 'A+' },
        ]; // Total 15 credits

        const result = await uploadAndEvaluate(testInput, { userMinors: ['IR'] });
        if (!result.data) throw new Error('Result data is undefined');
        const reqs = result.data.fineGrainedRequirements;
        
        // Credits satisfied
        const minorCreditReq = reqs.find(r => r.id === 'minor-credits-IR');
        expect(minorCreditReq?.satisfied).toBe(true);
        expect(minorCreditReq?.acquiredCredits).toBe(15);

        // Mandatory rule failed (Only 2/3)
        const mandatoryRuleReq = reqs.find(r => r.categoryKey === 'minor' && r.label.includes('필수 택3'));
        expect(mandatoryRuleReq).toBeDefined();
        expect(mandatoryRuleReq?.satisfied).toBe(false);
        expect(mandatoryRuleReq?.acquiredCredits).toBe(2);
    });

    it('should pass IR minor if credits >= 15 AND mandatory courses >= 3', async () => {
        const testInput = JSON.parse(JSON.stringify(input));
        testInput.userMinors = ['IR'];
        testInput.userTakenCourseList = [
            // Mandatory 1
            { year: 2023, semester: '1', courseCode: 'IR4201', courseName: 'Deep Learning', credit: 3, grade: 'A+' },
             // Mandatory 2
            { year: 2023, semester: '1', courseCode: 'IR4202', courseName: 'Mechatronics', credit: 3, grade: 'A+' },
             // Mandatory 3
            { year: 2023, semester: '1', courseCode: 'IR4203', courseName: 'HCI', credit: 3, grade: 'A+' },
            // Electives
            { year: 2023, semester: '1', courseCode: 'IR2201', courseName: 'Circuit Theory', credit: 3, grade: 'A+' },
            { year: 2023, semester: '1', courseCode: 'IR2202', courseName: 'Dynamics', credit: 3, grade: 'A+' },
        ]; // Total 15 credits, 3 mandatory

        const result = await uploadAndEvaluate(testInput, { userMinors: ['IR'] });
        if (!result.data) throw new Error('Result data is undefined');
        const reqs = result.data.fineGrainedRequirements;
        
        // Credits satisfied
        const minorCreditReq = reqs.find(r => r.id === 'minor-credits-IR');
        expect(minorCreditReq?.satisfied).toBe(true);

        // Mandatory rule satisfied
        const mandatoryRuleReq = reqs.find(r => r.categoryKey === 'minor' && r.label.includes('필수 택3'));
        expect(mandatoryRuleReq?.satisfied).toBe(true);
    });
});
