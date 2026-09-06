import type { Edge, Node } from 'reactflow';
import type { CourseNodeData } from './types';

export const CARD_WIDTH = 224;
export const CARD_HEIGHT = 116;
export const COLUMN_WIDTH = 336;
export const ROW_HEIGHT = 164;
export const SEMESTERS = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'];

/** Semester rank is fixed; barycenter sweeps order courses within each rank. */
export function layoutRoadmap(input: Node<CourseNodeData>[], edges: Edge[]): Node[] {
  const courses = input.filter((node) => node.type !== 'semesterHeader');
  const columns = [...SEMESTERS];
  if (courses.some((node) => !SEMESTERS.includes(node.data.semester ?? ''))) columns.push('미지정');
  const groups = columns.map((semester) =>
    courses.filter(
      (node) => (SEMESTERS.includes(node.data.semester ?? '') ? node.data.semester : '미지정') === semester,
    ),
  );
  const ranks = new Map<string, number>();
  groups.forEach((group) => group.forEach((node, index) => ranks.set(node.id, index)));
  for (let pass = 0; pass < 4; pass++) {
    const order = pass % 2 ? [...groups].reverse() : groups;
    for (const group of order) {
      const score = (node: Node) => {
        const adjacent = edges
          .filter((edge) => (pass % 2 ? edge.source === node.id : edge.target === node.id))
          .map((edge) => ranks.get(pass % 2 ? edge.target : edge.source))
          .filter((n): n is number => n !== undefined);
        return adjacent.length ? adjacent.reduce((a, b) => a + b, 0) / adjacent.length : ranks.get(node.id)!;
      };
      group.sort((a, b) => score(a) - score(b) || a.id.localeCompare(b.id));
      group.forEach((node, index) => ranks.set(node.id, index));
    }
  }
  return columns.flatMap((semester, column) => {
    const x = 24 + column * COLUMN_WIDTH;
    const header: Node = {
      id: `semester-header-${semester}`,
      type: 'semesterHeader',
      position: { x, y: 20 },
      data: {
        label: semester === '미지정' ? '학기 미지정' : `${semester[0]}학년 · ${semester[2]}학기`,
        width: CARD_WIDTH,
      },
      draggable: false,
      selectable: false,
      focusable: false,
      connectable: false,
    };
    return [
      header,
      ...groups[column].map((node, row) => ({
        ...node,
        type: 'customCourseNode',
        position: { x, y: 100 + row * ROW_HEIGHT },
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        style: { ...node.style, width: CARD_WIDTH, height: CARD_HEIGHT },
        // The card itself is a keyboard button; don't create a nested button wrapper.
        focusable: false,
      })),
    ];
  });
}

export interface Point {
  x: number;
  y: number;
}
export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
}
const inside = (p: Point, r: Obstacle) => p.x > r.x && p.x < r.x + r.width && p.y > r.y && p.y < r.y + r.height;
export function crossesObstacle(a: Point, b: Point, r: Obstacle): boolean {
  if (a.x === b.x)
    return a.x > r.x && a.x < r.x + r.width && Math.max(a.y, b.y) > r.y && Math.min(a.y, b.y) < r.y + r.height;
  if (a.y === b.y)
    return a.y > r.y && a.y < r.y + r.height && Math.max(a.x, b.x) > r.x && Math.min(a.x, b.x) < r.x + r.width;
  return true;
}

/** Orthogonal visibility grid + shortest path with bend cost. All cards are
 * obstacles, including skipped semesters. No assumptions about IDs/columns. */
export function routeOrthogonal(start: Point, end: Point, obstacles: Obstacle[]): Point[] {
  const padding = 14;
  const rects = obstacles.map((r) => ({
    x: r.x - padding,
    y: r.y - padding,
    width: r.width + padding * 2,
    height: r.height + padding * 2,
  }));
  const xs = Array.from(new Set([start.x, end.x, ...rects.flatMap((r) => [r.x, r.x + r.width])])).sort((a, b) => a - b);
  const ys = Array.from(new Set([start.y, end.y, ...rects.flatMap((r) => [r.y, r.y + r.height])])).sort(
    (a, b) => a - b,
  );
  const width = xs.length;
  const points = ys.flatMap((y) => xs.map((x) => ({ x, y })));
  const valid = points.map((p) => !rects.some((r) => inside(p, r)));
  const index = (p: Point) => ys.indexOf(p.y) * width + xs.indexOf(p.x);
  const source = index(start),
    target = index(end);
  // A dragged card can overlap another. Do not draw a misleading line through it.
  if (!valid[source] || !valid[target]) return [];
  const distance = (a: Point, b: Point) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  const cost = new Map<number, number>();
  const previous = new Map<number, number>();
  const initial = source * 3;
  cost.set(initial, 0);
  const open = [{ key: initial, score: distance(start, end) }];
  const closed = new Set<number>();
  let goal: number | undefined;
  while (open.length) {
    open.sort((a, b) => b.score - a.score);
    const current = open.pop()!.key;
    if (closed.has(current)) continue;
    closed.add(current);
    const at = Math.floor(current / 3),
      direction = current % 3;
    if (at === target) {
      goal = current;
      break;
    }
    const x = at % width,
      y = Math.floor(at / width);
    const neighbors = [
      x > 0 ? at - 1 : -1,
      x < width - 1 ? at + 1 : -1,
      y > 0 ? at - width : -1,
      y < ys.length - 1 ? at + width : -1,
    ];
    for (const next of neighbors) {
      if (next < 0 || !valid[next] || rects.some((r) => crossesObstacle(points[at], points[next], r))) continue;
      const nextDirection = points[at].x === points[next].x ? 2 : 1;
      const key = next * 3 + nextDirection;
      const value =
        cost.get(current)! + distance(points[at], points[next]) + (direction && direction !== nextDirection ? 28 : 0);
      if (value >= (cost.get(key) ?? Infinity)) continue;
      cost.set(key, value);
      previous.set(key, current);
      open.push({ key, score: value + distance(points[next], end) });
    }
  }
  if (goal === undefined) return [];
  const route: Point[] = [];
  for (let key: number | undefined = goal; key !== undefined; key = previous.get(key))
    route.unshift(points[Math.floor(key / 3)]);
  return route.filter(
    (p, i) =>
      i === 0 ||
      i === route.length - 1 ||
      !((route[i - 1].x === p.x && p.x === route[i + 1].x) || (route[i - 1].y === p.y && p.y === route[i + 1].y)),
  );
}

export function roundedRoutePath(points: Point[], radius = 8): string {
  if (!points.length) return '';
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const a = points[i - 1],
      b = points[i],
      c = points[i + 1];
    const before = Math.hypot(b.x - a.x, b.y - a.y),
      after = Math.hypot(c.x - b.x, c.y - b.y);
    if (!before || !after) continue;
    const r = Math.min(radius, before / 2, after / 2);
    path += ` L ${b.x - ((b.x - a.x) * r) / before} ${b.y - ((b.y - a.y) * r) / before} Q ${b.x} ${b.y} ${b.x + ((c.x - b.x) * r) / after} ${b.y + ((c.y - b.y) * r) / after}`;
  }
  return path + ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`;
}
