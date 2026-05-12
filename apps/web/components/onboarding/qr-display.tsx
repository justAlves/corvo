"use client";

import { Check } from "lucide-react";
import { useMemo } from "react";

import { cn } from "@/lib/utils";

interface QrDisplayProps {
  progress: number;
  done: boolean;
  src?: string | null;
  loading?: boolean;
}

const N = 21;

export function QrDisplay({ progress, done, src, loading }: QrDisplayProps) {
  const cells = useMemo(() => {
    const rng = (i: number, j: number) =>
      (i * 31 + j * 17 + i * j * 7) % 13 < 5;
    return Array.from({ length: N }, (_, i) =>
      Array.from({ length: N }, (_, j) => rng(i, j)),
    );
  }, []);

  const isFinder = (i: number, j: number) =>
    (i < 7 && j < 7) || (i < 7 && j > N - 8) || (i > N - 8 && j < 7);

  const showScan = !done && !!src;
  const showPlaceholder = !src;

  return (
    <div className="relative h-[220px] w-[220px] rounded-lg border border-line bg-background p-2.5">
      {/* Scan line — only while scanning a real QR */}
      {showScan && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-2.5 top-2.5 h-10 animate-scan rounded-md bg-gradient-to-b from-transparent via-accent/40 to-transparent blur-sm"
        />
      )}

      {src ? (
        <img
          src={src}
          alt="WhatsApp QR code"
          className={cn(
            "h-full w-full rounded-md transition-opacity duration-500",
            done && "opacity-30",
          )}
        />
      ) : (
        <svg
          viewBox={`0 0 ${N} ${N}`}
          width="100%"
          height="100%"
          className={cn(
            "transition-opacity duration-500",
            done ? "opacity-30" : loading ? "opacity-40" : "opacity-60",
          )}
        >
          {cells.map((row, i) =>
            row.map((on, j) => {
              if (isFinder(i, j)) return null;
              return on ? (
                <rect
                  key={`${i}-${j}`}
                  x={j}
                  y={i}
                  width="1"
                  height="1"
                  fill="currentColor"
                  className="text-foreground"
                />
              ) : null;
            }),
          )}
          {(
            [
              [0, 0],
              [0, N - 7],
              [N - 7, 0],
            ] as const
          ).map(([x, y], i) => (
            <g key={i}>
              <rect
                x={y}
                y={x}
                width="7"
                height="7"
                fill="currentColor"
                className="text-foreground"
              />
              <rect
                x={y + 1}
                y={x + 1}
                width="5"
                height="5"
                fill="currentColor"
                className="text-background"
              />
              <rect
                x={y + 2}
                y={x + 2}
                width="3"
                height="3"
                fill="currentColor"
                className="text-foreground"
              />
            </g>
          ))}
        </svg>
      )}

      {done && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="grid h-14 w-14 animate-pop-in place-items-center rounded-full bg-accent text-accent-foreground shadow-lg shadow-accent/40">
            <Check className="size-7" strokeWidth={3} />
          </div>
        </div>
      )}

      {loading && !done && showPlaceholder && (
        <div className="absolute inset-0 grid place-items-center">
          <span className="mono text-[11px] uppercase tracking-[0.08em] text-ink-3">
            gerando QR…
          </span>
        </div>
      )}

      {/* Corner markers animated while connecting */}
      {!done && progress > 0 && (
        <>
          {[
            "top-1 left-1 border-t-2 border-l-2",
            "top-1 right-1 border-t-2 border-r-2",
            "bottom-1 left-1 border-b-2 border-l-2",
            "bottom-1 right-1 border-b-2 border-r-2",
          ].map((pos) => (
            <span
              key={pos}
              className={cn(
                "absolute h-3 w-3 rounded-[3px] border-accent transition-opacity",
                pos,
              )}
            />
          ))}
        </>
      )}
    </div>
  );
}
