import { useState, useEffect } from 'react';

/**
 * 입력값을 지정된 시간만큼 지연시켜 반환하는 훅
 * @param value - 디바운스할 값
 * @param delay - 지연 시간 (ms), 기본값 300ms
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
