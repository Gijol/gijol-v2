import { Node, Edge } from 'reactflow';

export type CourseStatus = 'COMPLETED' | 'AVAILABLE' | 'LOCKED';

export interface CourseNodeData {
  label: string;
  credits: number; // displayed as "3학점"
  category: string; // e.g. "전공필수"
  courseCode?: string; // Optional based on usage in CourseDetailSheet and JSON data
  semester?: string;
  status: CourseStatus;
}

// React Flow Node with our custom data
export type CourseNodeType = Node<CourseNodeData>;

export interface RoadmapData {
  meta: {
    major: string;
    track: string;
  };
  nodes: CourseNodeType[];
  edges: Edge[];
}
