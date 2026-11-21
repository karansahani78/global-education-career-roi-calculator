import { motion } from 'framer-motion';

interface SummaryCardProps {
  items: [string, string][];
}

export const SummaryCard = ({ items }: SummaryCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5, duration: 0.45 }}
    className="rounded-xl border border-border bg-card p-5 shadow-card"
  >
    <h3 className="text-sm font-semibold text-foreground">Summary</h3>
    <dl className="mt-4 space-y-3 text-sm">
      {items.map(([label, value]) => (
        <div key={label} className="flex items-baseline justify-between gap-4">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="font-semibold tabular-nums text-foreground">{value}</dd>
        </div>
      ))}
    </dl>
  </motion.div>
);
