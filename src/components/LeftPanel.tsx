type ActivityItem = {
  id: string;
  text: string;
  meta: string;
};

type LegendItem = {
  type: string;
  color: string;
  count: number;
};

type LeftPanelProps = {
  activityItems: ActivityItem[];
  legendItems: LegendItem[];
};

export function LeftPanel({ activityItems, legendItems }: LeftPanelProps) {
  return (
    <aside className="side-panel side-panel--left">
      <div className="left-panel__main">
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
            {legendItems.map((item) => (
              <div className="legend-item" key={item.type}>
                <span className="legend-dot" style={{ background: item.color }} />
                <span>{item.type}</span>
                <span className="legend-count">{item.count}</span>
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
      </div>

      <div className="panel-section panel-section--activity">
        <div className="panel-title">活动流</div>
        <div className="activity-panel">
          {activityItems.length === 0 ? (
            <div className="panel-meta">暂无活动</div>
          ) : (
            activityItems.map((item) => (
              <div className="timeline-item" key={item.id}>
                <span className="timeline-dot" />
                <div>
                  <div className="timeline-title">{item.text}</div>
                  <div className="timeline-meta">{item.meta}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
