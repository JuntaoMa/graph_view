type TopNavProps = {
  onImport?: () => void;
  onExport?: () => void;
  onNewGraph?: () => void;
};

export function TopNav({ onImport, onExport, onNewGraph }: TopNavProps) {
  return (
    <header className="top-nav">
      <div className="top-nav__brand">
        <span className="brand-mark" />
        <div>
          <div className="brand-title">GraphView</div>
          <div className="brand-subtitle">Local Graph Studio</div>
        </div>
      </div>
      <div className="top-nav__search">
        <input type="search" placeholder="搜索节点、属性或标签…" />
        <span className="search-kbd">⌘K</span>
      </div>
      <div className="top-nav__actions">
        <button className="ghost" onClick={onImport}>
          导入
        </button>
        <button className="ghost" onClick={onExport}>
          导出
        </button>
        <button className="primary" onClick={onNewGraph}>
          新建图谱
        </button>
        <div className="avatar">SV</div>
      </div>
    </header>
  );
}
