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
        <button className="tool-button" onClick={onUndo} disabled={!canUndo}>
          撤销
        </button>
        <button className="tool-button" onClick={onRedo} disabled={!canRedo}>
          重做
        </button>
        <button className="tool-button primary" onClick={onSave}>
          保存视图
        </button>
      </div>
    </div>
  );
}
