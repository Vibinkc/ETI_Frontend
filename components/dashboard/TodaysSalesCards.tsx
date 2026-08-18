"use client";

import { useEffect, useState } from "react";
import { FileText, MessageSquare, Users, type LucideIcon } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api";
import { rangeQuery, type DashboardRange } from "./DashboardFilter";

interface StatTileProps {
  title: string;
  value: string;
  caption: string;
  icon: LucideIcon;
  accent: string;
}

/**
 * Stat tile in a brand gradient. Every gradient stop is dark enough for white
 * body text (>=4.5:1) - brand green #81c341 is only 2.14:1, so the darker
 * green step is used for the fill and the bright brand green is kept for
 * accents on dark ground.
 */
function StatTile({ title, value, caption, icon: Icon, accent }: StatTileProps) {
  return (
    <div
      className="rounded-[10px] p-4 text-white shadow-[var(--eti-shadow)]"
      style={{ backgroundImage: accent }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-white/90 truncate">{title}</p>
          <p className="mt-1.5 text-[1.625rem] leading-none font-semibold tracking-tight tabular-nums">
            {value}
          </p>
        </div>
        <span className="shrink-0 w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
          <Icon className="w-4 h-4" strokeWidth={2} />
        </span>
      </div>

      <p className="mt-2 text-[11px] text-white/75">{caption}</p>
    </div>
  );
}

interface TodayStats {
  documents_processed: number;
  documents_change: string;
  ai_queries: number;
  ai_queries_change: string;
  active_sessions: number;
  active_sessions_change: string;
  comparison_label?: string;
}

export default function TodaysSalesCards({ range }: { range?: DashboardRange } = {}) {
  const [stats, setStats] = useState<TodayStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(API_ENDPOINTS.dashboard.todayFiltered(range?.period ?? "day") + rangeQuery(range ?? { period: "day" }));
        if (response.ok) {
          setStats(await response.json());
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [range?.period, range?.start, range?.end]);

  return (
    <div className="mb-3">
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="eti-card p-5 h-[122px] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <StatTile
            title="Documents Uploaded"
            value={stats?.documents_processed.toString() ?? "0"}
            caption="Files in the knowledge base"
            icon={FileText}
            accent="linear-gradient(135deg,#00457f 0%,#002c5c 100%)"
          />
          <StatTile
            title="AI Queries"
            value={stats?.ai_queries.toString() ?? "0"}
            caption="Questions answered by the bot"
            icon={MessageSquare}
            accent="linear-gradient(135deg,#4e7d1e 0%,#375d15 100%)"
          />
          <StatTile
            title="Total Sessions"
            value={stats?.active_sessions.toString() ?? "0"}
            caption="Unique visitor sessions"
            icon={Users}
            accent="linear-gradient(135deg,#1f6fb2 0%,#14507f 100%)"
          />
        </div>
      )}
    </div>
  );
}
