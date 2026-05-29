"use client";

import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: "h-8 w-8 min-h-8 min-w-8",
  md: "h-10 w-10 min-h-10 min-w-10",
  lg: "h-14 w-14 min-h-14 min-w-14",
} as const;

const iconMap = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-6 w-6",
} as const;

type AiAvatarProps = {
  className?: string;
  size?: keyof typeof sizeMap;
  icon?: LucideIcon;
  label?: string;
};

/**
 * Gradient “halo” avatar for AI / faculty — pairs with dark glass UI.
 */
export function AiAvatar({ className, size = "md", icon: Icon = Sparkles, label }: AiAvatarProps) {
  return (
    <div
      className={cn("relative rounded-full", sizeMap[size], className)}
      aria-hidden={label ? undefined : true}
      title={label}
    >
      <span
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-teal-400 via-cyan-400 to-violet-500 opacity-95 shadow-[0_0_24px_-6px_rgb(45_212_191/0.55)]"
        aria-hidden
      />
      <span
        className={cn(
          "absolute inset-[2px] flex items-center justify-center rounded-full bg-background/95 ring-1 ring-white/10",
        )}
      >
        <Icon className={cn(iconMap[size], "text-primary")} strokeWidth={2.25} />
      </span>
    </div>
  );
}
