import { motion } from 'framer-motion';
import { Lightbulb, CheckCircle2 } from 'lucide-react';

interface RecommendationsCardProps {
  recommendations: string[];
}

export const RecommendationsCard = ({ recommendations }: RecommendationsCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.7, duration: 0.6 }}
    className="glass-card p-6"
  >
    <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
      <span className="inline-flex rounded-xl bg-warning/10 p-2 text-warning">
        <Lightbulb className="h-4 w-4" aria-hidden="true" />
      </span>
      Recommendations
    </h2>
    <ul className="mt-4 space-y-3">
      {recommendations.map((rec, i) => (
        <motion.li
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 + i * 0.08 }}
          className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" aria-hidden="true" />
          {rec}
        </motion.li>
      ))}
    </ul>
  </motion.div>
);
