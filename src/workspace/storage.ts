import type { ViewSnapshot } from '../graph/view';

type ViewRecord = {
  id: string;
  name: string;
  createdAt: string;
  layout: 'force';
  snapshot: ViewSnapshot;
};

type WorkspaceStore = {
  views: ViewRecord[];
};

const WORKSPACE_KEY = 'graphview.workspace.default';

function loadStore(): WorkspaceStore {
  const raw = localStorage.getItem(WORKSPACE_KEY);
  if (!raw) return { views: [] };
  try {
    const parsed = JSON.parse(raw) as WorkspaceStore;
    return { views: parsed.views ?? [] };
  } catch {
    return { views: [] };
  }
}

function saveStore(store: WorkspaceStore) {
  localStorage.setItem(WORKSPACE_KEY, JSON.stringify(store));
}

export function saveViewSnapshot(
  snapshot: ViewSnapshot,
  name?: string,
): ViewRecord {
  const store = loadStore();
  const createdAt = new Date().toISOString();
  const record: ViewRecord = {
    id: `view_${Date.now()}`,
    name: name ?? `视图 ${new Date().toLocaleString()}`,
    createdAt,
    layout: 'force',
    snapshot,
  };
  store.views.unshift(record);
  saveStore(store);
  return record;
}
