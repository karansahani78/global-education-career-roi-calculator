import { useEffect, useState, useCallback } from 'react';
import { motion, animate } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Brain,
  ChevronDown,
  Share2,
  BarChart3,
  RotateCw,
} from 'lucide-react';
import { fetchDecisionConfidence } from '@/lib/api';
import type { RoiCalculationRequest, DecisionConfidenceResponse } from '@/types/api';
import { AdSlot } from '@/components/ads/AdSlot';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Props {
  baseRequest: RoiCalculationRequest;
}

const LEVEL_STYLE = {
  HIGH: {
    label: 'High confidence',
    bg: 'bg-success/10',
    text: 'text-success',
    border: 'border-success/30',
    icon: CheckCircle2,
  },
  MODERATE: {
    label: 'Moderate confidence',
    bg: 'bg-warning/10',
    text: 'text-warning',
    border: 'border-warning/30',
    icon: AlertTriangle,
  },
  LOW: {
    label: 'Low confidence',
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    border: 'border-destructive/30',
    icon: AlertTriangle,
  },
} as const;

type NormalizedLevel = keyof typeof LEVEL_STYLE;

const normalizeLevel = (level?: string): NormalizedLevel => {
  if (!level) return 'MODERATE';
  const lower = level.toLowerCase();
  if (lower.includes('high')) return 'HIGH';
  if (lower.includes('low')) return 'LOW';
  return 'MODERATE';
};

/** Animated arc gauge */
const ArcGauge = ({ score }: { score: number }) => {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const ctrl = animate(0, score, {
      duration: 1.4,
      ease: [0.25, 1, 0.5, 1],
      onUpdate: (v) => setAnimated(v),
    });
    return () => ctrl.stop();
  }, [score]);

  const radius = 80;
  const cx = 100;
  const cy = 100;
  const startAngle = 225;
  const totalSweep = 270;
  const sweepAngle = (animated / 100) * totalSweep;

  const toRad = (d: number) => (d * Math.PI) / 180;
  const arcEnd = startAngle - sweepAngle;

  const x1 = cx + radius * Math.cos(toRad(startAngle));
  const y1 = cy - radius * Math.sin(toRad(startAngle));
  const x2 = cx + radius * Math.cos(toRad(arcEnd));
  const y2 = cy - radius * Math.sin(toRad(arcEnd));

  const largeArc = sweepAngle > 180 ? 1 : 0;

  const trackEnd = startAngle - totalSweep;
  const tx2 = cx + radius * Math.cos(toRad(trackEnd));
  const ty2 = cy - radius * Math.sin(toRad(trackEnd));

  return (
    <div
      className="relative mx-auto h-[200px] w-[200px]"
      role="img"
      aria-label={`Confidence score ${Math.round(score)} out of 100`}
    >
      <svg viewBox="0 0 200 200" className="h-full w-full">
        <defs>
          <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2a4bd0" />
            <stop offset="100%" stopColor="#0f766e" />
          </linearGradient>
        </defs>
        <path
          d={`M ${x1} ${y1} A ${radius} ${radius} 0 1 0 ${tx2} ${ty2}`}
          fill="none"
          stroke="rgba(28,37,58,0.12)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {animated > 0.5 && (
          <path
            d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 0 ${x2} ${y2}`}
            fill="none"
            stroke="url(#gauge-gradient)"
            strokeWidth="10"
            strokeLinecap="round"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
        <span className="text-5xl font-extrabold tracking-tight tabular-nums text-foreground">
          {Math.round(animated)}
        </span>
        <span className="mt-1 text-xs font-medium tracking-wider text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
};

export const DecisionConfidenceSection = ({ baseRequest }: Props) => {
  const [data, setData] = useState<DecisionConfidenceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDecisionConfidence(baseRequest);
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load confidence data');
    } finally {
      setLoading(false);
    }
  }, [baseRequest]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16" aria-live="polite">
        <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
        <span className="ml-3 text-sm text-muted-foreground">Analysing confidence…</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-card" role="alert">
        <AlertTriangle className="mx-auto h-5 w-5 text-warning" aria-hidden="true" />
        <p className="mt-2 text-sm text-muted-foreground">
          {error || 'Confidence data is unavailable for this calculation.'}
        </p>
        <Button variant="outline" size="sm" onClick={load} className="mt-4 gap-2">
          <RotateCw className="h-3.5 w-3.5" aria-hidden="true" /> Try again
        </Button>
      </div>
    );
  }

  const normalizedLevel = normalizeLevel(data.confidenceLevel);
  const levelStyle = LEVEL_STYLE[normalizedLevel];
  const LevelIcon = levelStyle.icon;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
      className="mb-14 mt-10"
    >
      {/* Section header */}
      <div className="mb-6 text-center">
        <span className="eyebrow">
          <Brain className="h-3.5 w-3.5" aria-hidden="true" />
          Decision intelligence
        </span>
        <h2 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
          Decision confidence score
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          How strong is this education decision?
        </p>
      </div>

      {/* Main card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card md:p-8">
        <div className="relative z-10 grid items-center gap-10 md:grid-cols-2">
          {/* Gauge + badge */}
          <div className="flex flex-col items-center">
            <ArcGauge score={data.confidenceScore} />

            <div className={`mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold ${levelStyle.bg} ${levelStyle.text} ${levelStyle.border}`}>
              <LevelIcon className="h-4 w-4" aria-hidden="true" />
              {levelStyle.label}
            </div>

            <AdSlot slot="in-content" className="mt-6 w-full max-w-xs" />
          </div>

          {/* Positives, risks, summary */}
          <div className="space-y-6">
            {data.positives.length > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                  Strengths
                </h3>
                <ul className="space-y-2.5">
                  {data.positives.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" aria-hidden="true" />
                      <span className="text-sm leading-relaxed text-foreground/85">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <AdSlot slot="in-content" className="w-full" />

            {data.risks.length > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <AlertTriangle className="h-3.5 w-3.5 text-warning" aria-hidden="true" />
                  Considerations
                </h3>
                <ul className="space-y-2.5">
                  {data.risks.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" aria-hidden="true" />
                      <span className="text-sm leading-relaxed text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="border-t border-border pt-5">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {data.summary}
              </p>
            </div>

            <AdSlot slot="below-results" className="w-full" />
          </div>
        </div>
      </div>

      {/* Engagement hooks */}
      <div className="mt-5 space-y-3">
        <Collapsible>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 text-sm font-medium text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&[data-state=open]>svg]:rotate-180">
            <span>Why this confidence score?</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" aria-hidden="true" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-1 rounded-2xl border border-border bg-card px-5 py-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your Decision Confidence Score is calculated by our backend engine based on multiple factors including ROI strength, market demand for your major, cost-to-earnings ratio, and regional economic indicators. A score of <strong className="font-semibold text-foreground">{data.confidenceScore}/100</strong> with <strong className={`font-semibold ${levelStyle.text}`}>{levelStyle.label}</strong> means the data supports this education investment at that level.
            </p>
          </CollapsibleContent>
        </Collapsible>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              const url = window.location.href;
              navigator.clipboard.writeText(url).then(() => {
                toast({ title: 'Link copied', description: 'Share your decision confidence score with others.' });
              });
            }}
          >
            <Share2 className="h-4 w-4" aria-hidden="true" />
            Share your decision score
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => window.open('/compare', '_self')}
          >
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
            Compare with similar choices
          </Button>
        </div>
      </div>
    </motion.section>
  );
};
