import { useFormContext } from 'react-hook-form';
import { CertificateFormValues } from '@/features/certificate/schema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface CreditInputFieldProps {
  basePath: string;
  label: string;
}

export function CreditInputField({ basePath, label }: CreditInputFieldProps) {
  const form = useFormContext<CertificateFormValues>();
  const completedPath = `${basePath}.completed` as any;
  const inProgressPath = `${basePath}.inProgress` as any;
  const totalPath = `${basePath}.total` as any;

  return (
    <>
      <FormField
        control={form.control}
        name={completedPath}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}(이수 완료)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={0}
                max={200}
                {...field}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  field.onChange(val);
                  // 합계 자동 계산
                  const inProgress = form.getValues(inProgressPath) || 0;
                  form.setValue(totalPath, val + inProgress);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={inProgressPath}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}(이수 중)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={0}
                max={200}
                {...field}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  field.onChange(val);
                  // 합계 자동 계산
                  const completed = form.getValues(completedPath) || 0;
                  form.setValue(totalPath, completed + val);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={totalPath}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}(합계)</FormLabel>
            <FormControl>
              <Input type="number" {...field} readOnly className="bg-muted" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
