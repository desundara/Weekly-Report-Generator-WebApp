import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import { api } from "lib/api";
import { ManagerNav } from "components/ManagerNav";
import { PageLoader } from "components/PageLoader";

type TeamUser = { id: string; name: string; email: string; role: "TEAM_MEMBER" | "MANAGER"; createdAt: string };

export default function UsersAdmin() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchUsers() {
    const data = await api("/api/users", { token });
    setUsers(data);
  }

  useEffect(() => {
    fetchUsers().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function changeRole(id: string, role: "TEAM_MEMBER" | "MANAGER") {
    setError(null);
    try {
      await api(`/api/users/${id}/role`, { method: "PATCH", token, body: { role } });
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update role.");
    }
  }

  async function removeUser(id: string, name: string) {
    if (!window.confirm(`Remove ${name} from the team? This can't be undone.`)) return;
    setError(null);
    try {
      await api(`/api/users/${id}`, { method: "DELETE", token });
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove this member.");
    }
  }

  if (loading) return <PageLoader message="Loading team…" />;

  return (
    <main className="max-w-3xl min-h-screen p-4 mx-auto space-y-6 md:p-8">
      <ManagerNav />

      <div>
        <h1 className="mb-1 text-xl font-semibold">Team</h1>
        <p className="text-sm text-text-muted">View team members and manage roles. New members join by registering themselves.</p>
      </div>

      {error && <p className="text-sm text-status-blocker">{error}</p>}

      <div className="divide-y glass-panel divide-glass-border">
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between p-4">
            <div>
              <Link to={`/team/${u.id}`} className="font-medium transition-colors hover:text-accent-cyan">
                {u.name}
              </Link>
              <p className="text-sm text-text-muted">{u.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={u.role}
                disabled={u.id === currentUser?.id}
                onChange={(e) => changeRole(u.id, e.target.value as "TEAM_MEMBER" | "MANAGER")}
                className="w-auto input-glass"
              >
                <option value="TEAM_MEMBER">Team Member</option>
                <option value="MANAGER">Manager</option>
              </select>
              {u.id !== currentUser?.id && (
                <button
                  onClick={() => removeUser(u.id, u.name)}
                  className="px-2 text-sm text-status-blocker hover:opacity-80"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}