import { useEffect, useRef } from 'react';
import type { EdgeData, GraphData, NodeData } from '@antv/g6';
import type { Graph } from '@antv/g6';
import { createGraph, FORCE_LAYOUT } from '../graph/createGraph';
import { getNodePosition } from '../graph/view';

type GraphCanvasProps = {
  data: GraphData;
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
  onCreateNode?: (payload: { x: number; y: number }) => void;
  onCreateEdge?: (payload: { source: string; target: string }) => void;
};

export function GraphCanvas({
  data,
  tool = 'select',
  onSelect,
  onGraphReady,
  onNodeMove,
  onCreateNode,
  onCreateEdge,
}: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectRef = useRef<typeof onSelect>(onSelect);
  const graphReadyRef = useRef<typeof onGraphReady>(onGraphReady);
  const nodeMoveRef = useRef<typeof onNodeMove>(onNodeMove);
  const createNodeRef = useRef<typeof onCreateNode>(onCreateNode);
  const createEdgeRef = useRef<typeof onCreateEdge>(onCreateEdge);
  const toolRef = useRef<typeof tool>(tool);
  const graphRef = useRef<Graph | null>(null);
  const selectedNodeIdsRef = useRef<Set<string>>(new Set());
  const selectedEdgeIdsRef = useRef<Set<string>>(new Set());
  const pendingEdgeSourceRef = useRef<string | null>(null);
  const resetSelectionRef = useRef<() => void>(() => undefined);
  const clearPendingEdgeRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    selectRef.current = onSelect;
    graphReadyRef.current = onGraphReady;
    nodeMoveRef.current = onNodeMove;
    createNodeRef.current = onCreateNode;
    createEdgeRef.current = onCreateEdge;
    toolRef.current = tool;
  }, [onSelect, onGraphReady, onNodeMove, onCreateNode, onCreateEdge, tool]);

  useEffect(() => {
    toolRef.current = tool;
    if (tool !== 'select') {
      resetSelectionRef.current?.();
    }
    if (tool !== 'add-edge') {
      clearPendingEdgeRef.current?.();
    }
  }, [tool]);

  useEffect(() => {
    if (!containerRef.current) return;

    const graph = createGraph(containerRef.current, data);
    graphRef.current = graph;
    graphReadyRef.current?.(graph);
    const dragStartPositions = new Map<string, { x: number; y: number }>();
    let active = true;

    const selectedNodeIds = selectedNodeIdsRef.current;
    const selectedEdgeIds = selectedEdgeIdsRef.current;

    const clearPendingEdge = () => {
      const pending = pendingEdgeSourceRef.current;
      if (pending && graph.hasNode(pending)) {
        void graph.setElementState({ [pending]: [] }, false);
      }
      pendingEdgeSourceRef.current = null;
    };

    const updateSelectionStates = () => {
      const data = graph.getData();
      const highlightNodes = new Set<string>();
      const highlightEdges = new Set<string>();

      selectedNodeIds.forEach((id) => {
        highlightNodes.add(id);
        const relatedEdges = graph.getRelatedEdgesData(id);
        relatedEdges.forEach((edge) => {
          highlightEdges.add(edge.id);
          highlightNodes.add(String(edge.source));
          highlightNodes.add(String(edge.target));
        });
      });

      selectedEdgeIds.forEach((id) => {
        highlightEdges.add(id);
        const edge = graph.getEdgeData(id);
        if (edge) {
          highlightNodes.add(String(edge.source));
          highlightNodes.add(String(edge.target));
        }
      });

      const hasHighlight = highlightNodes.size > 0 || highlightEdges.size > 0;
      const states: Record<string, string[]> = {};

      (data.nodes ?? []).forEach((node) => {
        const id = String(node.id);
        const nodeStates: string[] = [];
        if (hasHighlight) {
          nodeStates.push(highlightNodes.has(id) ? 'active' : 'inactive');
        }
        if (selectedNodeIds.has(id)) nodeStates.push('selected');
        states[id] = nodeStates;
      });

      (data.edges ?? []).forEach((edge) => {
        const id = String(edge.id);
        const edgeStates: string[] = [];
        if (hasHighlight) {
          edgeStates.push(highlightEdges.has(id) ? 'active' : 'inactive');
        }
        if (selectedEdgeIds.has(id)) edgeStates.push('selected');
        states[id] = edgeStates;
      });

      void graph.setElementState(states, false);

      const totalSelected = selectedNodeIds.size + selectedEdgeIds.size;
      if (totalSelected === 1) {
        if (selectedNodeIds.size === 1) {
          const [id] = selectedNodeIds;
          selectRef.current?.({ type: 'node', data: graph.getNodeData(id) });
        } else {
          const [id] = selectedEdgeIds;
          selectRef.current?.({ type: 'edge', data: graph.getEdgeData(id) });
        }
      } else {
        selectRef.current?.(null);
      }
    };

    const resetSelection = () => {
      selectedNodeIds.clear();
      selectedEdgeIds.clear();
      updateSelectionStates();
    };

    resetSelectionRef.current = resetSelection;
    clearPendingEdgeRef.current = clearPendingEdge;

    const renderGraph = async () => {
      await graph.render();
      if (!active || graph.destroyed) return;
      await graph.layout(FORCE_LAYOUT);
      if (!active || graph.destroyed) return;
      await graph.fitView({ when: 'overflow' });
    };

    void renderGraph();
    const handleNodeClick = (event: {
      target?: { id?: string };
      originalEvent?: MouseEvent;
    }) => {
      const id = event.target?.id;
      if (!id) return;
      const activeTool = toolRef.current ?? 'select';
      if (activeTool === 'add-edge') {
        if (!pendingEdgeSourceRef.current) {
          clearPendingEdge();
          pendingEdgeSourceRef.current = id;
          void graph.setElementState({ [id]: ['selected'] }, false);
        } else {
          const source = pendingEdgeSourceRef.current;
          clearPendingEdge();
          if (source) {
            createEdgeRef.current?.({ source, target: id });
          }
        }
        return;
      }
      if (activeTool !== 'select') return;
      const addToSelection =
        event.originalEvent?.shiftKey ||
        event.originalEvent?.metaKey ||
        event.originalEvent?.ctrlKey;
      if (!addToSelection) {
        selectedNodeIds.clear();
        selectedEdgeIds.clear();
        selectedNodeIds.add(id);
      } else if (selectedNodeIds.has(id)) {
        selectedNodeIds.delete(id);
      } else {
        selectedNodeIds.add(id);
      }
      updateSelectionStates();
    };

    const handleEdgeClick = (event: {
      target?: { id?: string };
      originalEvent?: MouseEvent;
    }) => {
      const activeTool = toolRef.current ?? 'select';
      if (activeTool !== 'select') return;
      const id = event.target?.id;
      if (!id) return;
      const addToSelection =
        event.originalEvent?.shiftKey ||
        event.originalEvent?.metaKey ||
        event.originalEvent?.ctrlKey;
      if (!addToSelection) {
        selectedNodeIds.clear();
        selectedEdgeIds.clear();
        selectedEdgeIds.add(id);
      } else if (selectedEdgeIds.has(id)) {
        selectedEdgeIds.delete(id);
      } else {
        selectedEdgeIds.add(id);
      }
      updateSelectionStates();
    };

    const handleCanvasClick = (event: { clientX?: number; clientY?: number }) => {
      const activeTool = toolRef.current ?? 'select';
      if (activeTool === 'add-node') {
        const fallback = event as { x?: number; y?: number };
        const clientX = event.clientX ?? fallback.x ?? 0;
        const clientY = event.clientY ?? fallback.y ?? 0;
        const point = graph.getCanvasByClient({
          x: clientX,
          y: clientY,
        });
        createNodeRef.current?.({ x: point.x, y: point.y });
        return;
      }
      if (activeTool === 'add-edge') {
        clearPendingEdge();
        return;
      }
      selectedNodeIds.clear();
      selectedEdgeIds.clear();
      updateSelectionStates();
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
      graphRef.current = null;
      resetSelectionRef.current = () => undefined;
      clearPendingEdgeRef.current = () => undefined;
    };
  }, [data]);

  return <div ref={containerRef} className="graph-canvas" />;
}
