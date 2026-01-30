import type { GraphData } from '@antv/g6';
import { typePalette } from './palette';

type RawNode = {
  id: string;
  label: string;
  type?: string;
  attrs?: Record<string, unknown>;
};

type RawEdge = {
  id: string;
  source: string;
  target: string;
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
        label: node.label,
        type: node.type,
        ...node.attrs,
      },
      style: {
        labelText: node.label,
        fill: typePalette[node.type] ?? '#5C7CFA',
        stroke: '#1C1E21',
        lineWidth: 1,
        size: 46,
        labelPlacement: 'bottom',
        labelFill: '#1C1E21',
        labelFontSize: 12,
      },
    })),
    edges: rawData.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      data: {
        label: edge.label,
        ...edge.attrs,
      },
      style: {
        stroke: '#868E96',
        endArrow: true,
        labelText: edge.label,
        labelFill: '#495057',
        labelFontSize: 11,
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
