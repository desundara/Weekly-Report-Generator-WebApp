import { FlaggedNote } from "lib/types";

export function FlaggedListEditor({
  items,
  onChange,
  keyLabel,
  placeholder,
  disabled
}: {
  items: FlaggedNote[];
  onChange: (items: FlaggedNote[]) => void;
  keyLabel: string;
  placeholder: string;
  disabled?: boolean;
}) {
  function update(i: number, patch: Partial<FlaggedNote>) {
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  function setKey(i: number) {
    // only one item can be flagged as "key" at a time
    onChange(items.map((it, idx) => ({ ...it, isKey: idx === i })));
  }

  function addRow() {
    onChange([...items, { text: "", isKey: items.length === 0 }]);
  }

  function removeRow(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            disabled={disabled}
            value={item.text}
            onChange={(e) => update(i, { text: e.target.value })}
            className="input-glass"
            placeholder={placeholder}
          />
          <label className="flex items-center gap-1.5 text-xs text-text-muted whitespace-nowrap">
            <input
              disabled={disabled}
              type="radio"
              checked={item.isKey}
              onChange={() => setKey(i)}
              className="accent-accent-violet"
            />
            {keyLabel}
          </label>
          {!disabled && (
            <button type="button" onClick={() => removeRow(i)} className="text-status-blocker hover:opacity-80 px-1">
              ✕
            </button>
          )}
        </div>
      ))}
      {!disabled && (
        <button type="button" onClick={addRow} className="btn-ghost text-sm">
          + Add
        </button>
      )}
    </div>
  );
}
