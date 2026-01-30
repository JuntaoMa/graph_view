import type { Graph } from '@antv/g6';

export type ViewSnapshot = {
  nodes: Record<string, { x: number; y: number }>;
};

export function captureViewSnapshot(graph: Graph): ViewSnapshot {
  const nodes = graph.getData().nodes;
  const snapshot: ViewSnapshot = { nodes: {} };

  nodes.forEach((node) => {
    const style = (node.style ?? {}) as { x?: number; y?: number };
    const x =
      typeof style.x === 'number' ? style.x : (node as { x?: number }).x;
    const y =
      typeof style.y === 'number' ? style.y : (node as { y?: number }).y;
    if (typeof x === 'number' && typeof y === 'number') {
      snapshot.nodes[String(node.id)] = { x, y };
    }
  });

  return snapshot;
}

export async function applyViewSnapshot(
  graph: Graph,
  snapshot: ViewSnapshot,
): Promise<void> {
  graph.stopLayout();
  const positions = Object.fromEntries(
    Object.entries(snapshot.nodes).map(([id, point]) => [
      id,
      { x: point.x, y: point.y },
    ]),
  );
  if (Object.keys(positions).length === 0) return;
  await graph.translateElementTo(positions, true);
}
