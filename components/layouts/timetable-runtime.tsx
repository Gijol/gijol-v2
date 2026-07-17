import type { ReactElement, ReactNode } from 'react';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { DashboardRuntime } from './dashboard-runtime';

function TimetableQueryRuntime({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export function timetableLayout(page: ReactElement): ReactElement {
  return (
    <DashboardRuntime>
      <TimetableQueryRuntime>{page}</TimetableQueryRuntime>
    </DashboardRuntime>
  );
}
