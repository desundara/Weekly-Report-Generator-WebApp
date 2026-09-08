import { useEffect, useState } from "react";
import { useAuth } from "context/AuthContext";
import { api } from "lib/api";
import { Project } from "lib/types";
import { ManagerNav } from "components/ManagerNav";
import { PageLoader } from "components/PageLoader";

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

  async function fetchProjects() {
    const data = await api("/api/projects", { token });
    setProjects(data);
  }

  useEffect(() => {
    fetchProjects().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function addProject() {
    if (!newName.trim()) return;
    setError(null);
    try {
      await api("/api/projects", { method: "POST", token, body: { name: newName, description: newDescription } });
      setNewName("");
      setNewDescription("");
      await fetchProjects();
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
      await fetchProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update project.");
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this project? Reports referencing it will be affected.")) return;
    setError(null);
    try {
      await api(`/api/projects/${id}`, { method: "DELETE", token });
      await fetchProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete project.");
    }
  }

  if (loading) return <PageLoader message="Loading projects…" />;

  return (
    <main className="max-w-3xl min-h-screen p-4 mx-auto space-y-6 md:p-8">
      <ManagerNav />

      <div>
        <h1 className="mb-1 text-xl font-semibold">Projects &amp; categories</h1>
        <p className="text-sm text-text-muted">Manage the projects team members can tag their reports with.</p>
      </div>

      <section className="p-4 glass-panel">
        <h2 className="mb-3 text-sm font-medium text-text-muted">Add a project</h2>
        <div className="flex flex-col gap-3 md:flex-row">
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

      {error && <p className="text-sm text-status-blocker">{error}</p>}

      <div className="divide-y glass-panel divide-glass-border">
        {projects.map((p) => (
          <div key={p.id} className="p-4">
            {editingId === p.id ? (
              <div className="flex flex-col items-start gap-3 md:flex-row md:items-center">
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
                  {p.description && <p className="text-sm text-text-muted">{p.description}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(p)} className="btn-ghost">Edit</button>
                  <button onClick={() => remove(p.id)} className="px-3 text-status-blocker hover:opacity-80">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}