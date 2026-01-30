import { Graph } from '@antv/g6';
import type { GraphData, LayoutOptions } from '@antv/g6';

export const FORCE_LAYOUT: LayoutOptions = {
  type: 'force',
  preventOverlap: true,
  linkDistance: 160,
};

export function createGraph(container: HTMLElement, data: GraphData) {
  const graph = new Graph({
    container,
    data,
    layout: FORCE_LAYOUT,
    node: {
      type: 'circle',
    },
    edge: {
      type: 'line',
    },
    behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element'],
  });

  const { width, height } = container.getBoundingClientRect();
  if (width > 0 && height > 0) {
    graph.setSize(width, height);
  }

  graph.render().then(() => {
    graph.fitView({ padding: 48 });
  });

  return graph;
}
