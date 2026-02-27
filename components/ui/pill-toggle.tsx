"use client";

import { cn } from "@/lib/utils";

type Option<T extends string> = {
  value: T;
  label: string;
};

type PillToggleProps<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export function PillToggle<T extends string>({
  options,
  value,
  onChange,
  className,
}: PillToggleProps<T>) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors",
            value === opt.value
              ? "border-primary-600 bg-primary-600 text-white"
              : "border-neutral-300 bg-white text-neutral-700 hover:border-primary-400 hover:text-primary-700"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
