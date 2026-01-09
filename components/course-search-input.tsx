import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { Separator } from '@components/ui/separator';
import { IconAdjustments, IconSearch } from '@tabler/icons-react';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useCourseList } from '@hooks/course';

const minor_types = [
  { value: 'NONE', label: '없음' },
  { value: 'HUS', label: 'HUS' },
  { value: 'PPE', label: 'PPE' },
  { value: 'BS', label: '생물학' },
  { value: 'CH', label: '화학' },
  { value: 'CT', label: '문화기술' },
  { value: 'EB', label: '인문사회(경제•경영)' },
  { value: 'EC', label: '전기전자' },
  { value: 'EV', label: '환경' },
  { value: 'FE', label: '에너지' },
  { value: 'IR', label: '지능로봇' },
  { value: 'LH', label: '인문사회(문학과 역사)' },
  { value: 'MA', label: '신소재' },
  { value: 'MB', label: '인문사회(마음과 행동)' },
  { value: 'MC', label: '기계공학' },
  { value: 'MD', label: '의생명공학' },
  { value: 'MM', label: '수학' },
  { value: 'PP', label: '인문사회(공공정책)' },
  { value: 'PS', label: '물리학' },
  { value: 'SS', label: '인문사회(과학기술과 사회)' },
  { value: 'AI', label: 'AI 융합' },
];

export default function CourseSearchInput() {
  const { register, control, reset } = useFormContext();
  const { refetch } = useCourseList();
  const handleReset = () => {
    reset({
      courseSearchCode: 'NONE',
      courseSearchString: '',
      pageSize: 20,
    });
    refetch();
  };

  return (
    <div className="flex justify-center items-center mb-8 gap-4">
      <div className="relative w-[540px]">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="course-search"
          placeholder="강의코드, 강의명으로 검색해주세요!"
          className="pl-10 h-[50px] rounded-full border-2 hover:border-blue-500 transition-colors"
          {...register('courseSearchString')}
        />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="secondary" className="rounded-full h-[50px] px-6">
            검색 옵션
            <IconAdjustments className="ml-2 h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px]" align="end">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2 leading-none">옵션</h4>
              <Separator />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  HUS, PPE, 또는 부전공
                </label>
                <Controller
                  name="courseSearchCode"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="선택해주세요!" />
                      </SelectTrigger>
                      <SelectContent>
                        {minor_types.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  몇 개씩 검색할까요?
                </label>
                <Controller
                  name="pageSize"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      defaultValue={20}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 20)}
                    />
                  )}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={handleReset}>
                  초기화
                </Button>
                <Button type="submit" className="flex-1">
                  적용하기
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
