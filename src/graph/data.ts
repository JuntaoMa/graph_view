import type { GraphData } from '@antv/g6';
import { buildTypePalette, getTypeColor, relationPalette } from './palette';
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
  properties?: Record<string, unknown>;
  attrs?: Record<string, unknown>;
};

export type RawEdge = {
  id: string;
  source: string;
  target: string;
  name?: string;
  label?: string;
  properties?: Record<string, unknown>;
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
      const { name, label, type, properties, description } = data;
      const rawNode: RawNode = {
        id: String(node.id),
        label: String(name ?? label ?? node.id ?? '未命名'),
        type: typeof type === 'string' ? type : undefined,
      };
      const nextProperties: Record<string, unknown> = {};
      if (properties && typeof properties === 'object') {
        Object.assign(nextProperties, properties as Record<string, unknown>);
      }
      if (description !== undefined && description !== null && description !== '') {
        nextProperties.description = description;
      }
      if (Object.keys(nextProperties).length > 0) {
        rawNode.properties = nextProperties;
      }
      return rawNode;
    }),
    edges: (graphData.edges ?? []).map((edge) => {
      const data = (edge.data ?? {}) as Record<string, unknown>;
      const { name, label, properties, description } = data;
      const rawEdge: RawEdge = {
        id: String(edge.id),
        source: String(edge.source),
        target: String(edge.target),
        label: String(name ?? label ?? edge.id ?? '未命名'),
      };
      const nextProperties: Record<string, unknown> = {};
      if (properties && typeof properties === 'object') {
        Object.assign(nextProperties, properties as Record<string, unknown>);
      }
      if (description !== undefined && description !== null && description !== '') {
        nextProperties.description = description;
      }
      if (Object.keys(nextProperties).length > 0) {
        rawEdge.properties = nextProperties;
      }
      return rawEdge;
    }),
  };
}

export function buildSampleGraphData(rawData: RawGraphData): GraphData {
  const types = rawData.nodes.map((node) => node.type ?? 'EntityType');
  const typePalette = buildTypePalette(types);
  return {
    nodes: rawData.nodes.map((node) => ({
      id: node.id,
      data: {
        name: node.name ?? node.label ?? '未命名',
        label: node.name ?? node.label ?? '未命名',
        type: node.type ?? 'EntityType',
        description:
          node.properties?.description ?? node.attrs?.description ?? '',
        properties: (() => {
          const props = { ...(node.properties ?? node.attrs ?? {}) };
          if ('description' in props) {
            delete props.description;
          }
          return props;
        })(),
      },
      style: {
        labelText: node.name ?? node.label ?? '未命名',
        fill: getTypeColor(node.type ?? 'EntityType', typePalette),
        stroke: getTypeColor(node.type ?? 'EntityType', typePalette),
        lineWidth: 0,
        zIndex: 2,
        size: DEFAULT_NODE_SIZE,
        labelPlacement: 'right',
        labelOffsetX: 6,
        labelFill: getTypeColor(node.type ?? 'EntityType', typePalette),
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
      const props = { ...(edge.properties ?? edge.attrs ?? {}) };
      const description =
        edge.properties?.description ?? edge.attrs?.description ?? '';
      if ('description' in props) {
        delete props.description;
      }
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        data: {
          name: label,
          label,
          description,
          properties: props,
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
