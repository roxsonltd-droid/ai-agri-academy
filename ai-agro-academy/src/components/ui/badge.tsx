import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-slate-950 backdrop-blur-sm",
  {
    variants: {
      variant: {
        default: "border-primary/20 bg-primary/10 text-primary shadow-[0_0_10px_rgba(45,212,191,0.1)]",
        secondary: "border-slate-700 bg-slate-800 text-slate-300",
        destructive: "border-red-500/20 bg-red-500/10 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.1)]",
        outline: "border-slate-700 text-slate-300",
        accent: "border-indigo-500/20 bg-indigo-500/10 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.1)]",
        glass: "border-white/10 bg-white/5 text-white shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
