import React, { useState, useRef, useCallback } from 'react';

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
    // h-screen minus nothing, taking full height available in the layout
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
          panOnDrag={[1, 2]} // Middle or Right mouse for pan, Left for selection
          selectionMode={SelectionMode.Partial}
        >
          <Background gap={20} color="#e2e8f0" />
          <Controls className="fill-white" />
          <MiniMap className="rounded-lg border shadow-sm" />

          <Panel
            position="top-right"
            className="max-w-xs rounded-md border bg-white/80 p-3 text-xs opacity-50 shadow-sm backdrop-blur transition-opacity hover:opacity-100"
          >
            <p className="mb-1 font-semibold">Roadmap Canvas</p>
            <p>Drag courses from left. Left Click + Drag to Select. Middle Click to Pan. Backspace to Delete.</p>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
};

export default function RoadmapPage() {
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
