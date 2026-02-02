export type CourseStatus = 'COMPLETED' | 'AVAILABLE' | 'LOCKED';

export interface CourseNodeData {
  courseCode?: string; // Made optional to match features/roadmap/types
  label: string;
  credits: number;
  category: string;
  semester?: string;
  status: CourseStatus;
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
