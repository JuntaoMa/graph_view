import { useEffect, useRef, useState } from 'react';
import type { EdgeData, Graph, GraphData, NodeData } from '@antv/g6';
import { toRawGraphData } from './graph/data';
import { buildTypePalette, getTypeColor, relationPalette } from './graph/palette';
import { loadWorkspaceGraphData, saveGraphData, exportGraphData } from './workspace/graphStore';
import { FORCE_LAYOUT } from './graph/createGraph';
import { applyViewSnapshot, captureViewSnapshot } from './graph/view';
import { saveViewSnapshot } from './workspace/storage';
import {
  DEFAULT_EDGE_ARROW_SIZE,
  DEFAULT_EDGE_LABEL_FONT_SIZE,
  DEFAULT_LABEL_FONT_SIZE,
  DEFAULT_NODE_SIZE,
} from './graph/constants';
import { CanvasStage } from './components/CanvasStage';
import { CanvasToolbar } from './components/CanvasToolbar';
import { LeftPanel } from './components/LeftPanel';
import { StatusBar } from './components/StatusBar';
import { TopNav } from './components/TopNav';

export function App() {
  type Command = {
    name: string;
    apply: () => Promise<void> | void;
    revert: () => Promise<void> | void;
  };
  type Selection =
    | { type: 'node'; data: NodeData }
    | { type: 'edge'; data: EdgeData }
    | null;

  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [selection, setSelection] = useState<Selection>(null);
  const [createSelection, setCreateSelection] = useState<Selection>(null);
  const [activeTool, setActiveTool] = useState<'select' | 'add-node' | 'add-edge'>(
    'select',
  );
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('画布缩放 100%');
  const [activityItems, setActivityItems] = useState<
    Array<{ id: string; text: string; meta: string }>
  >([]);
  const [legendItems, setLegendItems] = useState<
    Array<{ type: string; color: string; count: number }>
  >([]);
  const graphRef = useRef<Graph | null>(null);
  const undoStack = useRef<Command[]>([]);
  const redoStack = useRef<Command[]>([]);
  const typePaletteRef = useRef<Record<string, string>>({});
  const draftCreateRef = useRef<{ type: 'node' | 'edge'; id: string } | null>(
    null,
  );
  const nodeIdSeed = useRef(0);
  const edgeIdSeed = useRef(0);
  const workspaceId = 'default';

  useEffect(() => {
    let active = true;
    loadWorkspaceGraphData(workspaceId)
      .then((data) => {
        if (active) setGraphData(data);
      })
      .catch(() => {
        if (active) setGraphData({ nodes: [], edges: [] });
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!graphData) return;
    const counts = new Map<string, number>();
    (graphData.nodes ?? []).forEach((node) => {
      const data = (node.data ?? {}) as Record<string, unknown>;
      const type = typeof data.type === 'string' ? data.type : 'EntityType';
      counts.set(type, (counts.get(type) ?? 0) + 1);
    });
    const types = Array.from(counts.keys()).sort((a, b) => a.localeCompare(b));
    const palette = buildTypePalette(types);
    typePaletteRef.current = palette;
    setLegendItems(
      types.map((type) => ({
        type,
        color: palette[type],
        count: counts.get(type) ?? 0,
      })),
    );
  }, [graphData]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMeta = event.metaKey || event.ctrlKey;
      if (!isMeta) return;
      if (event.key.toLowerCase() === 'z' && !event.shiftKey) {
        event.preventDefault();
        void handleUndo();
      }
      if (event.key.toLowerCase() === 'z' && event.shiftKey) {
        event.preventDefault();
        void handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const updateHistoryFlags = () => {
    setCanUndo(undoStack.current.length > 0);
    setCanRedo(redoStack.current.length > 0);
  };

  const refreshLegend = (graph: Graph) => {
    const data = graph.getData();
    const counts = new Map<string, number>();
    (data.nodes ?? []).forEach((node) => {
      const meta = (node.data ?? {}) as Record<string, unknown>;
      const type = typeof meta.type === 'string' ? meta.type : 'EntityType';
      counts.set(type, (counts.get(type) ?? 0) + 1);
    });
    const types = Array.from(counts.keys()).sort((a, b) => a.localeCompare(b));
    const nextPalette = { ...typePaletteRef.current };
    types.forEach((type) => {
      if (!nextPalette[type]) {
        nextPalette[type] = getTypeColor(type, nextPalette);
      }
    });
    typePaletteRef.current = nextPalette;
    setLegendItems(
      types.map((type) => ({
        type,
        color: nextPalette[type],
        count: counts.get(type) ?? 0,
      })),
    );
    return nextPalette;
  };

  const ensureTypeColor = (type: string) => {
    const palette = typePaletteRef.current;
    if (palette[type]) return palette[type];
    const color = getTypeColor(type, palette);
    const nextPalette = { ...palette, [type]: color };
    typePaletteRef.current = nextPalette;
    return color;
  };

  const buildNodeStyle = (color: string, x: number, y: number) => ({
    x,
    y,
    labelText: '',
    fill: color,
    stroke: color,
    lineWidth: 0,
    zIndex: 2,
    size: DEFAULT_NODE_SIZE,
    labelPlacement: 'right',
    labelOffsetX: 6,
    labelFill: color,
    labelFontSize: DEFAULT_LABEL_FONT_SIZE,
    labelFontWeight: 500,
    labelZIndex: 3,
    labelBackground: true,
    labelBackgroundFill: '#ffffff',
    labelBackgroundOpacity: 0.7,
    labelBackgroundLineWidth: 1,
    labelBackgroundPadding: [2, 6, 2, 6],
  });

  const buildEdgeStyle = (label: string, source: string, target: string) => {
    const relationKey = label.toUpperCase();
    const stroke = relationPalette[relationKey] ?? '#64748B';
    const labelOffsetY = source < target ? 8 : -8;
    return {
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
    };
  };

  const logActivity = (text: string) => {
    setStatusMessage(text);
    setActivityItems((prev) => {
      const meta = new Date().toLocaleString();
      const item = {
        id: `${Date.now()}_${prev.length}`,
        text,
        meta,
      };
      return [item, ...prev].slice(0, 20);
    });
  };

  const pushCommand = (command: Command) => {
    undoStack.current.push(command);
    redoStack.current = [];
    updateHistoryFlags();
  };

  const handleLayout = async () => {
    if (!graphRef.current) {
      setStatusMessage('图谱尚未加载完成');
      return;
    }
    const graph = graphRef.current;
    const before = captureViewSnapshot(graph);
    await graph.layout(FORCE_LAYOUT);
    const after = captureViewSnapshot(graph);
    pushCommand({
      name: '应用力导向布局',
      apply: () => applyViewSnapshot(graph, after, false),
      revert: () => applyViewSnapshot(graph, before, false),
    });
    logActivity('已应用力导向布局');
  };

  const handleUndo = async () => {
    if (!graphRef.current) {
      setStatusMessage('图谱尚未加载完成');
      return;
    }
    const command = undoStack.current.pop();
    if (!command) return;
    await command.revert();
    redoStack.current.push(command);
    updateHistoryFlags();
    logActivity(`已撤销：${command.name}`);
  };

  const handleRedo = async () => {
    if (!graphRef.current) {
      setStatusMessage('图谱尚未加载完成');
      return;
    }
    const command = redoStack.current.pop();
    if (!command) return;
    await command.apply();
    undoStack.current.push(command);
    updateHistoryFlags();
    logActivity(`已重做：${command.name}`);
  };

  const handleSaveView = () => {
    if (!graphRef.current) {
      setStatusMessage('图谱尚未加载完成');
      return;
    }
    const snapshot = captureViewSnapshot(graphRef.current);
    const record = saveViewSnapshot(snapshot);
    logActivity(`视图已保存：${record.name}`);
  };

  const handleExport = () => {
    if (!graphRef.current) {
      setStatusMessage('图谱尚未加载完成');
      return;
    }
    const raw = toRawGraphData(graphRef.current.getData());
    exportGraphData(raw, `graph-${workspaceId}.json`);
    logActivity('已导出图谱数据');
  };

  const handleInspectorSave = (payload: {
    type: 'node' | 'edge';
    id: string;
    name: string;
    description: string;
    fields: Array<{ name: string; value: string }>;
  }) => {
    if (!graphRef.current || graphRef.current.destroyed) {
      setStatusMessage('图谱尚未加载完成');
      return;
    }
    const graph = graphRef.current;
    const fieldMap: Record<string, unknown> = {};
    payload.fields.forEach((field) => {
      const name = field.name.trim();
      if (!name) return;
      fieldMap[name] = field.value;
    });

    if (payload.type === 'node') {
      const existing = graph.getNodeData(payload.id);
      if (!existing) {
        setStatusMessage('未找到对应的节点');
        return;
      }
      const prevData = (existing?.data ?? {}) as Record<string, unknown>;
      const name =
        payload.name.trim() ||
        String(prevData.name ?? prevData.label ?? payload.id ?? '未命名');
      const description = payload.description ?? '';
      graph.updateNodeData([
        {
          id: payload.id,
          data: {
            ...prevData,
            name,
            label: name,
            description,
            properties: fieldMap,
          },
          style: {
            labelText: name,
          },
        },
      ]);
      const updated = graph.getNodeData(payload.id);
      setSelection({ type: 'node', data: updated });
      logActivity(`已更新节点：${name || payload.id}`);
    } else {
      const existing = graph.getEdgeData(payload.id);
      if (!existing) {
        setStatusMessage('未找到对应的关系');
        return;
      }
      const prevData = (existing?.data ?? {}) as Record<string, unknown>;
      const name =
        payload.name.trim() ||
        String(prevData.name ?? prevData.label ?? payload.id ?? '未命名');
      const description = payload.description ?? '';
      const source = String(existing?.source ?? '');
      const target = String(existing?.target ?? '');
      graph.updateEdgeData([
        {
          id: payload.id,
          data: {
            ...prevData,
            name,
            label: name,
            description,
            properties: fieldMap,
          },
          style: {
            ...buildEdgeStyle(name, source, target),
            labelText: name,
          },
        },
      ]);
      const updated = graph.getEdgeData(payload.id);
      setSelection({ type: 'edge', data: updated });
      logActivity(`已更新关系：${name || payload.id}`);
    }

    const raw = toRawGraphData(graph.getData());
    saveGraphData(raw, workspaceId);
    refreshLegend(graph);
  };

  const handleToolChange = (tool: 'select' | 'add-node' | 'add-edge') => {
    const nextTool = activeTool === tool ? 'select' : tool;
    setActiveTool(nextTool);
    if (nextTool !== 'select') {
      setSelection(null);
    }
    if (nextTool === 'add-node') {
      setStatusMessage('点击画布添加新节点');
    } else if (nextTool === 'add-edge') {
      setStatusMessage('点击两个节点以创建连接');
    } else {
      setStatusMessage('画布缩放 100%');
    }
  };

  const handleCreateNode = (payload: { x: number; y: number }) => {
    if (!graphRef.current || graphRef.current.destroyed) return;
    const graph = graphRef.current;
    const id = `node_${Date.now()}_${nodeIdSeed.current++}`;
    const type = 'EntityType';
    const color = ensureTypeColor(type);
    const name = '新节点';
    graph.addNodeData([
      {
        id,
        data: {
          name,
          label: name,
          type,
          description: '',
          properties: {},
        },
        style: {
          ...buildNodeStyle(color, payload.x, payload.y),
          labelText: name,
        },
      },
    ]);
    draftCreateRef.current = { type: 'node', id };
    setSelection(null);
    setCreateSelection({ type: 'node', data: graph.getNodeData(id) });
    setActiveTool('select');
    logActivity('已创建节点草稿');
    refreshLegend(graph);
  };

  const handleCreateEdge = (payload: { source: string; target: string }) => {
    if (!graphRef.current || graphRef.current.destroyed) return;
    const graph = graphRef.current;
    const id = `edge_${Date.now()}_${edgeIdSeed.current++}`;
    const label = '新关系';
    graph.addEdgeData([
      {
        id,
        source: payload.source,
        target: payload.target,
        data: {
          name: label,
          label,
          description: '',
          properties: {},
        },
        style: buildEdgeStyle(label, payload.source, payload.target),
      },
    ]);
    draftCreateRef.current = { type: 'edge', id };
    setSelection(null);
    setCreateSelection({ type: 'edge', data: graph.getEdgeData(id) });
    setActiveTool('select');
    logActivity('已创建关系草稿');
  };

  const handleCreateCancel = () => {
    if (!graphRef.current || graphRef.current.destroyed) return;
    const graph = graphRef.current;
    const draft = draftCreateRef.current;
    if (draft) {
      if (draft.type === 'node') {
        const relatedEdges = graph.getRelatedEdgesData(draft.id);
        if (relatedEdges.length > 0) {
          graph.removeEdgeData(relatedEdges.map((edge) => edge.id));
        }
        graph.removeNodeData([draft.id]);
      } else {
        graph.removeEdgeData([draft.id]);
      }
      refreshLegend(graph);
    }
    draftCreateRef.current = null;
    setCreateSelection(null);
    logActivity('已取消创建');
  };

  const handleCreateSave = (payload: {
    type: 'node' | 'edge';
    id: string;
    name: string;
    description: string;
    fields: Array<{ name: string; value: string }>;
  }) => {
    handleInspectorSave(payload);
    draftCreateRef.current = null;
    setCreateSelection(null);
  };

  const handleDelete = (payload: { type: 'node' | 'edge'; id: string }) => {
    if (!graphRef.current || graphRef.current.destroyed) {
      setStatusMessage('图谱尚未加载完成');
      return;
    }
    const graph = graphRef.current;
    if (payload.type === 'node') {
      const relatedEdges = graph.getRelatedEdgesData(payload.id);
      if (relatedEdges.length > 0) {
        graph.removeEdgeData(relatedEdges.map((edge) => edge.id));
      }
      graph.removeNodeData([payload.id]);
      logActivity(`已删除节点：${payload.id}`);
    } else {
      graph.removeEdgeData([payload.id]);
      logActivity(`已删除关系：${payload.id}`);
    }
    setSelection(null);
    const raw = toRawGraphData(graph.getData());
    saveGraphData(raw, workspaceId);
    refreshLegend(graph);
  };

  return (
    <div className="app-shell">
      <TopNav onExport={handleExport} />
      <div className="app-body">
        <LeftPanel activityItems={activityItems} legendItems={legendItems} />
        <main className="app-main">
          <CanvasToolbar
            activeTool={activeTool}
            onToolChange={handleToolChange}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onSave={handleSaveView}
            onLayout={handleLayout}
            canUndo={canUndo}
            canRedo={canRedo}
          />
          {graphData && (
            <CanvasStage
              data={graphData}
              selection={selection}
              createSelection={createSelection}
              tool={activeTool}
              onSelect={setSelection}
              onInspectorSave={handleInspectorSave}
              onInspectorDelete={handleDelete}
              onCreateSave={handleCreateSave}
              onCreateCancel={handleCreateCancel}
              onGraphReady={(graph) => {
                graphRef.current = graph;
                logActivity('图谱已加载');
                refreshLegend(graph);
              }}
              onNodeMove={(payload) => {
                if (!graphRef.current) return;
                const graph = graphRef.current;
                pushCommand({
                  name: '移动节点',
                  apply: () =>
                    graph.translateElementTo(payload.id, [
                      payload.after.x,
                      payload.after.y,
                    ], false),
                  revert: () =>
                    graph.translateElementTo(payload.id, [
                      payload.before.x,
                      payload.before.y,
                    ], false),
                });
                logActivity('已移动节点');
              }}
              onCreateNode={handleCreateNode}
              onCreateEdge={handleCreateEdge}
            />
          )}
          <StatusBar message={statusMessage} />
        </main>
      </div>
    </div>
  );
}
