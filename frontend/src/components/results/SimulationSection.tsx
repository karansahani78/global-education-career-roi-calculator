import { useState, useEffect, useCallback } from 'react';
import { motion, animate } from 'framer-motion';
import {
  Shield,
  Zap,
  Sparkles,
  Loader2,
  BarChart3,
  Play,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { simulateRoi } from '@/lib/api';
import type { RoiCalculationRequest, SimulationResponse, SimulationScenario } from '@/types/api';

interface SimulationSectionProps {
  baseRequest: RoiCalculationRequest;
  currencySymbol: string;
}

const SCENARIO_CONFIG = {
  CONSERVATIVE: {
    label: 'Conservative',
    subtitle: 'Worst-case scenario',
    icon: Shield,
    color: '#656975',
    textClass: 'text-muted-foreground',
    barColor: '#656975',
  },
  EXPECTED: {
    label: 'Expected',
    subtitle: 'Most likely outcome',
    icon: Zap,
    color: '#2a4bd0',
    textClass: 'text-primary',
    barColor: '#2a4bd0',
    highlighted: true,
  },
  OPTIMISTIC: {
    label: 'Optimistic',
    subtitle: 'Best-case growth',
    icon: Sparkles,
    color: '#15803d',
    textClass: 'text-success',
    barColor: '#15803d',
  },
} as const;

function formatCurrency(value: number, symbol = '$') {
  if (Math.abs(value) >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${symbol}${(value / 1_000).toFixed(0)}K`;
  return `${symbol}${value.toFixed(0)}`;
}

/** Animated number that counts up */
const CountUp = ({ value, decimals = 0, suffix = '' }: { value: number; decimals?: number; suffix?: string }) => {
  const [display, setDisplay] = useState('0');
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1,
      ease: [0.25, 1, 0.5, 1],
      onUpdate: (v) => setDisplay(v.toFixed(decimals)),
    });
    return () => controls.stop();
  }, [value, decimals]);
  return <>{display}{suffix}</>;
};

/** Animated confidence ring */
const ConfidenceRing = ({ score, color }: { score: number; color: string }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  useEffect(() => {
    const controls = animate(0, score, {
      duration: 1.2,
      ease: [0.25, 1, 0.5, 1],
      onUpdate: (v) => setAnimatedScore(v),
    });
    return () => controls.stop();
  }, [score]);

  const circumference = 2 * Math.PI * 28;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="relative h-16 w-16 flex-shrink-0" role="img" aria-label={`Confidence score ${Math.round(score)} percent`}>
      <svg className="h-full w-full -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(28,37,58,0.12)" strokeWidth="4" />
        <circle
          cx="32" cy="32" r="28" fill="none"
          stroke={color} strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold tabular-nums text-foreground">{Math.round(animatedScore)}%</span>
      </div>
    </div>
  );
};

const ScenarioCard = ({
  scenario,
  config,
  currencySymbol,
  index,
}: {
  scenario: SimulationScenario;
  config: typeof SCENARIO_CONFIG[keyof typeof SCENARIO_CONFIG];
  currencySymbol: string;
  index: number;
}) => {
  const Icon = config.icon;
  const isHighlighted = 'highlighted' in config && config.highlighted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 + index * 0.08, duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
      className={`relative overflow-hidden rounded-2xl border bg-card p-5 shadow-card ${
        isHighlighted ? 'border-primary/40' : 'border-border'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{config.label}</h3>
            <span className="text-2xs uppercase tracking-wider text-muted-foreground">
              {config.subtitle}
            </span>
          </div>
        </div>
        <ConfidenceRing score={scenario.confidenceScore} color={config.color} />
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <div className="mb-1 text-2xs uppercase tracking-wider text-muted-foreground">ROI</div>
          <div className={`text-3xl font-bold tracking-tight tabular-nums ${config.textClass}`}>
            <CountUp value={scenario.roiPercentage} decimals={1} suffix="%" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-border pt-4">
          <div>
            <div className="mb-0.5 text-2xs uppercase tracking-wider text-muted-foreground">Net ROI</div>
            <div className="text-base font-semibold tabular-nums text-foreground">
              {currencySymbol}<CountUp value={scenario.netRoi / 1000} decimals={0} />K
            </div>
          </div>
          <div>
            <div className="mb-0.5 text-2xs uppercase tracking-wider text-muted-foreground">Break-even</div>
            <div className="text-base font-semibold tabular-nums text-foreground">
              <CountUp value={scenario.breakEvenYears} decimals={0} /> yrs
            </div>
          </div>
        </div>

        <p className="border-t border-border pt-3 text-xs italic leading-relaxed text-muted-foreground">
          “{scenario.insight}”
        </p>
      </div>
    </motion.div>
  );
};

export const SimulationSection = ({ baseRequest, currencySymbol }: SimulationSectionProps) => {
  const [salaryVariation, setSalaryVariation] = useState(10);
  const [costVariation, setCostVariation] = useState(10);
  const [simulation, setSimulation] = useState<SimulationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);

  const runSimulation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await simulateRoi({
        baseRequest,
        salaryVariationPercent: salaryVariation,
        costVariationPercent: costVariation,
      });
      setSimulation(data);
      setHasRun(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulation failed');
    } finally {
      setLoading(false);
    }
  }, [baseRequest, salaryVariation, costVariation]);

  // Debounced re-run when sliders change (only after first manual run)
  useEffect(() => {
    if (!hasRun) return;
    const timer = setTimeout(runSimulation, 600);
    return () => clearTimeout(timer);
  }, [salaryVariation, costVariation]); // eslint-disable-line react-hooks/exhaustive-deps

  // Ordered scenarios
  const orderedScenarios = simulation
    ? (['CONSERVATIVE', 'EXPECTED', 'OPTIMISTIC'] as const).map(
        (key) => simulation.scenarios.find((s) => s.scenario === key)!
      ).filter(Boolean)
    : [];

  // Bar chart data
  const barData = orderedScenarios.map((s) => ({
    name: SCENARIO_CONFIG[s.scenario].label,
    roi: s.roiPercentage,
    color: SCENARIO_CONFIG[s.scenario].barColor,
  }));

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="mt-14"
    >
      {/* Section header */}
      <div className="mb-6 text-center">
        <span className="eyebrow">
          <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
          Scenario analysis
        </span>
        <h2 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">ROI simulation</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          Explore how salary and cost variations impact your education investment.
        </p>
      </div>

      {/* Controls / empty state */}
      {!hasRun ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-card">
          <p className="mx-auto mb-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
            See how different salary and cost assumptions affect your ROI across three scenarios.
          </p>
          <Button onClick={runSimulation} disabled={loading} className="gap-2 px-6">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Play className="h-4 w-4" aria-hidden="true" />
            )}
            Simulate outcomes
          </Button>
        </div>
      ) : (
        <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground" id="salary-variation-label">
                  Salary variation
                </span>
                <span className="font-mono text-sm font-semibold text-primary">±{salaryVariation}%</span>
              </div>
              <Slider
                value={[salaryVariation]}
                onValueChange={([v]) => setSalaryVariation(v)}
                min={5}
                max={30}
                step={1}
                className="w-full"
                aria-label="Salary variation percentage"
              />
            </div>
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground" id="cost-variation-label">
                  Cost variation
                </span>
                <span className="font-mono text-sm font-semibold text-primary">±{costVariation}%</span>
              </div>
              <Slider
                value={[costVariation]}
                onValueChange={([v]) => setCostVariation(v)}
                min={5}
                max={30}
                step={1}
                className="w-full"
                aria-label="Cost variation percentage"
              />
            </div>
          </div>
          {loading && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground" aria-live="polite">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Simulating…
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-center gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive" role="alert">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      {simulation && !loading && (
        <>
          {/* Scenario cards */}
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            {orderedScenarios.map((scenario, i) => (
              <ScenarioCard
                key={scenario.scenario}
                scenario={scenario}
                config={SCENARIO_CONFIG[scenario.scenario]}
                currencySymbol={currencySymbol}
                index={i}
              />
            ))}
          </div>

          {/* Summary insight */}
          {simulation.summaryInsight && (
            <div className="mb-6 rounded-2xl border border-border bg-card/60 p-5 text-center">
              <p className="mx-auto max-w-lg text-sm leading-relaxed text-muted-foreground">
                {simulation.summaryInsight}
              </p>
            </div>
          )}

          {/* ROI bar chart */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
            <h3 className="mb-4 text-base font-semibold text-foreground">ROI comparison</h3>
            <div className="h-64" role="img" aria-label="Bar chart comparing ROI across three scenarios">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(28,37,58,0.08)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="rgba(28,37,58,0.16)"
                    tick={{ fill: '#656975', fontSize: 12, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickFormatter={(v) => `${v}%`}
                    stroke="rgba(28,37,58,0.16)"
                    tick={{ fill: '#656975', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={44}
                  />
                  <Tooltip
                    formatter={(v: number) => [`${v.toFixed(1)}%`, 'ROI']}
                    contentStyle={{
                      background: '#ffffff',
                      border: '1px solid #dedfdc',
                      borderRadius: '12px',
                      color: '#1c253a',
                      fontSize: '13px',
                      fontWeight: 600,
                      boxShadow: '0 12px 32px -20px rgba(28,37,58,0.35)',
                    }}
                    itemStyle={{ color: '#1c253a' }}
                    labelStyle={{ color: '#656975', fontWeight: 500 }}
                    cursor={{ fill: 'rgba(28,37,58,0.05)' }}
                  />
                  <Bar dataKey="roi" radius={[6, 6, 0, 0]} animationDuration={900} animationEasing="ease-out">
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </motion.section>
  );
};
