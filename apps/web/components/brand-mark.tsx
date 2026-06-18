import { cn } from "@/lib/utils";

interface BrandMarkProps {
  size?: number;
  className?: string;
}

/**
 * Geometric raven silhouette — Krewo logo mark.
 * Pure SVG so it scales and inherits color from the current token.
 */
export function BrandMark({ size = 28, className }: BrandMarkProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-foreground text-accent",
        className,
      )}
      style={{ width: size, height: size }}
      aria-label="Krewo"
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.66}
        height={size * 0.66}
        fill="currentColor"
        aria-hidden
      >
        <path d="M4 13.5c0-3.3 2.4-6 5.8-6.4l3.4-.4-2 2.9 3.7-.1-2 2.4 4.1-.2c2.2 0 3 1 3 2.3 0 1.6-1.4 3-3.6 3h-1.2v1.8h-2.2v-1.8H8.2c-2.6 0-4.2-1.5-4.2-3.5Z" />
        <circle cx="15.4" cy="12.4" r="0.9" fill="var(--background)" />
      </svg>
    </span>
  );
}
