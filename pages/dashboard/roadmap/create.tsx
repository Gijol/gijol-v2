// pages/dashboard/roadmap/create.tsx
// Roadmap creation page - allows users to create their own custom roadmap
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
import { ArrowLeft, Save } from 'lucide-react';

interface RoadmapPageProps {
  courses: CourseDB[];
}

const nodeTypes = {
  course: CourseNode,
};

const RoadmapFlow = ({ courses }: RoadmapPageProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

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
          status: 'planning',
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes],
  );

  return (
    <div className="flex h-full w-full overflow-hidden">
      <RoadmapSidebar courses={courses} />
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
      </div>
    </div>
  );
};

export default function RoadmapCreatePage() {
  const [courses, setCourses] = useState<CourseDB[]>([]);

  React.useEffect(() => {
    fetch('/api/courses')
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <ReactFlowProvider>
      <RoadmapFlow courses={courses} />
    </ReactFlowProvider>
  );
}
