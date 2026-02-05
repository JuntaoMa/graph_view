import type { EdgeData, GraphData, NodeData } from '@antv/g6';
import type { Graph } from '@antv/g6';
import { GraphCanvas } from './GraphCanvas';
import { InspectorOverlay } from './InspectorOverlay';

type CanvasStageProps = {
  data: GraphData;
  selection: { type: 'node'; data: NodeData } | { type: 'edge'; data: EdgeData } | null;
  createSelection?: { type: 'node'; data: NodeData } | { type: 'edge'; data: EdgeData } | null;
  tool?: 'select' | 'add-node' | 'add-edge';
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
  onInspectorDelete?: (payload: { type: 'node' | 'edge'; id: string }) => void;
  onCreateSave?: (payload: {
    type: 'node' | 'edge';
    id: string;
    name: string;
    description: string;
    fields: Array<{ name: string; value: string }>;
  }) => void;
  onCreateCancel?: () => void;
  onCreateNode?: (payload: { x: number; y: number }) => void;
  onCreateEdge?: (payload: { source: string; target: string }) => void;
};

export function CanvasStage({
  data,
  selection,
  createSelection,
  tool = 'select',
  onSelect,
  onGraphReady,
  onNodeMove,
  onInspectorSave,
  onInspectorDelete,
  onCreateSave,
  onCreateCancel,
  onCreateNode,
  onCreateEdge,
}: CanvasStageProps) {
  return (
    <div className="canvas-stage">
      <GraphCanvas
        data={data}
        tool={tool}
        onSelect={onSelect}
        onGraphReady={onGraphReady}
        onNodeMove={onNodeMove}
        onCreateNode={onCreateNode}
        onCreateEdge={onCreateEdge}
      />
      <div className="canvas-overlay">
        <InspectorOverlay
          selection={selection}
          onSave={onInspectorSave}
          onDelete={onInspectorDelete}
        />
      </div>
      {createSelection && (
        <div className="canvas-modal">
          <InspectorOverlay
            selection={createSelection}
            onSave={onCreateSave}
            onCancel={onCreateCancel}
            mode="edit"
            showEditToggle={false}
            allowDelete={false}
            variant="modal"
          />
        </div>
      )}
    </div>
  );
}
