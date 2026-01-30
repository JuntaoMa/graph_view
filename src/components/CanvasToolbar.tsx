const tools = [
  { label: '选择', active: true },
  { label: '平移' },
  { label: '连线' },
  { label: '分组' },
  { label: '布局', key: 'layout' },
  { label: '高亮' },
];

type CanvasToolbarProps = {
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onLayout?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
};

export function CanvasToolbar({
  onUndo,
  onRedo,
  onSave,
  onLayout,
  canUndo = false,
  canRedo = false,
}: CanvasToolbarProps) {
  return (
    <div className="canvas-toolbar">
      <div className="tool-group">
        {tools.map((tool) => (
          <button
            key={tool.label}
            className={`tool-button${tool.active ? ' active' : ''}`}
            onClick={tool.key === 'layout' ? onLayout : undefined}
          >
            {tool.label}
          </button>
        ))}
      </div>
      <div className="tool-group">
        <button
          className="tool-button tool-button--icon"
          onClick={onUndo}
          disabled={!canUndo}
          aria-label="撤销"
          title="撤销 (Ctrl/Cmd+Z)"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7.5 7.5H3.5V3.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path
              d="M3.8 7.8C5.7 5.9 8.2 4.8 11 4.8C16.1 4.8 20.2 8.9 20.2 14C20.2 19.1 16.1 23.2 11 23.2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <button
          className="tool-button tool-button--icon"
          onClick={onRedo}
          disabled={!canRedo}
          aria-label="重做"
          title="重做 (Ctrl/Cmd+Shift+Z)"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M16.5 7.5H20.5V3.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path
              d="M20.2 7.8C18.3 5.9 15.8 4.8 13 4.8C7.9 4.8 3.8 8.9 3.8 14C3.8 19.1 7.9 23.2 13 23.2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <button className="tool-button primary" onClick={onSave}>
          保存视图
        </button>
      </div>
    </div>
  );
}
