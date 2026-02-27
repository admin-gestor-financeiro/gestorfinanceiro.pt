"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

type CollapsibleProps = {
  trigger: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
};

export function Collapsible({
  trigger,
  children,
  defaultOpen = false,
  className,
  triggerClassName,
  contentClassName,
}: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn("w-full", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between text-left",
          triggerClassName
        )}
        aria-expanded={open}
      >
        {trigger}
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-neutral-400" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-neutral-400" />
        )}
      </button>

      {open && <div className={cn(contentClassName)}>{children}</div>}
    </div>
  );
}
