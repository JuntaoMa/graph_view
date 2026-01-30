import type { EdgeData, NodeData } from '@antv/g6';

type Selection =
  | { type: 'node'; data: NodeData }
  | { type: 'edge'; data: EdgeData }
  | null;

type ActivityItem = {
  id: string;
  text: string;
  meta: string;
};

type RightPanelProps = {
  selection: Selection;
  showInspector: boolean;
  showActivity: boolean;
  activityItems: ActivityItem[];
};

function renderFieldValue(value: unknown) {
  if (value === undefined || value === null || value === '') return '—';
  if (Array.isArray(value)) return value.join(' · ');
  if (typeof value === 'number') return value.toString();
  return String(value);
}

export function RightPanel({
  selection,
  showInspector,
  showActivity,
  activityItems,
}: RightPanelProps) {
  const hasSelection = Boolean(selection);
  const shouldShowInspector = showInspector && hasSelection;

  const headerTitle = selection?.type === 'edge' ? '关系详情' : '节点详情';
  const data = selection?.data;
  const meta = (data?.data ?? {}) as Record<string, unknown>;
  const label = (meta.label as string) ?? (data?.id as string) ?? '未命名';

  if (!shouldShowInspector && !showActivity) {
    return null;
  }

  return (
    <aside className="side-panel side-panel--right">
      {shouldShowInspector && (
        <>
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
            </div>
          </div>

          <div className="panel-section">
            <div className="panel-title">属性字段</div>
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
        </>
      )}

      {showActivity && (
        <div className="panel-section">
          <div className="panel-title">活动流</div>
          <div className="timeline">
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
      )}
    </aside>
  );
}
