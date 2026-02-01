// features/roadmap/PresetCourseNode.tsx
// Custom React Flow node for preset roadmap data with view/edit mode support
import React, { memo } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CourseNodeData } from '@/lib/types/roadmap';
import { useRoadmapContext } from './RoadmapContext';

const categoryColors: Record<string, string> = {
  기초필수: 'bg-blue-100 border-blue-300 text-blue-800',
  기초선택: 'bg-cyan-100 border-cyan-300 text-cyan-800',
  전공필수: 'bg-purple-100 border-purple-300 text-purple-800',
  전공선택: 'bg-green-100 border-green-300 text-green-800',
  교양필수: 'bg-orange-100 border-orange-300 text-orange-800',
  교양선택: 'bg-yellow-100 border-yellow-300 text-yellow-800',
};

const statusColors: Record<string, string> = {
  COMPLETED: 'ring-2 ring-green-500 opacity-100',
  AVAILABLE: 'ring-2 ring-blue-400 opacity-100',
  LOCKED: 'opacity-60 grayscale',
};

const PresetCourseNode = ({ id, data, selected }: NodeProps<CourseNodeData>) => {
  const { isViewMode, setSelectedCourse, setSheetOpen, isNodeHighlighted, highlightState } = useRoadmapContext();

  const categoryStyle = categoryColors[data.category] || 'bg-gray-100 border-gray-300 text-gray-800';
  const statusStyle = data.status ? statusColors[data.status] : '';

  // Check if this node is highlighted (hovered or connected to hovered node)
  const isHighlighted = isNodeHighlighted(id);
  const hasActiveHighlight = highlightState.hoveredNodeId !== null;
  const isHoveredNode = highlightState.hoveredNodeId === id;

  const handleClick = () => {
    setSelectedCourse(data);
    setSheetOpen(true);
  };

  return (
    <>
      {!isViewMode && (
        <NodeResizer
          minWidth={150}
          minHeight={100}
          isVisible={selected}
          lineClassName="border-blue-400"
          handleClassName="h-3 w-3 bg-blue-500 border-2 border-white rounded"
        />
      )}
      <div
        onClick={handleClick}
        className={cn(
          'h-full min-w-[200px] rounded-lg border-2 bg-white shadow-md transition-all duration-200',
          selected ? 'border-primary ring-primary/50 ring-2' : 'border-slate-200',
          statusStyle,
          isViewMode && 'cursor-pointer hover:border-blue-400 hover:shadow-lg',
          // Highlight styles for view mode hover
          isViewMode && hasActiveHighlight && !isHighlighted && 'opacity-30',
          isViewMode && isHoveredNode && 'border-blue-500 ring-2 ring-blue-400 shadow-lg scale-[1.02] z-10',
          isViewMode && isHighlighted && !isHoveredNode && 'border-amber-400 ring-2 ring-amber-300 shadow-lg',
        )}
        style={{ width: '100%', height: '100%' }}
      >
        <Handle type="target" position={Position.Left} className="!h-3 !w-3 !border-2 !border-white !bg-slate-400" />

        <div className="flex h-full flex-col gap-1.5 p-3">
          {/* Category Badge & Course Code */}
          <div className="flex items-center justify-between">
            <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', categoryStyle)}>{data.category}</span>
            <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
              {data.credits}학점
            </Badge>
          </div>

          {/* Course Code */}
          <div className="font-mono text-[10px] text-gray-400">{data.courseCode}</div>

          {/* Course Title */}
          <div className="line-clamp-2 text-sm leading-tight font-bold text-gray-800">{data.label}</div>

          {/* Semester */}
          <div className="text-xs text-gray-500">{data.semester} 학기</div>
        </div>

        <Handle type="source" position={Position.Right} className="!h-3 !w-3 !border-2 !border-white !bg-slate-400" />
      </div>
    </>
  );
};

export default memo(PresetCourseNode);
