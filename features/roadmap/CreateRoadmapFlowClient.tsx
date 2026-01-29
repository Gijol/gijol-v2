// features/roadmap/CreateRoadmapFlowClient.tsx
// Separated client-side ReactFlow component for roadmap creation
import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';

import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Panel,
  Connection,
  Edge,
  Node,
  MiniMap,
  SelectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { CourseDB } from '@/lib/const/course-db';
import CourseNode from '@/features/roadmap/CourseNode';
import { RoadmapSidebar } from '@/features/roadmap/RoadmapSidebar';
import { CourseNodeData } from '@/features/roadmap/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface CreateRoadmapFlowProps {
  courses: CourseDB[];
}

const nodeTypes = {
  course: CourseNode,
};

export const CreateRoadmapFlow = ({ courses }: CreateRoadmapFlowProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Save/Load state
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [savedRoadmaps, setSavedRoadmaps] = useState<
    Array<{
      id: string;
      name: string;
      timestamp: number;
      nodes: Node[];
      edges: Edge[];
    }>
  >([]);

  // Load saved roadmaps from localStorage on mount
  React.useEffect(() => {
    const loadSavedRoadmaps = () => {
      const keys = Object.keys(localStorage).filter((key) => key.startsWith('roadmap-save-'));
      const maps = keys
        .map((key) => {
          try {
            return JSON.parse(localStorage.getItem(key) || '');
          } catch {
            return null;
          }
        })
        .filter(Boolean);
      setSavedRoadmaps(maps.sort((a, b) => b.timestamp - a.timestamp));
    };
    loadSavedRoadmaps();
  }, []);

  const handleSave = useCallback(() => {
    if (!saveName.trim()) return;

    const saveData = {
      id: `roadmap-save-${Date.now()}`,
      name: saveName,
      timestamp: Date.now(),
      nodes,
      edges,
    };

    localStorage.setItem(saveData.id, JSON.stringify(saveData));
    setSavedRoadmaps((prev) => [saveData, ...prev].sort((a, b) => b.timestamp - a.timestamp));
    setSaveDialogOpen(false);
    setSaveName('');
  }, [saveName, nodes, edges]);

  const handleLoad = useCallback(
    (savedData: (typeof savedRoadmaps)[0]) => {
      if (nodes.length > 0 || edges.length > 0) {
        if (!confirm('현재 작업 중인 내용이 있습니다. 불러오시겠습니까?')) {
          return;
        }
      }
      setNodes(savedData.nodes);
      setEdges(savedData.edges);
    },
    [nodes, edges, setNodes, setEdges],
  );

  const handleDelete = useCallback((id: string) => {
    if (confirm('이 로드맵을 삭제하시겠습니까?')) {
      localStorage.removeItem(id);
      setSavedRoadmaps((prev) => prev.filter((item) => item.id !== id));
    }
  }, []);

  const handleClearAll = useCallback(() => {
    if (confirm('모든 저장된 로드맵을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      savedRoadmaps.forEach((item) => localStorage.removeItem(item.id));
      setSavedRoadmaps([]);
    }
  }, [savedRoadmaps]);

  const handleExport = useCallback(() => {
    const exportData = {
      nodes,
      edges,
      timestamp: Date.now(),
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `my-roadmap-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const onConnect = useCallback((params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) {
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const courseDataString = event.dataTransfer.getData('application/reactflow/course');

      if (!courseDataString) return;

      const courseData: CourseDB = JSON.parse(courseDataString);

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node<CourseNodeData> = {
        id: `node-${courseData.courseUid}-${Date.now()}`,
        type: 'course',
        position,
        data: {
          ...courseData,
          label: courseData.displayTitleKo,
          credits: courseData.creditHours,
          courseCode: courseData.primaryCourseCode,
          category: '전공',
          status: 'AVAILABLE',
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes],
  );

  return (
    <div className="flex h-full w-full overflow-hidden">
      <RoadmapSidebar
        courses={courses}
        savedRoadmaps={savedRoadmaps}
        onLoad={handleLoad}
        onDelete={handleDelete}
        onClearAll={handleClearAll}
      />
      <div className="relative h-full flex-1" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          className="bg-slate-50"
          defaultEdgeOptions={{ type: 'smoothstep', animated: true }}
          deleteKeyCode={['Backspace', 'Delete']}
          selectionOnDrag={true}
          panOnDrag={[1, 2]}
          selectionMode={SelectionMode.Partial}
        >
          <Background gap={20} color="#e2e8f0" />
          <Controls className="fill-white" />
          <MiniMap className="rounded-lg border shadow-sm" />

          <Panel position="top-left" className="flex items-center gap-2">
            <Link href="/dashboard/roadmap">
              <Button variant="outline" size="sm" className="bg-white">
                <ArrowLeft className="mr-1 h-4 w-4" />
                뒤로가기
              </Button>
            </Link>
            <Button
              variant="default"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setSaveDialogOpen(true)}
              disabled={nodes.length === 0}
            >
              <Save className="mr-1 h-4 w-4" />
              저장
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white"
              onClick={handleExport}
              disabled={nodes.length === 0}
            >
              <Download className="mr-1 h-4 w-4" />
              Export JSON
            </Button>
          </Panel>

          <Panel
            position="top-right"
            className="max-w-xs rounded-md border bg-white/80 p-3 text-xs opacity-50 shadow-sm backdrop-blur transition-opacity hover:opacity-100"
          >
            <p className="mb-1 font-semibold">나만의 로드맵 만들기</p>
            <p>
              왼쪽에서 과목을 드래그하여 캔버스에 놓으세요. 마우스로 드래그하여 선택, 휠로 팬, Backspace로 삭제할 수
              있습니다.
            </p>
          </Panel>
        </ReactFlow>

        {/* Save Dialog */}
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>로드맵 저장</DialogTitle>
              <DialogDescription>로드맵에 이름을 지정하여 저장하세요.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">로드맵 이름</Label>
                <Input
                  id="name"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="예: 전기전자컴퓨터공학 로드맵"
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleSave} disabled={!saveName.trim()}>
                저장
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// Wrapper with ReactFlowProvider
export const CreateRoadmapFlowWithProvider = (props: CreateRoadmapFlowProps) => (
  <ReactFlowProvider>
    <CreateRoadmapFlow {...props} />
  </ReactFlowProvider>
);

export default CreateRoadmapFlowWithProvider;
