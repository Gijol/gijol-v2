// features/roadmap/PresetCourseNode.tsx
// Custom React Flow node for preset roadmap data for read-only course browsing
import React, { memo } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CourseNodeData } from '@/lib/types/roadmap';
import { useGraduationStore } from '@/lib/stores/useGraduationStore';
import { isRoadmapCourseCompleted } from './completion';
import { useRoadmapContext } from './RoadmapContext';

const categoryColors: Record<string, string> = {
  기초필수: 'bg-blue-100 border-blue-300 text-blue-800',
  기초선택: 'bg-cyan-100 border-cyan-300 text-cyan-800',
  전공필수: 'bg-purple-100 border-purple-300 text-purple-800',
  전공선택: 'bg-green-100 border-green-300 text-green-800',
  MOOC: 'bg-indigo-100 border-indigo-300 text-indigo-800',
  타전공1: 'bg-rose-100 border-rose-300 text-rose-800',
  타전공2: 'bg-pink-100 border-pink-300 text-pink-800',
  편성예정: 'bg-slate-100 border-slate-300 text-slate-600',
};

const statusColors: Record<string, string> = {
  COMPLETED: 'ring-2 ring-green-500 opacity-100',
  AVAILABLE: 'ring-2 ring-blue-400 opacity-100',
  LOCKED: 'opacity-60 grayscale',
};

const PresetCourseNode = ({ id, data, selected }: NodeProps<CourseNodeData>) => {
  const { setSelectedCourse, setSheetOpen, isNodeHighlighted, highlightState, setHoveredNode } = useRoadmapContext();

  const { getEdges } = useReactFlow();
  const focusConnections = () => {
    const edges = getEdges().filter((e) => e.source === id || e.target === id);
    setHoveredNode(
      id,
      edges.map((e) => (e.source === id ? e.target : e.source)),
      edges.map((e) => e.id),
    );
  };

  const categoryStyle = categoryColors[data.category] || 'bg-gray-100 border-gray-300 text-gray-800';
  const takenCourses = useGraduationStore((state) => state.takenCourses);
  const completed = isRoadmapCourseCompleted(data, takenCourses);
  const statusStyle = completed
    ? statusColors.COMPLETED
    : data.status === 'COMPLETED'
      ? ''
      : (statusColors[data.status] ?? '');

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
      <div
        onClick={handleClick}
        onFocus={focusConnections}
        onBlur={() => setHoveredNode(null)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`${data.label}${completed ? ' 이수 완료' : ''} 과목 상세 보기`}
        className={cn(
          'h-full min-w-[200px] rounded-xl border bg-white text-left shadow-sm transition-[border-color,opacity] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-blue-600 motion-reduce:transition-none',
          selected ? 'border-primary ring-primary/50 ring-2' : 'border-slate-200',
          statusStyle,
          'cursor-pointer hover:border-blue-400',
          // Highlight styles for view mode hover
          hasActiveHighlight && !isHighlighted && 'opacity-30',
          isHoveredNode && 'z-10 border-blue-500 shadow-lg ring-2 ring-blue-400',
          isHighlighted && !isHoveredNode && 'border-amber-400 shadow-lg ring-2 ring-amber-300',
        )}
        style={{ width: '100%', height: '100%' }}
      >
        <Handle
          isConnectable={false}
          type="target"
          position={Position.Left}
          className="h-3! w-3! border-2! border-white! bg-slate-400!"
        />

        <div className="flex h-full flex-col gap-1 p-3">
          {/* Category Badge & Course Code */}
          <div className="flex items-center justify-between">
            <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', categoryStyle)}>{data.category}</span>
            <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
              {data.credits}학점
            </Badge>
          </div>

          {/* Course Code */}
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-mono">{data.courseCode || '과목군'}</span>
            {completed && <span className="font-semibold text-green-700">✓ 이수 완료</span>}
          </div>

          {/* Course Title */}
          <div className="line-clamp-2 text-sm leading-tight font-bold text-gray-800">{data.label}</div>

          {/* Semester */}
        </div>

        <Handle
          isConnectable={false}
          type="source"
          position={Position.Right}
          className="h-3! w-3! border-2! border-white! bg-slate-400!"
        />
      </div>
    </>
  );
};

export default memo(PresetCourseNode);
