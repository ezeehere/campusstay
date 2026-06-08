import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Home as HomeIcon,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

import { getAllReports, updateReportStatus } from "../../firebase/reports";

function formatDate(value) {
  if (!value) return "Not available";

  if (value.toDate) {
    return value.toDate().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return String(value);
}

function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  async function loadReports() {
    try {
      setLoading(true);
      const data = await getAllReports();
      setReports(data);
    } catch (error) {
      console.error("Error loading reports:", error);
      alert("Could not load reports.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function handleStatusChange(reportId, status) {
    try {
      setUpdatingId(reportId);
      await updateReportStatus(reportId, status);
      await loadReports();
    } catch (error) {
      console.error("Error updating report:", error);
      alert("Could not update report.");
    } finally {
      setUpdatingId(null);
    }
  }

  const openReports = reports.filter((report) => report.status === "open");
  const reviewingReports = reports.filter(
    (report) => report.status === "reviewing"
  );
  const resolvedReports = reports.filter(
    (report) => report.status === "resolved"
  );

  return (
    <main className="min-h-screen bg-[#FFF8EF] text-[#1F2933]">
      <header className="sticky top-0 z-30 border-b border-[#E8DFD2] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1E5B4F] text-white shadow-sm">
              <HomeIcon size={22} />
            </div>

            <div>
              <h1 className="text-xl font-extrabold tracking-tight">
                CampusStay
              </h1>
              <p className="text-xs text-slate-500">Reports</p>
            </div>
          </Link>

          <Link
            to="/admin/dashboard"
            className="flex items-center gap-2 rounded-2xl border border-[#E8DFD2] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#F6F1E8]"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="rounded-[2rem] bg-[#1E5B4F] p-6 text-white shadow-xl sm:p-8">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
              <AlertTriangle size={16} />
              Listing issue reports
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              Reports from students
            </h2>

            <p className="mt-3 leading-7 text-emerald-50">
              Check wrong information, fake listings, changed rent, wrong phone
              numbers, and other listing issues reported by users.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <ReportStat title="Open" value={openReports.length} tone="red" />
          <ReportStat
            title="Reviewing"
            value={reviewingReports.length}
            tone="amber"
          />
          <ReportStat
            title="Resolved"
            value={resolvedReports.length}
            tone="green"
          />
        </div>

        <div className="mt-8 rounded-[2rem] border border-[#E8DFD2] bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5">
            <h3 className="text-2xl font-extrabold">All reports</h3>
            <p className="mt-1 text-sm text-slate-500">
              Review reports and update their status.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 rounded-3xl border border-dashed border-[#E8DFD2] p-10 text-slate-500">
              <Loader2 size={22} className="animate-spin" />
              Loading reports...
            </div>
          ) : reports.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#E8DFD2] p-10 text-center">
              <h3 className="text-xl font-bold">No reports yet</h3>
              <p className="mt-2 text-slate-500">
                Reports submitted from listing details will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {reports.map((report) => {
                const isUpdating = updatingId === report.id;

                return (
                  <article
                    key={report.id}
                    className="rounded-3xl border border-[#E8DFD2] bg-[#FFF8EF] p-4 sm:p-5"
                  >
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                      <div className="min-w-0">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <StatusPill status={report.status} />

                          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500">
                            {report.reason || "Issue"}
                          </span>
                        </div>

                        <h4 className="text-xl font-extrabold text-[#1F2933]">
                          {report.listingName || "Listing name not added"}
                        </h4>

                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
                          {report.message || "No message added."}
                        </p>

                        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                          <InfoMini
                            label="Listing ID"
                            value={report.listingId || "Not added"}
                          />

                          <InfoMini
                            label="Owner phone"
                            value={report.ownerPhone || "Not added"}
                          />

                          <InfoMini
                            label="Reporter phone"
                            value={report.reporterPhone || "Not added"}
                          />

                          <InfoMini
                            label="Created"
                            value={formatDate(report.createdAt)}
                          />
                        </div>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-3 lg:min-w-80 lg:grid-cols-1">
                        <button
                          disabled={isUpdating}
                          onClick={() =>
                            handleStatusChange(report.id, "open")
                          }
                          className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          Mark open
                        </button>

                        <button
                          disabled={isUpdating}
                          onClick={() =>
                            handleStatusChange(report.id, "reviewing")
                          }
                          className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
                        >
                          Mark reviewing
                        </button>

                        <button
                          disabled={isUpdating}
                          onClick={() =>
                            handleStatusChange(report.id, "resolved")
                          }
                          className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                        >
                          Mark resolved
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {report.ownerPhone && (
                        <a
                          href={`tel:${report.ownerPhone}`}
                          className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-[#F6F1E8]"
                        >
                          <Phone size={15} />
                          Call owner
                        </a>
                      )}

                      {report.ownerPhone && (
                        <a
                          href={`https://wa.me/91${report.ownerPhone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-[#F6F1E8]"
                        >
                          <MessageCircle size={15} />
                          WhatsApp owner
                        </a>
                      )}

                      <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-[#F6F1E8]"
                      >
                        <MapPin size={15} />
                        Go to listings
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function ReportStat({ title, value, tone }) {
  const tones = {
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
    green: "bg-emerald-50 text-emerald-700",
  };

  return (
    <div className="rounded-[1.7rem] border border-[#E8DFD2] bg-white p-5 shadow-sm">
      <div
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${tones[tone]}`}
      >
        {tone === "green" ? <CheckCircle2 size={21} /> : <Clock size={21} />}
      </div>

      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <p className="mt-1 text-3xl font-extrabold text-[#1F2933]">{value}</p>
    </div>
  );
}

function StatusPill({ status }) {
  const styles = {
    open: "bg-red-50 text-red-700",
    reviewing: "bg-amber-50 text-amber-700",
    resolved: "bg-emerald-50 text-emerald-700",
  };

  const labels = {
    open: "Open",
    reviewing: "Reviewing",
    resolved: "Resolved",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        styles[status] || styles.open
      }`}
    >
      {labels[status] || "Open"}
    </span>
  );
}

function InfoMini({ label, value }) {
  return (
    <div className="rounded-2xl bg-white px-3 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}

export default AdminReports;