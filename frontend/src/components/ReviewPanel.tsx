import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "lib/api";
import { useAuth } from "context/AuthContext";

export function ReviewPanel({ reportId }: { reportId: string }) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function act(action: "APPROVED" | "REQUESTED_CHANGES") {
    if (action === "REQUESTED_CHANGES" && !comment.trim()) {
      setError("Please explain what needs to change.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api(`/api/reports/${reportId}/review`, { method: "POST", token, body: { action, comment } });
      navigate("/review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your review.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="glass-panel p-4 border-accent-violet/30">
      <h2 className="text-lg font-medium mb-3">Manager review</h2>
      <label className="block text-sm text-text-muted mb-1.5">
        Comment <span className="text-text-faint">(required if requesting changes)</span>
      </label>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="input-glass mb-3"
        placeholder="What needs to change, or any notes on approval"
      />
      {error && <p className="text-status-blocker text-sm mb-3">{error}</p>}
      <div className="flex gap-3">
        <button onClick={() => act("REQUESTED_CHANGES")} disabled={saving} className="btn-ghost">
          {saving ? "Saving…" : "Request changes"}
        </button>
        <button onClick={() => act("APPROVED")} disabled={saving} className="btn-primary">
          {saving ? "Saving…" : "Approve"}
        </button>
      </div>
    </section>
  );
}
