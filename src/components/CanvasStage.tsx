import type { EdgeData, GraphData, NodeData } from '@antv/g6';
import type { Graph } from '@antv/g6';
import { GraphCanvas } from './GraphCanvas';

type CanvasStageProps = {
  data: GraphData;
  onSelect?: (
    selection: { type: 'node'; data: NodeData } | { type: 'edge'; data: EdgeData } | null,
  ) => void;
  onGraphReady?: (graph: Graph) => void;
};

export function CanvasStage({ data, onSelect, onGraphReady }: CanvasStageProps) {
  return (
    <div className="canvas-stage">
      <GraphCanvas data={data} onSelect={onSelect} onGraphReady={onGraphReady} />
      <div className="canvas-overlay">
        <div className="overlay-card">
          <div className="overlay-title">概览</div>
          <div className="overlay-metric">节点 48 · 边 92</div>
        </div>
        <div className="overlay-card">
          <div className="overlay-title">迷你地图</div>
          <div className="mini-map" />
        </div>
      </div>
    </div>
  );
}
