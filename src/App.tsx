import { useEffect, useRef, useState } from 'react';
import type { EdgeData, Graph, GraphData, NodeData } from '@antv/g6';
import { toRawGraphData } from './graph/data';
import { loadWorkspaceGraphData, saveGraphData, exportGraphData } from './workspace/graphStore';
import { FORCE_LAYOUT } from './graph/createGraph';
import { applyViewSnapshot, captureViewSnapshot } from './graph/view';
import { saveViewSnapshot } from './workspace/storage';
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

  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [selection, setSelection] = useState<
    { type: 'node'; data: NodeData } | { type: 'edge'; data: EdgeData } | null
  >(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('画布缩放 100%');
  const [activityItems, setActivityItems] = useState<
    Array<{ id: string; text: string; meta: string }>
  >([]);
  const graphRef = useRef<Graph | null>(null);
  const undoStack = useRef<Command[]>([]);
  const redoStack = useRef<Command[]>([]);
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
    if (!graphRef.current) {
      setStatusMessage('图谱尚未加载完成');
      return;
    }
    const graph = graphRef.current;
    const fieldMap: Record<string, unknown> = {};
    const keyMap: Record<string, string> =
      payload.type === 'edge'
        ? {
            关系: 'relation',
            强度: 'strength',
            证据: 'evidence',
            更新时间: 'updatedAt',
          }
        : {
            类型: 'type',
            负责人: 'owner',
            可信度: 'confidence',
            来源: 'source',
            更新时间: 'updatedAt',
          };
    payload.fields.forEach((field) => {
      const name = field.name.trim();
      if (!name) return;
      const key = keyMap[name] ?? name;
      fieldMap[key] = field.value;
    });

    if (payload.type === 'node') {
      graph.updateNodeData([
        {
          id: payload.id,
          data: {
            name: payload.name,
            label: payload.name,
            description: payload.description,
            ...fieldMap,
          },
          style: {
            labelText: payload.name,
          },
        },
      ]);
      const updated = graph.getNodeData(payload.id);
      setSelection({ type: 'node', data: updated });
      logActivity(`已更新节点：${payload.name || payload.id}`);
    } else {
      graph.updateEdgeData([
        {
          id: payload.id,
          data: {
            name: payload.name,
            label: payload.name,
            description: payload.description,
            ...fieldMap,
          },
          style: {
            labelText: payload.name,
          },
        },
      ]);
      const updated = graph.getEdgeData(payload.id);
      setSelection({ type: 'edge', data: updated });
      logActivity(`已更新关系：${payload.name || payload.id}`);
    }

    const raw = toRawGraphData(graph.getData());
    saveGraphData(raw, workspaceId);
  };

  return (
    <div className="app-shell">
      <TopNav onExport={handleExport} />
      <div className="app-body">
        <LeftPanel activityItems={activityItems} />
        <main className="app-main">
          <CanvasToolbar
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
              onSelect={setSelection}
              onInspectorSave={handleInspectorSave}
              onGraphReady={(graph) => {
                graphRef.current = graph;
                logActivity('图谱已加载');
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
            />
          )}
          <StatusBar message={statusMessage} />
        </main>
      </div>
    </div>
  );
}
