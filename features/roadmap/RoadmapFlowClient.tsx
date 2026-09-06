// features/roadmap/RoadmapFlowClient.tsx
// Separated client-side ReactFlow component for code-splitting
import React, { useMemo, useCallback } from 'react';
import ReactFlow, { ReactFlowProvider, Controls, Background, MiniMap, useReactFlow, Node, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';

import PresetCourseNode from '@/features/roadmap/PresetCourseNode';
import SemesterHeaderNode from '@/features/roadmap/SemesterHeaderNode';
import { CourseDetailSheet } from '@/features/roadmap/CourseDetailSheet';
import { useRoadmapContext } from '@/features/roadmap/RoadmapContext';
import { Button } from '@/components/ui/button';

import type { RoadmapData } from '@/features/roadmap/types';

// Register custom node types
const nodeTypes = {
  customCourseNode: PresetCourseNode,
  semesterHeader: SemesterHeaderNode,
};

import DynamicEdge from '@/features/roadmap/DynamicEdge';

const edgeTypes = {
  dynamic: DynamicEdge,
};

import { layoutRoadmap } from './layout';

export interface RoadmapFlowProps {
  roadmapData: RoadmapData;
}

export const RoadmapFlow = ({ roadmapData }: RoadmapFlowProps) => {
  const { fitView } = useReactFlow();
  const { selectedCourse, sheetOpen, setSheetOpen, setHoveredNode } = useRoadmapContext();

  const { nodes, edges } = useMemo(() => {
    const courseNodes = layoutRoadmap(roadmapData.nodes, roadmapData.edges).map((node) => ({
      ...node,
      draggable: false,
      connectable: false,
      selectable: false,
      deletable: false,
    }));
    const edges = roadmapData.edges.map((edge) => ({
      ...edge,
      type: 'dynamic',
      selectable: false,
      deletable: false,
      updatable: false,
      focusable: false,
      style: { stroke: '#94a3b8', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 15,
        height: 15,
        color: '#94a3b8',
      },
      zIndex: 0, // Edges behind nodes
    }));

    return {
      nodes: courseNodes,
      edges,
    };
  }, [roadmapData]);

  // Handle node hover for highlighting connected nodes and edges (View mode only)
  const onNodeMouseEnter = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (node.type === 'semesterHeader') return;

      // Find connected edges and nodes
      const connectedEdgeIds: string[] = [];
      const connectedNodeIds: string[] = [];

      edges.forEach((edge) => {
        if (edge.source === node.id) {
          connectedEdgeIds.push(edge.id);
          connectedNodeIds.push(edge.target);
        } else if (edge.target === node.id) {
          connectedEdgeIds.push(edge.id);
          connectedNodeIds.push(edge.source);
        }
      });

      setHoveredNode(node.id, connectedNodeIds, connectedEdgeIds);
    },
    [edges, setHoveredNode],
  );

  const onNodeMouseLeave = useCallback(() => {
    setHoveredNode(null);
  }, [setHoveredNode]);

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col bg-slate-50">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs text-slate-500">학기별 학습 계획</p>
          <h1 className="mt-1 text-base font-semibold text-slate-900">
            {roadmapData.meta.track || roadmapData.meta.major}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            점선은 추천 학습 흐름입니다. 과목을 선택하면 상세 정보를 볼 수 있습니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((year) => (
            <Button
              key={year}
              variant="ghost"
              size="sm"
              onClick={() =>
                fitView({
                  nodes: nodes.filter((n) => n.data.semester?.startsWith(`${year}-`)),
                  padding: 0.2,
                  maxZoom: 1,
                  duration: 0,
                })
              }
            >
              {year}학년
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={() => fitView({ padding: 0.12, duration: 0 })}>
            전체 보기
          </Button>
        </div>
      </header>
      <div className="min-h-0 flex-1">
        <ReactFlow
          fitView
          fitViewOptions={{ padding: 0.12, maxZoom: 0.9 }}
          minZoom={0.06}
          maxZoom={1.7}
          nodes={nodes}
          edges={edges}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          edgesFocusable={false}
          edgesUpdatable={false}
          deleteKeyCode={null}
          panOnDrag
          selectionOnDrag={false}
        >
          <Background gap={20} color="#e2e8f0" />
          <Controls showInteractive={false} />
          <MiniMap className="!h-[80px] !w-[140px] rounded-lg border shadow-sm max-md:!hidden" pannable zoomable />
        </ReactFlow>
      </div>

      <CourseDetailSheet course={selectedCourse} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
};

// Wrapper component that includes ReactFlowProvider
export const RoadmapFlowWithProvider = (props: RoadmapFlowProps) => (
  <ReactFlowProvider>
    <RoadmapFlow {...props} />
  </ReactFlowProvider>
);

export default RoadmapFlowWithProvider;
