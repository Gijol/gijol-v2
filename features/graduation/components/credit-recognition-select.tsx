import type { CreditRecognition } from '../domain/credit-recognition';
import { RECOGNITION_AREAS } from '../domain/credit-recognition';

export function CreditRecognitionSelect({
  value,
  onChange,
  label,
}: {
  value?: CreditRecognition;
  onChange: (value: CreditRecognition | undefined) => void;
  label: string;
}) {
  return (
    <select
      aria-label={label}
      className="h-8 max-w-full rounded border border-slate-300 bg-white px-2 text-xs"
      value={!value ? 'none' : value.status === 'pending' ? 'pending' : (value.category ?? 'otherUncheckedClass')}
      onChange={(event) => {
        const next = event.target.value;
        if (next === 'none') onChange(undefined);
        else if (next === 'pending') onChange({ ...value, status: 'pending' });
        else {
          const area = RECOGNITION_AREAS.find((a) => a.value === next);
          if (area) onChange({ ...value, status: 'approved', category: area.value });
        }
      }}
    >
      <option value="none">일반 수강</option>
      <option value="pending">타대 인정 확인 중</option>
      {RECOGNITION_AREAS.map((area) => (
        <option key={area.value} value={area.value}>
          타대 승인 · {area.label}
        </option>
      ))}
    </select>
  );
}
