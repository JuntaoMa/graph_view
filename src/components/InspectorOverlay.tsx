import type { EdgeData, NodeData } from '@antv/g6';

type Selection =
  | { type: 'node'; data: NodeData }
  | { type: 'edge'; data: EdgeData }
  | null;

type InspectorOverlayProps = {
  selection: Selection;
};

function renderFieldValue(value: unknown) {
  if (value === undefined || value === null || value === '') return '—';
  if (Array.isArray(value)) return value.join(' · ');
  if (typeof value === 'number') return value.toString();
  return String(value);
}

export function InspectorOverlay({ selection }: InspectorOverlayProps) {
  if (!selection) return null;

  const headerTitle = selection.type === 'edge' ? '关系详情' : '节点详情';
  const data = selection.data;
  const meta = (data.data ?? {}) as Record<string, unknown>;
  const label = (meta.label as string) ?? (data.id as string) ?? '未命名';

  return (
    <div className="overlay-card overlay-card--inspector">
      <div className="overlay-title">{headerTitle}</div>
      <div className="overlay-heading">{label}</div>
      {selection.type === 'node' && Array.isArray(meta.tags) && (
        <div className="overlay-tags">
          {meta.tags.map((tag) => (
            <span className="tag" key={String(tag)}>
              {String(tag)}
            </span>
          ))}
        </div>
      )}
      <div className="overlay-fields">
        {selection.type === 'node' && (
          <>
            <div className="field-row">
              <span>类型</span>
              <span className="field-value">{renderFieldValue(meta.type)}</span>
            </div>
            <div className="field-row">
              <span>负责人</span>
              <span className="field-value">{renderFieldValue(meta.owner)}</span>
            </div>
            <div className="field-row">
              <span>可信度</span>
              <span className="field-value">
                {renderFieldValue(meta.confidence)}
              </span>
            </div>
          </>
        )}
        {selection.type === 'edge' && (
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
          </>
        )}
      </div>
    </div>
  );
}
