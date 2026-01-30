import { useEffect, useRef, useState } from 'react';
import type { EdgeData, Graph, GraphData, NodeData } from '@antv/g6';
import { loadSampleGraphData } from './graph/data';
import { FORCE_LAYOUT } from './graph/createGraph';
import { applyViewSnapshot, captureViewSnapshot } from './graph/view';
import { saveViewSnapshot } from './workspace/storage';
import { CanvasStage } from './components/CanvasStage';
import { CanvasToolbar } from './components/CanvasToolbar';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { StatusBar } from './components/StatusBar';
import { TopNav } from './components/TopNav';

export function App() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [selection, setSelection] = useState<
    { type: 'node'; data: NodeData } | { type: 'edge'; data: EdgeData } | null
  >(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('画布缩放 100%');
  const graphRef = useRef<Graph | null>(null);
  const pastLayouts = useRef<
    Array<{
      before: ReturnType<typeof captureViewSnapshot>;
      after: ReturnType<typeof captureViewSnapshot>;
    }>
  >([]);
  const futureLayouts = useRef<
    Array<{
      before: ReturnType<typeof captureViewSnapshot>;
      after: ReturnType<typeof captureViewSnapshot>;
    }>
  >([]);

  useEffect(() => {
    let active = true;
    loadSampleGraphData()
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

  const updateHistoryFlags = () => {
    setCanUndo(pastLayouts.current.length > 0);
    setCanRedo(futureLayouts.current.length > 0);
  };

  const handleLayout = async () => {
    if (!graphRef.current) return;
    const graph = graphRef.current;
    const before = captureViewSnapshot(graph);
    await graph.layout(FORCE_LAYOUT);
    const after = captureViewSnapshot(graph);
    pastLayouts.current.push({ before, after });
    futureLayouts.current = [];
    updateHistoryFlags();
    setStatusMessage('已应用力导向布局');
  };

  const handleUndo = async () => {
    if (!graphRef.current) return;
    const entry = pastLayouts.current.pop();
    if (!entry) return;
    await applyViewSnapshot(graphRef.current, entry.before);
    futureLayouts.current.push(entry);
    updateHistoryFlags();
    setStatusMessage('已撤销上一次布局');
  };

  const handleRedo = async () => {
    if (!graphRef.current) return;
    const entry = futureLayouts.current.pop();
    if (!entry) return;
    await applyViewSnapshot(graphRef.current, entry.after);
    pastLayouts.current.push(entry);
    updateHistoryFlags();
    setStatusMessage('已重做布局');
  };

  const handleSaveView = () => {
    if (!graphRef.current) return;
    const snapshot = captureViewSnapshot(graphRef.current);
    saveViewSnapshot(snapshot);
    setStatusMessage('视图已保存到本地工作区');
  };

  return (
    <div className="app-shell">
      <TopNav />
      <div className="app-body">
        <LeftPanel />
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
              onSelect={setSelection}
              onGraphReady={(graph) => {
                graphRef.current = graph;
              }}
            />
          )}
          <StatusBar message={statusMessage} />
        </main>
        <RightPanel selection={selection} />
      </div>
    </div>
  );
}
