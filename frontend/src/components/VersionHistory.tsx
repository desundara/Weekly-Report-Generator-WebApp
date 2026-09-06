import { useEffect, useState } from "react";
import { api } from "lib/api";
import { useAuth } from "context/AuthContext";

type VersionEntry = {
  id: string;
  versionNumber: number;
  submittedAt: string;
  snapshot: {
    tasksCompleted?: any[];
    blockers?: { text: string; isKey: boolean }[];
    achievements?: { text: string; isKey: boolean }[];
  };
};

export function VersionHistory({ reportId }: { reportId: string }) {
  const { token } = useAuth();
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    api(`/api/reports/${reportId}/versions`, { token }).then(setVersions).catch(() => {});
  }, [reportId, token]);

  if (versions.length === 0) return null;

  return (
    <section className="glass-panel p-4">
      <h2 className="text-lg font-medium mb-3">Version history</h2>
      <div className="space-y-2">
        {versions.map((v) => (
          <div key={v.id} className="border border-glass-border rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenId(openId === v.id ? null : v.id)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-glass-fill transition-colors"
            >
              <span className="font-medium">Version {v.versionNumber}</span>
              <span className="text-text-muted">{new Date(v.submittedAt).toLocaleString()}</span>
            </button>
            {openId === v.id && (
              <div className="px-4 pb-3 text-sm text-text-muted space-y-2 border-t border-glass-border pt-2">
                <p>{v.snapshot.tasksCompleted?.length ?? 0} task(s) completed</p>
                {v.snapshot.blockers?.filter((b) => b.text).map((b, i) => (
                  <p key={i}>Blocker{b.isKey ? " (key)" : ""}: {b.text}</p>
                ))}
                {v.snapshot.achievements?.filter((a) => a.text).map((a, i) => (
                  <p key={i}>Achievement{a.isKey ? " (key)" : ""}: {a.text}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
