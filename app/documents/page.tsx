"use client";

import { useEffect, useState } from "react";
import ETISidebar from "@/components/layout/DabangSidebar";
import ETIHeader from "@/components/layout/DabangHeader";
import { API_ENDPOINTS } from "@/lib/api";
import { getAdminUser, getAuthToken } from "@/lib/auth";
import { Trash2, FileText, Calendar, X, File, FileSpreadsheet, Presentation, Eye, ChevronLeft, ChevronRight } from "lucide-react";

interface Document {
  id: number;
  name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  processed: boolean;
  uploaded_by: number | null;
  uploader: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [contentDoc, setContentDoc] = useState<{
    name: string;
    source: string;
    content: string;
    chunk_count: number;
    char_count: number;
  } | null>(null);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 10;

  // Scraped pages have a URL as their path and no file on disk
  const isWebPage = (doc: Document) => /^https?:\/\//i.test(doc.file_path || "");

  const handleView = async (doc: Document) => {
    // A scraped site has no file on disk - show the text the bot actually
    // stored, which is what matters here, not the live website.
    if (isWebPage(doc)) {
      setViewingId(doc.id);
      try {
        const res = await fetch(API_ENDPOINTS.documents.content(doc.id), {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        });
        if (!res.ok) throw new Error("Could not load the scraped content.");
        setContentDoc(await res.json());
      } catch (e) {
        alert((e instanceof Error ? e.message : "") || "Could not load the scraped content.");
      } finally {
        setViewingId(null);
      }
      return;
    }
    setViewingId(doc.id);
    try {
      // The endpoint needs a bearer token, which a plain link cannot send -
      // fetch it and hand the browser a blob URL instead.
      const res = await fetch(API_ENDPOINTS.documents.file(doc.id), {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail || "Could not open this document.");
      }
      const url = URL.createObjectURL(await res.blob());
      const win = window.open(url, "_blank", "noopener,noreferrer");
      if (!win) alert("Your browser blocked the popup. Allow popups for this site to view documents.");
      // Give the new tab time to load before releasing the object URL
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) {
      alert((e instanceof Error ? e.message : "") || "Could not open this document.");
    } finally {
      setViewingId(null);
    }
  };
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const user = getAdminUser();
    setIsSuperAdmin(user?.email === "superadmin@gmail.com");
  }, []);

  useEffect(() => {
    setSelected(new Set());
    loadDocuments();
  }, [page]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        API_ENDPOINTS.documents.listPaged(page * PAGE_SIZE, PAGE_SIZE)
      );
      if (!response.ok) {
        throw new Error("Failed to load documents");
      }
      const data = await response.json();
      setDocuments(data);
      // Unpaginated total travels in a header so the body stays a plain list
      setTotal(Number(response.headers.get("X-Total-Count") ?? data.length));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await fetch(API_ENDPOINTS.documents.delete(id), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });

      if (!response.ok) {
        throw new Error("Failed to delete document");
      }

      // Refetch rather than splicing locally, so the page backfills from the
      // server and the total stays correct
      const wasLastOnPage = documents.length === 1 && page > 0;
      if (wasLastOnPage) setPage(page - 1);
      else loadDocuments();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete document");
    } finally {
      setDeletingId(null);
    }
  };


  // [1, 2, 3, "…", 12] - first and last always shown, a 3-wide window around
  // the current page, and an ellipsis wherever numbers are skipped.
  const pageItems = (current: number, totalPages: number): (number | "gap")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    let left = Math.max(2, current - 1);
    let right = Math.min(totalPages - 1, current + 1);
    if (current <= 3) right = 3;
    if (current >= totalPages - 2) left = totalPages - 2;

    const items: (number | "gap")[] = [1];
    if (left > 2) items.push("gap");
    for (let i = left; i <= right; i++) items.push(i);
    if (right < totalPages - 1) items.push("gap");
    items.push(totalPages);
    return items;
  };


  const toggleOne = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allOnPageSelected = documents.length > 0 && documents.every((d) => selected.has(d.id));

  const toggleAllOnPage = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) documents.forEach((d) => next.delete(d.id));
      else documents.forEach((d) => next.add(d.id));
      return next;
    });
  };

  const handleBulkDelete = async () => {
    const ids = [...selected];
    if (ids.length === 0) return;
    if (!confirm(`Delete ${ids.length} document${ids.length === 1 ? "" : "s"}? This cannot be undone.`)) return;

    setBulkDeleting(true);
    const failed: number[] = [];
    try {
      // Sequential rather than parallel: each delete also removes chunks, and a
      // burst of concurrent deletes is more likely to trip over itself.
      for (const id of ids) {
        try {
          const res = await fetch(API_ENDPOINTS.documents.delete(id), {
            method: "DELETE",
            headers: { Authorization: `Bearer ${getAuthToken()}` },
          });
          if (!res.ok) failed.push(id);
        } catch {
          failed.push(id);
        }
      }
      if (failed.length) setError(`${failed.length} document(s) could not be deleted.`);
      setSelected(new Set());
      // Step back if the page we were on no longer exists
      const remaining = total - (ids.length - failed.length);
      const lastPage = Math.max(0, Math.ceil(remaining / PAGE_SIZE) - 1);
      if (page > lastPage) setPage(lastPage);
      else loadDocuments();
    } finally {
      setBulkDeleting(false);
    }
  };


  /** Split scraped text into per-page sections for readable display.
   *
   * Splits on the "URL: <address>" marker the scraper writes at the top of each
   * page. That marker is present in every scrape, whereas the "====" separator
   * was missing from documents captured before the joining bug was fixed.
   */
  const contentSections = (raw: string) => {
    const cleaned = raw.replace(/^[\s=]+/, "");
    const parts = cleaned.split(/\n(?=URL:\s*https?:\/\/)/g);

    return parts
      .map((block) => block.trim())
      .filter(Boolean)
      .map((block) => {
        const lines = block.split("\n");
        const meta: Record<string, string> = {};
        let i = 0;
        for (; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line === "" || line.startsWith("=")) continue;
          // `\s*` and `.*` could both match a space, so a non-matching line gave
          // the engine exponentially many ways to split a run of spaces. Capture
          // everything after the colon instead and trim it in JS - same groups.
          const m = line.match(/^(URL|Page|Title|Description):(.*)$/);
          if (!m) break;
          meta[m[1]] = m[2].replace(/^\s+/, "");
        }
        const body = lines
          .slice(i)
          .join("\n")
          .replace(/^[\s=]+/, "")
          .replace(/\n{3,}/g, "\n\n")
          .trim();
        return { meta, body };
      });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    // Use browser's local timezone automatically
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) {
      return <FileText className="w-6 h-6 text-[var(--eti-critical)]" />;
    }
    if (mimeType.includes("word") || mimeType.includes("doc")) {
      return <FileText className="w-6 h-6 text-blue-600" />;
    }
    if (mimeType.includes("excel") || mimeType.includes("xls") || mimeType.includes("spreadsheet")) {
      return <FileSpreadsheet className="w-6 h-6 text-[var(--eti-good)]" />;
    }
    if (mimeType.includes("powerpoint") || mimeType.includes("ppt") || mimeType.includes("presentation")) {
      return <Presentation className="w-6 h-6 text-orange-600" />;
    }
    return <File className="w-6 h-6 text-[var(--eti-ink-muted)]" />;
  };

  return (
    <div className="lg:flex lg:h-screen bg-[var(--eti-canvas)] lg:overflow-hidden">
      <ETISidebar />

      {/* Main Content */}
      <div className="min-w-0 lg:flex-1 lg:flex lg:flex-col lg:overflow-hidden">
        {/* Header */}
        <ETIHeader />

        {/* Content */}
        <div className="eti-page bg-[var(--eti-canvas)] lg:flex-1 lg:overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <X className="w-5 h-5 text-[var(--eti-critical)]" />
                  <span className="text-sm text-red-800">{error}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="text-[var(--eti-critical)] hover:text-red-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {loading ? (
              <div className="eti-card p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <p className="text-[var(--eti-ink-muted)]">Loading documents...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="eti-card p-8 text-center">
                <FileText className="w-16 h-16 text-[var(--eti-ink-subtle)] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[var(--eti-ink)] mb-2">No documents uploaded</h3>
                <p className="text-[var(--eti-ink-muted)] mb-4">
                  Upload documents from the Upload Content page to get started.
                </p>
                <a
                  href="/ai"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Go to Upload Content
                </a>
              </div>
            ) : (
              <div className="eti-card overflow-hidden flex flex-col min-h-[520px]">
                {selected.size > 0 && (
                  <div className="flex items-center justify-between gap-3 px-4 py-2 bg-[#eef3f9] border-b border-[var(--eti-border)]">
                    <span className="text-[12px] font-medium text-[var(--color-primary)]">
                      {selected.size} selected
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelected(new Set())}
                        className="text-[12px] font-medium text-[var(--eti-ink-muted)] hover:text-[var(--eti-ink)] transition-colors"
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={handleBulkDelete}
                        disabled={bulkDeleting}
                        className="eti-btn eti-btn-danger h-7 px-2.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {bulkDeleting ? "Deleting…" : `Delete ${selected.size}`}
                      </button>
                    </div>
                  </div>
                )}
                <div className="overflow-x-auto flex-1">
                  <table className="w-full">
                    <thead className="bg-[#f7f9fb] border-b border-[var(--eti-border)]">
                      <tr>
                        <th className="px-4 py-2 w-10">
                          <input
                            type="checkbox"
                            checked={allOnPageSelected}
                            onChange={toggleAllOnPage}
                            aria-label="Select all documents on this page"
                            className="w-3.5 h-3.5 accent-[var(--color-primary)] cursor-pointer align-middle"
                          />
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Document
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Size
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Upload Date
                        </th>
                        {isSuperAdmin && (
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Uploaded By
                          </th>
                        )}
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {documents.map((doc) => (
                        <tr
                          key={doc.id}
                          className={selected.has(doc.id) ? "bg-[#eef3f9]" : "hover:bg-[#f7f9fb]"}
                        >
                          <td className="px-4 py-2.5 w-10">
                            <input
                              type="checkbox"
                              checked={selected.has(doc.id)}
                              onChange={() => toggleOne(doc.id)}
                              aria-label={`Select ${doc.name}`}
                              className="w-3.5 h-3.5 accent-[var(--color-primary)] cursor-pointer align-middle"
                            />
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {getFileIcon(doc.mime_type)}
                              <div>
                                <div className="text-sm font-medium text-[var(--eti-ink)]">
                                  {doc.name}
                                </div>
                                <div className="text-xs text-[var(--eti-ink-subtle)]">
                                  {doc.processed ? "Processed" : "Processing..."}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <span className="text-sm text-[var(--eti-ink-muted)]">
                              {formatFileSize(doc.file_size)}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm text-[var(--eti-ink-muted)]">
                              <Calendar className="w-4 h-4" />
                              {formatDate(doc.created_at)}
                            </div>
                          </td>
                          {isSuperAdmin && (
                            <td className="px-4 py-2.5 whitespace-nowrap">
                              <div className="text-sm text-[var(--eti-ink-muted)]">
                                {doc.uploader ? (
                                  <span>{doc.uploader.first_name} {doc.uploader.last_name}</span>
                                ) : (
                                  <span className="text-[var(--eti-ink-subtle)] italic">Unknown</span>
                                )}
                              </div>
                            </td>
                          )}
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                doc.processed
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {doc.processed ? "Processed" : "Processing"}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap text-right">
                            <button
                              type="button"
                              onClick={() => handleView(doc)}
                              disabled={viewingId === doc.id}
                              title={isWebPage(doc) ? "Open the source page" : "View this document"}
                              className="inline-flex items-center gap-2 px-3 py-1.5 mr-1 text-sm text-[var(--color-primary)] hover:bg-[#eef3f9] rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {viewingId === doc.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--color-primary)]"></div>
                                  Opening…
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4" />
                                  View
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(doc.id, doc.name)}
                              disabled={deletingId === doc.id}
                              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--eti-critical)] hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {deletingId === doc.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pager - hidden when everything fits on one page */}
                {total > PAGE_SIZE && (
                  <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-t border-[var(--eti-border)] bg-[#f7f9fb]">
                    <p className="hidden sm:block text-[12px] text-[var(--eti-ink-subtle)]">
                      Showing{" "}
                      <span className="font-medium text-[var(--eti-ink-muted)]">
                        {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)}
                      </span>{" "}
                      of <span className="font-medium text-[var(--eti-ink-muted)]">{total}</span>
                    </p>

                    <nav aria-label="Pagination" className="flex items-center gap-1 ml-auto">
                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0 || loading}
                        className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-[13px] font-medium text-[var(--eti-ink-muted)] hover:bg-white hover:text-[var(--eti-ink)] disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                      </button>

                      {pageItems(page + 1, Math.ceil(total / PAGE_SIZE)).map((item, i) =>
                        item === "gap" ? (
                          <span
                            key={`gap-${i}`}
                            className="w-8 h-8 flex items-end justify-center pb-1.5 text-[13px] text-[var(--eti-ink-subtle)] select-none"
                          >
                            ···
                          </span>
                        ) : (
                          <button
                            type="button"
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
                        type="button"
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
      {/* Scraped content viewer */}
      {contentDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,28,46,0.45)] p-4"
          // Close only on the backdrop itself. Same result as stopPropagation on
          // the panel below, without a click handler on a non-interactive node.
          onClick={(e) => {
            if (e.target === e.currentTarget) setContentDoc(null);
          }}
          role="presentation"
        >
          <div
            className="eti-card w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-[var(--eti-shadow-lg)]"
            role="dialog"
            aria-modal="true"
            aria-label="Scraped content"
          >
            <div className="flex items-start justify-between gap-3 px-5 py-3 border-b border-[var(--eti-border)]">
              <div className="min-w-0">
                <h3 className="eti-card-title truncate">{contentDoc.name}</h3>
                <p className="eti-card-sub mt-0.5">
                  {contentDoc.char_count.toLocaleString()} characters &middot;{" "}
                  {contentDoc.chunk_count} chunks &middot; scraped from{" "}
                  <a
                    href={contentDoc.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-primary)] hover:underline"
                  >
                    {contentDoc.source}
                  </a>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setContentDoc(null)}
                aria-label="Close"
                className="shrink-0 p-1.5 rounded-lg text-[var(--eti-ink-subtle)] hover:bg-[#f2f5f9] hover:text-[var(--eti-ink)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto px-4 sm:px-5 py-4">
              {contentDoc.content ? (
                <div className="space-y-5">
                  {contentSections(contentDoc.content).map((section, i) => (
                    <section key={i} className={i > 0 ? "pt-5 border-t border-[var(--eti-border)]" : ""}>
                      {(section.meta.Title || section.meta.Page || section.meta.URL) && (
                        <header className="mb-2">
                          {section.meta.Title && (
                            <h4 className="text-[13px] font-semibold text-[var(--eti-ink)]">
                              {section.meta.Title}
                            </h4>
                          )}
                          {(section.meta.URL || section.meta.Page) && (
                            <p className="text-[11px] text-[var(--eti-ink-subtle)] break-all">
                              {section.meta.URL || section.meta.Page}
                            </p>
                          )}
                        </header>
                      )}
                      <p className="whitespace-pre-wrap break-words text-left text-[13px] leading-[1.65] text-[var(--eti-ink-muted)]">
                        {section.body}
                      </p>
                    </section>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-[var(--eti-ink-subtle)]">
                  No text was extracted for this document.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

