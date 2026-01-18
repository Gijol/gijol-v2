import { CreditTableRow, TableHeader, SectionHeaderRow } from '@/features/certificate/components/credit-table';

interface BasicCreditsSectionProps {
  isLaterThan2021: boolean;
}

export function BasicCreditsSection({ isLaterThan2021 }: BasicCreditsSectionProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 bg-white">
      <table className="w-full text-sm">
        <TableHeader />
        <tbody className="divide-y divide-slate-100">
          <CreditTableRow basePath="B_C.languageBasics" label="언어의 기초" />
          <CreditTableRow basePath="B_C.humanitiesAndSocial" label="인문사회" />
          <CreditTableRow basePath="B_C.software" label="소프트웨어" />
          <CreditTableRow basePath="B_C.basicScience" label="기초과학" />

          {/* 학번에 따른 조건부 필드 */}
          {isLaterThan2021 ? (
            <>
              <SectionHeaderRow title="2021년 이후 학번 전용" />
              <CreditTableRow basePath="B_C.gistFreshman" label="GIST 새내기" />
              <CreditTableRow basePath="B_C.gistMajorExploration" label="GIST 전공탐색" />
            </>
          ) : (
            <>
              <SectionHeaderRow title="2020년 이전 학번 전용" />
              <CreditTableRow basePath="B_C.freshmanSeminar" label="신입생세미나" />
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
