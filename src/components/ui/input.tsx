import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "h-11 w-full rounded-2xl border border-foreground/10 bg-white/80 px-4 text-sm text-foreground shadow-sm backdrop-blur placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";