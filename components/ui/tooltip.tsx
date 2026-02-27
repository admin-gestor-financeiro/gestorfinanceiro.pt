"use client";

import { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

type TooltipProps = {
  content: string;
  className?: string;
};

export function Tooltip({ content, className }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click / focus-out
  useEffect(() => {
    function handler(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setVisible(false);
      }
    }
    if (visible) {
      document.addEventListener("mousedown", handler);
      document.addEventListener("touchstart", handler);
    }
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [visible]);

  return (
    <div ref={ref} className={cn("relative inline-flex items-center", className)}>
      <button
        type="button"
        aria-label="Mais informação"
        onClick={() => setVisible((v) => !v)}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="text-neutral-400 hover:text-primary-500 transition-colors"
      >
        <Info className="h-3.5 w-3.5" />
      </button>

      {visible && (
        <div
          role="tooltip"
          className={cn(
            "absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2",
            "rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-lg",
            "text-xs leading-relaxed text-neutral-600"
          )}
        >
          {content}
          {/* Arrow */}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-neutral-200" />
        </div>
      )}
    </div>
  );
}
