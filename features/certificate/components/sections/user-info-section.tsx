import { useFormContext } from 'react-hook-form';
import { CertificateFormValues } from '@/features/certificate/schema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function UserInfoSection() {
  const form = useFormContext<CertificateFormValues>();

  return (
    <div className="rounded-xl border border-slate-300 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="USER.date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>신청 기간</FormLabel>
              <FormControl>
                <Input type="month" placeholder="YYYY-MM" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="USER.semester"
          render={({ field }) => (
            <FormItem>
              <FormLabel>전/후반기</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="전/후반기 선택" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="전반기">전반기</SelectItem>
                  <SelectItem value="후반기">후반기</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="USER.affiliation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>소속</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="소속 선택" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="전기전자컴퓨터공학부">전기전자컴퓨터공학부</SelectItem>
                  <SelectItem value="신소재공학부">신소재공학부</SelectItem>
                  <SelectItem value="기계공학부">기계공학부</SelectItem>
                  <SelectItem value="지구환경공학부">지구환경공학부</SelectItem>
                  <SelectItem value="생명과학부">생명과학부</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="USER.studentNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>학번</FormLabel>
              <FormControl>
                <Input placeholder="학번을 입력하세요" maxLength={8} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="USER.name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>성명</FormLabel>
              <FormControl>
                <Input placeholder="성명을 입력하세요" maxLength={10} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="USER.contact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>연락처</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="010-0000-0000"
                  maxLength={13}
                  {...field}
                  onChange={(e) => {
                    const formatted = e.target.value
                      .replace(/[^0-9]/g, '')
                      .replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/g, '$1-$2-$3')
                      .replace(/(-{1,2})$/g, '');
                    field.onChange(formatted);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="USER.minorMajor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>부전공</FormLabel>
              <FormControl>
                <Input placeholder="부전공명 (선택)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="USER.doubleMajor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>복수전공</FormLabel>
              <FormControl>
                <Input placeholder="복수전공명 (선택)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="USER.intensiveMajor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>심화전공</FormLabel>
              <FormControl>
                <Input placeholder="심화전공명 (선택)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
