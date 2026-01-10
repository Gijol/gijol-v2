import React from 'react';
import { IconProps } from '@tabler/icons-react';
import Balancer from 'react-wrap-balancer';
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ui/card';

export default function DashboardFeatureCard({
  feat,
}: {
  feat: {
    title: string;
    description: string;
    icon: React.ComponentType<IconProps>;
    route?: string;
  };
}) {
  return (
    <Card className="h-full transition-colors hover:bg-gray-50 dark:hover:bg-slate-900 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-950 shadow-sm">
      <CardHeader>
        <feat.icon size="2rem" stroke={1.4} className="text-slate-900 dark:text-slate-100 mb-2" />
        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {feat.title}
        </CardTitle>
        <div className="h-0.5 w-11 bg-slate-900 dark:bg-slate-100 mt-2" />
      </CardHeader>
      <CardContent>
        <p className="min-h-20 text-sm text-slate-500 dark:text-slate-400">
          <Balancer ratio={0.2}>{feat.description}</Balancer>
        </p>
        <div className="h-0.5 w-11 bg-slate-900 dark:bg-slate-100 mt-2 ml-auto mr-auto md:hidden" />
      </CardContent>
    </Card>
  );
}

