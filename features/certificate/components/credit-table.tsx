import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useEffect } from 'react';

export const TableHeader = () => (
  <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
    <tr>
      <th scope="col" className="w-[42%] px-4 py-3 text-left">
        구분
      </th>
      <th scope="col" className="w-[21%] px-2 py-3 text-center">
        기이수
      </th>
      <th scope="col" className="w-[21%] px-2 py-3 text-center">
        수강 중
      </th>
      <th scope="col" className="w-[16%] px-4 py-3 text-center">
        합계
      </th>
    </tr>
  </thead>
);

export const CreditTableRow = ({ label, basePath }: { label: string; basePath: string }) => {
  const { control, watch, setValue } = useFormContext();
  const completed = watch(`${basePath}.completed`) || 0;
  const inProgress = watch(`${basePath}.inProgress`) || 0;

  useEffect(() => {
    const total = (parseInt(completed) || 0) + (parseInt(inProgress) || 0);
    setValue(`${basePath}.total`, total);
  }, [completed, inProgress, setValue, basePath]);

  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
      <th scope="row" className="px-4 py-3 text-left text-sm font-medium break-words text-slate-900">
        {label}
      </th>
      <td className="px-2 py-2">
        <FormField
          control={control}
          name={`${basePath}.completed`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min="0"
                  max="200"
                  inputMode="decimal"
                  aria-label={`${label} 기이수 학점`}
                  className="h-9 min-w-16 text-center tabular-nums shadow-none focus-visible:ring-2"
                  placeholder="0"
                  value={Number.isNaN(field.value) ? '' : (field.value ?? '')}
                  onChange={(e) => field.onChange(e.target.value === '' ? 0 : e.target.valueAsNumber)}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </td>
      <td className="px-2 py-2">
        <FormField
          control={control}
          name={`${basePath}.inProgress`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min="0"
                  max="200"
                  inputMode="decimal"
                  aria-label={`${label} 수강 중 학점`}
                  className="h-9 min-w-16 text-center tabular-nums shadow-none focus-visible:ring-2"
                  placeholder="0"
                  value={Number.isNaN(field.value) ? '' : (field.value ?? '')}
                  onChange={(e) => field.onChange(e.target.value === '' ? 0 : e.target.valueAsNumber)}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </td>
      <td className="px-4 py-3 text-center font-semibold text-slate-900 tabular-nums">
        <FormField
          control={control}
          name={`${basePath}.total`}
          render={({ field }) => <span>{field.value || 0}</span>}
        />
      </td>
    </tr>
  );
};

export const SectionHeaderRow = ({ title }: { title: string }) => (
  <tr>
    <th
      scope="colgroup"
      colSpan={4}
      className="border-t border-slate-100 bg-blue-50/60 px-4 py-2 text-left first:border-t-0"
    >
      <span className="text-xs font-semibold text-blue-800">{title}</span>
    </th>
  </tr>
);
