"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api";
import { rangeQuery, type DashboardRange } from "./DashboardFilter";
import DetailDialog, { ViewButton } from "./DetailDialog";

interface Document {
  id: number;
  name: string;
  chunk_count: number;
  created_at: string;
}

const PAGE_SIZE = 5;

export default function TopProductsTable({ range }: { range?: DashboardRange } = {}) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    async function fetchTopDocuments() {
      try {
        // Pull a deeper set than one page so the card can page through them
        const response = await fetch(
          API_ENDPOINTS.dashboard.topDocuments(50, range?.period) + rangeQuery(range ?? { period: "day" })
        );
        if (response.ok) {
          const result = await response.json();
          setDocuments(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching top documents:", error);
      } finally {
        setLoading(false);
      }
    }
    setPage(0); // a new filter invalidates the current page
    fetchTopDocuments();
  }, [range?.period, range?.start, range?.end]);

  if (loading) {
    return (
      <div className="eti-card p-4 w-full h-full flex flex-col">
        <h3 className="eti-card-title mb-3">Top Documents</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-gray-100 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  // Scale the bar against the whole set, not just the visible page, so a
  // document's bar does not change length as you page around.
  const maxChunks = Math.max(...documents.map((d) => d.chunk_count), 1);
  const totalPages = Math.max(1, Math.ceil(documents.length / PAGE_SIZE));
  const visible = documents.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="eti-card p-4 w-full h-full flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="eti-card-title">Top Documents</h3>
          <p className="eti-card-sub mt-0.5">Documents by content volume</p>
        </div>
        <ViewButton onClick={() => setShowDetail(true)} />
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--eti-border)]">
              <th className="text-left py-2 px-3 text-xs font-semibold text-[var(--eti-ink-muted)]">Document</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-[var(--eti-ink-muted)]">Chunks</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-[var(--eti-ink-muted)]">Usage</th>
            </tr>
          </thead>
          <tbody>
            {visible.length > 0 ? (
              visible.map((doc) => {
                const popularity = (doc.chunk_count / maxChunks) * 100;
                return (
                  <tr key={doc.id} className="border-b border-[var(--eti-border)]/60">
                    <td
                      className="py-2 px-3 text-xs text-[var(--eti-ink)] truncate max-w-[200px]"
                      title={doc.name}
                    >
                      {doc.name}
                    </td>
                    <td className="py-2 px-3 text-xs tabular-nums text-[var(--eti-ink)]">{doc.chunk_count}</td>
                    <td className="py-2 px-3">
                      <div className="w-24 h-1.5 bg-[#eef1f5] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--color-primary)] rounded-full transition-all"
                          style={{ width: `${popularity}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={3} className="py-4 text-center text-xs text-[var(--eti-ink-subtle)]">
                  No documents yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pager appears only once there is more than one page */}
      {documents.length > PAGE_SIZE && (
        <div className="mt-2 pt-2 border-t border-[var(--eti-border)] flex items-center justify-between gap-2">
          <span className="text-[11px] text-[var(--eti-ink-subtle)]">
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, documents.length)} of {documents.length}
          </span>

          <nav aria-label="Top documents pagination" className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              aria-label="Previous page"
              className="w-6 h-6 flex items-center justify-center rounded-md text-[var(--eti-ink-muted)] hover:bg-[#f2f5f9] disabled:opacity-35 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                aria-current={page === i ? "page" : undefined}
                className={`w-6 h-6 rounded-md text-[11px] font-medium tabular-nums transition-colors ${
                  page === i
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-[var(--eti-ink-muted)] hover:bg-[#f2f5f9]"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              aria-label="Next page"
              className="w-6 h-6 flex items-center justify-center rounded-md text-[var(--eti-ink-muted)] hover:bg-[#f2f5f9] disabled:opacity-35 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </nav>
        </div>
      )}
      <DetailDialog
        open={showDetail}
        onClose={() => setShowDetail(false)}
        title="Top Documents"
        subtitle={`${documents.length} document${documents.length === 1 ? "" : "s"} in the knowledge base`}
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--eti-border)]">
              <th className="text-left py-2 pr-3 text-[11px] font-semibold text-[var(--eti-ink-muted)]">#</th>
              <th className="text-left py-2 px-3 text-[11px] font-semibold text-[var(--eti-ink-muted)]">Document</th>
              <th className="text-right py-2 px-3 text-[11px] font-semibold text-[var(--eti-ink-muted)]">Chunks</th>
              <th className="text-right py-2 pl-3 text-[11px] font-semibold text-[var(--eti-ink-muted)]">Share</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc, i) => (
              <tr key={doc.id} className="border-b border-[var(--eti-border)]">
                <td className="py-2 pr-3 text-[12px] tabular-nums text-[var(--eti-ink-subtle)]">{i + 1}</td>
                <td className="py-2 px-3 text-[12px] text-[var(--eti-ink)]" title={doc.name}>
                  <span className="truncate block max-w-[340px]">{doc.name}</span>
                </td>
                <td className="py-2 px-3 text-right text-[12px] tabular-nums text-[var(--eti-ink)]">{doc.chunk_count}</td>
                <td className="py-2 pl-3 text-right text-[12px] tabular-nums text-[var(--eti-ink-muted)]">
                  {Math.round((doc.chunk_count / maxChunks) * 100)}%
                </td>
              </tr>
            ))}
            {documents.length === 0 && (
              <tr><td colSpan={4} className="py-4 text-center text-[12px] text-[var(--eti-ink-subtle)]">No documents yet</td></tr>
            )}
          </tbody>
        </table>
      </DetailDialog>
    </div>
  );
}