// pages/dashboard/roadmap/create.tsx
// Roadmap creation page - allows users to create their own custom roadmap
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

import { CourseDB } from '@/lib/const/course-db';

// Dynamic import for ReactFlow - loads only on client side
const CreateRoadmapFlowWithProvider = dynamic(() => import('@/features/roadmap/CreateRoadmapFlowClient'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-blue-500" />
        <p className="text-sm text-gray-500">로드맵 에디터를 불러오는 중...</p>
      </div>
    </div>
  ),
});

export default function RoadmapCreatePage() {
  const [courses, setCourses] = useState<CourseDB[]>([]);

  useEffect(() => {
    fetch('/api/courses')
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch((err) => console.error(err));
  }, []);

  return <CreateRoadmapFlowWithProvider courses={courses} />;
}
