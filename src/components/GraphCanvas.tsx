import { useEffect, useRef } from 'react';
import type { EdgeData, GraphData, NodeData, Point } from '@antv/g6';
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

    graph.setPlugins([
      {
        type: 'minimap',
        key: 'minimap',
        size: [180, 120],
        position: 'left-top',
        className: 'minimap',
        containerStyle: {
          left: '16px',
          top: '16px',
        },
        delay: 128,
      },
    ]);

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

    const handleMinimapClick = (event: MouseEvent) => {
      const minimapEl = graph
        .getCanvas()
        ?.getContainer()
        ?.querySelector('.g6-minimap') as HTMLDivElement | null;
      if (!minimapEl || graph.destroyed) return;
      const rect = minimapEl.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;

      const nodes = graph.getData().nodes;
      if (nodes.length === 0) return;

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      nodes.forEach((node) => {
        const pos = getNodePosition(node);
        if (!pos) return;
        minX = Math.min(minX, pos.x);
        minY = Math.min(minY, pos.y);
        maxX = Math.max(maxX, pos.x);
        maxY = Math.max(maxY, pos.y);
      });
      if (!Number.isFinite(minX) || !Number.isFinite(minY)) return;
      const width = Math.max(1, maxX - minX);
      const height = Math.max(1, maxY - minY);
      const worldX = minX + (x / rect.width) * width;
      const worldY = minY + (y / rect.height) * height;

      const zoom = graph.getZoom();
      const center = graph.getViewportCenter();
      const position: Point = [
        center[0] - worldX * zoom,
        center[1] - worldY * zoom,
      ];
      void graph.translateTo(position, false);
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
    const minimapContainer = graph
      .getCanvas()
      ?.getContainer()
      ?.querySelector('.g6-minimap') as HTMLDivElement | null;
    minimapContainer?.addEventListener('click', handleMinimapClick);

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
      minimapContainer?.removeEventListener('click', handleMinimapClick);
      resizeObserver.disconnect();
      graph.destroy();
    };
  }, [data]);

  return <div ref={containerRef} className="graph-canvas" />;
}
