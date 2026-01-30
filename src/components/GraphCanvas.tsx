import { useEffect, useRef } from 'react';
import type { EdgeData, GraphData, NodeData } from '@antv/g6';
import type { Graph } from '@antv/g6';
import { createGraph } from '../graph/createGraph';

type GraphCanvasProps = {
  data: GraphData;
  onSelect?: (
    selection: { type: 'node'; data: NodeData } | { type: 'edge'; data: EdgeData } | null,
  ) => void;
  onGraphReady?: (graph: Graph) => void;
};

export function GraphCanvas({ data, onSelect, onGraphReady }: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const graph = createGraph(containerRef.current, data);
    onGraphReady?.(graph);
    const handleNodeClick = (event: { target?: { id?: string } }) => {
      const id = event.target?.id;
      if (!id) return;
      onSelect?.({ type: 'node', data: graph.getNodeData(id) });
    };

    const handleEdgeClick = (event: { target?: { id?: string } }) => {
      const id = event.target?.id;
      if (!id) return;
      onSelect?.({ type: 'edge', data: graph.getEdgeData(id) });
    };

    const handleCanvasClick = () => {
      onSelect?.(null);
    };

    graph.on('node:click', handleNodeClick);
    graph.on('edge:click', handleEdgeClick);
    graph.on('canvas:click', handleCanvasClick);

    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      if (width > 0 && height > 0) {
        graph.setSize(width, height);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      graph.off('node:click', handleNodeClick);
      graph.off('edge:click', handleEdgeClick);
      graph.off('canvas:click', handleCanvasClick);
      resizeObserver.disconnect();
      graph.destroy();
    };
  }, [data, onSelect]);

  return <div ref={containerRef} className="graph-canvas" />;
}
