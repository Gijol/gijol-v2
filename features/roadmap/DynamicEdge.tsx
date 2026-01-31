import React, { memo } from 'react';
import {
  BaseEdge,
  EdgeProps,
  getSmoothStepPath,
  getStraightPath,
  getBezierPath,
  EdgeLabelRenderer,
  useReactFlow,
} from 'reactflow';
import { X } from 'lucide-react';

import { useRoadmapContext } from '@/features/roadmap/RoadmapContext';

// Threshold distance to switch from SmoothStep to Straight edge
const STRAIGHT_EDGE_THRESHOLD = 300;
const MAX_Y_DIFF = 50; // Stricter threshold for straight connection

const DynamicEdge = memo(
  ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd }: EdgeProps) => {
    const { isViewMode } = useRoadmapContext();
    const { deleteElements } = useReactFlow();

    // Calculate Euclidean distance between source and target
    const distance = Math.sqrt(Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2));

    const yDiff = Math.abs(targetY - sourceY);

    let edgePath = '';
    let labelX = 0;
    let labelY = 0;

    if (distance < STRAIGHT_EDGE_THRESHOLD) {
      if (yDiff < MAX_Y_DIFF) {
        // Very close and aligned: Straight
        [edgePath, labelX, labelY] = getStraightPath({
          sourceX,
          sourceY,
          targetX,
          targetY,
        });
      } else {
        // Close but vertically offset: Bezier (Smooth curve instead of double bend)
        [edgePath, labelX, labelY] = getBezierPath({
          sourceX,
          sourceY,
          sourcePosition,
          targetX,
          targetY,
          targetPosition,
        });
      }
    } else {
      [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
      });
    }

    const onEdgeClick = (evt: React.MouseEvent) => {
      evt.stopPropagation();
      deleteElements({ edges: [{ id }] });
    };

    return (
      <>
        <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
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
