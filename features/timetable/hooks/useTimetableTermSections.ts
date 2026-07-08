import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SectionOffering } from '@/lib/types/timetable';

export function useTimetableTermSections(term: string) {
  const [sectionsByTerm, setSectionsByTerm] = useState<Record<string, SectionOffering[]>>({});
  const [loadingTerm, setLoadingTerm] = useState<string | null>(term || null);
  const [error, setError] = useState<string | null>(null);

  const loadTermSections = useCallback(
    async (nextTerm: string): Promise<boolean> => {
      if (!nextTerm || sectionsByTerm[nextTerm]) return true;

      setLoadingTerm(nextTerm);
      setError(null);

      try {
        const response = await fetch(`/api/timetable/${encodeURIComponent(nextTerm)}`);
        if (!response.ok) {
          throw new Error(`Failed to load ${nextTerm}: ${response.status}`);
        }

        const payload = (await response.json()) as { sections?: SectionOffering[] };
        setSectionsByTerm((current) => ({
          ...current,
          [nextTerm]: Array.isArray(payload.sections) ? payload.sections : [],
        }));
        return true;
      } catch (loadError) {
        console.error('Failed to load timetable term', loadError);
        setError('시간표 데이터를 불러오지 못했습니다.');
        return false;
      } finally {
        setLoadingTerm((current) => (current === nextTerm ? null : current));
      }
    },
    [sectionsByTerm],
  );

  useEffect(() => {
    void loadTermSections(term);
  }, [loadTermSections, term]);

  const sections = useMemo(() => sectionsByTerm[term] ?? [], [sectionsByTerm, term]);
  const isLoading = loadingTerm === term && !sectionsByTerm[term];

  return {
    sections,
    isLoading,
    error,
    loadTermSections,
  };
}
