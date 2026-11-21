interface AdSlotProps {
  slot: 'header' | 'sidebar' | 'below-results' | 'in-content';
  className?: string;
}

export function AdSlot({ slot, className = '' }: AdSlotProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-xl border border-dashed border-border bg-surface/40 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/80 ${className}`}
      data-ad-slot={slot}
      aria-hidden="true"
    >
      <span className="py-3.5">Advertisement</span>
    </div>
  );
}
