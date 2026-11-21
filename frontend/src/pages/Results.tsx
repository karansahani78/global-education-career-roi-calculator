import { BookOpen, Sparkles } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Percent,
  BarChart3,
  Loader2,
  AlertCircle,
  ArrowRight,
  RotateCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdSlot } from '@/components/ads/AdSlot';
import type { RoiCalculationRequest, RoiCalculationResponse } from '@/types/api';
import { VERDICT_CONFIG } from '@/types/api';
import { fetchSharedResult } from '@/lib/api';
import { MetricCard } from '@/components/results/MetricCard';
import { CostBreakdownChart } from '@/components/results/CostBreakdownChart';
import { EarningsChart } from '@/components/results/EarningsChart';
import { ShareCard } from '@/components/results/ShareCard';
import { PdfDownloadCard } from '@/components/results/PdfDownloadCard';
import { SummaryCard } from '@/components/results/SummaryCard';
import { SimulationSection } from '@/components/results/SimulationSection';
import { CareerIntelligencePanel } from '@/components/results/CareerIntelligencePanel';
import { DecisionConfidenceSection } from '@/components/results/DecisionConfidenceSection';

function formatCurrency(value: number, symbol = '$') {
  if (Math.abs(value) >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${symbol}${(value / 1_000).toFixed(0)}K`;
  return `${symbol}${value.toFixed(0)}`;
}

const VERDICT_STYLES = {
  Excellent: { bg: 'bg-success/10', color: 'text-success', border: 'border-success/30' },
  Good: { bg: 'bg-success/10', color: 'text-success', border: 'border-success/30' },
  Fair: { bg: 'bg-warning/10', color: 'text-warning', border: 'border-warning/30' },
  Poor: { bg: 'bg-destructive/10', color: 'text-destructive', border: 'border-destructive/30' },
} as const;

const metricExplanations = [
  {
    title: 'Net ROI — in plain terms',
    body: 'This is the total extra money your degree is projected to put in your pocket over your entire working life, after every cost has been subtracted — including tuition, living expenses, loan interest, and the salary you forgo while studying. A positive number means the degree is expected to more than pay for itself.',
  },
  {
    title: 'ROI % — strong or weak?',
    body: 'This shows how much you get back for every dollar invested in your education. As a benchmark, a diversified investment portfolio has historically returned around 7–10% per year over the long run. An ROI % that comfortably exceeds that benchmark suggests your degree is a financially efficient use of capital.',
  },
  {
    title: 'Break-even — before & after',
    body: 'Before this point, your higher graduate salary is still repaying the full cost of your education. After it, every additional working year adds clear net financial gain. A shorter break-even period means faster payoff and less vulnerability to career changes or life interruptions.',
  },
  {
    title: 'Annual return — investment context',
    body: "This expresses your degree's financial return the same way a savings account or investment fund reports yearly growth. Comparing it to a current risk-free savings rate (around 4–5%) shows whether the degree meaningfully outperforms simply investing your tuition money instead of spending it on education.",
  },
];

const ResultsPage = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const [result, setResult] = useState<RoiCalculationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load form data for simulation
  const baseRequest = useMemo<RoiCalculationRequest | null>(() => {
    try {
      const saved = localStorage.getItem('eduroi-calculator-form');
      if (saved) return JSON.parse(saved) as RoiCalculationRequest;
    } catch {
      // Ignore corrupt saved forms; advanced sections are simply hidden.
    }
    return null;
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const stored = sessionStorage.getItem('eduroi-result');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.uuid === uuid) {
          setResult(parsed);
          setLoading(false);
          return;
        }
      } catch {
        // Fall through and load the canonical result from the API.
      }
    }

    if (uuid) {
      fetchSharedResult(uuid)
        .then((data) => {
          setResult(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Could not load result.');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [uuid]);

  if (loading) {
    return (
      <div className="page-shell" aria-busy="true" aria-live="polite">
        <div className="container max-w-5xl py-14">
          <div className="mx-auto flex max-w-md flex-col items-center gap-3 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Loading your results…</p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl border border-border bg-card" />
            ))}
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="h-80 animate-pulse rounded-xl border border-border bg-card lg:col-span-2" />
            <div className="h-80 animate-pulse rounded-xl border border-border bg-card" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-card">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-lg font-semibold text-foreground">Couldn’t load this result</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{error}</p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <Button onClick={() => window.location.reload()} className="gap-2">
              <RotateCw className="h-4 w-4" aria-hidden="true" /> Try again
            </Button>
            <Button asChild variant="outline">
              <Link to="/calculator">New calculation</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!result || !result.roiResults || !result.inputSummary) {
    return (
      <div className="page-shell flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4 text-center" aria-live="polite">
        <AlertCircle className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">This result could not be prepared.</p>
        <Button asChild variant="outline">
          <Link to="/calculator">Start a new calculation</Link>
        </Button>
      </div>
    );
  }

  const {
    roiResults,
    costBreakdown,
    incomeProjection,
    inputSummary,
    yearlyBreakdown,
  } = result;

  const verdictStyle = VERDICT_STYLES[roiResults.verdict];

  const pieData = [
    { name: 'Tuition', value: costBreakdown.tuitionTotal },
    { name: 'Living', value: costBreakdown.livingCostTotal },
    { name: 'Other', value: costBreakdown.otherCostsTotal },
    { name: 'Loan interest', value: costBreakdown.loanInterest },
    { name: 'Opportunity', value: costBreakdown.opportunityCost },
  ].filter(d => d.value > 0);

  const metrics = [
    { label: 'Net ROI', value: formatCurrency(roiResults.netRoi, inputSummary.currencySymbol), icon: TrendingUp, tone: (roiResults.netRoi >= 0 ? 'positive' : 'warning') as 'positive' | 'warning' },
    { label: 'ROI %', value: `${roiResults.roiPercentage}%`, icon: Percent },
    { label: 'Break-even', value: `${roiResults.breakEvenYears} yrs`, icon: Clock },
    { label: 'Annual return', value: `${roiResults.annualizedReturn}%`, icon: BarChart3 },
  ];

  const summaryItems: [string, string][] = [
    ['Total cost', formatCurrency(costBreakdown.totalEducationCost, inputSummary.currencySymbol)],
    ['Opportunity cost', formatCurrency(costBreakdown.opportunityCost, inputSummary.currencySymbol)],
    ['Lifetime earnings', formatCurrency(incomeProjection.lifetimeEarnings, inputSummary.currencySymbol)],
    ['Additional earnings', formatCurrency(incomeProjection.additionalLifetimeEarnings, inputSummary.currencySymbol)],
  ];

  return (
    <div className="page-shell">
      {/* Hero */}
      <section className="border-b border-border">
        <div className="container max-w-5xl py-10 md:py-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-center"
          >
            <p className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
              {inputSummary.degreeLevel} in {inputSummary.major} · {inputSummary.country}
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl">
              Your education ROI analysis
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              This analysis projects the long-term financial value of your degree using your
              personal inputs alongside real labour-market data. It is designed to help you
              understand what the numbers mean — not to tell you what to decide. Think of it as a
              calm, data-backed conversation with an impartial financial guide.
            </p>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.35 }}
              className={`mx-auto mt-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold ${verdictStyle.bg} ${verdictStyle.color} ${verdictStyle.border}`}
            >
              {roiResults.verdict === 'Excellent' || roiResults.verdict === 'Good' ? (
                <TrendingUp className="h-4 w-4" aria-hidden="true" />
              ) : (
                <TrendingDown className="h-4 w-4" aria-hidden="true" />
              )}
              {VERDICT_CONFIG[roiResults.verdict].label}
            </motion.div>
          </motion.div>

          {/* Metric cards */}
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {metrics.map((m, i) => (
              <MetricCard key={m.label} {...m} delay={0.1 + i * 0.07} />
            ))}
          </div>

          {/* Per-metric explanations */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4"
          >
            {metricExplanations.map((item) => (
              <div key={item.title} className="rounded-lg border border-border bg-card/60 px-4 py-3">
                <p className="mb-1.5 text-2xs font-semibold uppercase tracking-wider text-foreground">
                  {item.title}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div className="container max-w-5xl py-10 md:py-12">
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Main column */}
          <div className="space-y-6 lg:col-span-2">

            <section>
              <p className="mb-1 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                Where your money goes
              </p>
              <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                Understanding which costs dominate your total investment is the first step to
                reducing financial risk. For many students, the single largest expense is not
                tuition but the income forfeited by studying full-time rather than working — known
                as opportunity cost. Use this chart to identify your biggest financial lever.
              </p>
            </section>

            <CostBreakdownChart
              data={pieData}
              currencySymbol={inputSummary.currencySymbol}
              totalInvestment={costBreakdown.totalInvestment}
              formatCurrency={formatCurrency}
            />

            <p className="text-xs leading-relaxed text-muted-foreground">
              <strong className="font-medium text-foreground">Opportunity cost</strong> is the salary
              you could have earned by working instead of studying — a real economic cost even
              though no money leaves your account directly. Shortening your programme or working
              part-time during study are typically the most effective ways to reduce this component.
            </p>

            <section>
              <p className="mb-1 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                Earnings over your career
              </p>
              <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                This chart maps two parallel career paths: your projected cumulative earnings with
                this degree versus what you might expect without one. The point where the lines
                cross is your financial break-even. Every year after that crossover represents the
                compounding advantage of having the qualification — a gap that typically widens with
                seniority and salary progression.
              </p>
            </section>

            <EarningsChart
              data={yearlyBreakdown}
              currencySymbol={inputSummary.currencySymbol}
              formatCurrency={formatCurrency}
            />

            <AdSlot slot="below-results" />
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <ShareCard shareableUrl={result.shareableUrl} />
            <PdfDownloadCard uuid={result.uuid} />
            <AdSlot slot="sidebar" />

            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <p className="mb-2 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                What each figure means
              </p>
              <ul className="space-y-2.5 text-xs leading-relaxed text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">Total cost</span> — every dollar
                  spent on your education: fees, living expenses, and loan interest combined.
                </li>
                <li>
                  <span className="font-medium text-foreground">Opportunity cost</span> — the salary
                  you forgo by not working full-time during your studies. Often larger than tuition.
                </li>
                <li>
                  <span className="font-medium text-foreground">Lifetime earnings</span> — your total
                  projected career income with this degree factored in.
                </li>
                <li>
                  <span className="font-medium text-foreground">Additional earnings</span> — the
                  extra lifetime income your degree is expected to generate above a no-degree career
                  baseline. This is the clearest single measure of financial return.
                </li>
              </ul>
            </div>

            <SummaryCard items={summaryItems} />

            <Button asChild variant="outline" className="w-full gap-2">
              <Link to="/calculator">
                New calculation <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>

            {baseRequest && (
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-card/60 p-4">
                  <p className="mb-1.5 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Simulate your ROI
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Adjust salary and cost assumptions below to see how your ROI changes across
                    best-case, realistic, and worst-case scenarios. If the ROI stays positive in the
                    pessimistic scenario, your investment is financially resilient.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card/60 p-4">
                  <p className="mb-1.5 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Career outcomes explained
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    The probabilities and salary bands below are drawn from real graduate data for
                    your field. <strong className="font-semibold text-foreground">Conservative</strong> = 25th
                    percentile earnings. <strong className="font-semibold text-foreground">Optimistic</strong> =
                    75th percentile. Plan around the conservative figure — anything above is a
                    bonus.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Degree worth it CTA — needs the original inputs, which shared links don't carry */}
        {baseRequest && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mt-6 rounded-xl border border-border bg-card p-6 text-center shadow-card md:p-8"
        >
          <div className="mx-auto flex max-w-xl flex-col items-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Decision insight
            </span>

            <h2 className="mt-3 text-xl font-bold tracking-tight">
              Is this degree actually worth it?
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Get a clear verdict based on ROI, downside risk, salary outcomes, and career demand —
              explained in simple, human language.
            </p>

            <Button asChild size="lg" className="mt-5 gap-2">
              <Link to={`/insights/degree-worth-it?majorId=${baseRequest.majorId}&countryCode=${encodeURIComponent(baseRequest.countryCode)}&currencyCode=${encodeURIComponent(inputSummary.currencyCode)}`}>
                Check if it’s worth it <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </motion.div>
        )}

        {/* Blog links */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mt-8"
        >
          <p className="mb-3 flex items-center gap-2 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            Further reading
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { to: '/blog/is-college-worth-it-in-2025', title: 'Is college worth it in 2025?', desc: 'A data-driven look at the value of a degree' },
              { to: '/blog/highest-roi-degrees-2025', title: 'Highest ROI degrees', desc: 'Ranked by net financial return over 30 years' },
              { to: '/blog', title: 'Education finance blog', desc: 'Guides on maximising your education ROI' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/35 hover:bg-surface"
              >
                <h3 className="flex items-start gap-1.5 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                  {item.title}
                  <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Decision confidence */}
        {baseRequest && (
          <>
            <div className="mb-3 mt-10">
              <p className="mb-1 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                Decision confidence score
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                This score reflects how well your inputs align with verified real-world data for
                your chosen field, degree level, and country. A high score means your salary
                expectations, cost estimates, and career assumptions are strongly supported by
                current labour-market evidence — which makes the ROI figures above more reliable.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                A lower score does not mean a bad outcome; it indicates more uncertainty in the
                projection and suggests gathering additional information before making a final
                decision. Use this score to calibrate how much confidence to place in the numbers
                — high confidence warrants acting on the analysis; lower confidence is a prompt to
                research further.
              </p>
            </div>
            <DecisionConfidenceSection baseRequest={baseRequest} />
          </>
        )}

        {/* Simulation */}
        {baseRequest && (
          <SimulationSection
            baseRequest={baseRequest}
            currencySymbol={inputSummary.currencySymbol}
          />
        )}

        {/* Career intelligence */}
        {baseRequest && (
          <CareerIntelligencePanel
            request={{
              majorId: baseRequest.majorId,
              countryCode: baseRequest.countryCode,
              degreeLevelId: baseRequest.degreeLevelId,
              expectedSalaryAfter: baseRequest.expectedSalaryAfter,
              durationYears: baseRequest.durationYears,
              roiPercentage: roiResults.roiPercentage,
            }}
            currencySymbol={inputSummary.currencySymbol}
          />
        )}

        {/* Disclaimer */}
        <div className="mt-12 border-t border-border pt-8 text-center">
          <p className="mx-auto max-w-2xl text-xs leading-relaxed text-muted-foreground">
            All projections are based on the inputs you provided and aggregated third-party
            labour-market data. Figures are provided for informational and planning purposes only
            and do not constitute financial, legal, or careers advice. Individual outcomes will
            vary. We recommend consulting a qualified financial adviser or careers professional
            before making significant education investment decisions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
