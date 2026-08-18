"use client";

import { useState } from "react";
import { CalendarRange, X } from "lucide-react";

export type Period = "day" | "week" | "month";

export interface DashboardRange {
  period: Period;
  /** YYYY-MM-DD. When both are set they override the preset period. */
  start?: string;
  end?: string;
}

const PRESETS: { value: Period; label: string }[] = [
  { value: "day", label: "Days" },
  { value: "week", label: "Weeks" },
  { value: "month", label: "Months" },
];

/** Build the query suffix the dashboard endpoints expect. */
export function rangeQuery(range: DashboardRange): string {
  if (range.start && range.end) {
    return `&start=${range.start}&end=${range.end}`;
  }
  return "";
}

export default function DashboardFilter({
  value,
  onChange,
}: {
  value: DashboardRange;
  onChange: (next: DashboardRange) => void;
}) {
  const [showCustom, setShowCustom] = useState(Boolean(value.start && value.end));
  const [from, setFrom] = useState(value.start ?? "");
  const [to, setTo] = useState(value.end ?? "");

  const customActive = Boolean(value.start && value.end);

  // No data can exist in the future, so neither bound should reach past today.
  // en-CA renders as YYYY-MM-DD, and uses the local date rather than UTC.
  const today = new Date().toLocaleDateString("en-CA");

  const applyCustom = (nextFrom: string, nextTo: string) => {
    setFrom(nextFrom);
    setTo(nextTo);
    // Only apply once both ends are chosen, otherwise the charts would flicker
    if (nextFrom && nextTo) {
      onChange({ ...value, start: nextFrom, end: nextTo });
    }
  };

  const clearCustom = () => {
    setFrom("");
    setTo("");
    setShowCustom(false);
    onChange({ period: value.period });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Preset periods */}
      <div className="inline-flex rounded-lg border border-[var(--eti-border)] bg-white p-0.5">
        {PRESETS.map((p) => {
          const active = !customActive && value.period === p.value;
          return (
            <button
              key={p.value}
              onClick={() => onChange({ period: p.value })}
              aria-pressed={active}
              className={`px-3 h-7 rounded-[6px] text-[12px] font-medium transition-colors ${
                active
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--eti-ink-muted)] hover:bg-[#f2f5f9]"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Custom range */}
      {showCustom ? (
        <div className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--eti-border)] bg-white px-2 h-8">
          <CalendarRange className="w-3.5 h-3.5 text-[var(--eti-ink-subtle)]" />
          <input
            type="date"
            value={from}
            max={to || today}
            onChange={(e) => applyCustom(e.target.value, to)}
            aria-label="From date"
            className="h-6 text-[12px] text-[var(--eti-ink)] bg-transparent outline-none"
          />
          <span className="text-[11px] text-[var(--eti-ink-subtle)]">to</span>
          <input
            type="date"
            value={to}
            min={from || undefined}
            max={today}
            onChange={(e) => applyCustom(from, e.target.value)}
            aria-label="To date"
            className="h-6 text-[12px] text-[var(--eti-ink)] bg-transparent outline-none"
          />
          <button
            onClick={clearCustom}
            title="Clear date range"
            className="p-0.5 rounded text-[var(--eti-ink-subtle)] hover:text-[var(--eti-critical)] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowCustom(true)}
          className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-[var(--eti-border)] bg-white text-[12px] font-medium text-[var(--eti-ink-muted)] hover:bg-[#f7f9fb] transition-colors"
        >
          <CalendarRange className="w-3.5 h-3.5" />
          Custom range
        </button>
      )}

      {customActive && (
        <span className="eti-badge eti-badge-neutral">
          {value.start} → {value.end}
        </span>
      )}
    </div>
  );
}
