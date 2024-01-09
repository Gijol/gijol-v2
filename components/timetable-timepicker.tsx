import { NativeSelect } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';

// 9:00 ~ 17:00
const times = Array.from({ length: 8 }, (_, i) => i + 9)
  .flatMap((hour) => {
    return [0, 30].map(
      (minute) => `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    );
  })
  .concat('17:00');

export default function TimePicker({ label, field }: { label: string; field: any }) {
  return (
    <NativeSelect
      data={times}
      label={label}
      placeholder="Select time"
      icon={<IconClock size="1rem" />}
      withAsterisk
      styles={{ label: { marginBottom: 8, fontWeight: 600 } }}
      {...field}
    />
  );
}
