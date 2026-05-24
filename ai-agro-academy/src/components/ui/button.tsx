import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "neon"
  size?: "default" | "sm" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full text-sm font-semibold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-[#0A2540] text-white hover:bg-[#1A365D] stripe-shadow-sm hover:-translate-y-0.5": variant === "default",
            "bg-[#635BFF] text-white hover:bg-[#5851E5] stripe-shadow-sm hover:-translate-y-0.5": variant === "neon",
            "bg-white border border-[#E6EBF1] text-[#0A2540] hover:bg-[#F6F9FC] stripe-shadow-sm hover:-translate-y-0.5": variant === "outline",
            "hover:bg-[#E6EBF1]/50 text-[#425466] hover:text-[#0A2540]": variant === "ghost",
            "h-9 px-4 py-2": size === "default",
            "h-8 px-3 text-xs": size === "sm",
            "h-11 px-6 text-base": size === "lg",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
