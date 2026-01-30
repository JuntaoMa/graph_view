import type { Graph, NodeData, Point } from '@antv/g6';

export type ViewSnapshot = {
  nodes: Record<string, { x: number; y: number }>;
};

export function getNodePosition(node: NodeData): { x: number; y: number } | null {
  const style = (node.style ?? {}) as { x?: number; y?: number };
  const x = typeof style.x === 'number' ? style.x : (node as { x?: number }).x;
  const y = typeof style.y === 'number' ? style.y : (node as { y?: number }).y;
  if (typeof x === 'number' && typeof y === 'number') {
    return { x, y };
  }
  return null;
}

export function captureViewSnapshot(graph: Graph): ViewSnapshot {
  const nodes = graph.getData().nodes;
  const snapshot: ViewSnapshot = { nodes: {} };

  nodes.forEach((node) => {
    const position = getNodePosition(node);
    if (position) {
      snapshot.nodes[String(node.id)] = position;
    }
  });

  return snapshot;
}

export async function applyViewSnapshot(
  graph: Graph,
  snapshot: ViewSnapshot,
  animate = false,
): Promise<void> {
  graph.stopLayout();
  const positions = Object.fromEntries(
    Object.entries(snapshot.nodes).map(([id, point]) => [
      id,
      [point.x, point.y] as Point,
    ]),
  ) as Record<string, Point>;
  if (Object.keys(positions).length === 0) return;
  await graph.translateElementTo(positions, animate);
}
