import { motion, animate } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  delay: number;
  tone?: 'default' | 'positive' | 'warning';
}

/** Extracts a numeric portion from a formatted string like "$123K" or "4.5%" */
function parseDisplayValue(str: string): { prefix: string; num: number; suffix: string; decimals: number } {
  const match = str.match(/^([^0-9-]*)([-\d.]+)(.*)$/);
  if (!match) return { prefix: '', num: 0, suffix: str, decimals: 0 };
  const num = parseFloat(match[2]);
  const decPart = match[2].includes('.') ? match[2].split('.')[1].length : 0;
  return { prefix: match[1], num, suffix: match[3], decimals: decPart };
}

const CountUpValue = ({ value, className }: { value: string; className: string }) => {
  const { prefix, num, suffix, decimals } = parseDisplayValue(value);
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    const controls = animate(0, num, {
      duration: 1.2,
      ease: [0.25, 1, 0.5, 1],
      onUpdate: (v) => setDisplay(v.toFixed(decimals)),
    });
    return () => controls.stop();
  }, [num, decimals]);

  return <div className={className}>{prefix}{display}{suffix}</div>;
};

const toneStyles = {
  default: 'text-foreground',
  positive: 'text-success',
  warning: 'text-warning',
} as const;

export const MetricCard = ({ label, value, icon: Icon, delay, tone = 'default' }: MetricCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
    className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-card"
  >
    <div className="flex items-start justify-between gap-3">
      <span className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
    </div>
    <CountUpValue
      value={value}
      className={cn('mt-3 text-2xl font-bold tracking-tight tabular-nums sm:text-3xl', toneStyles[tone])}
    />
  </motion.div>
);
