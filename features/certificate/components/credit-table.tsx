import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useEffect } from 'react';

export const TableHeader = () => (
  <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
    <tr>
      <th className="px-4 py-3 text-left">구분</th>
      <th className="px-4 py-3 text-center">기이수</th>
      <th className="px-4 py-3 text-center">수강중</th>
      <th className="px-4 py-3 text-center">합계</th>
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
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
      <td className="px-4 py-3 font-medium text-gray-900">{label}</td>
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
                  className="h-9 text-center shadow-none focus-visible:ring-1"
                  placeholder="0"
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
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
                  className="h-9 text-center shadow-none focus-visible:ring-1"
                  placeholder="0"
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </td>
      <td className="px-4 py-3 text-center font-bold text-gray-900">
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
    <td colSpan={4} className="border-t border-gray-100 bg-gray-50/50 px-4 py-2 first:border-t-0">
      <span className="text-brand-primary text-xs font-bold">{title}</span>
    </td>
  </tr>
);
