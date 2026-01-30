import type { GraphData } from '@antv/g6';
import { typePalette } from './palette';
import {
  DEFAULT_EDGE_LABEL_FONT_SIZE,
  DEFAULT_LABEL_FONT_SIZE,
  DEFAULT_NODE_SIZE,
} from './constants';

type RawNode = {
  id: string;
  name?: string;
  label?: string;
  type?: string;
  attrs?: Record<string, unknown>;
};

type RawEdge = {
  id: string;
  source: string;
  target: string;
  name?: string;
  label?: string;
  attrs?: Record<string, unknown>;
};

type RawGraphData = {
  nodes: RawNode[];
  edges: RawEdge[];
};

export function buildSampleGraphData(rawData: RawGraphData): GraphData {
  return {
    nodes: rawData.nodes.map((node) => ({
      id: node.id,
      data: {
        name: node.name ?? node.label ?? '未命名',
        label: node.name ?? node.label ?? '未命名',
        type: node.type ?? 'EntityType',
        ...node.attrs,
      },
      style: {
        labelText: node.name ?? node.label ?? '未命名',
        fill: typePalette[node.type ?? 'EntityType'] ?? '#5C7CFA',
        stroke: '#1C1E21',
        lineWidth: 1,
        size: DEFAULT_NODE_SIZE,
        labelPlacement: 'bottom',
        labelFill: '#1C1E21',
        labelFontSize: DEFAULT_LABEL_FONT_SIZE,
      },
    })),
    edges: rawData.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      data: {
        name: edge.name ?? edge.label ?? '未命名',
        label: edge.name ?? edge.label ?? '未命名',
        ...edge.attrs,
      },
      style: {
        stroke: '#868E96',
        endArrow: true,
        labelText: edge.name ?? edge.label ?? '未命名',
        labelFill: '#495057',
        labelFontSize: DEFAULT_EDGE_LABEL_FONT_SIZE,
        labelBackground: true,
        labelBackgroundFill: '#F8F9FA',
        labelPadding: [2, 4, 2, 4],
      },
    })),
  };
}

export async function loadSampleGraphData(
  url = '/data/graph-template.json',
): Promise<GraphData> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load graph data from ${url}`);
  }
  const rawData = (await response.json()) as RawGraphData;
  return buildSampleGraphData(rawData);
}
