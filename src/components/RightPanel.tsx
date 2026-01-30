import type { EdgeData, NodeData } from '@antv/g6';

type Selection =
  | { type: 'node'; data: NodeData }
  | { type: 'edge'; data: EdgeData }
  | null;

type RightPanelProps = {
  selection: Selection;
};

function renderFieldValue(value: unknown) {
  if (value === undefined || value === null || value === '') return '—';
  if (Array.isArray(value)) return value.join(' · ');
  if (typeof value === 'number') return value.toString();
  return String(value);
}

export function RightPanel({ selection }: RightPanelProps) {
  const hasSelection = Boolean(selection);

  const headerTitle = selection?.type === 'edge' ? '关系详情' : '节点详情';
  const data = selection?.data;
  const meta = (data?.data ?? {}) as Record<string, unknown>;
  const label = (meta.label as string) ?? (data?.id as string) ?? '未命名';

  return (
    <aside className="side-panel side-panel--right">
      <div className="panel-section">
        <div className="panel-title">属性检查器</div>
        <div className="inspect-card">
          <div className="inspect-name">{headerTitle}</div>
          <div className="inspect-type">{label}</div>
          {selection?.type === 'node' && Array.isArray(meta.tags) && (
            <div className="inspect-tags">
              {meta.tags.map((tag) => (
                <span className="tag" key={String(tag)}>
                  {String(tag)}
                </span>
              ))}
            </div>
          )}
          {!hasSelection && (
            <div className="inspect-hint">点击节点或边查看详情</div>
          )}
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-title">属性字段</div>
        {hasSelection ? (
          <>
            {selection?.type === 'node' && (
              <>
                <div className="field-row">
                  <span>类型</span>
                  <span className="field-value">{renderFieldValue(meta.type)}</span>
                </div>
                <div className="field-row">
                  <span>负责人</span>
                  <span className="field-value">
                    {renderFieldValue(meta.owner)}
                  </span>
                </div>
                <div className="field-row">
                  <span>可信度</span>
                  <span className="field-value">
                    {renderFieldValue(meta.confidence)}
                  </span>
                </div>
                <div className="field-row">
                  <span>来源</span>
                  <span className="field-value">
                    {renderFieldValue(meta.source)}
                  </span>
                </div>
                <div className="field-row">
                  <span>更新时间</span>
                  <span className="field-value">
                    {renderFieldValue(meta.updatedAt)}
                  </span>
                </div>
              </>
            )}
            {selection?.type === 'edge' && (
              <>
                <div className="field-row">
                  <span>关系</span>
                  <span className="field-value">
                    {renderFieldValue(meta.relation)}
                  </span>
                </div>
                <div className="field-row">
                  <span>强度</span>
                  <span className="field-value">
                    {renderFieldValue(meta.strength)}
                  </span>
                </div>
                <div className="field-row">
                  <span>证据</span>
                  <span className="field-value">
                    {renderFieldValue(meta.evidence)}
                  </span>
                </div>
                <div className="field-row">
                  <span>更新时间</span>
                  <span className="field-value">
                    {renderFieldValue(meta.updatedAt)}
                  </span>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="panel-meta">暂无选择</div>
        )}
      </div>

      <div className="panel-section">
        <div className="panel-title">说明</div>
        <div className="relation-card">
          <div className="relation-title">
            {renderFieldValue(meta.description)}
          </div>
          <div className="relation-meta">
            {selection?.type === 'edge'
              ? `source: ${(data as EdgeData | undefined)?.source ?? '—'}`
              : `id: ${(data as NodeData | undefined)?.id ?? '—'}`}
          </div>
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-title">活动流</div>
        <div className="timeline">
          <div className="timeline-item">
            <span className="timeline-dot" />
            <div>
              <div className="timeline-title">点击节点或边查看详情</div>
              <div className="timeline-meta">交互示例 · 暂无真实数据</div>
            </div>
          </div>
          <div className="timeline-item">
            <span className="timeline-dot" />
            <div>
              <div className="timeline-title">后续可接入操作日志</div>
              <div className="timeline-meta">占位内容 · 本地模式</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
