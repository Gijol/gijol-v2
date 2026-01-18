import { Node } from 'reactflow';
import { CourseDB } from '@/lib/const/course-db';

export type CourseStatus = 'taken' | 'planning' | 'fail';

export interface CourseNodeData extends CourseDB {
  status: 'taken' | 'planning' | 'fail';
  semester?: string; // e.g. "2023-1" or "1-1" (Freshman Spring)
}

// React Flow Node with our custom data
export type CourseNodeType = Node<CourseNodeData>;
