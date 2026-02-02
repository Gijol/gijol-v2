import { CreditTableRow, TableHeader } from '@/features/certificate/components/credit-table';

export function NoCreditSection() {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 bg-white">
      <table className="w-full text-sm">
        <TableHeader />
        <tbody className="divide-y divide-gray-100">
          <CreditTableRow basePath="NC.arts" label="예술" />
          <CreditTableRow basePath="NC.sports" label="체육" />
          <CreditTableRow basePath="NC.colloquium" label="콜로퀴엄" />
        </tbody>
      </table>
    </div>
  );
}
