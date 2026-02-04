import { useEffect, useMemo, useState } from 'react';
import type { EdgeData, NodeData } from '@antv/g6';

type Selection =
  | { type: 'node'; data: NodeData }
  | { type: 'edge'; data: EdgeData }
  | null;

type InspectorOverlayProps = {
  selection: Selection;
  onSave?: (payload: {
    type: 'node' | 'edge';
    id: string;
    name: string;
    description: string;
    fields: Array<{ name: string; value: string }>;
  }) => void;
};

function renderFieldValue(value: unknown) {
  if (value === undefined || value === null || value === '') return '—';
  if (Array.isArray(value)) return value.join(' · ');
  if (typeof value === 'number') return value.toString();
  return String(value);
}

let fieldIdSeed = 0;
const createFieldId = () => `field_${Date.now()}_${fieldIdSeed++}`;

export function InspectorOverlay({ selection, onSave }: InspectorOverlayProps) {
  if (!selection) return null;

  const data = selection.data;
  const meta = (data.data ?? {}) as Record<string, unknown>;
  const label = (meta.label as string) ?? (data.id as string) ?? '未命名';
  const metaLine =
    selection.type === 'edge'
      ? `source: ${(data as EdgeData).source ?? '—'} → target: ${(data as EdgeData).target ?? '—'}`
      : `id: ${(data as NodeData).id ?? '—'}`;

  const buildFields = useMemo(() => {
    if (selection.type === 'edge') {
      return [
        { name: '关系', value: meta.relation },
        { name: '强度', value: meta.strength },
        { name: '证据', value: meta.evidence },
        { name: '更新时间', value: meta.updatedAt },
      ];
    }
    return [
      { name: '类型', value: meta.type },
      { name: '负责人', value: meta.owner },
      { name: '可信度', value: meta.confidence },
      { name: '来源', value: meta.source },
      { name: '更新时间', value: meta.updatedAt },
    ];
  }, [meta, selection.type]);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(label);
  const [description, setDescription] = useState(
    meta.description !== undefined && meta.description !== null
      ? String(meta.description)
      : '',
  );
  const [fields, setFields] = useState<
    Array<{ id: string; name: string; value: string }>
  >([]);

  useEffect(() => {
    setIsEditing(false);
    setTitle(label);
    setDescription(
      meta.description !== undefined && meta.description !== null
        ? String(meta.description)
        : '',
    );
    setFields(
      buildFields.map((field) => ({
        id: createFieldId(),
        name: field.name,
        value:
          field.value !== undefined && field.value !== null
            ? String(field.value)
            : '',
      })),
    );
  }, [buildFields, label, meta.description]);

  const handleCancel = () => {
    setIsEditing(false);
    setTitle(label);
    setDescription(
      meta.description !== undefined && meta.description !== null
        ? String(meta.description)
        : '',
    );
    setFields(
      buildFields.map((field) => ({
        id: createFieldId(),
        name: field.name,
        value:
          field.value !== undefined && field.value !== null
            ? String(field.value)
            : '',
      })),
    );
  };

  return (
    <div className="side-panel overlay-card--inspector">
      <div className="panel-section">
        <div className="inspect-plain">
          <div className="inspect-header">
            {isEditing ? (
              <input
                className="inspect-title-input"
                value={title}
                placeholder="请输入名称"
                onChange={(event) => setTitle(event.target.value)}
              />
            ) : (
              <div className="inspect-title">{title || label}</div>
            )}
            <div className="inspect-actions">
              {!isEditing && (
                <button
                  type="button"
                  className="inspect-icon-button"
                  aria-label="编辑"
                  title="编辑"
                  onClick={() => setIsEditing(true)}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M4 16.8V20h3.2l9.4-9.4-3.2-3.2L4 16.8z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14.6 6.2l2.2-2.2a1.6 1.6 0 012.2 0l1.8 1.8a1.6 1.6 0 010 2.2l-2.2 2.2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              )}
              {isEditing && (
                <>
                  <button
                    type="button"
                    className="inspect-icon-button inspect-icon-button--primary"
                    aria-label="保存"
                    title="保存"
                    onClick={() => {
                      onSave?.({
                        type: selection.type,
                        id: String(data.id ?? ''),
                        name: title,
                        description,
                        fields: fields.map((field) => ({
                          name: field.name,
                          value: field.value,
                        })),
                      });
                      setIsEditing(false);
                    }}
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
                  <button
                    type="button"
                    className="inspect-icon-button inspect-icon-button--ghost"
                    aria-label="取消"
                    title="取消"
                    onClick={handleCancel}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M6 6l12 12M18 6l-12 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="inspect-meta">{metaLine}</div>
          {isEditing ? (
            <textarea
              className="inspect-description-input"
              value={description}
              placeholder="描述可为空"
              onChange={(event) => setDescription(event.target.value)}
            />
          ) : (
            <div className="inspect-description">
              {renderFieldValue(description)}
            </div>
          )}
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-header">
          <div className="panel-title">属性字段</div>
          {isEditing && (
            <button
              type="button"
              className="inspect-icon-button inspect-icon-button--ghost"
              aria-label="新增属性"
              title="新增属性"
              onClick={() =>
                setFields((prev) => [
                  ...prev,
                  { id: createFieldId(), name: '', value: '' },
                ])
              }
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 5v14M5 12h14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>
        {fields.map((field, index) => (
          <div className="field-row field-row--editable" key={field.id}>
            {isEditing ? (
              <input
                className="field-input field-input--name"
                value={field.name}
                onChange={(event) =>
                  setFields((prev) =>
                    prev.map((item, idx) =>
                      idx === index
                        ? { ...item, name: event.target.value }
                        : item,
                    ),
                  )
                }
              />
            ) : (
              <span>{field.name}</span>
            )}
            {isEditing ? (
              <div className="field-value-edit">
                <input
                  className="field-input field-input--value"
                  value={field.value}
                  onChange={(event) =>
                    setFields((prev) =>
                      prev.map((item, idx) =>
                        idx === index
                          ? { ...item, value: event.target.value }
                          : item,
                      ),
                    )
                  }
                />
                <button
                  type="button"
                  className="field-icon-button"
                  aria-label="删除属性"
                  title="删除属性"
                  onClick={() =>
                    setFields((prev) => prev.filter((_, idx) => idx !== index))
                  }
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M6 7h12M9 7V5h6v2M9 10v7M15 10v7M7 7l1 12h8l1-12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <span className="field-value">{renderFieldValue(field.value)}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
