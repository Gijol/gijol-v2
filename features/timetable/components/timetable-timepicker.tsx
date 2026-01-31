import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { Clock } from 'lucide-react';

// 9:00 ~ 17:00
const times = Array.from({ length: 8 }, (_, i) => i + 9)
  .flatMap((hour) => {
    return [0, 30].map((minute) => `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
  })
  .concat('17:00');

export default function TimePicker({ label, field }: { label: string; field: any }) {
  // field usually comes from RHF Controller: { onChange, onBlur, value, ref }
  // Shadcn Select doesn't support ref directly on root, but works ok without it usually,
  // or we pass ref to SelectTrigger?
  // SelectTrigger forwards ref.

  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-1 text-sm font-semibold">
        {label} <span className="text-red-500">*</span>
      </label>
      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
        <SelectTrigger ref={field.ref} className="w-full">
          <div className="flex items-center gap-2">
            <Clock size="1rem" className="text-muted-foreground" />
            <SelectValue placeholder="Select time" />
          </div>
        </SelectTrigger>
        <SelectContent className="max-h-[200px]">
          {times.map((time) => (
            <SelectItem key={time} value={time}>
              {time}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
