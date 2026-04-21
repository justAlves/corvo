import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const chipVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.04em]",
  {
    variants: {
      variant: {
        default: "border-border bg-surface-2 text-ink-2",
        accent:
          "border-accent-line bg-accent-soft text-accent-foreground dark:text-foreground",
        outline: "border-border bg-transparent text-ink-2",
        solid: "border-transparent bg-foreground text-background",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface ChipProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof chipVariants> {}

const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(
  ({ className, variant, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(chipVariants({ variant, className }))}
      {...props}
    />
  ),
);
Chip.displayName = "Chip";

export { Chip, chipVariants };
