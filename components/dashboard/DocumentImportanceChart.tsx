"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { API_ENDPOINTS } from "@/lib/api";
import { rangeQuery, type DashboardRange } from "./DashboardFilter";
import { ViewButton } from "./DetailDialog";
import { SERIES } from "@/lib/chartTheme";

interface DocumentImportance {
  id: number;
  name: string;
  chunk_count: number;
  file_size: number;
  importance_score: number;
  usage_count: number;
  created_at: string | null;
}

/** What a recharts Tooltip formatter receives (mirrors recharts' own ValueType). */
type TooltipValue = number | string | ReadonlyArray<number | string>;

export default function DocumentImportanceChart({ range }: { range?: DashboardRange } = {}) {
  const [data, setData] = useState<DocumentImportance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function fetchDocumentImportance() {
      try {
        const response = await fetch(API_ENDPOINTS.dashboard.documentImportance(10, range?.period) + rangeQuery(range ?? { period: "day" }));
        if (response.ok) {
          const result = await response.json();
          setData(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching document importance:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDocumentImportance();
  }, [range?.period, range?.start, range?.end]);

  useEffect(() => {
    if (!showAll) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShowAll(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showAll]);

  if (loading) {
    return (
      <div className="eti-card p-4 w-full h-full flex flex-col">
        <h3 className="eti-card-title mb-3">Most Queried Documents</h3>
        <div className="w-full h-[200px] bg-gray-100 animate-pulse rounded" />
      </div>
    );
  }

  const chartData = data.length > 0 
    ? data.map(doc => ({
        name: doc.name.length > 20 ? doc.name.substring(0, 20) + "..." : doc.name,
        fullName: doc.name,
        score: doc.importance_score,
        chunks: doc.chunk_count,
        queries: doc.usage_count,
      }))
    : [];

  const PREVIEW_ROWS = 2;
  const previewData = chartData.slice(0, PREVIEW_ROWS);
  const hiddenCount = chartData.length - previewData.length;
  const maxScore = Math.max(...chartData.map(d => d.score), 100);

  // Color gradient based on importance score
  const getColor = (score: number) => {
    if (score >= 80) return SERIES[1]; // Green for high importance
    if (score >= 50) return SERIES[0]; // Blue for medium importance
    return "#94a3b8"; // Gray for low importance
  };

  return (
    <div className="eti-card p-4 w-full h-full flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="eti-card-title">Most Queried Documents</h3>
          <p className="eti-card-sub mt-0.5">How many questions each document answered</p>
        </div>
        <ViewButton onClick={() => setShowAll(true)} />
      </div>
      <div className="w-full" style={{ height: `${Math.max(110, previewData.length * 46 + 40)}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={previewData} layout="vertical">
            <CartesianGrid stroke="#e9edf2" strokeDasharray="0" vertical={false} />
            <XAxis 
              type="number"
              domain={[0, maxScore]}
              stroke="#8494ab" tickLine={false} axisLine={false}
              style={{ fontSize: "12px" }}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis 
              type="category"
              dataKey="name"
              stroke="#8494ab" tickLine={false} axisLine={false}
              style={{ fontSize: "12px" }}
              width={120}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "white", 
                border: "1px solid #e5e7eb",
                borderRadius: "8px"
              }}
              formatter={(value: TooltipValue) => [`${value}%`, "Queries answered"]}
              labelFormatter={(label) => {
                const doc = chartData.find(d => d.name === label);
                return doc?.fullName || label;
              }}
            />
            <Bar dataKey="score" name="Queries answered" radius={[0, 4, 4, 0]}>
              {previewData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-auto pt-3 border-t border-[var(--eti-border)] flex items-center justify-between gap-3 text-[11px]">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: SERIES[1] }} />
            <span className="text-[var(--eti-ink-muted)]">Most queried</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: SERIES[0] }} />
            <span className="text-[var(--eti-ink-muted)]">Moderate</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#94a3b8]" />
            <span className="text-[var(--eti-ink-muted)]">Rarely used</span>
          </span>
        </div>
        {hiddenCount > 0 && (
          <button
            onClick={() => setShowAll(true)}
            className="text-[var(--color-primary)] font-medium hover:underline whitespace-nowrap"
          >
            +{hiddenCount} more
          </button>
        )}
      </div>

      {/* Detail view - every document, with the numbers behind the bars */}
      {showAll && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,28,46,0.45)] p-4"
          onClick={() => setShowAll(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Most queried documents, full view"
        >
          <div
            className="eti-card w-full max-w-3xl max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-[var(--eti-shadow-lg)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 px-5 py-3 border-b border-[var(--eti-border)]">
              <div>
                <h3 className="eti-card-title">Most Queried Documents</h3>
                <p className="eti-card-sub mt-0.5">
                  {chartData.length} document{chartData.length === 1 ? "" : "s"} &middot;{" "}
                  {chartData.reduce((n, d) => n + d.queries, 0)} queries answered
                </p>
              </div>
              <button
                onClick={() => setShowAll(false)}
                aria-label="Close"
                className="shrink-0 p-1.5 rounded-lg text-[var(--eti-ink-subtle)] hover:bg-[#f2f5f9] hover:text-[var(--eti-ink)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto px-4 sm:px-5 py-4">
              <div style={{ height: `${Math.max(160, chartData.length * 42 + 50)}px` }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 24 }}>
                    <CartesianGrid stroke="#e9edf2" strokeDasharray="0" vertical={false} />
                    <XAxis
                      type="number"
                      domain={[0, maxScore]}
                      stroke="#8494ab"
                      tickLine={false}
                      axisLine={false}
                      style={{ fontSize: "11px" }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#8494ab"
                      tickLine={false}
                      axisLine={false}
                      style={{ fontSize: "11px" }}
                      width={160}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(15,28,46,0.04)" }}
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e3e8ee",
                        borderRadius: "10px",
                        fontSize: "12px",
                      }}
                      formatter={(value: TooltipValue) => [`${value}%`, "Queries answered"]}
                      labelFormatter={(label) =>
                        chartData.find((d) => d.name === label)?.fullName || label
                      }
                    />
                    <Bar dataKey="score" name="Queries answered" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry, i) => (
                        <Cell key={`modal-cell-${i}`} fill={getColor(entry.score)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <table className="w-full mt-5">
                <thead>
                  <tr className="border-b border-[var(--eti-border)]">
                    <th className="text-left py-2 pr-3 text-[11px] font-semibold text-[var(--eti-ink-muted)]">Document</th>
                    <th className="text-right py-2 px-3 text-[11px] font-semibold text-[var(--eti-ink-muted)]">Queries</th>
                    <th className="text-right py-2 px-3 text-[11px] font-semibold text-[var(--eti-ink-muted)]">Chunks</th>
                    <th className="text-right py-2 pl-3 text-[11px] font-semibold text-[var(--eti-ink-muted)]">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((d, i) => (
                    <tr key={`row-${i}`} className="border-b border-[var(--eti-border)]">
                      <td className="py-2 pr-3 text-[12px] text-[var(--eti-ink)]" title={d.fullName}>
                        <span className="inline-flex items-center gap-2">
                          <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: getColor(d.score) }} />
                          <span className="truncate max-w-[320px]">{d.fullName}</span>
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-[12px] tabular-nums text-[var(--eti-ink)]">{d.queries}</td>
                      <td className="py-2 px-3 text-right text-[12px] tabular-nums text-[var(--eti-ink-muted)]">{d.chunks}</td>
                      <td className="py-2 pl-3 text-right text-[12px] tabular-nums text-[var(--eti-ink-muted)]">{d.score}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

