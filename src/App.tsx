import { useEffect, useMemo, useRef } from 'react';
import { Layout, Typography, Space, Tag, Card } from 'antd';
import G6 from '@antv/g6';

const { Header, Content, Sider } = Layout;
const { Title, Paragraph, Text } = Typography;

const sampleData = {
  nodes: [
    { id: 'n1', label: '需求分析', type: 'process' },
    { id: 'n2', label: '数据导入', type: 'data' },
    { id: 'n3', label: '知识图谱', type: 'graph' },
    { id: 'n4', label: '洞察输出', type: 'insight' },
    { id: 'n5', label: '本地存储', type: 'storage' },
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n2', label: '准备' },
    { id: 'e2', source: 'n2', target: 'n3', label: '构建' },
    { id: 'e3', source: 'n3', target: 'n4', label: '输出' },
    { id: 'e4', source: 'n5', target: 'n3', label: '支持' },
    { id: 'e5', source: 'n3', target: 'n3', label: '自环' },
  ],
};

const typePalette: Record<string, string> = {
  process: '#4C6EF5',
  data: '#15AABF',
  graph: '#FAB005',
  insight: '#E8590C',
  storage: '#2F9E44',
};

export function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const graphData = useMemo(
    () => ({
      nodes: sampleData.nodes.map((node) => ({
        ...node,
        style: {
          fill: typePalette[node.type] ?? '#5C7CFA',
          stroke: '#1C1E21',
          lineWidth: 1,
        },
        labelCfg: {
          position: 'bottom',
          style: {
            fill: '#1C1E21',
            fontSize: 12,
          },
        },
      })),
      edges: sampleData.edges.map((edge) => ({
        ...edge,
        style: {
          stroke: '#868E96',
          endArrow: true,
        },
        labelCfg: {
          autoRotate: true,
          style: {
            fill: '#495057',
            fontSize: 11,
            background: {
              fill: '#F8F9FA',
              padding: [2, 4, 2, 4],
              radius: 4,
            },
          },
        },
      })),
    }),
    [],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const graph = new G6.Graph({
      container: containerRef.current,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      layout: {
        type: 'force',
        preventOverlap: true,
        linkDistance: 160,
      },
      defaultNode: {
        size: 46,
        type: 'circle',
      },
      defaultEdge: {
        type: 'line',
      },
      modes: {
        default: ['drag-canvas', 'zoom-canvas'],
      },
    });

    graph.data(graphData);
    graph.render();

    const handleResize = () => {
      if (!containerRef.current) return;
      graph.changeSize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight,
      );
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      graph.destroy();
    };
  }, [graphData]);

  return (
    <Layout className="app-shell">
      <Header className="app-header">
        <Space direction="vertical" size={2}>
          <Title level={3} className="app-title">
            GraphView 本地优先 MVP
          </Title>
          <Text className="app-subtitle">
            仅展示图与基础 UI，功能交互将在后续迭代中定义。
          </Text>
        </Space>
      </Header>
      <Layout>
        <Sider width={280} className="app-sider">
          <Space direction="vertical" size="middle" className="app-sider-content">
            <Card size="small" title="MVP 状态">
              <Paragraph className="app-muted">
                当前版本聚焦“图可视化 + UI 框架”，暂不实现编辑与交互逻辑。
              </Paragraph>
            </Card>
            <Card size="small" title="示例节点类型">
              <Space wrap>
                {Object.entries(typePalette).map(([type, color]) => (
                  <Tag key={type} color={color}>
                    {type}
                  </Tag>
                ))}
              </Space>
            </Card>
            <Card size="small" title="即将支持">
              <ul className="app-list">
                <li>拖拽连线与多选</li>
                <li>属性面板编辑</li>
                <li>本地导入导出</li>
              </ul>
            </Card>
          </Space>
        </Sider>
        <Content className="app-content">
          <div ref={containerRef} className="graph-canvas" />
        </Content>
      </Layout>
    </Layout>
  );
}
