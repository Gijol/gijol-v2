// types/roadmap.ts
export interface CourseNodeData {
  courseCode: string; // Course code for lookup in course-db (e.g., "GS1401", "EC2202")
  label: string;
  credits: number;
  category: string;
  semester: string;
  status?: 'COMPLETED' | 'AVAILABLE' | 'LOCKED';
  description?: string;
}

export interface RoadmapNode {
  id: string;
  type?: string; // default or custom
  position: { x: number; y: number };
  data: CourseNodeData;
}

export interface RoadmapEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
}

export interface RoadmapData {
  meta: {
    major: string;
    track?: string;
  };
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
}
