"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { API_ENDPOINTS } from "@/lib/api";
import { rangeQuery, type DashboardRange } from "./DashboardFilter";
import DetailDialog, { ViewButton } from "./DetailDialog";
import { SERIES } from "@/lib/chartTheme";

interface VisitorData {
  day?: string;
  month?: string;
  conversations: number;
  sessions: number;
  submissions: number;
}

export default function VisitorInsightsChart({ range }: { range?: DashboardRange } = {}) {
  const [data, setData] = useState<VisitorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    async function fetchVisitors() {
      try {
        const period = range?.period ?? "day";
        const response = await fetch(API_ENDPOINTS.dashboard.visitors(period) + rangeQuery(range ?? { period }));
        if (response.ok) {
          const result = await response.json();
          setData(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching visitor stats:", error);
      } finally {
        setLoading(false);
      }
    }
    setLoading(true);
    fetchVisitors();
  }, [range?.period, range?.start, range?.end]);

  if (loading) {
    return (
      <div className="eti-card p-4 w-full h-full flex flex-col">
        <h3 className="eti-card-title mb-3">Engagement</h3>
        <div className="w-full h-[200px] bg-gray-100 animate-pulse rounded" />
      </div>
    );
  }

  const chartData = data.length > 0 ? data.map(item => ({
    day: item.day || item.month,
    conversations: Number(item.conversations) || 0,
    sessions: Number(item.sessions) || 0,
  })) : [];

  const maxValue = chartData.length > 0 
    ? Math.max(
        ...chartData.map(d => Math.max(d.conversations, d.sessions)),
        1
      )
    : 100;

  return (
    <div className="eti-card p-4 w-full h-full flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="eti-card-title">Engagement</h3>
          <p className="eti-card-sub mt-0.5">Conversations and sessions over time</p>
        </div>
        <ViewButton onClick={() => setShowDetail(true)} />
      </div>
      <div className="w-full" style={{ height: "210px", minHeight: "210px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid stroke="#e9edf2" strokeDasharray="0" vertical={false} />
            <XAxis 
              dataKey="day" 
              stroke="#8494ab" tickLine={false} axisLine={false}
              style={{ fontSize: "12px" }}
            />
            <YAxis 
              stroke="#8494ab" tickLine={false} axisLine={false}
              style={{ fontSize: "12px" }}
              domain={[0, maxValue * 1.1]}
              tickFormatter={(value) => {
                if (value === 0) return "0";
                if (value < 1) return value.toFixed(2);
                return Math.round(value).toString();
              }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "white", 
                border: "1px solid #e5e7eb",
                borderRadius: "8px"
              }}
              formatter={(value: any) => {
                if (typeof value === 'number') {
                  if (value === 0) return "0";
                  if (value < 1) return value.toFixed(2);
                  return Math.round(value).toString();
                }
                return value;
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="conversations"
              stroke={SERIES[0]}
              strokeWidth={2}
              dot={{ fill: SERIES[0], r: 4 }}
              activeDot={{ r: 6 }}
              name="Conversations"
            />
            <Line
              type="monotone"
              dataKey="sessions"
              stroke={SERIES[1]}
              strokeWidth={2}
              dot={{ fill: SERIES[1], r: 4 }}
              activeDot={{ r: 6 }}
              name="Sessions"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <DetailDialog
        open={showDetail}
        onClose={() => setShowDetail(false)}
        title="Engagement"
        subtitle="Conversations and sessions over time"
      >
        <div style={{ height: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid stroke="#e9edf2" strokeDasharray="0" vertical={false} />
              <XAxis dataKey="day" stroke="#8494ab" tickLine={false} axisLine={false} style={{ fontSize: "11px" }} />
              <YAxis
                stroke="#8494ab"
                tickLine={false}
                axisLine={false}
                style={{ fontSize: "11px" }}
                domain={[0, maxValue * 1.1]}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #e3e8ee", borderRadius: "10px", fontSize: "12px" }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Line type="monotone" dataKey="conversations" stroke={SERIES[0]} strokeWidth={2}
                    dot={{ fill: SERIES[0], r: 3 }} activeDot={{ r: 5 }} name="Conversations" />
              <Line type="monotone" dataKey="sessions" stroke={SERIES[1]} strokeWidth={2}
                    dot={{ fill: SERIES[1], r: 3 }} activeDot={{ r: 5 }} name="Sessions" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--eti-border)]">
              <th className="text-left py-2 pr-3 text-[11px] font-semibold text-[var(--eti-ink-muted)]">Period</th>
              <th className="text-right py-2 px-3 text-[11px] font-semibold text-[var(--eti-ink-muted)]">Conversations</th>
              <th className="text-right py-2 pl-3 text-[11px] font-semibold text-[var(--eti-ink-muted)]">Sessions</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row: any, i: number) => (
              <tr key={`d-${i}`} className="border-b border-[var(--eti-border)]">
                <td className="py-2 pr-3 text-[12px] text-[var(--eti-ink)]">{row.day ?? row.month ?? row.date}</td>
                <td className="py-2 px-3 text-right text-[12px] tabular-nums text-[var(--eti-ink)]">{row.conversations ?? 0}</td>
                <td className="py-2 pl-3 text-right text-[12px] tabular-nums text-[var(--eti-ink-muted)]">{row.sessions ?? 0}</td>
              </tr>
            ))}
            {chartData.length === 0 && (
              <tr><td colSpan={3} className="py-4 text-center text-[12px] text-[var(--eti-ink-subtle)]">No activity in this period</td></tr>
            )}
          </tbody>
        </table>
      </DetailDialog>
    </div>
  );
}