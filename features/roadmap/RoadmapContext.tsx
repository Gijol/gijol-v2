// features/roadmap/RoadmapContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { CourseNodeData } from '@/lib/types/roadmap';

interface RoadmapContextType {
  isViewMode: boolean;
  setIsViewMode: (value: boolean) => void;
  selectedCourse: CourseNodeData | null;
  setSelectedCourse: (course: CourseNodeData | null) => void;
  sheetOpen: boolean;
  setSheetOpen: (open: boolean) => void;
}

const RoadmapContext = createContext<RoadmapContextType | null>(null);

export function RoadmapProvider({ children }: { children: ReactNode }) {
  const [isViewMode, setIsViewMode] = useState(true); // Default to View Mode
  const [selectedCourse, setSelectedCourse] = useState<CourseNodeData | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <RoadmapContext.Provider
      value={{
        isViewMode,
        setIsViewMode,
        selectedCourse,
        setSelectedCourse,
        sheetOpen,
        setSheetOpen,
      }}
    >
      {children}
    </RoadmapContext.Provider>
  );
}

export function useRoadmapContext() {
  const context = useContext(RoadmapContext);
  if (!context) {
    throw new Error('useRoadmapContext must be used within RoadmapProvider');
  }
  return context;
}
