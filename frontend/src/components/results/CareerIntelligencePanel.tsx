import { useEffect, useState, useCallback } from 'react';
import { motion, animate } from 'framer-motion';
import {
  Briefcase,
  TrendingUp,
  Target,
  Lightbulb,
  Loader2,
  AlertTriangle,
  Zap,
  Shield,
  Rocket,
  Clock,
  DollarSign,
  Award,
  RotateCw,
} from 'lucide-react';
import { fetchCareerIntelligence } from '@/lib/api';
import type { CareerIntelligenceRequest, CareerIntelligenceResponse, CareerPathStage } from '@/types/api';

interface CareerIntelligencePanelProps {
  request: CareerIntelligenceRequest;
  currencySymbol: string;
}

const EASE = [0.25, 1, 0.5, 1] as const;

function formatSalary(value: number, symbol: string) {
  if (value >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${symbol}${(value / 1_000).toFixed(0)}K`;
  return `${symbol}${value.toFixed(0)}`;
}

/* ---------- Outlook risk mapping ---------- */
function getOutlookConfig(outlook: string) {
  const lower = outlook.toLowerCase();
  if (lower.includes('strong') || lower.includes('low risk'))
    return { label: outlook, badge: 'border-success/30 bg-success/10 text-success', dot: 'bg-success' };
  if (lower.includes('risk') || lower.includes('weak'))
    return { label: outlook, badge: 'border-destructive/30 bg-destructive/10 text-destructive', dot: 'bg-destructive' };
  return { label: outlook, badge: 'border-warning/30 bg-warning/10 text-warning', dot: 'bg-warning' };
}

/* ---------- Animated count-up ---------- */
const CountUp = ({ value, decimals = 0, prefix = '', suffix = '' }: { value: number; decimals?: number; prefix?: string; suffix?: string }) => {
  const [display, setDisplay] = useState('0');
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.2,
      ease: [0.25, 1, 0.5, 1],
      onUpdate: (v) => setDisplay(v.toFixed(decimals)),
    });
    return () => controls.stop();
  }, [value, decimals]);
  return <>{prefix}{display}{suffix}</>;
};

/* ---------- Employment bar ---------- */
const EmploymentBar = ({ value, delay, label }: { value: number; delay: number; label: string }) => {
  const pct = Math.round(value * 100);
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4, ease: EASE }}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <span className="text-sm font-semibold tabular-nums text-foreground">
          <CountUp value={pct} />%
        </span>
      </div>
      <div
        className="relative h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: delay + 0.1, duration: 0.8, ease: EASE }}
          className="h-full rounded-full bg-primary"
        />
      </div>
    </motion.div>
  );
};

/* ---------- Salary card ---------- */
const SalaryCard = ({
  label, value, symbol, variant, delay,
}: {
  label: string; value: number; symbol: string; variant: 'conservative' | 'expected' | 'optimistic'; delay: number;
}) => {
  const config = {
    conservative: { icon: Shield, textClass: 'text-foreground', borderClass: 'border-border' },
    expected: { icon: Target, textClass: 'text-primary', borderClass: 'border-primary/40 bg-primary/[0.04]' },
    optimistic: { icon: Rocket, textClass: 'text-foreground', borderClass: 'border-border' },
  }[variant];

  const Icon = config.icon;
  const isExpected = variant === 'expected';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: EASE }}
      className={`relative overflow-hidden rounded-2xl border p-4 ${config.borderClass}`}
    >
      <div className="mb-2 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        <span className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <div className={`text-xl font-bold tracking-tight tabular-nums sm:text-2xl ${config.textClass}`}>
        <CountUp value={value} prefix={symbol} />
      </div>
      {isExpected && (
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-2xs font-semibold uppercase tracking-wider text-primary">
          <Zap className="h-2.5 w-2.5" aria-hidden="true" /> Most likely
        </span>
      )}
    </motion.div>
  );
};

/* ---------- Timeline node ---------- */
const TimelineNode = ({
  stage, index, total, symbol, delay,
}: {
  stage: CareerPathStage; index: number; total: number; symbol: string; delay: number;
}) => {
  const colors = ['#2a4bd0', '#0f766e', '#15803d'];
  const icons = [Briefcase, TrendingUp, Award];
  const color = colors[index % colors.length];
  const Icon = icons[index % icons.length];

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.45, ease: EASE }}
      className="relative pb-4 pl-10 last:pb-0"
    >
      {index < total - 1 && (
        <div
          className="absolute bottom-0 left-[15px] top-8 w-px bg-border"
          aria-hidden="true"
        />
      )}

      <div
        className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface"
      >
        <Icon className="h-3.5 w-3.5" style={{ color }} aria-hidden="true" />
      </div>

      <div className="rounded-xl border border-border bg-background/40 p-4 transition-colors hover:bg-surface/60">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-foreground">{stage.stage}</h4>
          <span className="rounded-full bg-surface px-2 py-0.5 font-mono text-2xs text-muted-foreground">{stage.years} yrs</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">{stage.roleFocus}</span>
          <span className="text-sm font-bold tabular-nums" style={{ color }}>
            {formatSalary(stage.avgSalary, symbol)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

/* ========== Main component ========== */
export const CareerIntelligencePanel = ({ request, currencySymbol }: CareerIntelligencePanelProps) => {
  const [data, setData] = useState<CareerIntelligenceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Depend on the individual values, not the object identity: Results builds a
  // fresh request object on every render, which would otherwise re-fetch forever.
  const {
    majorId, countryCode, degreeLevelId, expectedSalaryAfter, durationYears, roiPercentage,
  } = request;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCareerIntelligence({
        majorId, countryCode, degreeLevelId, expectedSalaryAfter, durationYears, roiPercentage,
      });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load career data');
    } finally {
      setLoading(false);
    }
  }, [majorId, countryCode, degreeLevelId, expectedSalaryAfter, durationYears, roiPercentage]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="mt-10 rounded-2xl border border-border bg-card p-8 shadow-card" aria-live="polite">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
          <span className="text-sm text-muted-foreground">Analysing career intelligence…</span>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mt-10 rounded-2xl border border-border bg-card p-8 text-center shadow-card" role="alert">
        <AlertTriangle className="mx-auto h-5 w-5 text-warning" aria-hidden="true" />
        <p className="mt-2 text-sm text-muted-foreground">{error || 'Career data unavailable'}</p>
        <button
          type="button"
          onClick={load}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface"
        >
          <RotateCw className="h-3.5 w-3.5" aria-hidden="true" /> Try again
        </button>
      </div>
    );
  }

  const outlook = getOutlookConfig(data.marketOutlook);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className="relative mt-14"
    >
      {/* Section header */}
      <div className="mb-6 text-center">
        <span className="eyebrow">
          <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
          Career intelligence
        </span>
        <h2 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
          Career outcome intelligence
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
          Data-driven projections for your post-degree career trajectory.
        </p>
      </div>

      {/* Market outlook badge */}
      <div className="mb-6 flex justify-center">
        <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${outlook.badge}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${outlook.dot}`} aria-hidden="true" />
          {outlook.label}
        </div>
      </div>

      {/* Executive insight */}
      <div className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-start gap-4">
          <div className="shrink-0 rounded-lg border border-border bg-surface p-2.5">
            <Lightbulb className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h3 className="mb-1.5 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Executive insight</h3>
            <p className="text-base font-medium leading-relaxed text-foreground/90">{data.insight}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          {/* Employment probability */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
            <h3 className="mb-5 flex items-center gap-2 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Target className="h-4 w-4" aria-hidden="true" />
              Employment probability
            </h3>
            <div className="space-y-4">
              <EmploymentBar value={data.employmentProbability['3_months']} delay={0.2} label="Within 3 months" />
              <EmploymentBar value={data.employmentProbability['6_months']} delay={0.3} label="Within 6 months" />
              <EmploymentBar value={data.employmentProbability['12_months']} delay={0.4} label="Within 12 months" />
            </div>
          </div>

          {/* Salary confidence band */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 px-1 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
              <DollarSign className="h-4 w-4" aria-hidden="true" />
              Salary confidence band
            </h3>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              <SalaryCard label="Conservative" value={data.salaryBand.conservative} symbol={currencySymbol} variant="conservative" delay={0.3} />
              <SalaryCard label="Expected" value={data.salaryBand.expected} symbol={currencySymbol} variant="expected" delay={0.4} />
              <SalaryCard label="Optimistic" value={data.salaryBand.optimistic} symbol={currencySymbol} variant="optimistic" delay={0.5} />
            </div>
          </div>
        </div>

        <div>
          {/* Career growth timeline */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
            <h3 className="mb-6 flex items-center gap-2 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
              Career growth timeline
            </h3>
            <div>
              {data.careerPath.map((stage, i) => (
                <TimelineNode
                  key={stage.stage}
                  stage={stage}
                  index={i}
                  total={data.careerPath.length}
                  symbol={currencySymbol}
                  delay={0.3 + i * 0.08}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
