import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Clock,
  DollarSign,
  Briefcase,
  BarChart3,
  Loader2,
  CircleCheck,
  CircleHelp,
  CircleX,
  RotateCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdSlot } from '@/components/ads/AdSlot';
import { fetchDegreeWorthIt } from '@/lib/api';
import type { DegreeWorthItResponse } from '@/types/api';
import { useEffect, useState } from 'react';
import { animate } from 'framer-motion';

/* ── Verdict styling ── */
const VERDICT_STYLE = {
  'Worth It': {
    bg: 'bg-success/10',
    text: 'text-success',
    border: 'border-success/30',
    icon: CircleCheck,
  },
  'Depends': {
    bg: 'bg-warning/10',
    text: 'text-warning',
    border: 'border-warning/30',
    icon: CircleHelp,
  },
  'Not Worth It': {
    bg: 'bg-danger/10',
    text: 'text-danger',
    border: 'border-danger/30',
    icon: CircleX,
  },
} as const;

const getVerdictStyle = (verdict?: string) => {
  if (verdict && verdict in VERDICT_STYLE) return VERDICT_STYLE[verdict as keyof typeof VERDICT_STYLE];
  return VERDICT_STYLE['Depends'];
};

/* ── Confidence level styling ── */
const CONFIDENCE_STYLE: Record<string, { color: string; trackColor: string; label: string }> = {
  VeryHigh: { color: '#15803d', trackColor: 'rgba(21,128,61,0.12)', label: 'Very High' },
  High:     { color: '#0f766e', trackColor: 'rgba(15,118,110,0.12)', label: 'High' },
  Moderate: { color: '#b45309', trackColor: 'rgba(180,83,9,0.12)', label: 'Moderate' },
  Low:      { color: '#c2410c', trackColor: 'rgba(194,65,12,0.12)', label: 'Low' },
  VeryLow:  { color: '#dc2626', trackColor: 'rgba(220,38,38,0.12)', label: 'Very Low' },
};

const getConfidenceStyle = (level?: string) => {
  if (level && level in CONFIDENCE_STYLE) return CONFIDENCE_STYLE[level];
  return CONFIDENCE_STYLE['Moderate'];
};

/* ── Currency formatting ── */
const formatSalary = (value: number, currencyCode: string) => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    // Unknown currency code from a query param — fall back to USD.
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  }
};

/* ── Count-up hook ── */
const useCountUp = (target: number, decimals = 0, duration = 1.4) => {
  const [val, setVal] = useState('0');
  useEffect(() => {
    const controls = animate(0, target, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setVal(v.toFixed(decimals)),
    });
    return () => controls.stop();
  }, [target, decimals, duration]);
  return val;
};

/* ── Confidence Gauge ── */
const ConfidenceGauge = ({ score, level }: { score: number; level?: string }) => {
  const style = getConfidenceStyle(level);
  const circumference = 2 * Math.PI * 54;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference - (score / 100) * circumference);
    }, 300);
    return () => clearTimeout(timer);
  }, [score, circumference]);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      role="img"
      aria-label={`Confidence score ${score} out of 100, ${style.label}`}
    >
      <svg width="140" height="140" viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(28,37,58,0.1)" strokeWidth="8" />
        <circle
          cx="60" cy="60" r="54" fill="none"
          stroke={style.color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-extrabold tabular-nums text-foreground">{score}</span>
        <span className="text-xs font-medium text-muted-foreground">{style.label}</span>
      </div>
    </div>
  );
};

/* ── Section wrapper ── */
const Section = ({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

/* ── ROI Card ── */
const RoiCard = ({ label, value, variant }: { label: string; value: number; variant: 'conservative' | 'expected' | 'optimistic' }) => {
  const display = useCountUp(value, 1);
  const isMain = variant === 'expected';
  const styles = {
    conservative: {
      card: 'border-warning/25 bg-warning/5',
      text: 'text-warning',
      badge: 'border-warning/25 bg-warning/10 text-warning',
    },
    expected: {
      card: 'border-success/35 bg-success/5 sm:scale-[1.02]',
      text: 'text-success',
      badge: 'border-success/25 bg-success/10 text-success',
    },
    optimistic: {
      card: 'border-primary/25 bg-primary/5',
      text: 'text-primary',
      badge: 'border-primary/25 bg-primary/10 text-primary',
    },
  }[variant];

  return (
    <div className={`glass-card border p-6 ${styles.card}`}>
      {isMain && (
        <span className={`mb-2 inline-block rounded-full border px-3 py-0.5 text-xs font-semibold ${styles.badge}`}>
          Most Likely
        </span>
      )}
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className={`mt-1 text-3xl font-extrabold tabular-nums tracking-tight ${styles.text}`}>
        {display}%
      </p>
    </div>
  );
};

/* ── Main Page ── */
const DegreeWorthIt = () => {
  const [searchParams] = useSearchParams();

  const majorId = Number(searchParams.get('majorId'));
  const countryCode = searchParams.get('countryCode');
  const currencyCode = searchParams.get('currencyCode');
  const hasParams = Number.isFinite(majorId) && majorId > 0 && !!countryCode && !!currencyCode;

  const { data, isLoading, error } = useQuery({
    queryKey: ['degree-worth-it', majorId, countryCode, currencyCode],
    enabled: hasParams,
    queryFn: () =>
      fetchDegreeWorthIt({
        majorId,
        countryCode,
        currencyCode,
      }),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-background" role="status" aria-live="polite">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">Loading insights…</span>
      </div>
    );
  }

  if (!hasParams) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <CircleHelp className="h-10 w-10 text-muted-foreground/60" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-foreground">Choose a degree to see its insights</h1>
        <p className="max-w-md text-muted-foreground">
          This page needs a major, country and currency. Run a calculation first and open the
          insight from your results.
        </p>
        <Button asChild>
          <Link to="/calculator">Open the calculator</Link>
        </Button>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <BarChart3 className="h-10 w-10 text-muted-foreground/60" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-foreground">Unable to Load Insights</h1>
        <p className="text-muted-foreground">Please try again later.</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RotateCw aria-hidden="true" />
            Retry
          </Button>
          <Button asChild variant="ghost">
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const verdictStyle = getVerdictStyle(data.verdict);
  const VerdictIcon = verdictStyle.icon;
  const salaryDisplay = formatSalary(data.expectedSalary, currencyCode ?? 'USD');

  return (
    <>
      <Helmet>
        <title>{data.pageTitle}</title>
        <meta name="description" content={data.metaDescription} />
        {data.canonicalUrl && <link rel="canonical" href={data.canonicalUrl} />}
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* ─── 1. HERO ─── */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="grain-paper pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="container relative z-10 max-w-5xl py-10 md:py-14">
            <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_300px] md:items-center md:gap-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="eyebrow">Degree ROI insight</span>
                <h1 className="mt-3 font-heading text-[clamp(2rem,3.6vw,2.9rem)] font-[450] leading-[1.08] tracking-[-0.04em] text-foreground">
                  {data.pageTitle}
                </h1>
                <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                  {data.metaDescription}
                </p>
              </motion.div>

              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.45 }}
                className="rounded-2xl border border-border bg-card p-5 shadow-card"
              >
                <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                    Overall verdict
                  </p>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${verdictStyle.bg} ${verdictStyle.text} ${verdictStyle.border}`}>
                    <VerdictIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    {data.verdict}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <ConfidenceGauge score={data.confidenceScore} level={data.confidenceLevel} />
                  <div className="min-w-0">
                    <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                      Confidence score
                    </p>
                    <p className="mt-1 text-sm leading-snug text-muted-foreground">
                      Based on modeled cost, salary, and demand inputs.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── SEO INTRO CONTENT ─── */}
        <section className="container pb-10 pt-12">
          <Section delay={0.05}>
            <div className="prose mx-auto max-w-3xl prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground">
              <h2>Is {data.pageTitle.replace('Is ', '').replace('?', '')}</h2>

              <p>
                Choosing a degree is both a financial and career decision. Many students ask whether
                pursuing {data.pageTitle.replace('Is ', '').replace('?', '')} provides strong long-term value.
              </p>

              <p>
                Based on return on investment analysis, expected salary outcomes, and current job market demand,
                this degree shows <strong>{data.verdict.toLowerCase()}</strong> potential for most students.
              </p>
            </div>
          </Section>
        </section>

        <AdSlot slot="in-content" className="container mt-4" />

        {/* ─── 2. ROI SCENARIOS ─── */}
        <section className="container py-14 md:py-16">
          <Section>
            <h2 className="mb-8 text-center text-2xl font-bold text-foreground md:text-3xl">
              ROI Scenario <span className="text-primary">Comparison</span>
            </h2>
            <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
              <RoiCard label="Conservative" value={data.conservativeRoi} variant="conservative" />
              <RoiCard label="Expected" value={data.expectedRoi} variant="expected" />
              <RoiCard label="Optimistic" value={data.optimisticRoi} variant="optimistic" />
            </div>
          </Section>
        </section>

        {/* ─── UNDERSTANDING ROI ─── */}
        <section className="container pb-12">
          <Section delay={0.1}>
            <div className="prose mx-auto max-w-3xl prose-headings:text-foreground prose-p:text-muted-foreground">
              <h2>Understanding ROI for this Degree</h2>

              <p>
                ROI scenarios help evaluate risk and upside. Even under conservative assumptions,
                this degree maintains a positive return, while optimistic scenarios show strong upside
                driven by salary growth and market demand.
              </p>

              <p>
                The expected ROI scenario represents the most realistic outcome for students entering
                the workforce under normal economic conditions.
              </p>
            </div>
          </Section>
        </section>

        {/* ─── 3. BREAK-EVEN & SALARY ─── */}
        <section className="container pb-16">
          <Section delay={0.1}>
            <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
              {/* Break-even */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-3">
                  <div className="inline-flex rounded-xl border border-primary/20 bg-primary/10 p-2.5">
                    <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Break-Even Timeline</p>
                    <p className="text-3xl font-extrabold text-foreground">
                      {data.breakEvenYears}{' '}
                      <span className="text-lg font-semibold text-muted-foreground">years</span>
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Time to recover your full education investment
                </p>
              </div>

              {/* Salary */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-3">
                  <div className="inline-flex rounded-xl border border-success/20 bg-success/10 p-2.5">
                    <DollarSign className="h-5 w-5 text-success" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Expected Salary</p>
                    <p className="text-3xl font-extrabold tabular-nums text-success">{salaryDisplay}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Projected annual earnings post-graduation
                </p>
              </div>
            </div>
          </Section>
        </section>

        <AdSlot slot="in-content" className="container mb-8" />

        {/* ─── 4. CAREER & MARKET INTELLIGENCE ─── */}
        <section className="container pb-16">
          <Section delay={0.15}>
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-8 text-center text-2xl font-bold text-foreground md:text-3xl">
                Career & Market <span className="text-primary">Intelligence</span>
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="glass-card p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="inline-flex rounded-xl border border-primary/20 bg-primary/10 p-2.5">
                      <BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <h3 className="font-semibold text-foreground">Market Outlook</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{data.marketOutlook}</p>
                </div>
                <div className="glass-card p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="inline-flex rounded-xl border border-warning/20 bg-warning/10 p-2.5">
                      <Briefcase className="h-5 w-5 text-warning" aria-hidden="true" />
                    </div>
                    <h3 className="font-semibold text-foreground">Employment Summary</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{data.employmentSummary}</p>
                </div>
              </div>
            </div>
          </Section>
        </section>

        {/* ─── CAREER OUTLOOK EXPANDED ─── */}
        <section className="container pb-16">
          <Section delay={0.2}>
            <div className="prose mx-auto max-w-3xl prose-headings:text-foreground prose-p:text-muted-foreground">
              <h2>Career Outlook and Job Market Demand</h2>

              <p>{data.marketOutlook}</p>

              <p>
                From an employment perspective, graduates entering this field can expect roles
                aligned with long-term industry demand and evolving skill requirements.
              </p>

              <p>{data.employmentSummary}</p>
            </div>
          </Section>
        </section>

        {/* ─── 5. KEY INSIGHTS ─── */}
        {data.keyInsights && data.keyInsights.length > 0 && (
          <section className="container pb-16">
            <Section delay={0.2}>
              <div className="mx-auto max-w-3xl">
                <h2 className="mb-8 text-center text-2xl font-bold text-foreground md:text-3xl">
                  Key <span className="text-primary">Insights</span>
                </h2>
                <ul className="space-y-3">
                  {data.keyInsights.map((insight, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06, duration: 0.35 }}
                      className="glass-subtle flex items-start gap-3 p-4"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                      <span className="text-sm leading-relaxed text-muted-foreground">{insight}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </Section>
          </section>
        )}

        <AdSlot slot="below-results" className="container mb-8" />

        {/* ─── FAQ SECTION ─── */}
        <section className="container pb-16">
          <Section delay={0.25}>
            <div className="prose mx-auto max-w-3xl prose-headings:text-foreground prose-p:text-muted-foreground">
              <h2>Frequently Asked Questions</h2>

              <h3>Is this degree hard?</h3>
              <p>
                Difficulty depends on background and commitment. Students with consistent practice
                and interest in the subject generally perform well.
              </p>

              <h3>How long does it take to recover the investment?</h3>
              <p>
                Based on current projections, most students recover their education investment
                in approximately {data.breakEvenYears} years.
              </p>

              <h3>Is this degree future-proof?</h3>
              <p>
                Market indicators suggest sustained demand due to technological growth
                and industry-wide adoption.
              </p>
            </div>
          </Section>
        </section>

        {/* ─── 6. FINAL CONCLUSION ─── */}
        <section className="container pb-20">
          <Section delay={0.25}>
            <div className="mx-auto max-w-3xl rounded-2xl border border-primary/25 bg-primary/5 p-8 text-center md:p-12">
              <TrendingUp className="mx-auto mb-4 h-8 w-8 text-primary" aria-hidden="true" />
              <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">Our Conclusion</h2>
              <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                {data.finalConclusion}
              </p>

              <Button asChild size="lg" className="mt-8">
                <Link to="/calculator">
                  Calculate Your ROI <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </Section>
        </section>
      </div>
    </>
  );
};

export default DegreeWorthIt;
