import { ReportStatus } from "lib/types";

const LABELS: Record<ReportStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  NEEDS_CORRECTION: "Needs Correction",
  APPROVED: "Approved"
};

const CLASS: Record<ReportStatus, string> = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  NEEDS_CORRECTION: "correction",
  APPROVED: "approved"
};

export function StatusPill({ status }: { status: ReportStatus }) {
  return <span className={`status-pill ${CLASS[status]}`}>{LABELS[status]}</span>;
}
