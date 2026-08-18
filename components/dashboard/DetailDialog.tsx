"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

/**
 * Shared "expand this card" dialog.
 *
 * Every dashboard card uses this so the close behaviour (backdrop, Escape,
 * button) and framing stay identical across the dashboard.
 */
export default function DetailDialog({
  open,
  onClose,
  title,
  subtitle,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    // Stop the page behind the dialog from scrolling
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,28,46,0.45)] p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="eti-card w-full max-w-3xl max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-[var(--eti-shadow-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-3 border-b border-[var(--eti-border)]">
          <div className="min-w-0">
            <h3 className="eti-card-title">{title}</h3>
            {subtitle && <p className="eti-card-sub mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 p-1.5 rounded-lg text-[var(--eti-ink-subtle)] hover:bg-[#f2f5f9] hover:text-[var(--eti-ink)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-4 sm:px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

/** The small "View" affordance that sits in a card header. */
export function ViewButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-[var(--eti-border)] text-[12px] font-medium text-[var(--eti-ink-muted)] hover:bg-[#f7f9fb] hover:text-[var(--eti-ink)] transition-colors"
    >
      View
    </button>
  );
}
