import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-md border border-line-strong bg-background px-3 py-2 text-sm tracking-[-0.005em] outline-none transition-[border-color,box-shadow] duration-150",
          "placeholder:text-ink-3",
          "focus-visible:border-accent focus-visible:ring-[3px] focus-visible:ring-accent-soft",
          "disabled:cursor-not-allowed disabled:opacity-60",
          "aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive/20",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
