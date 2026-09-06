import { layoutRoadmap, routeOrthogonal, crossesObstacle, CARD_WIDTH, CARD_HEIGHT } from '../features/roadmap/layout';
import type { Node } from 'reactflow';
const node = (id: string, semester: string): Node => ({
  id,
  position: { x: 999, y: 333 },
  data: { semester, label: id },
});
it('aligns preset coordinates and keeps unassigned courses', () => {
  const result = layoutRoadmap([node('b', '1-1'), node('a', '1-1'), node('unknown', '')], []).filter(
    (n) => n.type !== 'semesterHeader',
  );
  expect(result).toHaveLength(3);
  expect(result[0].position.x).toBe(result[1].position.x);
  expect(Math.abs(result[0].position.y - result[1].position.y)).toBeGreaterThan(CARD_HEIGHT);
  expect(result[2].data.courseCode).toBeUndefined();
  expect(result[0].width).toBe(CARD_WIDTH);
});
it.each([
  [
    { x: 0, y: 50 },
    { x: 500, y: 50 },
  ],
  [
    { x: 500, y: 50 },
    { x: 0, y: 50 },
  ],
  [
    { x: 0, y: 0 },
    { x: 0, y: 400 },
  ],
])('routes around intervening cards in either direction', (start, end) => {
  const obstacle = { x: -30, y: 100, width: 100, height: 150 };
  const block = { x: 150, y: 0, width: 200, height: 120 };
  const path = routeOrthogonal(start, end, [obstacle, block]);
  expect(path[0]).toEqual(start);
  expect(path[path.length - 1]).toEqual(end);
  path.slice(1).forEach((p, i) => {
    expect(crossesObstacle(path[i], p, obstacle)).toBe(false);
    expect(crossesObstacle(path[i], p, block)).toBe(false);
  });
});

it('routes every CS core preset connection without crossing a course card', () => {
  const preset = require('../DB/roadmap/presets/EECS_CORE.json');
  const nodes = layoutRoadmap(preset.nodes, preset.edges).filter((n) => n.type !== 'semesterHeader');
  const rects = nodes.map((n) => ({ ...n.position, width: CARD_WIDTH, height: CARD_HEIGHT }));
  for (const edge of preset.edges) {
    const source = nodes.find((n) => n.id === edge.source)!;
    const target = nodes.find((n) => n.id === edge.target)!;
    const path = routeOrthogonal(
      { x: source.position.x + CARD_WIDTH + 18, y: source.position.y + CARD_HEIGHT / 2 },
      { x: target.position.x - 18, y: target.position.y + CARD_HEIGHT / 2 },
      rects,
    );
    expect(path.length).toBeGreaterThan(1);
    path.slice(1).forEach((p, i) => rects.forEach((r) => expect(crossesObstacle(path[i], p, r)).toBe(false)));
  }
});
