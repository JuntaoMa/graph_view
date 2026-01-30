type StatusBarProps = {
  message?: string;
};

export function StatusBar({ message }: StatusBarProps) {
  return (
    <div className="status-bar">
      <div className="status-left">
        <span className="status-pill">实时模式</span>
        <span className="status-text">{message ?? '画布缩放 100%'}</span>
      </div>
      <div className="status-right">
        <span className="status-text">节点 5</span>
        <span className="status-text">边 5</span>
        <span className="status-text">布局：Force</span>
      </div>
    </div>
  );
}
