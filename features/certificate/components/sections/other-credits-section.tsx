import { useFormContext } from 'react-hook-form';
import { CertificateFormValues } from '@/features/certificate/schema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export function OtherCreditsSection() {
  const form = useFormContext<CertificateFormValues>();

  return (
    <section aria-label="해외대학 학점 입력" className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
        {/* 해외대학 여름학기 */}
        <div className="col-span-full border-b border-slate-200 pb-3">
          <h3 className="text-sm font-semibold text-slate-950">해외대학 여름학기</h3>
          <p className="mt-1 text-xs text-slate-500">해당하는 경우에만 입력하세요.</p>
        </div>

        <FormField
          control={form.control}
          name="OU.summerSession.credits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>학점</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={200}
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="예: 3"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="OU.summerSession.university"
          render={({ field }) => (
            <FormItem>
              <FormLabel>파견대학</FormLabel>
              <FormControl>
                <Input autoComplete="off" placeholder="예: UC Berkeley" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="OU.summerSession.semester"
          render={({ field }) => (
            <FormItem>
              <FormLabel>파견학기</FormLabel>
              <FormControl>
                <Input autoComplete="off" placeholder="예: 2024-1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* SAP */}
        <div className="col-span-full mt-3 border-b border-slate-200 pb-3">
          <h3 className="text-sm font-semibold text-slate-950">SAP (Study Abroad Program)</h3>
          <p className="mt-1 text-xs text-slate-500">정규 교환 프로그램 이수 내역을 입력하세요.</p>
        </div>

        <FormField
          control={form.control}
          name="OU.studyAbroad.credits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>학점</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={200}
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="예: 12"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="OU.studyAbroad.university"
          render={({ field }) => (
            <FormItem>
              <FormLabel>파견대학</FormLabel>
              <FormControl>
                <Input autoComplete="off" placeholder="예: TU Munich" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="OU.studyAbroad.semester"
          render={({ field }) => (
            <FormItem>
              <FormLabel>파견학기</FormLabel>
              <FormControl>
                <Input autoComplete="off" placeholder="예: 2024-1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </section>
  );
}
