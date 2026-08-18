"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { API_ENDPOINTS } from "@/lib/api";
import { rangeQuery, type DashboardRange } from "./DashboardFilter";
import DetailDialog, { ViewButton } from "./DetailDialog";
import { SERIES } from "@/lib/chartTheme";

interface ActivityData {
  day?: string;
  date?: string;
  questions: number;
  documents: number;
}

export default function TotalRevenueChart({ range }: { range?: DashboardRange } = {}) {
  const [data, setData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const period = range?.period ?? "day";
        const response = await fetch(API_ENDPOINTS.dashboard.activity(period) + rangeQuery(range ?? { period }));
        if (response.ok) {
          const result = await response.json();
          setData(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching activity stats:", error);
      } finally {
        setLoading(false);
      }
    }
    setLoading(true);
    fetchActivity();
  }, [range?.period, range?.start, range?.end]);

  if (loading) {
    return (
      <div className="eti-card p-4 w-full h-full flex flex-col">
        <h3 className="eti-card-title mb-3">Query Activity</h3>
        <div className="w-full h-[200px] bg-gray-100 animate-pulse rounded" />
      </div>
    );
  }

  const chartData = data.length > 0 ? data : [
    { day: "Mon", questions: 0, documents: 0 },
    { day: "Tue", questions: 0, documents: 0 },
    { day: "Wed", questions: 0, documents: 0 },
    { day: "Thu", questions: 0, documents: 0 },
    { day: "Fri", questions: 0, documents: 0 },
    { day: "Sat", questions: 0, documents: 0 },
    { day: "Sun", questions: 0, documents: 0 },
  ];

  return (
    <div className="eti-card p-4 w-full h-full flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="eti-card-title">Query Activity</h3>
          <p className="eti-card-sub mt-0.5">Questions asked and documents added</p>
        </div>
        <ViewButton onClick={() => setShowDetail(true)} />
      </div>
      <div className="w-full" style={{ height: "210px", minHeight: "210px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid stroke="#e9edf2" strokeDasharray="0" vertical={false} />
            <XAxis 
              dataKey={chartData[0]?.day ? "day" : "date"} 
              stroke="#8494ab" tickLine={false} axisLine={false}
              style={{ fontSize: "12px" }}
            />
            <YAxis 
              stroke="#8494ab" tickLine={false} axisLine={false}
              style={{ fontSize: "12px" }}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "white", 
                border: "1px solid #e5e7eb",
                borderRadius: "8px"
              }}
            />
            <Bar dataKey="questions" name="AI Questions" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`questions-${index}`} fill={SERIES[0]} />
              ))}
            </Bar>
            <Bar dataKey="documents" name="Documents Uploaded" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`documents-${index}`} fill={SERIES[1]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <DetailDialog
        open={showDetail}
        onClose={() => setShowDetail(false)}
        title="Query Activity"
        subtitle="Questions asked and documents added"
      >
        <div style={{ height: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid stroke="#e9edf2" strokeDasharray="0" vertical={false} />
              <XAxis
                dataKey={chartData[0]?.day ? "day" : "date"}
                stroke="#8494ab"
                tickLine={false}
                axisLine={false}
                style={{ fontSize: "11px" }}
              />
              <YAxis stroke="#8494ab" tickLine={false} axisLine={false} style={{ fontSize: "11px" }} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: "rgba(15,28,46,0.04)" }}
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #e3e8ee", borderRadius: "10px", fontSize: "12px" }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="questions" name="AI Questions" fill={SERIES[0]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="documents" name="Documents Uploaded" fill={SERIES[1]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--eti-border)]">
              <th className="text-left py-2 pr-3 text-[11px] font-semibold text-[var(--eti-ink-muted)]">Period</th>
              <th className="text-right py-2 px-3 text-[11px] font-semibold text-[var(--eti-ink-muted)]">AI questions</th>
              <th className="text-right py-2 pl-3 text-[11px] font-semibold text-[var(--eti-ink-muted)]">Documents</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row: any, i: number) => (
              <tr key={`a-${i}`} className="border-b border-[var(--eti-border)]">
                <td className="py-2 pr-3 text-[12px] text-[var(--eti-ink)]">{row.day ?? row.date}</td>
                <td className="py-2 px-3 text-right text-[12px] tabular-nums text-[var(--eti-ink)]">{row.questions ?? 0}</td>
                <td className="py-2 pl-3 text-right text-[12px] tabular-nums text-[var(--eti-ink-muted)]">{row.documents ?? 0}</td>
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