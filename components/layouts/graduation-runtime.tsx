import type { ReactElement } from 'react';
import { DashboardRuntime } from './dashboard-runtime';
import { Toaster } from '@/components/ui/toaster';

export function graduationLayout(page: ReactElement): ReactElement {
  return <DashboardRuntime overlay={<Toaster />}>{page}</DashboardRuntime>;
}
