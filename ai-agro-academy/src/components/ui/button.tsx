import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-slate-950 shadow-[0_0_15px_rgba(45,212,191,0.2)] hover:bg-primary/90 hover:shadow-[0_0_25px_rgba(45,212,191,0.4)] hover:-translate-y-0.5",
        destructive: "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:bg-red-600 hover:shadow-[0_0_25px_rgba(239,68,68,0.4)] hover:-translate-y-0.5",
        outline: "border border-slate-700 bg-slate-950/50 text-slate-300 hover:bg-slate-800 hover:text-white hover:-translate-y-0.5 hover:border-slate-500",
        secondary: "bg-slate-800 text-white hover:bg-slate-700 hover:-translate-y-0.5 shadow-sm",
        ghost: "text-slate-400 hover:bg-white/10 hover:text-white",
        link: "text-primary underline-offset-4 hover:underline",
        neon: "bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:bg-indigo-400 hover:-translate-y-0.5 hover:shadow-[0_0_35px_rgba(99,102,241,0.5)]",
        glass: "bg-white/5 border border-white/10 text-white backdrop-blur-md hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(0,0,0,0.3)]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
