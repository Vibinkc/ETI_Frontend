/**
 * Shared chart tokens.
 *
 * SERIES is a fixed-order categorical palette - assign by position and never
 * cycle it. It was validated for colour-vision-deficiency separation and >=3:1
 * contrast against a white surface, so do not substitute ad-hoc hexes.
 *
 * Text in a chart wears ink tokens, never the series colour; the mark beside a
 * label is what carries identity.
 */
export const SERIES = ["#1f6fb2", "#00875f", "#c85200", "#9b4d8c"] as const;

export const CHART_INK = {
  axis: "#8494ab",
  label: "#55637a",
  grid: "#e9edf2",
  surface: "#ffffff",
  border: "#e3e8ee",
};

/** Recessive axes: no axis line, no tick marks, small muted type. */
export const axisProps = {
  stroke: CHART_INK.axis,
  tickLine: false,
  axisLine: false,
  tick: { fill: CHART_INK.axis, fontSize: 11 },
} as const;

/** Horizontal rules only - vertical grid adds noise without adding meaning. */
export const gridProps = {
  stroke: CHART_INK.grid,
  strokeDasharray: "0",
  vertical: false,
} as const;

export const tooltipProps = {
  cursor: { fill: "rgba(15,28,46,0.04)" },
  contentStyle: {
    backgroundColor: CHART_INK.surface,
    border: `1px solid ${CHART_INK.border}`,
    borderRadius: "10px",
    boxShadow: "0 10px 30px rgba(15,28,46,0.10), 0 2px 8px rgba(15,28,46,0.06)",
    fontSize: "12px",
    padding: "8px 10px",
  },
  labelStyle: { color: "#0f1c2e", fontWeight: 600, marginBottom: 2 },
  itemStyle: { color: "#55637a", padding: 0 },
} as const;

export const legendProps = {
  iconType: "circle",
  iconSize: 8,
  wrapperStyle: { fontSize: "12px", color: CHART_INK.label, paddingTop: 8 },
} as const;
