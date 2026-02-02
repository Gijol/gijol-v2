import { useFormContext } from 'react-hook-form';
import { CertificateFormValues } from '@/features/certificate/schema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export function OtherCreditsSection() {
  const form = useFormContext<CertificateFormValues>();

  return (
    <div className="rounded-xl border border-slate-300 bg-white px-4 pb-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* 해외대학 여름학기 */}
        <div className="col-span-full mt-4">
          <p className="text-sm font-semibold">해외대학 여름학기</p>
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
                  placeholder="학점"
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
                <Input placeholder="파견대학명" {...field} />
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
                <Input placeholder="2024-1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* SAP */}
        <div className="col-span-full mt-4">
          <p className="text-sm font-semibold">SAP (Study Abroad Program)</p>
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
                  placeholder="학점"
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
                <Input placeholder="파견대학명" {...field} />
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
                <Input placeholder="2024-1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
