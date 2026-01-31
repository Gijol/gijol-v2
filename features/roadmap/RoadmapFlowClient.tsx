// features/roadmap/RoadmapFlowClient.tsx
// Separated client-side ReactFlow component for code-splitting
import React, { useEffect, useMemo, useCallback, useState } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Panel,
  useReactFlow,
  Node,
  Edge,
  Connection,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useUndoRedo } from '@/lib/hooks/useUndoRedo';
import PresetCourseNode from '@/features/roadmap/PresetCourseNode';
import SemesterHeaderNode from '@/features/roadmap/SemesterHeaderNode';
import { CourseDetailSheet } from '@/features/roadmap/CourseDetailSheet';
import { CourseEditSheet } from '@/features/roadmap/CourseEditSheet';
import { useRoadmapContext } from '@/features/roadmap/RoadmapContext';
import { Button } from '@/components/ui/button';
import { Eye, Edit3, Download, Grab, MousePointer2 } from 'lucide-react';

import type { RoadmapData, CourseNodeData } from '@/features/roadmap/types';
import type { CourseDB } from '@/lib/const/course-db';

// Register custom node types
const nodeTypes = {
  customCourseNode: PresetCourseNode,
  semesterHeader: SemesterHeaderNode,
};

import DynamicEdge from '@/features/roadmap/DynamicEdge';

const edgeTypes = {
  dynamic: DynamicEdge,
};

// Constants for layout
const NODE_WIDTH = 200;
const NODE_HEIGHT = 120;
const COLUMN_GAP = 40;
const ROW_GAP = 20;
const HEADER_HEIGHT = 60;
const SEMESTER_WIDTH = NODE_WIDTH + COLUMN_GAP;

// Semester column configuration
const SEMESTER_COLUMNS = [
  { semester: '1-1', label: '1학기', year: 1 },
  { semester: '1-2', label: '2학기', year: 1 },
  { semester: '2-1', label: '1학기', year: 2 },
  { semester: '2-2', label: '2학기', year: 2 },
  { semester: '3-1', label: '1학기', year: 3 },
  { semester: '3-2', label: '2학기', year: 3 },
  { semester: '4-1', label: '1학기', year: 4 },
  { semester: '4-2', label: '2학기', year: 4 },
];

// Auto-layout nodes by semester to prevent overlapping
function layoutNodesBySemester(nodes: RoadmapData['nodes']): Node<CourseNodeData>[] {
  const semesterGroups: Record<string, RoadmapData['nodes']> = {};

  nodes.forEach((node) => {
    const semester = node.data.semester || '';
    if (!semesterGroups[semester]) {
      semesterGroups[semester] = [];
    }
    semesterGroups[semester].push(node);
  });

  const layoutedNodes: Node<CourseNodeData>[] = [];

  SEMESTER_COLUMNS.forEach((col, colIndex) => {
    const columnNodes = semesterGroups[col.semester] || [];
    const xPosition = colIndex * SEMESTER_WIDTH + 20;

    columnNodes.forEach((node, rowIndex) => {
      layoutedNodes.push({
        id: node.id,
        type: node.type || 'customCourseNode',
        position: {
          x: xPosition,
          y: HEADER_HEIGHT + 30 + rowIndex * (NODE_HEIGHT + ROW_GAP),
        },
        data: {
          ...node.data,
          courseCode: node.data.courseCode || node.id,
        },
      });
    });
  });

  return layoutedNodes;
}

// Create semester header nodes
function createHeaderNodes(): Node[] {
  const headers: Node[] = [];

  const years = [1, 2, 3, 4];
  years.forEach((year, yearIndex) => {
    headers.push({
      id: `year-header-${year}`,
      type: 'semesterHeader',
      position: {
        x: yearIndex * 2 * SEMESTER_WIDTH + 20,
        y: 0,
      },
      data: {
        label: `${year}학년`,
        isYearHeader: true,
        width: SEMESTER_WIDTH * 2 - COLUMN_GAP,
      },
      draggable: false,
      selectable: false,
    });
  });

  SEMESTER_COLUMNS.forEach((col, colIndex) => {
    headers.push({
      id: `semester-header-${col.semester}`,
      type: 'semesterHeader',
      position: {
        x: colIndex * SEMESTER_WIDTH + 20,
        y: 40,
      },
      data: {
        label: col.label,
        isYearHeader: false,
        width: NODE_WIDTH,
      },
      draggable: false,
      selectable: false,
    });
  });

  return headers;
}

export interface RoadmapFlowProps {
  roadmapData: RoadmapData;
  courses: CourseDB[];
}

export const RoadmapFlow = ({ roadmapData, courses }: RoadmapFlowProps) => {
  const { fitView } = useReactFlow();
  const { isViewMode, setIsViewMode, selectedCourse, setSelectedCourse, sheetOpen, setSheetOpen } = useRoadmapContext();

  // Pan mode state for edit mode (grab mode vs pointer mode)
  const [isPanMode, setIsPanMode] = useState(false);

  const { initialNodes, initialEdges } = useMemo(() => {
    const headerNodes = createHeaderNodes();
    const courseNodes = layoutNodesBySemester(roadmapData.nodes);
    const edges = roadmapData.edges.map((edge) => ({
      ...edge,
      type: 'dynamic',
      style: { stroke: '#94a3b8', strokeWidth: 2 },
    }));

    return {
      initialNodes: [...headerNodes, ...courseNodes],
      initialEdges: edges,
    };
  }, [roadmapData]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Undo/Redo hook
  const { takeSnapshot, undo, redo, canUndo, canRedo } = useUndoRedo({ nodes, edges });

  // Sync nodes when roadmapData changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Keyboard Shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          if (canRedo) {
            const nextState = redo({ nodes, edges });
            if (nextState) {
              setNodes(nextState.nodes);
              setEdges(nextState.edges);
            }
          }
        } else {
          if (canUndo) {
            const prevState = undo({ nodes, edges });
            if (prevState) {
              setNodes(prevState.nodes);
              setEdges(prevState.edges);
            }
          }
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        if (canRedo) {
          const nextState = redo({ nodes, edges });
          if (nextState) {
            setNodes(nextState.nodes);
            setEdges(nextState.edges);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo, nodes, edges, setNodes, setEdges]);

  // Capture state before drag starts (for Undo)
  const onNodeDragStart = useCallback(() => {
    if (!isViewMode) {
      takeSnapshot({ nodes, edges });
    }
  }, [isViewMode, nodes, edges, takeSnapshot]);

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      if (!isViewMode) takeSnapshot({ nodes, edges });
      setEdges((eds) =>
        addEdge({ ...params, type: 'dynamic', animated: false, style: { stroke: '#94a3b8', strokeWidth: 2 } }, eds),
      );
    },
    [setEdges, isViewMode, nodes, edges, takeSnapshot],
  );

  const handleNodeUpdate = (nodeId: string, newData: CourseNodeData) => {
    takeSnapshot({ nodes, edges });
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId || (node.data.courseCode && node.data.courseCode === nodeId)) {
          return { ...node, data: newData };
        }
        return node;
      }),
    );
    setSelectedCourse(newData);
  };

  // Export current roadmap state to JSON
  const handleExport = useCallback(() => {
    const exportData = {
      meta: roadmapData.meta,
      nodes,
      edges,
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `roadmap-${roadmapData.meta.major || 'export'}.json`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [roadmapData, nodes, edges]);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={isViewMode ? undefined : onNodesChange}
        onEdgesChange={isViewMode ? undefined : onEdgesChange}
        onConnect={isViewMode ? undefined : onConnect}
        onNodeDragStart={onNodeDragStart}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={!isViewMode && !isPanMode}
        nodesConnectable={!isViewMode}
        elementsSelectable={!isViewMode && !isPanMode}
        edgesFocusable={!isViewMode}
        edgesUpdatable={!isViewMode}
        panOnDrag={isViewMode ? true : isPanMode ? true : [1, 2]}
        selectionOnDrag={!isViewMode && !isPanMode}
      >
        <Background gap={20} color="#e2e8f0" />
        <Controls className="fill-white" />
        <MiniMap className="rounded-lg border shadow-sm" pannable zoomable />

        {/* Mode Toggle & Info Panel */}
        <Panel position="top-right" className="flex flex-col gap-2">
          {/* Action Buttons */}
          <div className="flex items-center gap-2 rounded-lg border bg-white/90 p-2 shadow-sm backdrop-blur">
            <Button
              size="sm"
              variant={isViewMode ? 'default' : 'outline'}
              onClick={() => setIsViewMode(true)}
              className="h-8"
            >
              <Eye className="mr-1.5 h-4 w-4" />
              View
            </Button>
            <Button
              size="sm"
              variant={!isViewMode ? 'default' : 'outline'}
              onClick={() => setIsViewMode(false)}
              className="h-8"
            >
              <Edit3 className="mr-1.5 h-4 w-4" />
              Edit
            </Button>

            {!isViewMode && (
              <>
                <div className="mx-1 h-4 w-px bg-gray-300" />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExport}
                  className="h-8 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  <Download className="mr-1.5 h-4 w-4" />
                  Export JSON
                </Button>
              </>
            )}
          </div>

          {/* Interaction Mode Toggle (Edit mode only) */}
          {!isViewMode && (
            <div className="flex items-center gap-1 rounded-lg border bg-white/90 p-1.5 shadow-sm backdrop-blur">
              <Button
                size="sm"
                variant={!isPanMode ? 'default' : 'ghost'}
                onClick={() => setIsPanMode(false)}
                className="h-8 w-8 p-0"
                title="포인터 모드 (노드 선택/이동)"
              >
                <MousePointer2 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={isPanMode ? 'default' : 'ghost'}
                onClick={() => setIsPanMode(true)}
                className="h-8 w-8 p-0"
                title="손 모드 (화면 이동)"
              >
                <Grab className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Info Panel */}
          <div className="rounded-lg border bg-white/90 p-4 shadow-sm backdrop-blur">
            <h1 className="text-lg font-bold text-gray-800">{roadmapData.meta.major}</h1>
            {roadmapData.meta.track && <p className="text-sm text-gray-500">{roadmapData.meta.track}</p>}
            <div className="mt-2 flex gap-4 text-xs text-gray-400">
              <span>{nodes.filter((n) => n.type !== 'semesterHeader').length}개 과목</span>
              <span>{edges.length}개 연결</span>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              {isViewMode ? (
                '노드 클릭 시 상세정보 표시'
              ) : (
                <span className="font-medium text-blue-600">편집 모드: 노드 클릭하여 수정, 핸들 드래그하여 연결</span>
              )}
            </div>
          </div>
        </Panel>
      </ReactFlow>

      {/* Sheets */}
      {isViewMode ? (
        <CourseDetailSheet course={selectedCourse} open={sheetOpen} onOpenChange={setSheetOpen} courses={courses} />
      ) : (
        <CourseEditSheet
          course={selectedCourse}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          onSave={handleNodeUpdate}
        />
      )}
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
