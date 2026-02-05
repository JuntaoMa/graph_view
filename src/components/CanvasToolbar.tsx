type CanvasToolbarProps = {
  activeTool?: 'select' | 'add-node' | 'add-edge';
  onToolChange?: (tool: 'select' | 'add-node' | 'add-edge') => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onLayout?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
};

export function CanvasToolbar({
  activeTool = 'select',
  onToolChange,
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
        <button
          className={`tool-button tool-button--icon${
            activeTool === 'add-node' ? ' active' : ''
          }`}
          onClick={() => onToolChange?.('add-node')}
          aria-label="添加节点"
          title="添加节点"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 5v14M5 12h14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <circle
              cx="12"
              cy="12"
              r="9"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            />
          </svg>
        </button>
        <button
          className={`tool-button tool-button--icon${
            activeTool === 'add-edge' ? ' active' : ''
          }`}
          onClick={() => onToolChange?.('add-edge')}
          aria-label="添加边"
          title="添加边"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M6 8h5M13 16h5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <circle
              cx="5"
              cy="8"
              r="2.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <circle
              cx="19"
              cy="16"
              r="2.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path
              d="M7 9.5l10 5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <button
          className="tool-button tool-button--icon"
          onClick={onLayout}
          aria-label="应用布局"
          title="应用布局"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect
              x="4"
              y="4"
              width="6"
              height="6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <rect
              x="14"
              y="4"
              width="6"
              height="6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <rect
              x="4"
              y="14"
              width="6"
              height="6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <rect
              x="14"
              y="14"
              width="6"
              height="6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            />
          </svg>
        </button>
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
        <button
          className="tool-button tool-button--icon"
          onClick={onSave}
          aria-label="保存视图"
          title="保存视图"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M5 4h11l3 3v13H5z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M8 4v6h7V4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path
              d="M8 18h8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
