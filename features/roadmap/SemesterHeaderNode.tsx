// features/roadmap/SemesterHeaderNode.tsx
// Custom React Flow node for semester/year headers
import React, { memo } from 'react';
import { NodeProps } from 'reactflow';

interface SemesterHeaderData {
  label: string;
  isYearHeader: boolean;
  width: number;
}

const SemesterHeaderNode = ({ data }: NodeProps<SemesterHeaderData>) => {
  if (data.isYearHeader) {
    // Year header (e.g., "1학년")
    return (
      <div
        className="pointer-events-none flex items-center justify-center rounded-t-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-white shadow-sm"
        style={{ width: data.width }}
      >
        <span className="text-sm font-bold">{data.label}</span>
      </div>
    );
  }

  // Semester sub-header (e.g., "1학기", "2학기")
  return (
    <div
      className="pointer-events-none flex items-center justify-center border-b-2 border-slate-300 px-3 py-3"
      style={{ width: data.width }}
    >
      <span className="text-sm font-semibold text-slate-700">{data.label}</span>
    </div>
  );
};

export default memo(SemesterHeaderNode);
