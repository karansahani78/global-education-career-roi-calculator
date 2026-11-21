import { motion } from 'framer-motion';
import {
  Globe,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Loader2,
  BookOpen,
  Users,
  Award,
  ArrowRight,
  RotateCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchCountries } from '@/lib/api';
import type { CountryDto } from '@/types/api';
import { Button } from '@/components/ui/button';

const CountriesPage = () => {
  const { data: countries, isLoading, isError, error, refetch } = useQuery<CountryDto[]>({
    queryKey: ['countries'],
    queryFn: fetchCountries,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="grain-paper pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="container relative z-10 py-10 md:py-14">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
            <div>
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38 }}
                className="eyebrow"
              >
                <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                Global Education ROI Database
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mt-4 max-w-xl font-heading text-[clamp(2.2rem,4vw,3.2rem)] font-[450] leading-[1.08] tracking-[-0.045em] text-foreground"
              >
                Explore Education by <span className="text-primary">Country</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground"
              >
                Compare tuition costs, living expenses, and ROI across countries worldwide.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.28 }}
                className="mt-6 flex flex-wrap items-center gap-2"
              >
                {[
                  'Tuition Fees by Country',
                  'Cost of Living Index',
                  'Graduate Salary Data',
                  'Student Loan ROI',
                  'University Rankings',
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.12 }}
              className="relative hidden lg:block"
            >
              <div className="relative overflow-hidden rounded-[26px] border border-border bg-card shadow-raised">
                <img
                  src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80"
                  alt="Earth seen from space at night"
                  width={1200}
                  height={800}
                  loading="eager"
                  decoding="async"
                  className="h-[280px] w-full object-cover"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent"
                  aria-hidden="true"
                />
                <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white backdrop-blur-sm">
                  <span className="h-1 w-1 rounded-full bg-white" aria-hidden="true" />
                  Global coverage
                </span>
                <div className="absolute inset-x-5 bottom-5">
                  <p className="max-w-[240px] text-sm font-medium leading-snug text-white">
                    Compare borders, currencies, and outcomes in one model.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
            className="mt-8 grid grid-cols-2 gap-4 border-t border-border pt-6 sm:grid-cols-4 sm:gap-6"
          >
            {[
              { icon: Globe, value: '50+', label: 'Countries' },
              { icon: BookOpen, value: '1,200+', label: 'Universities' },
              { icon: Users, value: '300+', label: 'Degree Programs' },
              { icon: Award, value: '10M+', label: 'Salary Data Points' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-primary">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-mono text-sm font-medium text-foreground">{value}</p>
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── COUNTRY GRID ─────────────────────────────────────────────────── */}
      <div className="container py-12 md:py-16">
        {isLoading && (
          <div role="status" aria-live="polite">
            <span className="sr-only">Loading countries…</span>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass-card p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 animate-pulse rounded-xl bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-2/3 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <div className="h-3 w-12 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
              Loading countries…
            </div>
          </div>
        )}

        {isError && (
          <div className="mx-auto max-w-md rounded-2xl border border-danger/30 bg-danger/5 p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-danger" aria-hidden="true" />
            <h2 className="mt-3 font-semibold text-foreground">Backend Unavailable</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {error instanceof Error ? error.message : 'Could not load countries from the server.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => refetch()}
            >
              <RotateCw aria-hidden="true" />
              Try again
            </Button>
          </div>
        )}

        {!isLoading && !isError && countries && countries.length === 0 && (
          <div className="py-20 text-center">
            <Globe className="mx-auto h-10 w-10 text-muted-foreground/50" aria-hidden="true" />
            <p className="mt-3 text-sm text-muted-foreground">No data available</p>
          </div>
        )}

        {countries && countries.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6 flex items-center gap-3"
            >
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                All Countries
              </h2>
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium text-muted-foreground">
                {countries.length} destinations
              </span>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {countries.map((country, i) => (
                <motion.div
                  key={country.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    to={`/calculator?country=${country.code}`}
                    className="glass-card glass-card-hover group flex h-full flex-col p-5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                        <Globe className="h-5 w-5 text-primary" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-foreground transition-colors group-hover:text-primary">
                          {country.name}
                        </h3>
                        <span className="text-xs text-muted-foreground">{country.region}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3 text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <DollarSign className="h-3.5 w-3.5" aria-hidden="true" />
                        {country.currencyCode}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                        COL: {country.costOfLivingIndex}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── SEO EDITORIAL SECTION ────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="border-t border-border"
      >
        <div className="container max-w-4xl space-y-14 py-14 md:py-20">
          {/* Block 1 */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground md:text-2xl">
              How to Choose the Best Country for Your Education ROI
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Selecting the right country for your university education is one of the most consequential
              financial decisions you'll make. Beyond prestige, the true measure is{' '}
              <strong className="font-semibold text-foreground">return on investment</strong> — the net
              gain from your degree after accounting for tuition fees, cost of living, student loan
              interest, and post-graduation salary. Our calculator models these variables across 50+
              countries so you can make a data-driven choice instead of guessing.
            </p>
          </div>

          {/* Block 2 */}
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: DollarSign,
                heading: 'Tuition Fees by Country',
                body: 'Annual tuition ranges from near-zero in Germany and Norway to over $55,000 at elite US private universities. Scandinavian countries offer heavily subsidised tuition even for international students, making them top picks for budget-conscious students seeking high-quality education.',
                tone: 'text-primary bg-primary/10 border-primary/20',
              },
              {
                icon: Globe,
                heading: 'Cost of Living for Students',
                body: 'Monthly student living costs range from ~$500 in Eastern Europe and Southeast Asia to over $2,500 in cities like London, Zurich, and New York. Our Cost of Living Index lets you instantly benchmark housing, food, transport, and healthcare across every country.',
                tone: 'text-success bg-success/10 border-success/20',
              },
              {
                icon: TrendingUp,
                heading: 'Graduate Salary Comparisons',
                body: 'Post-graduation salary is the single biggest driver of ROI. STEM graduates in the US and Germany consistently outperform peers globally, while finance and law graduates in Singapore and the UK top regional salary charts. We update salary benchmarks quarterly.',
                tone: 'text-warning bg-warning/10 border-warning/20',
              },
              {
                icon: BookOpen,
                heading: 'Student Loan & Debt Impact',
                body: 'A $100k loan at 6% over 10 years adds $33k in interest to your total cost. Countries with income-contingent repayment systems — like the UK and Australia — dramatically reduce default risk. Our loan calculator factors in interest, term length, and repayment structure.',
                tone: 'text-secondary bg-secondary/10 border-secondary/20',
              },
            ].map(({ icon: Icon, heading, body, tone }) => (
              <div key={heading} className="glass-card space-y-3 p-5">
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${tone}`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{heading}</h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>

          {/* Block 3 */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground md:text-2xl">
              Best Countries for International Students in 2025
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Based on our ROI model, the top-ranked destinations for international students in 2025
              balance affordable tuition, moderate cost of living, strong graduate employment rates, and
              post-study work visa options. Germany, Canada, the Netherlands, and Australia consistently
              rank highly across all four dimensions. The United States leads on raw salary potential but
              requires careful debt management given high tuition costs.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-2">
              {[
                { rank: '01', name: 'Germany', note: 'Near-zero tuition' },
                { rank: '02', name: 'Canada', note: 'Post-study work visa' },
                { rank: '03', name: 'Netherlands', note: 'High English proficiency' },
                { rank: '04', name: 'Australia', note: 'Strong STEM salaries' },
                { rank: '05', name: 'United States', note: 'Top salary outcomes' },
              ].map(({ rank, name, note }) => (
                <div
                  key={rank}
                  className="flex items-center gap-2.5 rounded-xl border border-border bg-surface/60 px-3.5 py-2"
                >
                  <span className="text-[10px] font-black text-muted-foreground/60">{rank}</span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{name}</p>
                    <p className="text-[11px] text-muted-foreground">{note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Block 4 */}
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-foreground md:text-2xl">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {[
                {
                  q: 'Which country has the cheapest university tuition for international students?',
                  a: 'Germany, Norway, and Finland offer the lowest tuition fees, with many public universities charging minimal or zero tuition even for non-EU international students. However, living costs in these countries are moderate to high, so total cost of attendance should be calculated.',
                },
                {
                  q: 'How do I calculate the ROI of a university degree?',
                  a: 'Education ROI is calculated by comparing the total investment (tuition + living costs + opportunity cost + loan interest) against the lifetime salary premium your degree generates. Our calculator automates this using real salary data and adjusts for inflation, tax rates, and loan repayment schedules.',
                },
                {
                  q: 'Is studying in the US worth the cost?',
                  a: "It depends on the major and institution. US STEM and business graduates at top-50 universities often see 10-year ROIs exceeding 200%. However, humanities and arts degrees at less selective institutions can produce negative ROI when accounting for student debt. Use our comparison tool to model your specific scenario.",
                },
                {
                  q: 'What is a Cost of Living Index for students?',
                  a: 'A Cost of Living Index (COL index) benchmarks the relative expense of living in a city or country. A score of 100 represents the global average. A score of 150 means 50% more expensive; a score of 60 means 40% cheaper. We use COL data to adjust break-even and ROI calculations for each country.',
                },
              ].map(({ q, a }, i) => (
                <motion.div
                  key={q}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 + i * 0.05 }}
                  className="glass-card space-y-2.5 p-5"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-black text-primary">
                      Q
                    </span>
                    <h3 className="text-sm font-semibold leading-snug text-foreground">{q}</h3>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-[10px] font-black text-success">
                      A
                    </span>
                    <p className="text-sm leading-relaxed text-muted-foreground">{a}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA Banner */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-primary/25 bg-primary/5 p-7 sm:flex-row sm:items-center"
          >
            <div>
              <p className="text-base font-bold text-foreground">Ready to calculate your exact ROI?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick a country above and run a full degree ROI analysis in under 2 minutes.
              </p>
            </div>
            <Button asChild className="shrink-0">
              <Link to="/compare">
                Compare Two Options
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default CountriesPage;
