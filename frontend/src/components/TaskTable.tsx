import { Task, emptyTask } from "lib/types";

const PRIORITIES = ["Low", "Medium", "High"];
const TASK_STATUSES = ["Not Started", "In Progress", "Blocked", "Done"];

export function TaskTable({
  tasks,
  onChange,
  disabled
}: {
  tasks: Task[];
  onChange: (tasks: Task[]) => void;
  disabled?: boolean;
}) {
  function update(index: number, patch: Partial<Task>) {
    onChange(tasks.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  }

  function addRow() {
    onChange([...tasks, { ...emptyTask }]);
  }

  function removeRow(index: number) {
    onChange(tasks.filter((_, i) => i !== index));
  }

  return (
    <div className="p-4 overflow-x-auto glass-panel">
      <table className="w-full text-sm min-w-[1040px]">
        <thead>
          <tr className="text-left border-b text-text-muted border-glass-border">
            <th className="pb-2 pr-2">Task</th>
            <th className="pb-2 pr-2">Priority</th>
            <th className="w-20 pb-2 pr-2">Planned %</th>
            <th className="w-20 pb-2 pr-2">Actual %</th>
            <th className="pb-2 pr-2">Status</th>
            <th className="w-24 pb-2 pr-2">Time planned (h)</th>
            <th className="w-24 pb-2 pr-2">Time spent (h)</th>
            <th className="pb-2 pr-2">Output / deliverable</th>
            {!disabled && <th className="w-8 pb-2"></th>}
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, i) => (
            <tr key={i} className="border-b border-glass-border/50">
              <td className="py-2 pr-2">
                <input
                  disabled={disabled}
                  value={task.taskName}
                  onChange={(e) => update(i, { taskName: e.target.value })}
                  className="py-1 input-glass"
                  placeholder="Task name"
                />
              </td>
              <td className="py-2 pr-2">
                <select
                  disabled={disabled}
                  value={task.priority}
                  onChange={(e) => update(i, { priority: e.target.value })}
                  className="input-glass py-1 min-w-[130px]"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </td>
              <td className="py-2 pr-2">
                <input
                  disabled={disabled}
                  type="number"
                  min={0}
                  max={100}
                  value={task.plannedPct}
                  onChange={(e) => update(i, { plannedPct: Number(e.target.value) })}
                  className="py-1 input-glass"
                />
              </td>
              <td className="py-2 pr-2">
                <input
                  disabled={disabled}
                  type="number"
                  min={0}
                  max={100}
                  value={task.actualPct}
                  onChange={(e) => update(i, { actualPct: Number(e.target.value) })}
                  className="py-1 input-glass"
                />
              </td>
              <td className="py-2 pr-2">
                <select
                  disabled={disabled}
                  value={task.status}
                  onChange={(e) => update(i, { status: e.target.value })}
                  className="input-glass py-1 min-w-[155px]"
                >
                  {TASK_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>
              <td className="py-2 pr-2">
                <input
                  disabled={disabled}
                  type="number"
                  min={0}
                  value={task.timePlanned}
                  onChange={(e) => update(i, { timePlanned: Number(e.target.value) })}
                  className="py-1 input-glass"
                />
              </td>
              <td className="py-2 pr-2">
                <input
                  disabled={disabled}
                  type="number"
                  min={0}
                  value={task.timeSpent}
                  onChange={(e) => update(i, { timeSpent: Number(e.target.value) })}
                  className="py-1 input-glass"
                />
              </td>
              <td className="py-2 pr-2">
                <input
                  disabled={disabled}
                  value={task.output}
                  onChange={(e) => update(i, { output: e.target.value })}
                  className="py-1 input-glass"
                  placeholder="PR link, doc, etc."
                />
              </td>
              {!disabled && (
                <td className="py-2 text-center">
                  <button type="button" onClick={() => removeRow(i)} className="text-status-blocker hover:opacity-80">
                    ✕
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {!disabled && (
        <button type="button" onClick={addRow} className="mt-3 text-sm btn-ghost">
          + Add task
        </button>
      )}
    </div>
  );
}