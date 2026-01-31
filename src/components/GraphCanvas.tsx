import { useEffect, useRef } from 'react';
import type { EdgeData, GraphData, NodeData } from '@antv/g6';
import type { Graph } from '@antv/g6';
import { createGraph, FORCE_LAYOUT } from '../graph/createGraph';
import { getNodePosition } from '../graph/view';

type GraphCanvasProps = {
  data: GraphData;
  onSelect?: (
    selection: { type: 'node'; data: NodeData } | { type: 'edge'; data: EdgeData } | null,
  ) => void;
  onGraphReady?: (graph: Graph) => void;
  onNodeMove?: (payload: {
    id: string;
    before: { x: number; y: number };
    after: { x: number; y: number };
  }) => void;
};

export function GraphCanvas({
  data,
  onSelect,
  onGraphReady,
  onNodeMove,
}: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectRef = useRef<typeof onSelect>(onSelect);
  const graphReadyRef = useRef<typeof onGraphReady>(onGraphReady);
  const nodeMoveRef = useRef<typeof onNodeMove>(onNodeMove);

  useEffect(() => {
    selectRef.current = onSelect;
    graphReadyRef.current = onGraphReady;
    nodeMoveRef.current = onNodeMove;
  }, [onSelect, onGraphReady, onNodeMove]);

  useEffect(() => {
    if (!containerRef.current) return;

    const graph = createGraph(containerRef.current, data);
    graphReadyRef.current?.(graph);
    const dragStartPositions = new Map<string, { x: number; y: number }>();
    let active = true;

    const renderGraph = async () => {
      await graph.render();
      if (!active || graph.destroyed) return;
      await graph.layout(FORCE_LAYOUT);
      if (!active || graph.destroyed) return;
      await graph.fitView({ when: 'overflow' });
    };

    void renderGraph();
    const handleNodeClick = (event: { target?: { id?: string } }) => {
      const id = event.target?.id;
      if (!id) return;
      selectRef.current?.({ type: 'node', data: graph.getNodeData(id) });
    };

    const handleEdgeClick = (event: { target?: { id?: string } }) => {
      const id = event.target?.id;
      if (!id) return;
      selectRef.current?.({ type: 'edge', data: graph.getEdgeData(id) });
    };

    const handleCanvasClick = () => {
      selectRef.current?.(null);
    };

    const handleNodeDragStart = (event: { target?: { id?: string }; data?: { id?: string } }) => {
      const id = event.target?.id ?? event.data?.id;
      if (!id) return;
      if (!graph.hasNode(id)) return;
      const nodeData = graph.getNodeData(id);
      const position = getNodePosition(nodeData);
      if (position) {
        dragStartPositions.set(id, position);
      }
    };

    const handleNodeDragEnd = (event: { target?: { id?: string }; data?: { id?: string } }) => {
      const id = event.target?.id ?? event.data?.id;
      if (!id) return;
      if (!graph.hasNode(id)) return;
      const before = dragStartPositions.get(id);
      const nodeData = graph.getNodeData(id);
      const after = getNodePosition(nodeData);
      if (before && after) {
        if (before.x !== after.x || before.y !== after.y) {
          nodeMoveRef.current?.({ id, before, after });
        }
      }
      dragStartPositions.delete(id);
    };

    graph.on('node:click', handleNodeClick);
    graph.on('edge:click', handleEdgeClick);
    graph.on('canvas:click', handleCanvasClick);
    graph.on('node:dragstart', handleNodeDragStart);
    graph.on('node:dragend', handleNodeDragEnd);

    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      if (width > 0 && height > 0) {
        graph.setSize(width, height);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      active = false;
      graph.off('node:click', handleNodeClick);
      graph.off('edge:click', handleEdgeClick);
      graph.off('canvas:click', handleCanvasClick);
      graph.off('node:dragstart', handleNodeDragStart);
      graph.off('node:dragend', handleNodeDragEnd);
      resizeObserver.disconnect();
      graph.destroy();
    };
  }, [data]);

  return <div ref={containerRef} className="graph-canvas" />;
}
