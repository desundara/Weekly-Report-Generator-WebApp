import { Link, useLocation } from "react-router-dom";
import { useAuth } from "context/AuthContext";

const LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/review", label: "Review Queue" },
  { to: "/projects", label: "Projects" },
  { to: "/users", label: "Team" }
];

export function ManagerNav() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
      <div className="flex items-center gap-1 glass-panel p-1">
        {LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              location.pathname.startsWith(link.to)
                ? "bg-accent-gradient text-[#0A0E1A] font-medium"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-text-muted text-sm">{user?.name}</span>
        <button onClick={logout} className="btn-ghost">Sign out</button>
      </div>
    </div>
  );
}
