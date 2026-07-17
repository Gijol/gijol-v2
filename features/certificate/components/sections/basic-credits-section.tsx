import { CreditTableRow, TableHeader, SectionHeaderRow } from '@/features/certificate/components/credit-table';

interface BasicCreditsSectionProps {
  isLaterThan2021: boolean;
}

export function BasicCreditsSection({ isLaterThan2021 }: BasicCreditsSectionProps) {
  return (
    <section aria-label="기초 및 교양 학점">
      <p className="mb-2 text-xs text-slate-500 sm:hidden">표를 좌우로 밀어 모든 입력 항목을 확인할 수 있습니다.</p>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[34rem] table-fixed text-sm">
          <caption className="sr-only">기초 및 교양 학점 입력</caption>
          <TableHeader />
          <tbody className="divide-y divide-slate-100">
            <CreditTableRow basePath="B_C.languageBasics" label="언어의 기초" />
            <CreditTableRow basePath="B_C.humanitiesAndSocial" label="인문사회" />
            <CreditTableRow basePath="B_C.software" label="소프트웨어" />
            <CreditTableRow basePath="B_C.basicScience" label="기초과학" />

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
    </section>
  );
}
