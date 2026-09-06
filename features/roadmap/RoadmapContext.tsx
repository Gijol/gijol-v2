// features/roadmap/RoadmapContext.tsx
import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import type { CourseNodeData } from '@/lib/types/roadmap';

// Highlight state for hover interactions
interface HighlightState {
  hoveredNodeId: string | null;
  highlightedNodeIds: Set<string>;
  highlightedEdgeIds: Set<string>;
}

interface RoadmapContextType {
  selectedCourse: CourseNodeData | null;
  setSelectedCourse: (course: CourseNodeData | null) => void;
  sheetOpen: boolean;
  setSheetOpen: (open: boolean) => void;
  // Hover highlight state
  highlightState: HighlightState;
  setHoveredNode: (nodeId: string | null, connectedNodeIds?: string[], connectedEdgeIds?: string[]) => void;
  isNodeHighlighted: (nodeId: string) => boolean;
  isEdgeHighlighted: (edgeId: string) => boolean;
}

const RoadmapContext = createContext<RoadmapContextType | null>(null);

export function RoadmapProvider({ children }: { children: ReactNode }) {
  const [selectedCourse, setSelectedCourse] = useState<CourseNodeData | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Hover highlight state
  const [highlightState, setHighlightState] = useState<HighlightState>({
    hoveredNodeId: null,
    highlightedNodeIds: new Set(),
    highlightedEdgeIds: new Set(),
  });

  const setHoveredNode = useCallback(
    (nodeId: string | null, connectedNodeIds: string[] = [], connectedEdgeIds: string[] = []) => {
      if (nodeId) {
        setHighlightState({
          hoveredNodeId: nodeId,
          highlightedNodeIds: new Set([nodeId, ...connectedNodeIds]),
          highlightedEdgeIds: new Set(connectedEdgeIds),
        });
      } else {
        setHighlightState({
          hoveredNodeId: null,
          highlightedNodeIds: new Set(),
          highlightedEdgeIds: new Set(),
        });
      }
    },
    [],
  );

  const isNodeHighlighted = useCallback(
    (nodeId: string) => highlightState.highlightedNodeIds.has(nodeId),
    [highlightState.highlightedNodeIds],
  );

  const isEdgeHighlighted = useCallback(
    (edgeId: string) => highlightState.highlightedEdgeIds.has(edgeId),
    [highlightState.highlightedEdgeIds],
  );

  const value = useMemo(
    () => ({
      selectedCourse,
      setSelectedCourse,
      sheetOpen,
      setSheetOpen,
      highlightState,
      setHoveredNode,
      isNodeHighlighted,
      isEdgeHighlighted,
    }),
    [selectedCourse, sheetOpen, highlightState, setHoveredNode, isNodeHighlighted, isEdgeHighlighted],
  );

  return <RoadmapContext.Provider value={value}>{children}</RoadmapContext.Provider>;
}

export function useRoadmapContext() {
  const context = useContext(RoadmapContext);
  if (!context) {
    throw new Error('useRoadmapContext must be used within RoadmapProvider');
  }
  return context;
}
