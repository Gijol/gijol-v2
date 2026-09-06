import React, { memo, useMemo } from 'react';
import { BaseEdge, EdgeProps, Position, useNodes } from 'reactflow';
import { useRoadmapContext } from './RoadmapContext';
import { CARD_HEIGHT, CARD_WIDTH, routeOrthogonal, roundedRoutePath } from './layout';

const vector = (position: Position) =>
  position === Position.Left
    ? { x: -1, y: 0 }
    : position === Position.Top
      ? { x: 0, y: -1 }
      : position === Position.Bottom
        ? { x: 0, y: 1 }
        : { x: 1, y: 0 };
const DynamicEdge = memo(
  ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd }: EdgeProps) => {
    const { isEdgeHighlighted, highlightState } = useRoadmapContext();
    const nodes = useNodes();
    const route = useMemo(() => {
      const a = vector(sourcePosition),
        b = vector(targetPosition);
      const start = { x: sourceX + a.x * 18, y: sourceY + a.y * 18 };
      const end = { x: targetX + b.x * 18, y: targetY + b.y * 18 };
      const obstacles = nodes
        .filter((n) => n.type !== 'semesterHeader')
        .map((n) => ({
          x: n.positionAbsolute?.x ?? n.position.x,
          y: n.positionAbsolute?.y ?? n.position.y,
          width: n.width ?? CARD_WIDTH,
          height: n.height ?? CARD_HEIGHT,
        }));
      const middle = routeOrthogonal(start, end, obstacles);
      return middle.length ? [{ x: sourceX, y: sourceY }, ...middle, { x: targetX, y: targetY }] : [];
    }, [nodes, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition]);
    const highlight = isEdgeHighlighted(id);
    const active = highlightState.hoveredNodeId !== null;
    return (
      <>
        <BaseEdge
          id={id}
          path={roundedRoutePath(route)}
          markerEnd={markerEnd}
          style={{
            ...style,
            stroke: highlight ? '#2563eb' : '#94a3b8',
            strokeWidth: highlight ? 2.5 : 1.5,
            strokeDasharray: highlight ? undefined : '5 4',
            opacity: active && !highlight ? 0.16 : 0.85,
          }}
        />
      </>
    );
  },
);
DynamicEdge.displayName = 'DynamicEdge';
export default DynamicEdge;
