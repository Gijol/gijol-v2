import { CreditTableRow, TableHeader, SectionHeaderRow } from '@/features/certificate/components/credit-table';

export function MajorCreditsSection() {
  return (
    <section aria-label="전공, 연구 및 자유선택 학점">
      <p className="mb-2 text-xs text-slate-500 sm:hidden">표를 좌우로 밀어 모든 입력 항목을 확인할 수 있습니다.</p>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[34rem] table-fixed text-sm">
          <caption className="sr-only">전공, 연구 및 자유선택 학점 입력</caption>
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
    </section>
  );
}
