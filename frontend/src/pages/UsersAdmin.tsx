import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import { api } from "lib/api";
import { ManagerNav } from "components/ManagerNav";

type TeamUser = { id: string; name: string; email: string; role: "TEAM_MEMBER" | "MANAGER"; createdAt: string };

export default function UsersAdmin() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    api("/api/users", { token }).then(setUsers).finally(() => setLoading(false));
  }

  useEffect(load, [token]);

  async function changeRole(id: string, role: "TEAM_MEMBER" | "MANAGER") {
    setError(null);
    try {
      await api(`/api/users/${id}/role`, { method: "PATCH", token, body: { role } });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update role.");
    }
  }

  async function removeUser(id: string, name: string) {
    if (!window.confirm(`Remove ${name} from the team? This can't be undone.`)) return;
    setError(null);
    try {
      await api(`/api/users/${id}`, { method: "DELETE", token });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove this member.");
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <ManagerNav />

      <div>
        <h1 className="text-xl font-semibold mb-1">Team</h1>
        <p className="text-text-muted text-sm">View team members and manage roles. New members join by registering themselves.</p>
      </div>

      {error && <p className="text-status-blocker text-sm">{error}</p>}

      {loading ? (
        <p className="text-text-muted text-sm">Loading…</p>
      ) : (
        <div className="glass-panel divide-y divide-glass-border">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between p-4">
              <div>
                <Link to={`/team/${u.id}`} className="font-medium hover:text-accent-cyan transition-colors">
                  {u.name}
                </Link>
                <p className="text-text-muted text-sm">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={u.role}
                  disabled={u.id === currentUser?.id}
                  onChange={(e) => changeRole(u.id, e.target.value as "TEAM_MEMBER" | "MANAGER")}
                  className="input-glass w-auto"
                >
                  <option value="TEAM_MEMBER">Team Member</option>
                  <option value="MANAGER">Manager</option>
                </select>
                {u.id !== currentUser?.id && (
                  <button
                    onClick={() => removeUser(u.id, u.name)}
                    className="text-status-blocker hover:opacity-80 text-sm px-2"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
