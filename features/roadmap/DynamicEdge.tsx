import React, { memo, useMemo } from 'react';
import {
  BaseEdge,
  EdgeProps,
  getSmoothStepPath,
  getBezierPath,
  EdgeLabelRenderer,
  useReactFlow,
} from 'reactflow';
import { X } from 'lucide-react';

import { useRoadmapContext } from '@/features/roadmap/RoadmapContext';

// Layout constants - should match RoadmapFlowClient
const NODE_HEIGHT = 120;
const ROW_GAP = 40;

// Edge routing constants
const EDGE_OFFSET_BASE = 25; // Base offset for edge routing around nodes
const BORDER_RADIUS = 12; // Rounded corners for smooth step edges

const DynamicEdge = memo(
  ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd }: EdgeProps) => {
    const { isViewMode, isEdgeHighlighted, highlightState } = useRoadmapContext();
    const { deleteElements, getEdges, getNodes } = useReactFlow();

    // Check if this edge is highlighted
    const isHighlighted = isEdgeHighlighted(id);
    const hasActiveHighlight = highlightState.hoveredNodeId !== null;

    // Calculate dynamic offset based on edge position to prevent overlapping
    const edgeRouting = useMemo(() => {
      const edges = getEdges();
      const nodes = getNodes();
      const yDiff = targetY - sourceY;
      const xDiff = targetX - sourceX;
      const absYDiff = Math.abs(yDiff);

      // Find edges sharing the same source or target to calculate offset
      const sourceEdges = edges.filter((e) => e.source === id.split('-')[0] || e.id.split('-')[0] === id.split('-')[0]);
      const edgeIndex = sourceEdges.findIndex((e) => e.id === id);
      const totalSourceEdges = sourceEdges.length;

      // Calculate offset to spread multiple edges from same node
      let offset = EDGE_OFFSET_BASE;
      if (totalSourceEdges > 1 && edgeIndex >= 0) {
        const spreadFactor = (edgeIndex - (totalSourceEdges - 1) / 2) * 8;
        offset = EDGE_OFFSET_BASE + spreadFactor;
      }

      // Determine if edge needs to route around intermediate nodes
      const sourceCol = Math.floor(sourceX / 260);
      const targetCol = Math.floor(targetX / 260);
      const colDiff = targetCol - sourceCol;

      // For edges spanning multiple columns, check for potential node collisions
      let needsDetour = false;
      if (colDiff > 1) {
        // Check if there are nodes in intermediate columns that might block the path
        const minY = Math.min(sourceY, targetY);
        const maxY = Math.max(sourceY, targetY);

        for (let col = sourceCol + 1; col < targetCol; col++) {
          const intermediateX = col * 260 + 20;
          const blockingNodes = nodes.filter((n) => {
            if (n.type === 'semesterHeader') return false;
            const nodeY = n.position.y;
            const nodeBottom = nodeY + NODE_HEIGHT;
            return (
              Math.abs(n.position.x - intermediateX) < 50 &&
              ((nodeY >= minY - 20 && nodeY <= maxY + 20) || (nodeBottom >= minY - 20 && nodeBottom <= maxY + 20))
            );
          });

          if (blockingNodes.length > 0) {
            needsDetour = true;
            break;
          }
        }
      }

      // Increase offset if detour is needed
      if (needsDetour) {
        offset = offset + (absYDiff > NODE_HEIGHT ? 15 : 30);
      }

      return { offset, yDiff, absYDiff, xDiff, needsDetour };
    }, [id, sourceX, sourceY, targetX, targetY, getEdges, getNodes]);

    const { offset, yDiff, absYDiff, xDiff } = edgeRouting;

    let edgePath = '';
    let labelX = 0;
    let labelY = 0;

    // Use bezier for adjacent columns with small y-difference (smooth curves)
    // Use smoothstep for longer distances (clear routing around nodes)
    if (xDiff < 280 && absYDiff < ROW_GAP + NODE_HEIGHT) {
      // Adjacent semester, close vertically - use bezier for smooth look
      [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        curvature: 0.25,
      });
    } else {
      // Longer distance or significant y-difference - use smooth step with offset
      [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        offset,
        borderRadius: BORDER_RADIUS,
      });
    }

    const onEdgeClick = (evt: React.MouseEvent) => {
      evt.stopPropagation();
      deleteElements({ edges: [{ id }] });
    };

    // Compute edge style with highlighting
    const computedStyle = useMemo(() => {
      if (!isViewMode || !hasActiveHighlight) {
        return style;
      }

      if (isHighlighted) {
        return {
          ...style,
          stroke: '#f59e0b', // amber-500
          strokeWidth: 3,
          filter: 'drop-shadow(0 0 3px rgba(245, 158, 11, 0.5))',
        };
      }

      return {
        ...style,
        stroke: '#cbd5e1', // slate-300
        strokeWidth: 1,
        opacity: 0.3,
      };
    }, [style, isViewMode, hasActiveHighlight, isHighlighted]);

    return (
      <>
        <BaseEdge path={edgePath} markerEnd={markerEnd} style={computedStyle} />
        {!isViewMode && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: 'all',
              }}
              className="nodrag nopan"
            >
              <button
                className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-500 transition-colors hover:bg-red-500 hover:text-white"
                onClick={onEdgeClick}
                aria-label="Delete edge"
              >
                <X size={12} />
              </button>
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    );
  },
);

DynamicEdge.displayName = 'DynamicEdge';

export default DynamicEdge;
