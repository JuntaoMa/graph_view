import { Graph } from '@antv/g6';
import type { GraphData, LayoutOptions } from '@antv/g6';
import { DEFAULT_LINK_DISTANCE } from './constants';

export const FORCE_LAYOUT: LayoutOptions = {
  type: 'force',
  preventOverlap: true,
  linkDistance: DEFAULT_LINK_DISTANCE,
};

export function createGraph(container: HTMLElement, data: GraphData) {
  const graph = new Graph({
    container,
    data,
    padding: 48,
    node: {
      type: 'circle',
    },
    edge: {
      type: 'line',
    },
    behaviors: [
      'drag-canvas',
      'zoom-canvas',
      'drag-element',
      {
        type: 'fix-element-size',
        key: 'fix-label-size',
        enable: true,
        node: { shape: 'label' },
        edge: [{ shape: 'key', fields: ['lineWidth'] }, { shape: 'label' }],
      },
    ],
  });

  const { width, height } = container.getBoundingClientRect();
  if (width > 0 && height > 0) {
    graph.setSize(width, height);
  }

  return graph;
}
