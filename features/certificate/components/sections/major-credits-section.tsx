import { CreditTableRow, TableHeader, SectionHeaderRow } from '@/features/certificate/components/credit-table';

export function MajorCreditsSection() {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 bg-white">
      <table className="w-full text-sm">
        <TableHeader />
        <tbody className="divide-y divide-slate-100">
          {/* 전공학점 */}
          <SectionHeaderRow title="전공학점" />
          <CreditTableRow basePath="M_R_F.majorRequired" label="전공필수" />
          <CreditTableRow basePath="M_R_F.majorElective" label="전공선택" />

          {/* 연구학점 */}
          <SectionHeaderRow title="연구학점" />
          <CreditTableRow basePath="M_R_F.thesisResearch" label="학사논문연구" />

          {/* 자유선택 학점 */}
          <SectionHeaderRow title="자유선택 학점" />
          <CreditTableRow basePath="M_R_F.universityCommonSubjects" label="대학 공통 교과목" />
          <CreditTableRow basePath="M_R_F.humanitiesAndSocial" label="인문사회" />
          <CreditTableRow basePath="M_R_F.languageSelectionSoftware" label="언어선택/소프트웨어" />
          <CreditTableRow basePath="M_R_F.basicScienceSelection" label="기초과학선택" />
          <CreditTableRow basePath="M_R_F.otherMajor" label="타전공" />
          <CreditTableRow basePath="M_R_F.graduateSchoolSubjects" label="대학원 교과목" />
        </tbody>
      </table>
    </div>
  );
}
