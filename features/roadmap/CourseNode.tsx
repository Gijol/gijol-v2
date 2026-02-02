import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { CourseNodeData } from './types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const CourseNode = ({ data, selected }: NodeProps<CourseNodeData>) => {
  return (
    <div
      className={cn(
        'bg-background w-[180px] rounded-md border-2 shadow-md transition-all',
        selected ? 'border-primary' : 'border-border',
      )}
    >
      <Handle type="target" position={Position.Left} className="bg-muted-foreground! h-3 w-3" />

      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-start justify-between">
          <span className="text-muted-foreground bg-muted rounded px-1 font-mono text-[10px]">{data.courseCode}</span>
          <Badge variant="outline" className="h-4 px-1 text-[10px]">
            {data.credits}학점
          </Badge>
        </div>

        <div className="line-clamp-2 text-sm leading-tight font-bold">{data.label}</div>

        {/* departmentContext is not available in CourseNodeData
        {data.departmentContext && (
          <div className="text-muted-foreground truncate text-[10px]">
            {data.departmentContext.split('|').pop()?.trim()}
          </div>
        )} */}
      </div>

      <Handle type="source" position={Position.Right} className="!bg-muted-foreground h-3 w-3" />
    </div>
  );
};

export default memo(CourseNode);
