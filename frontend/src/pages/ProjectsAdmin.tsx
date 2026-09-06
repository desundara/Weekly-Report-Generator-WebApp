import { useEffect, useState } from "react";
import { useAuth } from "context/AuthContext";
import { api } from "lib/api";
import { Project } from "lib/types";
import { ManagerNav } from "components/ManagerNav";

export default function ProjectsAdmin() {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  function load() {
    setLoading(true);
    api("/api/projects", { token }).then(setProjects).finally(() => setLoading(false));
  }

  useEffect(load, [token]);

  async function addProject() {
    if (!newName.trim()) return;
    setError(null);
    try {
      await api("/api/projects", { method: "POST", token, body: { name: newName, description: newDescription } });
      setNewName("");
      setNewDescription("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add project.");
    }
  }

  function startEdit(p: Project) {
    setEditingId(p.id);
    setEditName(p.name);
    setEditDescription(p.description ?? "");
  }

  async function saveEdit(id: string) {
    setError(null);
    try {
      await api(`/api/projects/${id}`, { method: "PUT", token, body: { name: editName, description: editDescription } });
      setEditingId(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update project.");
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this project? Reports referencing it will be affected.")) return;
    setError(null);
    try {
      await api(`/api/projects/${id}`, { method: "DELETE", token });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete project.");
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <ManagerNav />

      <div>
        <h1 className="text-xl font-semibold mb-1">Projects &amp; categories</h1>
        <p className="text-text-muted text-sm">Manage the projects team members can tag their reports with.</p>
      </div>

      <section className="glass-panel p-4">
        <h2 className="text-sm font-medium text-text-muted mb-3">Add a project</h2>
        <div className="flex flex-col md:flex-row gap-3">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} className="input-glass" placeholder="Project name" />
          <input
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="input-glass"
            placeholder="Description (optional)"
          />
          <button onClick={addProject} className="btn-primary whitespace-nowrap">+ Add</button>
        </div>
      </section>

      {error && <p className="text-status-blocker text-sm">{error}</p>}

      {loading ? (
        <p className="text-text-muted text-sm">Loading…</p>
      ) : (
        <div className="glass-panel divide-y divide-glass-border">
          {projects.map((p) => (
            <div key={p.id} className="p-4">
              {editingId === p.id ? (
                <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} className="input-glass" />
                  <input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="input-glass" />
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => saveEdit(p.id)} className="btn-primary">Save</button>
                    <button onClick={() => setEditingId(null)} className="btn-ghost">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    {p.description && <p className="text-text-muted text-sm">{p.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(p)} className="btn-ghost">Edit</button>
                    <button onClick={() => remove(p.id)} className="text-status-blocker hover:opacity-80 px-3">Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
