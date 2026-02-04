import type { EdgeData, GraphData, NodeData } from '@antv/g6';
import type { Graph } from '@antv/g6';
import { GraphCanvas } from './GraphCanvas';
import { InspectorOverlay } from './InspectorOverlay';

type CanvasStageProps = {
  data: GraphData;
  selection: { type: 'node'; data: NodeData } | { type: 'edge'; data: EdgeData } | null;
  onSelect?: (
    selection: { type: 'node'; data: NodeData } | { type: 'edge'; data: EdgeData } | null,
  ) => void;
  onGraphReady?: (graph: Graph) => void;
  onNodeMove?: (payload: {
    id: string;
    before: { x: number; y: number };
    after: { x: number; y: number };
  }) => void;
  onInspectorSave?: (payload: {
    type: 'node' | 'edge';
    id: string;
    name: string;
    description: string;
    fields: Array<{ name: string; value: string }>;
  }) => void;
};

export function CanvasStage({
  data,
  selection,
  onSelect,
  onGraphReady,
  onNodeMove,
  onInspectorSave,
}: CanvasStageProps) {
  return (
    <div className="canvas-stage">
      <GraphCanvas
        data={data}
        onSelect={onSelect}
        onGraphReady={onGraphReady}
        onNodeMove={onNodeMove}
      />
      <div className="canvas-overlay">
        <InspectorOverlay selection={selection} onSave={onInspectorSave} />
      </div>
    </div>
  );
}
