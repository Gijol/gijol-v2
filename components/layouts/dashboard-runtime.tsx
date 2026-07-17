import type { ReactElement, ReactNode } from 'react';
import { Layout } from './layout';

export function DashboardRuntime({ children, overlay }: { children: ReactNode; overlay?: ReactNode }) {
  return (
    <>
      <Layout>{children}</Layout>
      {overlay}
    </>
  );
}

export function dashboardLayout(page: ReactElement): ReactElement {
  return <DashboardRuntime>{page}</DashboardRuntime>;
}
