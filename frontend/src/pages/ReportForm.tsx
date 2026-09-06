import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import { api } from "lib/api";
import { Task, PlannedTask, FlaggedNote, Project, Report, HOUR_TYPES } from "lib/types";
import { TaskTable } from "components/TaskTable";
import { FlaggedListEditor } from "components/FlaggedListEditor";
import { StatusPill } from "components/StatusPill";
import { VersionHistory } from "components/VersionHistory";
import { ReviewPanel } from "components/ReviewPanel";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function ReportForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [status, setStatus] = useState<Report["status"]>("DRAFT");
  const [correctionComment, setCorrectionComment] = useState<string | null>(null);

  const [projectId, setProjectId] = useState("");
  const [weekStartDate, setWeekStartDate] = useState(todayISO());
  const [weekEndDate, setWeekEndDate] = useState(todayISO());
  const [tasksCompleted, setTasksCompleted] = useState<Task[]>([]);
  const [tasksPlanned, setTasksPlanned] = useState<PlannedTask[]>([{ description: "" }]);
  const [blockers, setBlockers] = useState<FlaggedNote[]>([]);
  const [achievements, setAchievements] = useState<FlaggedNote[]>([]);
  const [hoursByType, setHoursByType] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editable = status === "DRAFT" || status === "NEEDS_CORRECTION";

  useEffect(() => {
    api("/api/projects", { token }).then(setProjects).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!isEdit) return;
    api(`/api/reports/${id}`, { token })
      .then((r: Report) => {
        setStatus(r.status);
        setProjectId(r.projectId);
        setWeekStartDate(r.weekStartDate.slice(0, 10));
        setWeekEndDate(r.weekEndDate.slice(0, 10));
        setTasksCompleted(r.tasksCompleted ?? []);
        setTasksPlanned(r.tasksPlanned?.length ? r.tasksPlanned : [{ description: "" }]);
        setBlockers(r.blockers ?? []);
        setAchievements(r.achievements ?? []);
        setHoursByType(r.hoursByType ?? {});
        setNotes(r.notes ?? "");
        const mostRecent = r.reviewComments?.[0];
        setCorrectionComment(mostRecent?.action === "REQUESTED_CHANGES" ? mostRecent.comment : null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit, token]);

  function buildPayload() {
    return {
      projectId,
      weekStartDate,
      weekEndDate,
      tasksCompleted,
      tasksPlanned: tasksPlanned.filter((t) => t.description.trim()),
      blockers: blockers.filter((b) => b.text.trim()),
      achievements: achievements.filter((a) => a.text.trim()),
      hoursByType,
      notes
    };
  }

  async function saveDraft() {
    setSaving(true);
    setError(null);
    try {
      if (isEdit) {
        await api(`/api/reports/${id}`, { method: "PUT", token, body: buildPayload() });
      } else {
        const created = await api("/api/reports", { method: "POST", token, body: buildPayload() });
        navigate(`/reports/${created.id}`, { replace: true });
        return;
      }
      navigate("/reports");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the report.");
    } finally {
      setSaving(false);
    }
  }

  async function submitReport() {
    setSaving(true);
    setError(null);
    try {
      let reportId = id;
      if (!isEdit) {
        const created = await api("/api/reports", { method: "POST", token, body: buildPayload() });
        reportId = created.id;
      } else {
        await api(`/api/reports/${id}`, { method: "PUT", token, body: buildPayload() });
      }
      await api(`/api/reports/${reportId}/submit`, { method: "POST", token });
      navigate("/reports");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit the report.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main className="min-h-screen p-8 text-text-muted">Loading…</main>;

  return (
    <main className="max-w-5xl min-h-screen p-4 mx-auto space-y-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <Link to={user?.role === "MANAGER" ? "/dashboard" : "/reports"} className="text-sm text-accent-cyan hover:underline">
            ← Back to {user?.role === "MANAGER" ? "dashboard" : "history"}
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">{isEdit ? "Edit weekly report" : "New weekly report"}</h1>
        </div>
        {isEdit && <StatusPill status={status} />}
      </div>

      {correctionComment && (
        <div className="p-4 glass-panel border-status-correction/40">
          <p className="mb-1 text-sm font-medium text-status-correction">Manager requested changes</p>
          <p className="text-sm text-text-muted">{correctionComment}</p>
        </div>
      )}

      {!editable && isEdit && (
        <div className="p-4 glass-panel">
          <p className="text-sm text-text-muted">
            This report is {status.toLowerCase().replace("_", " ")} and is read-only.
          </p>
        </div>
      )}

      {error && <p className="text-sm text-status-blocker">{error}</p>}

      <div className="grid grid-cols-1 gap-4 p-4 glass-panel md:grid-cols-3">
        <div>
          <label className="block text-sm text-text-muted mb-1.5">Project / category</label>
          <select
            disabled={!editable}
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="input-glass"
          >
            <option value="" disabled>Select a project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-text-muted mb-1.5">Week start</label>
          <input
            disabled={!editable}
            type="date"
            value={weekStartDate}
            onChange={(e) => setWeekStartDate(e.target.value)}
            className="input-glass"
          />
        </div>
        <div>
          <label className="block text-sm text-text-muted mb-1.5">Week end</label>
          <input
            disabled={!editable}
            type="date"
            value={weekEndDate}
            onChange={(e) => setWeekEndDate(e.target.value)}
            className="input-glass"
          />
        </div>
      </div>

      <section>
        <h2 className="mb-2 text-lg font-medium">Tasks completed</h2>
        <TaskTable tasks={tasksCompleted} onChange={setTasksCompleted} disabled={!editable} />
      </section>

      <section className="p-4 glass-panel">
        <h2 className="mb-3 text-lg font-medium">Tasks planned for next week</h2>
        <div className="space-y-2">
          {tasksPlanned.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                disabled={!editable}
                value={t.description}
                onChange={(e) =>
                  setTasksPlanned(tasksPlanned.map((p, idx) => (idx === i ? { description: e.target.value } : p)))
                }
                className="input-glass"
                placeholder="What's planned next"
              />
              {editable && (
                <button
                  type="button"
                  onClick={() => setTasksPlanned(tasksPlanned.filter((_, idx) => idx !== i))}
                  className="px-1 text-status-blocker hover:opacity-80"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {editable && (
            <button
              type="button"
              onClick={() => setTasksPlanned([...tasksPlanned, { description: "" }])}
              className="text-sm btn-ghost"
            >
              + Add
            </button>
          )}
        </div>
      </section>

      <section className="p-4 glass-panel">
        <h2 className="mb-3 text-lg font-medium">Blockers / challenges</h2>
        <FlaggedListEditor
          items={blockers}
          onChange={setBlockers}
          keyLabel="Key issue"
          placeholder="Describe a blocker"
          disabled={!editable}
        />
      </section>

      <section className="p-4 glass-panel">
        <h2 className="mb-3 text-lg font-medium">Achievements / highlights</h2>
        <FlaggedListEditor
          items={achievements}
          onChange={setAchievements}
          keyLabel="Key achievement"
          placeholder="Describe an achievement"
          disabled={!editable}
        />
      </section>

      <section className="p-4 glass-panel">
        <h2 className="mb-3 text-lg font-medium">Hours by task type <span className="text-sm font-normal text-text-faint">(optional)</span></h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {HOUR_TYPES.map((type) => (
            <div key={type}>
              <label className="block text-sm text-text-muted mb-1.5">{type}</label>
              <input
                disabled={!editable}
                type="number"
                min={0}
                value={hoursByType[type] ?? ""}
                onChange={(e) => setHoursByType({ ...hoursByType, [type]: Number(e.target.value) })}
                className="input-glass"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="p-4 glass-panel">
        <h2 className="mb-3 text-lg font-medium">Notes / links <span className="text-sm font-normal text-text-faint">(optional)</span></h2>
        <textarea
          disabled={!editable}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="input-glass"
          placeholder="Anything else worth noting"
        />
      </section>

      {isEdit && <VersionHistory reportId={id!} />}

      {isEdit && user?.role === "MANAGER" && status === "SUBMITTED" && <ReviewPanel reportId={id!} />}

      {editable && (
        <div className="flex gap-3 pb-8">
          <button onClick={saveDraft} disabled={saving || !projectId} className="btn-ghost">
            {saving ? "Saving…" : "Save as draft"}
          </button>
          <button onClick={submitReport} disabled={saving || !projectId} className="btn-primary">
            {saving ? "Submitting…" : status === "NEEDS_CORRECTION" ? "Resubmit for review" : "Submit for review"}
          </button>
        </div>
      )}
    </main>
  );
}
