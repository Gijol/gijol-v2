/* eslint-disable */
import { read, WorkSheet } from 'xlsx';
import { TakenCourse } from './TakenCourse';

const TYPE_CELL_INDEX = 'A';
const CODE_CELL_INDEX = 'B';
const COURSE_NAME_CELL_INDEX = 'D';
const CREDIT_CELL_INDEX = 'E';
const GRADE_CELL_INDEX = 'F';
const VALUE_KEY = 'v';
const START_INDEX = 3;

export class GradeReportParser {
  // 2020 + 2025 학사편람 기준 HUS 과목 코드
  private static readonly HUS_COURSES = new Set<string>([
    // HS 계열 (2025)
    'HS2502', 'HS2503', 'HS2505', 'HS2506', 'HS2507', 'HS2509', 'HS2510',
    'HS2511', 'HS2512', 'HS2521', 'HS2522', 'HS2523', 'HS2524', 'HS2525',
    'HS2526', 'HS2544', 'HS2581', 'HS2582', 'HS2601', 'HS2602', 'HS2603',
    'HS2605', 'HS2611', 'HS2612', 'HS2613', 'HS2614', 'HS2615', 'HS2616',
    'HS2617', 'HS2618', 'HS2621', 'HS2625', 'HS2627', 'HS2656', 'HS2723',
    'HS2814', 'HS3501', 'HS3502', 'HS3504', 'HS3505', 'HS3601', 'HS3602',
    'HS3603', 'HS3604', 'HS3605', 'HS3621', 'HS3623', 'HS3624', 'HS3625',
    'HS3626', 'HS3662', 'HS3802', 'HS3803', 'HS3901', 'HS4611',

    // GS 계열 (2020)
    'GS2524', 'GS2525', 'GS2526', 'GS2544', 'GS2601', 'GS2602', 'GS2603',
    'GS2611', 'GS2612', 'GS2613', 'GS2614', 'GS2615', 'GS2616', 'GS2618',
    'GS2621', 'GS2625', 'GS2627', 'GS2814', 'GS3501', 'GS3502', 'GS3504',
    'GS3601', 'GS3602', 'GS3603', 'GS3604', 'GS3621', 'GS3623', 'GS3624',
    'GS3626', 'GS3662', 'GS3801', 'GS3802', 'GS3803', 'GS3901',
  ]);

   // 2020 + 2025 학사편람 기준 PPE 과목 코드
  private static readonly PPE_COURSES = new Set<string>([
    // HS 계열 (2025)
    'HS2620', 'HS2661', 'HS2701', 'HS2702', 'HS2703', 'HS2704', 'HS2705',
    'HS2706', 'HS2707', 'HS2708', 'HS2709', 'HS2721', 'HS2722', 'HS2724',
    'HS2726', 'HS2727', 'HS2730', 'HS2732', 'HS2733', 'HS2734', 'HS2739',
    'HS2742', 'HS2743', 'HS2747', 'HS2748', 'HS2749', 'HS2750', 'HS2751',
    'HS2752', 'HS2753', 'HS2754', 'HS2761', 'HS2762', 'HS2763', 'HS2765',
    'HS2767', 'HS2781', 'HS2782', 'HS2783', 'HS2784', 'HS2787', 'HS2788',
    'HS2789', 'HS2794', 'HS2795', 'HS2796', 'HS2797', 'HS2803', 'HS2832',
    'HS2833', 'HS2834', 'HS2839', 'HS3631', 'HS3632', 'HS3633', 'HS3663',
    'HS3721', 'HS3722', 'HS3725', 'HS3728', 'HS3735', 'HS3736', 'HS3737',
    'HS3752', 'HS3753', 'HS3754', 'HS3762', 'HS3763', 'HS3764', 'HS3765',
    'HS3766', 'HS3767', 'HS3785', 'HS3786', 'HS3801', 'HS3831', 'HS3838',
    'HS3839', 'HS3861', 'HS4610', 'HS4710', 'HS4741', 'HS4762', 'HS4837',

    // GS 계열 (2020)
    'GS2620', 'GS2661', 'GS2701', 'GS2702', 'GS2703', 'GS2704', 'GS2705',
    'GS2706', 'GS2707', 'GS2708', 'GS2709', 'GS2724', 'GS2725', 'GS2726',
    'GS2727', 'GS2728', 'GS2730', 'GS2731', 'GS2732', 'GS2733', 'GS2734',
    'GS2735', 'GS2736', 'GS2742', 'GS2743', 'GS2747', 'GS2748', 'GS2750',
    'GS2751', 'GS2752', 'GS2761', 'GS2762', 'GS2763', 'GS2765', 'GS2781',
    'GS2782', 'GS2783', 'GS2784', 'GS2785', 'GS2786', 'GS2787', 'GS2788',
    'GS2803', 'GS2812', 'GS2831', 'GS2832', 'GS2833', 'GS2834', 'GS2835',
    'GS3631', 'GS3632', 'GS3633', 'GS3663', 'GS3721', 'GS3751', 'GS3752',
    'GS3753', 'GS3762', 'GS3763', 'GS3764', 'GS3861', 'GS4741', 'GS4761',
    'GS4762',
  ]);

   // 2020 + 2025 학사편람 기준 GSC 과목 코드
  private static readonly GSC_COURSES = new Set<string>([
    // 2025 GSC
    'GS1541', 'GS1750', 'GS2541', 'GS2542', 'GS2543', 'GS2545', 'GS2791',
    'GS2792', 'GS2793', 'GS2801', 'GS2802', 'GS2804', 'GS2807', 'GS2810',
    'GS2812', 'GS2815', 'GS2816', 'GS2817', 'GS2818', 'GS2819', 'GS2821',
    'GS2822', 'GS2823', 'GS2824', 'GS2825', 'GS2840', 'GS2911', 'GS2912',
    'GS2913', 'GS2921', 'GS2922', 'GS2931', 'GS2932', 'GS2933', 'GS3506',
    'GS3507',

    // 2020 GSC 추가분
    'GS2544', // 문화콘텐츠의 이해
    'GS3566', // 서양연극사 (2:0:2 버전)
  ]);

  public static readXlsxFile(filePath: string) {
    const workSheet = this.createSheet(filePath);
    let index = START_INDEX;
    const address = (cell: string, row: number) => cell + row;
    let [year, semester] = ['', ''];
    let userTakenCourseList: TakenCourse[] = [];

    while (true) {
      index += 1;
      if (this.isEndOfCode(workSheet, address(CODE_CELL_INDEX, index))) {
        break;
      }

      if (this.isSeparatedByYear(workSheet, address(COURSE_NAME_CELL_INDEX, index))) {
        [year, semester] = this.setYearAndSemester(
          workSheet,
          address(COURSE_NAME_CELL_INDEX, index)
        );
      }

      if (this.notExistCodeRow(workSheet, address(CODE_CELL_INDEX, index))) {
        continue;
      }

      const rawType = this.accessValueOfWorkSheet(workSheet, address(TYPE_CELL_INDEX, index));
      const code = this.accessValueOfWorkSheet(workSheet, address(CODE_CELL_INDEX, index));
      const course = this.accessValueOfWorkSheet(workSheet, address(COURSE_NAME_CELL_INDEX, index));
      const credit = this.accessValueOfWorkSheet(workSheet, address(CREDIT_CELL_INDEX, index));
      const grade = this.accessValueOfWorkSheet(workSheet, address(GRADE_CELL_INDEX, index));

      if (grade.includes('U')) {
        continue;
      }

      const isLetterGrade: boolean = ['A', 'B', 'C', 'D', 'F'].some((letterGrade) =>
        grade.includes(letterGrade)
      );
      const canBeDuplicated = ['GS01', 'GS02', 'UC9331'].some((duplicatableCode) =>
        code.includes(duplicatableCode)
      );

      // 🔥 코드 기반으로 HUS / PPE / GSC 전처리
      const type = this.getCourseTypeByCode(code, rawType);

      const addedTakenCourse = new TakenCourse(
        parseInt(year),
        semester,
        type,
        code,
        course,
        parseInt(credit),
        grade
      );

      if (
        userTakenCourseList.some(
          (takenCourse) => takenCourse.equals(addedTakenCourse) && isLetterGrade && !canBeDuplicated
        )
      ) {
        userTakenCourseList = userTakenCourseList.filter(
          (course) => !course.equals(addedTakenCourse)
        );
      }
      userTakenCourseList.push(addedTakenCourse);
    }
    const studentId = this.parseStudentId(workSheet);
    return { studentId, userTakenCourseList };
  }

  /**
   * 코드 기반으로 HUS / PPE / GSC 타입을 결정.
   * - 코드가 해당 리스트에 있으면 HUS / PPE / GSC 반환
   * - 아니면 기존 엑셀의 type 값을 그대로 사용
   */
  private static getCourseTypeByCode(code: string, fallbackType: string): string {
    const trimmedCode = code.trim();

    if (this.HUS_COURSES.has(trimmedCode)) return 'HUS';
    if (this.PPE_COURSES.has(trimmedCode)) return 'PPE';
    if (this.GSC_COURSES.has(trimmedCode)) return 'GSC';

    // 코드 매칭 안 되면 기존 이수구분(or 빈 문자열) 유지
    return fallbackType;
  }

  private static isEndOfCode(workSheet: WorkSheet, excelAddress: string) {
    const workSheetElement: string = this.accessValueOfWorkSheet(workSheet, excelAddress);
    return workSheetElement.includes('[학사]');
  }

  private static notExistCodeRow(workSheet: WorkSheet, excelAddress: string) {
    const workSheetElement = this.accessValueOfWorkSheet(workSheet, excelAddress);
    return !workSheetElement || workSheetElement === 'Code';
  }

  private static isSeparatedByYear(workSheet: WorkSheet, excelAddress: string) {
    let workSheetElement = this.accessValueOfWorkSheet(workSheet, excelAddress);
    return workSheetElement && workSheetElement.includes('학기>');
  }

  private static setYearAndSemester(workSheet: WorkSheet, excelAddress: string) {
    const workSheetElement = this.accessValueOfWorkSheet(workSheet, excelAddress);
    const elementWithNoWhitespace = workSheetElement.trim();
    const [year, semester] = elementWithNoWhitespace
      .substring(1, elementWithNoWhitespace.length - 1)
      .split('/');
    return [year, semester];
  }

  private static accessValueOfWorkSheet(workSheet: WorkSheet, excelAddress: string): string {
    if (excelAddress in workSheet) {
      const workSheetElement = workSheet[excelAddress];
      if (VALUE_KEY in workSheetElement) {
        return workSheetElement[VALUE_KEY].trim();
      }
    }

    return '';
  }

  private static parseStudentId(workSheet: any) {
    const studentIdString = workSheet.A2[VALUE_KEY];
    return studentIdString.split(':')[1].trim(); // format: StudentNo.:20205185
  }

  private static createSheet(file: string | ArrayBuffer) {
    // xlsx.read accepts different "type" options depending on input
    const isString = typeof file === 'string';
    const readOpts = isString ? { type: 'binary' as const } : { type: 'array' as const };
    const workBook = read(file as any, readOpts);
    const sheetNames = workBook.SheetNames;
    if (sheetNames.length > 1) throw new Error('유효하지 않은 파일입니다.');
    const sheetName = sheetNames[0];
    return workBook.Sheets[sheetName];
  }
}
