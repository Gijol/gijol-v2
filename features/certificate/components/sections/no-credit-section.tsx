import { CreditTableRow, TableHeader } from '@/features/certificate/components/credit-table';

export function NoCreditSection() {
  return (
    <section aria-label="무학점 필수 이수 내역">
      <p className="mb-2 text-xs text-slate-500 sm:hidden">표를 좌우로 밀어 모든 입력 항목을 확인할 수 있습니다.</p>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[34rem] table-fixed text-sm">
          <caption className="sr-only">무학점 필수 이수 내역 입력</caption>
          <TableHeader />
          <tbody className="divide-y divide-gray-100">
            <CreditTableRow basePath="NC.arts" label="예술" />
            <CreditTableRow basePath="NC.sports" label="체육" />
            <CreditTableRow basePath="NC.colloquium" label="콜로퀴엄" />
          </tbody>
        </table>
      </div>
    </section>
  );
}
