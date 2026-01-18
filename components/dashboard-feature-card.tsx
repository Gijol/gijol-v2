import React from 'react';
import { LucideIcon } from 'lucide-react';
import Balancer from 'react-wrap-balancer';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';

export default function DashboardFeatureCard({
  feat,
}: {
  feat: {
    title: string;
    description: string;
    icon: LucideIcon;
    route?: string;
  };
}) {
  return (
    <Card className="h-full border-gray-200 bg-white shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-slate-950 dark:hover:bg-slate-900">
      <CardHeader>
        <feat.icon size="2rem" strokeWidth={1.4} className="mb-2 text-slate-900 dark:text-slate-100" />
        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">{feat.title}</CardTitle>
        <div className="mt-2 h-0.5 w-11 bg-slate-900 dark:bg-slate-100" />
      </CardHeader>
      <CardContent>
        <p className="min-h-20 text-sm text-slate-500 dark:text-slate-400">
          <Balancer ratio={0.2}>{feat.description}</Balancer>
        </p>
        <div className="mt-2 mr-auto ml-auto h-0.5 w-11 bg-slate-900 md:hidden dark:bg-slate-100" />
      </CardContent>
    </Card>
  );
}
