import { useAuth } from "context/AuthContext";

export default function Reports() {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen p-8">
      <div className="glass-panel p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Welcome, {user?.name}</h1>
            <p className="text-text-muted text-sm mt-1">
              Signed in as <span className="status-pill submitted">{user?.role}</span>
            </p>
          </div>
          <button onClick={logout} className="btn-ghost">Sign out</button>
        </div>
        <p className="text-text-muted mt-6 text-sm">
          Report create/edit, history, and dashboard pages land here in Day 2–4.
        </p>
      </div>
    </main>
  );
}
