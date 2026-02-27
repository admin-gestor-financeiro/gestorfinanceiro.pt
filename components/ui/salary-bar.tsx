"use client";

import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SalaryBarSegment = {
  /** Unique key for the segment */
  key: string;
  /** Display label shown in the legend (typically includes the formatted amount) */
  label: string;
  /** Raw numeric value used to compute proportional width */
  value: number;
  /** Tailwind fill colour class — kept for caller convenience (not used internally) */
  colorClass: string;
  /** Hex colour used for background, text, and legend badge */
  hex: string;
  /** Whether this segment is the "positive" take-home value (unused, kept for compat) */
  positive?: boolean;
};

type Props = {
  /** Ordered list of segments rendered left-to-right */
  segments: SalaryBarSegment[];
  /** Accessible label for the whole chart region */
  ariaLabel: string;
  /** Bar height in px (default 40) */
  barHeight?: number;
  className?: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Horizontal stacked bar chart — pure CSS/HTML, zero runtime dependencies.
 *
 * Rendering approach:
 *  - `div` flex row with `overflow-hidden` + `rounded-2xl` for clean, accurate
 *    rounded corners on the whole bar (replaces the previous SVG rect-overlap hack).
 *  - A 2 px gap between segments shows the card background through the overflow
 *    and visually separates segments without a hard border.
 *  - A translucent gradient overlay adds subtle depth.
 *  - Inline % labels rendered inside segments wider than 13 % of total.
 *  - Legend shows label (which callers include the formatted amount in) plus a
 *    colour-matched percentage badge.
 */
export function SalaryBar({ segments, ariaLabel, barHeight = 40, className }: Props) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total <= 0) return null;

  const withPct = segments.map((s) => ({
    ...s,
    pct: (s.value / total) * 100,
  }));

  return (
    <div className={cn("w-full", className)}>

      {/* ── Hidden accessible description ── */}
      <div role="img" aria-label={ariaLabel} className="sr-only">
        {withPct.map((s) => `${s.label}: ${s.pct.toFixed(1)}%`).join(", ")}
      </div>

      {/* ── Bar ── */}
      <div
        aria-hidden
        className="relative flex w-full overflow-hidden rounded-2xl gap-[2px]"
        style={{ height: barHeight }}
      >
        {withPct.map(({ key, hex, pct, label }) => (
          <div
            key={key}
            className="relative flex shrink-0 items-center justify-center"
            style={{ width: `${pct}%`, backgroundColor: hex }}
            title={`${label} · ${pct.toFixed(1)}%`}
          >
            {/* Inline percentage label — only when segment is wide enough to fit */}
            {pct >= 13 && (
              <span
                className="select-none tabular-nums text-white"
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  lineHeight: 1,
                  textShadow: "0 1px 3px rgba(0,0,0,0.28)",
                }}
              >
                {pct.toFixed(1)}%
              </span>
            )}
          </div>
        ))}

        {/* Subtle top-highlight gradient for depth */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.13) 0%, transparent 55%)",
          }}
        />
      </div>

      {/* ── Legend ── */}
      <div
        aria-hidden
        className="mt-3.5 flex flex-wrap gap-x-5 gap-y-2"
      >
        {withPct.map(({ key, hex, label, pct }) => (
          <div key={key} className="flex items-center gap-2 min-w-0">
            {/* Round swatch */}
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: hex }}
            />

            {/* Label (includes the formatted amount from the caller) */}
            <span className="text-xs text-neutral-500">{label}</span>

            {/* Percentage badge — coloured to match segment */}
            <span
              className="shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold tabular-nums"
              style={{ color: hex, backgroundColor: `${hex}1a` }}
            >
              {pct.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}
