# GraphView (Local Edition)

GraphView 是一个**本地优先 (Local-First)**、注重隐私保护的知识图谱可视化构建工具，目标是提供类似 Graph Commons 的流畅交互体验，同时确保所有数据仅存储在用户本地设备上，适用于处理敏感业务逻辑、故障归因分析及个人知识库构建。

## 🎯 核心特性

### 🔒 安全与隐私
- **零服务端 (Serverless)**：所有逻辑在浏览器端运行，无后端服务器。
- **本地存储**：数据仅存在于内存及本地文件（JSON/CSV）中。

### 🎨 可视化与交互
- **所见即所得 (WYSIWYG)**：
  - 支持文本标签、有向边、自环边。
  - **智能高亮**：选中节点时自动高亮其邻居及关联边；支持按类型筛选高亮。
- **编辑器级交互**：
  - **动态连线**：直观的拖拽连线交互（Drag-to-Connect）。
  - **多选操作**：支持按住 `Shift`/`Ctrl` 框选或多选节点/边。
  - **拖拽布局**：支持力导向自动布局，同时允许手动拖拽固定节点位置（Pinning）。

### 🛠 属性管理 (Property Inspector)
- **侧边栏详情**：点击对象唤起侧边栏，查看完整信息。
- **多属性编辑**：支持动态添加、修改、删除任意业务属性（不限于 Description）。
- **类型系统**：支持为节点定义“类型 (Type)”，并基于类型自动映射颜色/形状。

### 💾 导入与导出
- 支持标准 JSON 格式的导入与导出（包含布局坐标）。
- 支持 CSV 格式的批量节点/边导入。
- 其他待支持格式。

## 🏗 技术栈

- **Core Framework**: React 18
- **Build Tool**: Vite
- **Graph Engine**: AntV G6 (v5)
- **UI Library**: Ant Design (v5)
- **State Management**: Zustand
- **Language**: JavaScript / TypeScript

## 🧱 项目架构设计

### 1) 总体分层
- **UI 层 (React + Ant Design)**：负责布局、侧边栏、工具栏、表单与弹窗。
- **图渲染层 (AntV G6 v5)**：封装为 GraphCanvas 组件，负责画布与交互事件。
- **状态管理层 (Zustand)**：维护图数据、选择态、布局状态与 UI 状态。
- **数据模型层 (Graph Model)**：统一节点/边结构、类型系统与布局坐标。
- **导入导出层 (Import/Export)**：JSON/CSV 解析、清洗与序列化。
- **持久化层 (Local-First Storage)**：本地文件与浏览器存储（不触及服务器）。

### 2) 建议目录结构
```
src/
  app/                  # 入口、路由、全局 Provider
  components/
    GraphCanvas/         # G6 实例初始化与事件桥接
    Toolbar/             # 操作栏（增删、导入导出、布局）
    InspectorPanel/      # 右侧属性面板
    NodeTypeBadge/       # 类型显示与颜色映射
  store/
    graphStore.ts        # 节点/边数据、选择态
    uiStore.ts           # 侧栏状态、工具状态
  graph/
    model.ts             # Node/Edge 类型定义
    mapping.ts           # 类型到颜色/形状映射
    layout.ts            # 布局策略封装
    g6Config.ts          # G6 全局配置、交互注册
  io/
    importJson.ts
    exportJson.ts
    importCsv.ts
  utils/
    validators.ts
    id.ts
```

### 3) 事件与数据流
- **交互驱动 → Zustand 更新 → 触发 G6 视图同步**。
- G6 事件（点击节点/边、拖拽、连线）通过桥接层更新 store。
- store 变化触发 React 组件更新（侧栏、工具栏等）。

### 4) 数据结构建议
```ts
type GraphNode = {
  id: string;
  label: string;
  type?: string;
  attrs?: Record<string, any>;
  x?: number;
  y?: number;
};

type GraphEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
  attrs?: Record<string, any>;
};
```

### 5) 本地优先存储策略
- 默认使用内存 + JSON/CSV 导入导出。
- 可选方案：LocalStorage / IndexedDB。
- **不依赖任何远端 API**，确保隐私与数据控制权。
