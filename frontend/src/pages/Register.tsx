import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/reports");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="text-text-muted text-sm mt-1">Joins as a Team Member — a manager can promote you later</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-4">
          <div>
            <label className="block text-sm text-text-muted mb-1.5">Full name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-glass"
              placeholder="Gayani Samaraweera"
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1.5">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-glass"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1.5">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-glass"
              placeholder="At least 8 characters"
            />
          </div>

          {error && <p className="text-status-blocker text-sm">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Creating account…" : "Create account"}
          </button>

          <p className="text-center text-sm text-text-muted">
            Already have an account? <Link to="/login" className="text-accent-cyan hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
