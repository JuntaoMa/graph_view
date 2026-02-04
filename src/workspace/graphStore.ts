import type { GraphData } from '@antv/g6';
import { buildSampleGraphData } from '../graph/data';
import type { RawGraphData } from '../graph/data';

const WORKSPACE_PREFIX = 'graphview.workspace';

function getGraphKey(workspaceId: string) {
  return `${WORKSPACE_PREFIX}.${workspaceId}.graph`;
}

export function loadStoredGraphData(workspaceId = 'default'): RawGraphData | null {
  const raw = localStorage.getItem(getGraphKey(workspaceId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RawGraphData;
  } catch {
    return null;
  }
}

export function saveGraphData(raw: RawGraphData, workspaceId = 'default') {
  localStorage.setItem(getGraphKey(workspaceId), JSON.stringify(raw));
}

export async function loadWorkspaceGraphData(
  workspaceId = 'default',
  fallbackUrl = '/data/graph-template.json',
): Promise<GraphData> {
  const stored = loadStoredGraphData(workspaceId);
  if (stored) {
    return buildSampleGraphData(stored);
  }
  const response = await fetch(fallbackUrl);
  if (!response.ok) {
    throw new Error(`Failed to load graph data from ${fallbackUrl}`);
  }
  const raw = (await response.json()) as RawGraphData;
  saveGraphData(raw, workspaceId);
  return buildSampleGraphData(raw);
}

export function exportGraphData(raw: RawGraphData, filename = 'graph.json') {
  const blob = new Blob([JSON.stringify(raw, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
