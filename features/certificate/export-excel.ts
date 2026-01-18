import ExcelJS from 'exceljs';
import { MAP_2021 } from './mapping/after_2021';

import { CertificateFormValues, CreditValue } from './schema';

export type CertificateFormData = CertificateFormValues;

/**
 * Generate Excel file from form data using template
 */
export async function generateCertificateExcel(formData: CertificateFormData, isAfter2021: boolean): Promise<Blob> {
  // Fetch template file from public folder
  const templatePath = isAfter2021 ? '/templates/after_2021_template.xlsx' : '/templates/2018_to_2020_template.xlsx';

  const response = await fetch(templatePath);
  if (!response.ok) {
    throw new Error(`Failed to load template file: ${templatePath}`);
  }
  const templateBuffer = await response.arrayBuffer();

  // Read template workbook
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(templateBuffer);

  const worksheet = workbook.getWorksheet(1); // ExcelJS uses 1-based indexing for worksheets
  if (!worksheet) {
    throw new Error('Worksheet not found in template');
  }

  const mapping = MAP_2021;

  // 1. Basic Info
  setCellValue(worksheet, mapping.basicInfo.major, formData.USER.affiliation);
  setCellValue(worksheet, mapping.basicInfo.studentId, formData.USER.studentNumber);
  setCellValue(worksheet, mapping.basicInfo.name, formData.USER.name);
  setCellValue(worksheet, mapping.basicInfo.contact, formData.USER.contact);

  // 2. Date fields - format title
  const [year, month] = formData.USER.date.split('-');
  const semesterText = formData.USER.semester === '전반기' ? '전반기' : '후반기';
  const titleText = `${year}년 ${semesterText}(${parseInt(month)}월) 졸업신청 및 졸업 이수요건 확인서`;
  setCellValue(worksheet, mapping.dateFields.title, titleText);

  // 3. Composites
  setCellValue(worksheet, mapping.composites.majorDetails, formData.USER.majorDetails);

  // Summer session format
  if (formData.OU.summerSession.credits) {
    const summerText = `${formData.OU.summerSession.credits}학점 / ${formData.OU.summerSession.university} / ${formData.OU.summerSession.subjects.join(', ')} / ${formData.OU.summerSession.semester}`;
    setCellValue(worksheet, mapping.composites.summerSession, summerText);
  }

  // Study abroad format
  if (formData.OU.studyAbroad.credits) {
    const abroadText = `${formData.OU.studyAbroad.credits}학점 / ${formData.OU.studyAbroad.university} / ${formData.OU.studyAbroad.subjects.join(', ')} / ${formData.OU.studyAbroad.semester}`;
    setCellValue(worksheet, mapping.composites.studyAbroad, abroadText);
  }

  // 4. Credits mapping
  // Basic credits
  setCreditValues(worksheet, mapping.credits.basic_languageBasic, formData.B_C.languageBasics);
  setCreditValues(worksheet, mapping.credits.basic_humanities, formData.B_C.humanitiesAndSocial);
  setCreditValues(worksheet, mapping.credits.basic_software, formData.B_C.software);
  setCreditValues(worksheet, mapping.credits.basic_basicScience, formData.B_C.basicScience);
  setCreditValues(worksheet, mapping.credits.basic_gistFreshman, formData.B_C.gistFreshman);
  setCreditValues(worksheet, mapping.credits.basic_majorExploration, formData.B_C.gistMajorExploration);

  // Major/Research/Free credits
  setCreditValues(worksheet, mapping.credits.major_required, formData.M_R_F.majorRequired);
  setCreditValues(worksheet, mapping.credits.major_elective, formData.M_R_F.majorElective);
  setCreditValues(worksheet, mapping.credits.research, formData.M_R_F.thesisResearch);
  setCreditValues(worksheet, mapping.credits.free_universityCommon, formData.M_R_F.universityCommonSubjects);
  setCreditValues(worksheet, mapping.credits.free_humanities, formData.M_R_F.humanitiesAndSocial);
  setCreditValues(worksheet, mapping.credits.free_langSw, formData.M_R_F.languageSelectionSoftware);
  setCreditValues(worksheet, mapping.credits.free_basicScience, formData.M_R_F.basicScienceSelection);
  setCreditValues(worksheet, mapping.credits.free_otherMajor, formData.M_R_F.otherMajor);
  setCreditValues(worksheet, mapping.credits.free_graduateCourse, formData.M_R_F.graduateSchoolSubjects);

  // 5. No credit but required
  setCreditValues(worksheet, mapping.noCreditButRequired.arts, formData.NC.arts);
  setCreditValues(worksheet, mapping.noCreditButRequired.sports, formData.NC.sports);
  setCreditValues(worksheet, mapping.noCreditButRequired.colloquium, formData.NC.colloquium);

  // 6. Signature
  const today = new Date();
  const signatureText = `${formData.USER.name} (인)\n${today.getFullYear()}. ${String(today.getMonth() + 1).padStart(2, '0')}. ${String(today.getDate()).padStart(2, '0')}`;
  // For signature, correct newlines are important. ExcelJS handles strings as is.
  // If we want actual rich text or specific alignment, we can set that on the cell style.
  // For now, simple value replacement is likely enough if the cell has wrapText: true.
  setCellValue(worksheet, mapping.signature.applicant, signatureText);

  // Generate output
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

function setCellValue(worksheet: ExcelJS.Worksheet, cellAddress: string, value: string | number) {
  const cell = worksheet.getCell(cellAddress);
  cell.value = value;
}

function setCreditValues(
  worksheet: ExcelJS.Worksheet,
  mapping: { done: string; plan: string; total: string },
  value: CreditValue,
) {
  setCellValue(worksheet, mapping.done, value.completed);
  setCellValue(worksheet, mapping.plan, value.inProgress);
  setCellValue(worksheet, mapping.total, value.total);
}

/**
 * Trigger download of the generated Excel file
 */
export function downloadExcel(blob: Blob, filename: string = 'certificate.xlsx') {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
