import { motion } from 'framer-motion';
import { BookOpen, Star, AlertCircle, Loader2, RotateCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdSlot } from '@/components/ads/AdSlot';
import { useQuery } from '@tanstack/react-query';
import { fetchMajors } from '@/lib/api';
import type { MajorDto } from '@/types/api';
import { Helmet } from 'react-helmet-async';
import { useState } from 'react';

// Category accent colours — keys match the categories returned by the API.
const CATEGORY_COLORS: Record<string, string> = {
  STEM: 'bg-success/10 text-success border-success/25',
  Engineering: 'bg-success/10 text-success border-success/25',
  Business: 'bg-warning/10 text-warning border-warning/25',
  Healthcare: 'bg-secondary/10 text-secondary border-secondary/25',
  'Social Sciences': 'bg-primary/10 text-primary border-primary/25',
  Law: 'bg-primary/10 text-primary border-primary/25',
  Education: 'bg-secondary/10 text-secondary border-secondary/25',
  Design: 'bg-warning/10 text-warning border-warning/25',
  Media: 'bg-warning/10 text-warning border-warning/25',
  Humanities: 'bg-primary/10 text-primary border-primary/25',
  Arts: 'bg-secondary/10 text-secondary border-secondary/25',
  Science: 'bg-success/10 text-success border-success/25',
};

// ── Category accent colors for the filter pills ───────────────────────────────
const CATEGORY_PILL_ACTIVE: Record<string, string> = {
  All: 'bg-primary text-primary-foreground border-primary',
  STEM: 'bg-success/15 text-success border-success/40',
  Engineering: 'bg-success/15 text-success border-success/40',
  Business: 'bg-warning/15 text-warning border-warning/40',
  Healthcare: 'bg-secondary/15 text-secondary border-secondary/40',
  'Social Sciences': 'bg-primary/15 text-primary border-primary/40',
  Law: 'bg-primary/15 text-primary border-primary/40',
  Education: 'bg-secondary/15 text-secondary border-secondary/40',
  Design: 'bg-warning/15 text-warning border-warning/40',
  Media: 'bg-warning/15 text-warning border-warning/40',
  Humanities: 'bg-primary/15 text-primary border-primary/40',
  Arts: 'bg-secondary/15 text-secondary border-secondary/40',
  Science: 'bg-success/15 text-success border-success/40',
};

const pillAccent = (category: string) =>
  CATEGORY_PILL_ACTIVE[category] ?? 'bg-primary/15 text-primary border-primary/40';

// ── SEO helper (unchanged) ───────────────────────────────────────────────────
function buildStructuredData(majors: MajorDto[]) {
  const topSalary = [...majors].sort((a, b) => (b.avgGlobalSalary ?? 0) - (a.avgGlobalSalary ?? 0))[0];
  const topGrowth = [...majors].sort((a, b) => (b.jobGrowthRate ?? 0) - (a.jobGrowthRate ?? 0))[0];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://eduroi.com' },
          { '@type': 'ListItem', position: 2, name: 'Majors', item: 'https://eduroi.com/majors' },
        ],
      },
      {
        '@type': 'ItemList',
        name: 'College Majors & Career Outcomes',
        description: 'Compare salary, job growth, and demand for every college major.',
        numberOfItems: majors.length,
        itemListElement: majors.map((m, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: m.name,
          url: `https://eduroi.com/calculator?major=${m.id}`,
          description: `${m.name} — avg salary $${m.avgGlobalSalary?.toLocaleString()}, +${m.jobGrowthRate}% job growth, demand ${m.demandScore}/10`,
        })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Which college major has the highest salary?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${topSalary?.name ?? 'Computer Science'} ranks highest with an average global salary of $${topSalary?.avgGlobalSalary?.toLocaleString() ?? '120,000'}.`,
            },
          },
          {
            '@type': 'Question',
            name: 'Which major has the fastest job growth?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${topGrowth?.name ?? 'Health Sciences'} leads at +${topGrowth?.jobGrowthRate ?? 15}% projected growth over the next decade.`,
            },
          },
          {
            '@type': 'Question',
            name: 'How is the demand score calculated?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The demand score (1–10) combines employer job postings, industry growth projections, and graduate employment rates across global markets.',
            },
          },
        ],
      },
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const MajorsPage = () => {

  // ── ORIGINAL QUERY LOGIC — NOT TOUCHED ───────────────────────────────────
  const { data: majors, isLoading, isError, error, refetch } = useQuery<MajorDto[]>({
    queryKey: ['majors'],
    queryFn: () => fetchMajors(),
  });

  // Build the filter list from the API data so it always matches the backend
  // categories (e.g. "Healthcare", "Engineering") instead of a hardcoded list.
  const categories = Array.from(
    new Set((majors ?? []).map((m) => m.category).filter(Boolean)),
  ).sort();

  // 'All' shows everything, any other value filters the displayed cards.
  const [activeFilter, setActiveFilter] = useState<string>('All');

  // Derive filtered list — original `majors` array is never mutated
  const displayedMajors = activeFilter === 'All'
    ? (majors ?? [])
    : (majors ?? []).filter(m => m.category === activeFilter);

  // Sorted view for "Highest Salary" quick-filter
  const [sortBySalary, setSortBySalary] = useState(false);
  const sortedMajors = sortBySalary
    ? [...displayedMajors].sort((a, b) => (b.avgGlobalSalary ?? 0) - (a.avgGlobalSalary ?? 0))
    : displayedMajors;

  // Scroll helper — smooth scroll to the grid when a filter link is clicked
  const scrollToGrid = () => {
    document.getElementById('majors-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleFilterClick = (category: string, salary = false) => {
    setActiveFilter(category);
    setSortBySalary(salary);
    scrollToGrid();
  };

  // ── Dynamic SEO meta (unchanged) ─────────────────────────────────────────
  const year        = new Date().getFullYear();
  const totalMajors = majors?.length ?? 0;
  const topSalary   = majors ? [...majors].sort((a, b) => (b.avgGlobalSalary ?? 0) - (a.avgGlobalSalary ?? 0))[0] : null;
  const topGrowth   = majors ? [...majors].sort((a, b) => (b.jobGrowthRate ?? 0) - (a.jobGrowthRate ?? 0))[0] : null;
  const metaTitle   = `Best College Majors by Salary & Job Growth (${year}) | EduROI`;
  const metaDesc    = topSalary
    ? `Compare ${totalMajors} college majors. ${topSalary.name} leads salary at $${topSalary.avgGlobalSalary?.toLocaleString()}. ${topGrowth?.name} leads growth at +${topGrowth?.jobGrowthRate}%. Free career calculator.`
    : `Compare college majors by salary, job growth, and employer demand. Make smarter education decisions with real ${year} career outcome data.`;
  const canonicalUrl = 'https://eduroi.com/majors';

  return (
    <>
      {/* SEO HEAD — unchanged */}
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical"    href={canonicalUrl} />
        <meta name="robots"      content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta property="og:type"        content="website" />
        <meta property="og:url"         content={canonicalUrl} />
        <meta property="og:title"       content={metaTitle} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:image"       content="https://eduroi.com/og/majors.png" />
        <meta property="og:site_name"   content="EduROI" />
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content={metaTitle} />
        <meta name="twitter:description" content={metaDesc} />
        <meta name="twitter:image"       content="https://eduroi.com/og/majors.png" />
        {majors && majors.length > 0 && (
          <script type="application/ld+json">
            {JSON.stringify(buildStructuredData(majors))}
          </script>
        )}
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* AD 1: TOP LEADERBOARD — no minHeight, zero gap if unloaded */}
        <div className="flex justify-center pt-3">
          <AdSlot slot="header" className="w-full max-w-[728px]" />
        </div>

        {/* ── HERO ───────────────────────────────────────────────────────── */}
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
                  <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                  Majors &amp; career outcomes
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="mt-4 max-w-xl font-heading text-[clamp(2.2rem,4vw,3.2rem)] font-[450] leading-[1.08] tracking-[-0.045em] text-foreground"
                >
                  Explore Majors & <span className="text-primary">Career Outcomes</span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                  className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground"
                >
                  Compare salary potential, job growth, and demand across fields of study.
                </motion.p>

                {/* ── CATEGORY FILTER PILLS ────────────────────────────────────── */}
                {majors && majors.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.4 }}
                    className="mt-6 flex flex-wrap items-center gap-2"
                  >
                    {['All', ...categories].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => handleFilterClick(cat, false)}
                        aria-pressed={activeFilter === cat && !sortBySalary}
                        className={`rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200
                          ${activeFilter === cat && !sortBySalary
                            ? pillAccent(cat)
                            : 'border-border bg-surface/60 text-muted-foreground hover:bg-surface hover:text-foreground'
                          }`}
                      >
                        {cat === 'All' ? 'All Majors' : cat}
                      </button>
                    ))}
                    {/* Highest Salary sort button */}
                    <button
                      onClick={() => { setActiveFilter('All'); setSortBySalary(true); scrollToGrid(); }}
                      aria-pressed={sortBySalary}
                      className={`rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200
                        ${sortBySalary
                          ? 'border-warning/40 bg-warning/15 text-warning'
                          : 'border-border bg-surface/60 text-muted-foreground hover:bg-surface hover:text-foreground'
                        }`}
                    >
                      ↑ Highest Salary
                    </button>
                  </motion.div>
                )}

                {/* Active filter label */}
                {(activeFilter !== 'All' || sortBySalary) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 flex items-center gap-2"
                  >
                    <span className="text-xs text-muted-foreground">
                      Showing {sortedMajors.length} {activeFilter !== 'All' ? activeFilter : ''} major{sortedMajors.length !== 1 ? 's' : ''}
                      {sortBySalary ? ' · sorted by salary' : ''}
                    </span>
                    <button
                      onClick={() => { setActiveFilter('All'); setSortBySalary(false); }}
                      className="text-xs text-primary/80 transition-colors hover:text-primary"
                    >
                      Clear ✕
                    </button>
                  </motion.div>
                )}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.12 }}
                className="relative hidden lg:block"
              >
                <div className="relative overflow-hidden rounded-[26px] border border-border bg-card shadow-raised">
                  <img
                    src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80"
                    alt="Students in a university classroom"
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
                    Field comparison
                  </span>
                  <div className="absolute inset-x-5 bottom-5">
                    <p className="max-w-[240px] text-sm font-medium leading-snug text-white">
                      Salary, growth, and demand — side by side.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <div className="container py-12 md:py-16">

          {/* Loading */}
          {isLoading && (
            <div role="status" aria-live="polite">
              <span className="sr-only">Loading majors…</span>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="glass-card p-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 animate-pulse rounded-xl bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 w-2/3 animate-pulse rounded bg-muted" />
                        <div className="h-4 w-20 animate-pulse rounded-full bg-muted" />
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {Array.from({ length: 3 }).map((__, j) => (
                        <div key={j} className="h-8 animate-pulse rounded bg-muted" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
                Loading majors…
              </div>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="mx-auto max-w-md rounded-2xl border border-danger/30 bg-danger/5 p-6 text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-danger" aria-hidden="true" />
              <h2 className="mt-3 font-semibold text-foreground">Backend Unavailable</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {error instanceof Error ? error.message : 'Could not load majors from the server.'}
              </p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
                <RotateCw aria-hidden="true" />
                Try again
              </Button>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && majors && majors.length === 0 && (
            <div className="py-20 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/50" aria-hidden="true" />
              <p className="mt-3 text-sm text-muted-foreground">No data available</p>
            </div>
          )}

          {majors && majors.length > 0 && (
            <>
              {/* No results for active filter */}
              {sortedMajors.length === 0 && (
                <div className="rounded-xl border border-border bg-surface/50 py-16 text-center text-sm text-muted-foreground">
                  No majors found for "{activeFilter}".{' '}
                  <button
                    onClick={() => setActiveFilter('All')}
                    className="text-primary underline underline-offset-2 hover:text-primary/80"
                  >
                    Show all
                  </button>
                </div>
              )}

              {/* ── GRID ─────────────────────────────────────────────────── */}
              {sortedMajors.length > 0 && (
                <div
                  id="majors-grid"
                  className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  style={{ scrollMarginTop: '1rem' }}
                >
                  {sortedMajors.map((major, i) => (
                    <motion.div
                      key={major.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full"
                    >
                      <Link
                        to={`/calculator?major=${major.id}`}
                        className="glass-card glass-card-hover group flex h-full flex-col p-5"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                              <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">
                                {major.name}
                              </h3>
                              <Badge
                                variant="outline"
                                className={`mt-1 border text-xs ${CATEGORY_COLORS[major.category] || 'border-border bg-surface text-muted-foreground'}`}
                              >
                                {major.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3 text-center text-xs">
                          <div>
                            <div className="font-semibold tabular-nums text-foreground">
                              ${major.avgGlobalSalary?.toLocaleString()}
                            </div>
                            <div className="text-muted-foreground">Avg Salary</div>
                          </div>
                          <div>
                            <div className="font-semibold tabular-nums text-success">+{major.jobGrowthRate}%</div>
                            <div className="text-muted-foreground">Growth</div>
                          </div>
                          <div>
                            <div className="flex items-center justify-center gap-0.5 font-semibold tabular-nums text-warning">
                              <Star className="h-3 w-3" aria-hidden="true" />{major.demandScore}
                            </div>
                            <div className="text-muted-foreground">Demand</div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* AD 2: MID-PAGE — outside grid, no gap */}
              <div className="mt-6 flex justify-center">
                <AdSlot slot="in-content" className="w-full max-w-[728px]" />
              </div>

              {/* AD 3: BOTTOM — no gap */}
              <div className="mt-4 flex justify-center">
                <AdSlot slot="below-results" className="w-full max-w-[728px]" />
              </div>

              {/* ── SEO CONTENT BLOCK ────────────────────────────────────── */}
              <section className="mx-auto mt-16 max-w-3xl" aria-label="Guide: Choosing a College Major">
                <div className="glass-card p-6 sm:p-8">
                  <h2 className="mb-4 text-xl font-bold text-foreground">
                    How to Choose a College Major for Career Success
                  </h2>
                  <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                    <p>
                      Choosing the right college major directly impacts your earning potential, job security,
                      and long-term career satisfaction. Our platform compares{' '}
                      <strong className="font-semibold text-foreground">{totalMajors} majors</strong> across
                      average global salary, job growth rate, and employer demand so you can make a fully
                      data-driven decision.
                    </p>
                    {topSalary && (
                      <p>
                        Among all fields tracked,{' '}
                        <strong className="font-semibold text-foreground">{topSalary.name}</strong> leads in
                        average global salary at{' '}
                        <strong className="font-semibold text-foreground">${topSalary.avgGlobalSalary?.toLocaleString()}</strong>,
                        while{' '}
                        <strong className="font-semibold text-foreground">{topGrowth?.name}</strong> shows the
                        strongest projected job growth at{' '}
                        <strong className="font-semibold text-foreground">+{topGrowth?.jobGrowthRate}%</strong>.
                        Click any major card to open the salary calculator and model your specific situation
                        by country and experience level.
                      </p>
                    )}
                    <p>
                      A demand score above 7 indicates strong employer hiring activity across global markets.
                      Job growth rate reflects projected employment expansion over the next decade based on
                      industry and government data sources.
                    </p>
                  </div>

                  <nav aria-label="Related pages" className="mt-6 flex flex-wrap gap-2">
                    <Link
                      to="/calculator"
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:border-primary/40 hover:text-primary"
                    >
                      Salary Calculator
                    </Link>

                    <Link
                      to="/compare"
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:border-primary/40 hover:text-primary"
                    >
                      Compare Options
                    </Link>

                    <button
                      onClick={() => handleFilterClick('STEM')}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:border-primary/40 hover:text-primary"
                    >
                      STEM Majors
                    </button>

                    <button
                      onClick={() => handleFilterClick('Business')}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:border-primary/40 hover:text-primary"
                    >
                      Business Majors
                    </button>

                    <button
                      onClick={() => { setActiveFilter('All'); setSortBySalary(true); scrollToGrid(); }}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:border-primary/40 hover:text-primary"
                    >
                      Highest Paying Majors
                    </button>
                  </nav>
                </div>
              </section>

              {/* FAQ SECTION */}
              <section className="mx-auto mt-6 max-w-3xl" aria-label="Frequently Asked Questions about College Majors">
                <h2 className="mb-4 text-lg font-bold text-foreground">Frequently Asked Questions</h2>
                <div className="space-y-3">
                  {[
                    {
                      q: 'Which college major has the highest salary?',
                      a: topSalary
                        ? `${topSalary.name} tops our list with an average global salary of $${topSalary.avgGlobalSalary?.toLocaleString()}. Use the salary calculator to see location-adjusted figures.`
                        : 'STEM majors like Computer Science and Engineering consistently rank among the highest paid.',
                    },
                    {
                      q: 'Which major has the fastest job growth?',
                      a: topGrowth
                        ? `${topGrowth.name} leads at +${topGrowth.jobGrowthRate}% projected growth over the next decade.`
                        : 'Health sciences and technology fields show the strongest hiring outlooks.',
                    },
                    {
                      q: 'How is the demand score calculated?',
                      a: 'The demand score (1–10) is a composite of employer job postings, industry growth projections, and graduate employment rates across global markets.',
                    },
                  ].map((faq) => (
                    <details key={faq.q} className="glass-card group p-4">
                      <summary className="flex cursor-pointer select-none items-center justify-between gap-4 text-sm font-semibold text-foreground">
                        {faq.q}
                        <span
                          aria-hidden="true"
                          className="shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45"
                        >
                          +
                        </span>
                      </summary>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MajorsPage;
