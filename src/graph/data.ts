import type { GraphData } from '@antv/g6';
import { relationPalette, typePalette } from './palette';
import {
  DEFAULT_EDGE_ARROW_SIZE,
  DEFAULT_EDGE_LABEL_FONT_SIZE,
  DEFAULT_LABEL_FONT_SIZE,
  DEFAULT_NODE_SIZE,
} from './constants';

export type RawNode = {
  id: string;
  name?: string;
  label?: string;
  type?: string;
  attrs?: Record<string, unknown>;
};

export type RawEdge = {
  id: string;
  source: string;
  target: string;
  name?: string;
  label?: string;
  attrs?: Record<string, unknown>;
};

export type RawGraphData = {
  nodes: RawNode[];
  edges: RawEdge[];
};

export function toRawGraphData(graphData: GraphData): RawGraphData {
  return {
    nodes: (graphData.nodes ?? []).map((node) => {
      const data = (node.data ?? {}) as Record<string, unknown>;
      const { name, label, type, ...attrs } = data;
      const rawNode: RawNode = {
        id: String(node.id),
        label: String(name ?? label ?? node.id ?? '未命名'),
        type: typeof type === 'string' ? type : undefined,
      };
      if (Object.keys(attrs).length > 0) {
        rawNode.attrs = attrs;
      }
      return rawNode;
    }),
    edges: (graphData.edges ?? []).map((edge) => {
      const data = (edge.data ?? {}) as Record<string, unknown>;
      const { name, label, ...attrs } = data;
      const rawEdge: RawEdge = {
        id: String(edge.id),
        source: String(edge.source),
        target: String(edge.target),
        label: String(name ?? label ?? edge.id ?? '未命名'),
      };
      if (Object.keys(attrs).length > 0) {
        rawEdge.attrs = attrs;
      }
      return rawEdge;
    }),
  };
}

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
        fill: typePalette[node.type ?? 'EntityType'] ?? '#64748B',
        stroke: typePalette[node.type ?? 'EntityType'] ?? '#64748B',
        lineWidth: 0,
        zIndex: 2,
        size: DEFAULT_NODE_SIZE,
        labelPlacement: 'right',
        labelOffsetX: 6,
        labelFill: typePalette[node.type ?? 'EntityType'] ?? '#64748B',
        labelFontSize: DEFAULT_LABEL_FONT_SIZE,
        labelFontWeight: 500,
        labelZIndex: 3,
        labelBackground: true,
        labelBackgroundFill: '#ffffff',
        labelBackgroundOpacity: 0.7,
        labelBackgroundLineWidth: 1,
        labelBackgroundPadding: [2, 6, 2, 6],
      },
    })),
    edges: rawData.edges.map((edge) => {
      const label = edge.name ?? edge.label ?? '未命名';
      const relationKey = label.toUpperCase();
      const stroke = relationPalette[relationKey] ?? '#64748B';
      const labelOffsetY = edge.source < edge.target ? 8 : -8;
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        data: {
          name: label,
          label,
          ...edge.attrs,
        },
        style: {
          stroke,
          lineWidth: 1,
          zIndex: 0,
          endArrow: true,
          endArrowSize: DEFAULT_EDGE_ARROW_SIZE,
          labelText: label,
          labelFill: stroke,
          labelFontSize: DEFAULT_EDGE_LABEL_FONT_SIZE,
          labelFontWeight: 500,
          labelAutoRotate: true,
          labelBackground: false,
          labelPlacement: 'center',
          labelOffsetX: 0,
          labelOffsetY,
          labelZIndex: 1,
        },
      };
    }),
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
