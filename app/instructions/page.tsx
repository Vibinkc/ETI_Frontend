"use client";

import { useEffect, useState } from "react";
import ETISidebar from "@/components/layout/DabangSidebar";
import ETIHeader from "@/components/layout/DabangHeader";
import { API_ENDPOINTS } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { Save, RotateCcw, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface Instruction {
  content: string;
  is_default: boolean;
  updated_at: string | null;
  updated_by_email: string | null;
}

export default function InstructionsPage() {
  const [content, setContent] = useState("");
  const [savedContent, setSavedContent] = useState("");
  const [meta, setMeta] = useState<Instruction | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getAuthToken()}`,
  });

  useEffect(() => {
    loadInstruction();
  }, []);

  const loadInstruction = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_ENDPOINTS.instructions.get, { headers: authHeaders() });
      if (!res.ok) {
        throw new Error(
          res.status === 401 ? "Your session expired. Please log in again." : "Could not load instructions."
        );
      }
      const data: Instruction = await res.json();
      setContent(data.content);
      setSavedContent(data.content);
      setMeta(data);
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "Could not load instructions.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      setError("Instructions cannot be empty.");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(API_ENDPOINTS.instructions.update, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail || "Could not save instructions.");
      }
      const data: Instruction = await res.json();
      setContent(data.content);
      setSavedContent(data.content);
      setMeta(data);
      setSuccess("Instructions saved. The chatbot is now using them.");
      setTimeout(() => setSuccess(null), 4000);
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "Could not save instructions.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!confirm("Replace the current instructions with the built-in default? This does not save until you click Save.")) {
      return;
    }
    try {
      const res = await fetch(API_ENDPOINTS.instructions.default, { headers: authHeaders() });
      if (!res.ok) throw new Error("Could not load the default instructions.");
      const data: Instruction = await res.json();
      setContent(data.content);
      setSuccess("Default instructions loaded. Click Save to apply them.");
      setTimeout(() => setSuccess(null), 5000);
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "Could not load the default instructions.");
    }
  };

  // Tab should indent inside the editor instead of moving focus to the next control
  const handleTabKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Tab") return;
    e.preventDefault();
    const el = e.currentTarget;
    const { selectionStart: start, selectionEnd: end } = el;
    const next = content.slice(0, start) + "  " + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => el.setSelectionRange(start + 2, start + 2));
  };

  const hasChanges = content !== savedContent;
  const lineCount = content ? content.split("\n").length : 0;

  const formatDate = (value: string) =>
    new Date(value).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="lg:flex lg:h-screen bg-[var(--eti-canvas)] lg:overflow-hidden">
      <ETISidebar />

      <div className="min-w-0 lg:flex-1 lg:flex lg:flex-col lg:overflow-hidden">
        <ETIHeader />

        <div className="eti-page bg-[var(--eti-canvas)] lg:flex-1 lg:overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            {/* Alerts */}
            {error && (
              <div className="mb-3 flex items-start gap-2.5 rounded-[10px] border border-[#f4cdc9] bg-[#fef3f2] p-4">
                <AlertCircle className="w-5 h-5 text-[var(--eti-critical)] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[var(--eti-critical)]">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-3 flex items-start gap-2.5 rounded-[10px] border border-[#bfe3d3] bg-[#e7f4ef] p-4">
                <CheckCircle2 className="w-5 h-5 text-[var(--eti-good)] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[var(--eti-good)]">{success}</p>
              </div>
            )}

            {/* Editor */}
            <div className="eti-card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-[var(--eti-border)] bg-[#f7f9fb]">
                <div className="text-xs text-[var(--eti-ink-muted)]">
                  {loading ? (
                    "Loading…"
                  ) : meta?.is_default ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[var(--eti-warning)]" />
                      Using built-in default — not yet customised
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[var(--eti-good)]" />
                      Last updated {meta?.updated_at ? formatDate(meta.updated_at) : "—"}
                      {meta?.updated_by_email ? ` by ${meta.updated_by_email}` : ""}
                    </span>
                  )}
                </div>
                <div className="text-xs text-[var(--eti-ink-subtle)]">
                  {lineCount.toLocaleString()} lines · {content.length.toLocaleString()} characters
                </div>
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleTabKey}
                disabled={loading || saving}
                spellCheck={false}
                wrap="soft"
                placeholder="Enter the instructions for the chatbot…"
                style={{ lineHeight: "1.9", tabSize: 2 }}
                className="w-full h-[560px] px-6 py-5 text-[15px] text-gray-800 resize-y outline-none bg-white disabled:bg-gray-50 disabled:text-[var(--eti-ink-subtle)]"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-[var(--eti-border)] bg-gray-50">
                <button
                  onClick={handleResetToDefault}
                  disabled={loading || saving}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-[var(--eti-border-strong)] rounded-[10px] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset to default
                </button>

                <div className="flex items-center gap-3">
                  {hasChanges && !saving && <span className="text-xs text-[var(--eti-warning)]">Unsaved changes</span>}
                  <button
                    onClick={handleSave}
                    disabled={loading || saving || !hasChanges}
                    className="eti-btn eti-btn-primary"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs text-[var(--eti-ink-subtle)]">
              Note: instructions control the bot&apos;s behaviour, not its knowledge. What it knows about ETI comes
              from the files on the Uploaded Documents page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
