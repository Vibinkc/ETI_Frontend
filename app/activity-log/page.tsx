"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ETISidebar from "@/components/layout/DabangSidebar";
import ETIHeader from "@/components/layout/DabangHeader";
import { apiUrl } from "@/lib/api";
import { getAdminUser, getAuthToken } from "@/lib/auth";
import {
  ChevronLeft,
  ChevronRight,
  LogIn,
  ShieldAlert,
  FileUp,
  Trash2,
  ScrollText,
  UserPlus,
  Activity,

} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Entry {
  id: number;
  actor_email: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  detail: string | null;
  ip_address: string | null;
  created_at: string;
}

const PAGE_SIZE = 25;

/** Icon + tone per action, so the log can be scanned rather than read. */
const ACTION_META: Record<string, { icon: LucideIcon; tone: string; label: string }> = {
  "auth.login": { icon: LogIn, tone: "text-[var(--eti-good)]", label: "Signed in" },
  "auth.login_failed": { icon: ShieldAlert, tone: "text-[var(--eti-critical)]", label: "Failed sign-in" },
  "document.upload": { icon: FileUp, tone: "text-[var(--color-primary)]", label: "Document uploaded" },
  "document.delete": { icon: Trash2, tone: "text-[var(--eti-critical)]", label: "Document deleted" },
  "instruction.update": { icon: ScrollText, tone: "text-[var(--eti-warning)]", label: "Instructions updated" },
  "admin.create": { icon: UserPlus, tone: "text-[var(--color-primary)]", label: "Admin created" },
};

export default function ActivityLogPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [actionFilter, setActionFilter] = useState("");
  const [actorFilter, setActorFilter] = useState("");
  const [actors, setActors] = useState<string[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  const authHeaders = useCallback(
    () => ({ Authorization: `Bearer ${getAuthToken()}` }),
    []
  );

  // Client-side guard is convenience only - the endpoint enforces this too
  useEffect(() => {
    const user = getAdminUser();
    if (user && !user.is_superuser) {
      setDenied(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (denied) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const qs = new URLSearchParams({
          skip: String(page * PAGE_SIZE),
          limit: String(PAGE_SIZE),
        });
        if (actionFilter) qs.set("action", actionFilter);
        if (actorFilter) qs.set("actor", actorFilter);
        // An explicit range wins over the preset, matching the backend
        if (from && to) {
          qs.set("start", from);
          qs.set("end", to);
        }

        const res = await fetch(apiUrl(`api/admin/activity?${qs}`), { headers: authHeaders() });
        if (res.status === 403) {
          if (!cancelled) setDenied(true);
          return;
        }
        if (!res.ok) throw new Error("Could not load the activity log.");
        const data = await res.json();
        if (cancelled) return;
        setEntries(data);
        setTotal(Number(res.headers.get("X-Total-Count") ?? data.length));
      } catch {
        if (!cancelled) setEntries([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, actionFilter, actorFilter, from, to, denied, authHeaders]);

  useEffect(() => {
    if (denied) return;
    fetch(apiUrl("api/admin/activity/actions"), { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : []))
      .then(setActions)
      .catch(() => setActions([]));

    fetch(apiUrl("api/admin/activity/actors"), { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : []))
      .then(setActors)
      .catch(() => setActors([]));
  }, [denied, authHeaders]);

  const formatWhen = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  // [1, 2, 3, "gap", 12] - first/last always shown, a window around the current
  const pageItems = (current: number, pages: number): (number | "gap")[] => {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    let left = Math.max(2, current - 1);
    let right = Math.min(pages - 1, current + 1);
    if (current <= 3) right = 3;
    if (current >= pages - 2) left = pages - 2;
    const items: (number | "gap")[] = [1];
    if (left > 2) items.push("gap");
    for (let i = left; i <= right; i++) items.push(i);
    if (right < pages - 1) items.push("gap");
    items.push(pages);
    return items;
  };

  // datetime-local wants YYYY-MM-DDTHH:mm in local time
  const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="lg:flex lg:h-screen bg-[var(--eti-canvas)] lg:overflow-hidden">
      <ETISidebar />

      <div className="min-w-0 lg:flex-1 lg:flex lg:flex-col lg:overflow-hidden">
        <ETIHeader />

        <div className="eti-page bg-[var(--eti-canvas)] lg:flex-1 lg:overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {denied ? (
              <div className="eti-card p-8 text-center">
                <ShieldAlert className="w-10 h-10 text-[var(--eti-ink-subtle)] mx-auto mb-3" />
                <h3 className="text-base font-semibold text-[var(--eti-ink)] mb-1">
                  Super admin access only
                </h3>
                <p className="text-sm text-[var(--eti-ink-muted)] mb-4">
                  The activity log records what every admin does, so only the super admin can read it.
                </p>
                <button onClick={() => router.push("/")} className="eti-btn eti-btn-primary">
                  Back to dashboard
                </button>
              </div>
            ) : (
              <div className="eti-card overflow-hidden flex flex-col min-h-[520px]">
                {/* Filter bar */}
                <div className="px-4 py-3 border-b border-[var(--eti-border)] bg-[#f7f9fb]">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Activity className="w-4 h-4 text-[var(--eti-ink-subtle)] shrink-0" />
                    <span className="text-[12px] text-[var(--eti-ink-muted)]">
                      {total} recorded action{total === 1 ? "" : "s"}
                    </span>
                    {(actionFilter || actorFilter || (from && to)) && (
                      <button
                        onClick={() => {
                          setActionFilter("");
                          setActorFilter("");
                          setFrom("");
                          setTo("");
                          setPage(0);
                        }}
                        className="ml-auto text-[12px] font-medium text-[var(--eti-ink-muted)] hover:text-[var(--eti-critical)] transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Each control is its own labelled field. Stacked on narrow
                      screens, three across once there is room - a wrapping row
                      of bare inputs is what made this unreadable before. */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                    <div className="min-w-0">
                      <label htmlFor="from" className="block text-[10px] font-medium uppercase tracking-wider text-[var(--eti-ink-subtle)] mb-1">
                        From
                      </label>
                      <input
                        id="from"
                        type="datetime-local"
                        value={from}
                        max={to || nowLocal}
                        onChange={(e) => {
                          setFrom(e.target.value);
                          setPage(0);
                        }}
                        className="eti-input h-9 text-[12px] w-full"
                      />
                    </div>

                    <div className="min-w-0">
                      <label htmlFor="to" className="block text-[10px] font-medium uppercase tracking-wider text-[var(--eti-ink-subtle)] mb-1">
                        To
                      </label>
                      <input
                        id="to"
                        type="datetime-local"
                        value={to}
                        min={from || undefined}
                        max={nowLocal}
                        onChange={(e) => {
                          setTo(e.target.value);
                          setPage(0);
                        }}
                        className="eti-input h-9 text-[12px] w-full"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:col-span-2 xl:col-span-1">
                      <div className="min-w-0">
                        <label htmlFor="actor" className="block text-[10px] font-medium uppercase tracking-wider text-[var(--eti-ink-subtle)] mb-1">
                          Admin
                        </label>
                        <select
                          id="actor"
                          value={actorFilter}
                          onChange={(e) => {
                            setActorFilter(e.target.value);
                            setPage(0);
                          }}
                          className="eti-input h-9 text-[12px] w-full truncate"
                        >
                          <option value="">All admins</option>
                          {actors.map((a) => (
                            <option key={a} value={a}>
                              {a}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="min-w-0">
                        <label htmlFor="action" className="block text-[10px] font-medium uppercase tracking-wider text-[var(--eti-ink-subtle)] mb-1">
                          Action
                        </label>
                        <select
                          id="action"
                          value={actionFilter}
                          onChange={(e) => {
                            setActionFilter(e.target.value);
                            setPage(0);
                          }}
                          className="eti-input h-9 text-[12px] w-full truncate"
                        >
                          <option value="">All actions</option>
                          {actions.map((a) => (
                            <option key={a} value={a}>
                              {ACTION_META[a]?.label ?? a}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto flex-1">
                  <table className="w-full">
                    <thead className="bg-white border-b border-[var(--eti-border)]">
                      <tr>
                        <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--eti-ink-muted)]">
                          Action
                        </th>
                        <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--eti-ink-muted)]">
                          Admin
                        </th>
                        <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--eti-ink-muted)]">
                          Detail
                        </th>
                        <th className="px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-[var(--eti-ink-muted)]">
                          When
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--eti-border)]">
                      {loading ? (
                        [...Array(6)].map((_, i) => (
                          <tr key={i}>
                            <td colSpan={4} className="px-4 py-3">
                              <div className="h-4 bg-gray-100 rounded animate-pulse" />
                            </td>
                          </tr>
                        ))
                      ) : entries.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-10 text-center text-sm text-[var(--eti-ink-subtle)]">
                            No activity recorded yet.
                          </td>
                        </tr>
                      ) : (
                        entries.map((e) => {
                          const meta = ACTION_META[e.action];
                          const Icon = meta?.icon ?? Activity;
                          return (
                            <tr key={e.id} className="hover:bg-[#f7f9fb]">
                              <td className="px-4 py-2.5 whitespace-nowrap">
                                <span className="inline-flex items-center gap-2">
                                  <Icon className={`w-4 h-4 shrink-0 ${meta?.tone ?? "text-[var(--eti-ink-subtle)]"}`} />
                                  <span className="text-[13px] text-[var(--eti-ink)]">
                                    {meta?.label ?? e.action}
                                  </span>
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-[13px] text-[var(--eti-ink-muted)] whitespace-nowrap">
                                {e.actor_email}
                              </td>
                              <td className="px-4 py-2.5 text-[13px] text-[var(--eti-ink-muted)]">
                                {e.detail || "—"}
                              </td>
                              <td className="px-4 py-2.5 text-[12px] text-[var(--eti-ink-subtle)] text-right whitespace-nowrap">
                                {formatWhen(e.created_at)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {total > PAGE_SIZE && (
                  <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-t border-[var(--eti-border)] bg-[#f7f9fb]">
                    <span className="text-[12px] text-[var(--eti-ink-subtle)]">
                      {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
                    </span>
                    <nav aria-label="Activity log pagination" className="flex items-center gap-1">
                      <button
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0 || loading}
                        className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-[13px] font-medium text-[var(--eti-ink-muted)] hover:bg-white hover:text-[var(--eti-ink)] disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                      </button>

                      {pageItems(page + 1, totalPages).map((item, i) =>
                        item === "gap" ? (
                          <span
                            key={`gap-${i}`}
                            className="w-8 h-8 flex items-end justify-center pb-1.5 text-[13px] text-[var(--eti-ink-subtle)] select-none"
                          >
                            &middot;&middot;&middot;
                          </span>
                        ) : (
                          <button
                            key={item}
                            onClick={() => setPage(item - 1)}
                            disabled={loading}
                            aria-current={page + 1 === item ? "page" : undefined}
                            className={`w-8 h-8 rounded-lg text-[13px] font-medium tabular-nums transition-colors ${
                              page + 1 === item
                                ? "bg-[var(--color-primary)] text-white"
                                : "bg-white text-[var(--eti-ink-muted)] hover:text-[var(--eti-ink)] border border-[var(--eti-border)]"
                            }`}
                          >
                            {item}
                          </button>
                        )
                      )}

                      <button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={(page + 1) * PAGE_SIZE >= total || loading}
                        className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-[13px] font-medium text-[var(--eti-ink-muted)] hover:bg-white hover:text-[var(--eti-ink)] disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
