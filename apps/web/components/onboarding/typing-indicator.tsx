export function TypingIndicator() {
  return (
    <div className="inline-flex items-center gap-1.5 self-start rounded-2xl border border-line bg-surface-2 px-3 py-1.5 animate-slide-in-left">
      <span className="flex gap-[3px]">
        {[0, 0.2, 0.4].map((d) => (
          <span
            key={d}
            className="h-[5px] w-[5px] rounded-full bg-ink-3 animate-typing"
            style={{ animationDelay: `${d}s` }}
          />
        ))}
      </span>
    </div>
  );
}
