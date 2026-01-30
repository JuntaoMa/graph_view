import { typePalette } from '../graph/palette';

export function LeftPanel() {
  return (
    <aside className="side-panel side-panel--left">
      <div className="panel-section">
        <div className="panel-title">工作区</div>
        <div className="pill-list">
          <span className="pill active">运营知识图谱</span>
          <span className="pill">故障归因</span>
          <span className="pill">个人研究</span>
        </div>
        <div className="panel-meta">共 5 个图谱 · 最近更新 2 小时前</div>
      </div>

      <div className="panel-section">
        <div className="panel-title">筛选器</div>
        <div className="filter-row">
          <span>状态</span>
          <span className="chip">全部</span>
        </div>
        <div className="filter-row">
          <span>密度</span>
          <span className="chip">自动</span>
        </div>
        <div className="filter-row">
          <span>时间轴</span>
          <span className="chip">最近 30 天</span>
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-title">节点类型</div>
        <div className="legend-list">
          {Object.entries(typePalette).map(([type, color]) => (
            <div className="legend-item" key={type}>
              <span className="legend-dot" style={{ background: color }} />
              <span>{type}</span>
              <span className="legend-count">8</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-title">快照</div>
        <div className="snapshot-card">
          <div className="snapshot-title">核心实体视图</div>
          <div className="snapshot-meta">12 节点 · 26 边</div>
        </div>
        <div className="snapshot-card">
          <div className="snapshot-title">最近活动</div>
          <div className="snapshot-meta">6 节点 · 9 边</div>
        </div>
      </div>
    </aside>
  );
}
