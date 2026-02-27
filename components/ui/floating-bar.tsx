"use client";

import { cn } from "@/lib/utils";

type FloatingBarProps = {
  label: string;
  value: string;
  visible: boolean;
  onClick?: () => void;
  className?: string;
};

/**
 * Mobile-only sticky bottom bar that always shows the current net salary.
 * Tapping it calls onClick (use to scroll to the results panel).
 * Hidden on lg+ screens via CSS.
 */
export function FloatingBar({ label, value, visible, onClick, className }: FloatingBarProps) {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 lg:hidden",
        "transition-transform duration-300 ease-in-out",
        visible ? "translate-y-0" : "translate-y-full",
        className
      )}
    >
      {/* Safe-area padding for iOS home indicator */}
      <div className="border-t border-neutral-200 bg-white shadow-xl pb-[env(safe-area-inset-bottom)]">
        <button
          type="button"
          onClick={onClick}
          className="flex w-full items-center justify-between px-5 py-3"
        >
          <span className="text-sm text-neutral-500">{label}</span>
          <span className="text-xl font-bold tabular-nums text-primary-700">{value}</span>
        </button>
      </div>
    </div>
  );
}
