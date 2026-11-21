import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Loader2,
  TrendingUp,
  DollarSign,
  Clock,
  BookOpen,
  Users,
  Award,
  BarChart3,
  CheckCircle,
  RotateCw,
} from 'lucide-react';
import { fetchSeoPage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { AdSlot } from '@/components/ads/AdSlot';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const SeoPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: page, isLoading, error } = useQuery({
    queryKey: ['seo-page', slug],
    queryFn: () => fetchSeoPage(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-background" role="status" aria-live="polite">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">Loading page…</span>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <BarChart3 className="h-10 w-10 text-muted-foreground/60" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-foreground">Page Not Found</h1>
        <p className="text-muted-foreground">
          {error ? 'Backend unavailable. Please try again later.' : 'No data available for this page.'}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {error && (
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RotateCw aria-hidden="true" />
              Retry
            </Button>
          )}
          <Button asChild variant="ghost">
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const calculatorLink = page.defaultParams
    ? `/calculator?${new URLSearchParams(
        Object.entries(page.defaultParams)
          .filter(([, v]) => v !== undefined && v !== null)
          .map(([k, v]) => [k, String(v)])
      ).toString()}`
    : '/calculator';

  const degreeTitle = page.h1Title.replace('Is ', '').replace('?', '');

  const bodyProse =
    'prose max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground prose-h2:mt-0 prose-h3:text-foreground';

  return (
    <>
      <Helmet>
        <title>{page.metaTitle}</title>
        <meta name="description" content={page.metaDescription} />
        <link rel="canonical" href={page.canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:title" content={page.metaTitle} />
        <meta property="og:description" content={page.metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={page.canonicalUrl} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={page.metaTitle} />
        <meta name="twitter:description" content={page.metaDescription} />

        {/* BreadcrumbList Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://eduroi.com' },
              { '@type': 'ListItem', position: 2, name: page.pageType, item: `https://eduroi.com/${page.pageType}` },
              { '@type': 'ListItem', position: 3, name: degreeTitle, item: page.canonicalUrl },
            ],
          })}
        </script>

        {/* Article Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: page.h1Title,
            description: page.metaDescription,
            url: page.canonicalUrl,
            author: { '@type': 'Organization', name: 'EduROI' },
            publisher: { '@type': 'Organization', name: 'EduROI', logo: { '@type': 'ImageObject', url: 'https://eduroi.com/logo.png' } },
            datePublished: new Date().toISOString(),
            dateModified: new Date().toISOString(),
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="grain-paper pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="container relative z-10 max-w-5xl py-10 md:py-14">
            <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_280px] md:items-start md:gap-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="eyebrow capitalize">
                  <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                  {page.pageType}
                </span>
                <h1 className="mt-3 font-heading text-[clamp(2rem,3.6vw,2.9rem)] font-[450] leading-[1.08] tracking-[-0.04em] text-foreground">
                  {page.h1Title}
                </h1>
                <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                  {page.metaDescription}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <Button asChild size="lg">
                    <Link to={calculatorLink}>
                      Calculate ROI Now
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    Free · No sign-up
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.12 }}
                className="rounded-2xl border border-border bg-card p-4 shadow-card"
              >
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                  What the analysis covers
                </p>
                <ul className="mt-3 space-y-2.5">
                  {[
                    { icon: DollarSign, label: 'Tuition and living costs' },
                    { icon: TrendingUp, label: 'Salary and career growth' },
                    { icon: Clock, label: 'Break-even timing' },
                    { icon: BarChart3, label: 'Return on investment' },
                  ].map(({ icon: Icon, label }) => (
                    <li key={label} className="flex items-center gap-2.5 text-xs text-foreground/80">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-primary">
                        <Icon className="h-3 w-3" aria-hidden="true" />
                      </span>
                      {label}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Table of Contents */}
        <section className="container pt-10">
          <motion.nav
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            aria-label="Table of contents"
            className="mx-auto max-w-4xl rounded-xl border border-border bg-card p-6 shadow-card"
          >
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
              <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
              Table of Contents
            </h2>
            <ul className="grid gap-2 text-sm md:grid-cols-2">
              <li><a href="#overview" className="text-primary underline-offset-2 hover:underline">Complete ROI Analysis</a></li>
              <li><a href="#factors" className="text-primary underline-offset-2 hover:underline">Key Factors to Consider</a></li>
              <li><a href="#calculation" className="text-primary underline-offset-2 hover:underline">How ROI is Calculated</a></li>
              <li><a href="#career" className="text-primary underline-offset-2 hover:underline">Career Prospects</a></li>
              <li><a href="#comparison" className="text-primary underline-offset-2 hover:underline">Compare Similar Degrees</a></li>
              <li><a href="#faqs" className="text-primary underline-offset-2 hover:underline">Frequently Asked Questions</a></li>
            </ul>
          </motion.nav>
        </section>

        {/* ─── OVERVIEW SECTION ─── */}
        <section id="overview" className="container scroll-mt-20 py-14 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-4xl space-y-6"
          >
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              {degreeTitle} – Complete ROI Analysis
            </h2>

            <div className={`${bodyProse} space-y-5`}>
              <p className="text-lg">
                Choosing the right degree is one of the most important financial decisions you will ever make.
                In this comprehensive guide, we break down whether <strong>{degreeTitle}</strong> makes financial sense based on tuition costs, expected salary, career demand, and long-term return on investment.
              </p>

              <p>
                Our analysis uses real market data, salary projections from verified sources, and education cost modeling to help
                students understand the true return on their education investment — not just the headline salary figures you see advertised.
              </p>

              <p>
                We examine multiple scenarios including best-case, worst-case, and most-likely outcomes to give you a realistic picture
                of what to expect financially over a 10, 20, and 30-year career horizon.
              </p>
            </div>

            <div className="grid gap-4 pt-2 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="mb-3 inline-flex rounded-lg border border-primary/20 bg-primary/10 p-2">
                  <DollarSign className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">Financial ROI</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">Complete cost-benefit analysis including tuition, living expenses, and opportunity costs</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="mb-3 inline-flex rounded-lg border border-success/20 bg-success/10 p-2">
                  <TrendingUp className="h-5 w-5 text-success" aria-hidden="true" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">Career Growth</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">Long-term salary trajectory and advancement opportunities in the field</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="mb-3 inline-flex rounded-lg border border-warning/20 bg-warning/10 p-2">
                  <BarChart3 className="h-5 w-5 text-warning" aria-hidden="true" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">Market Demand</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">Industry trends, job availability, and future-proofing considerations</p>
              </div>
            </div>
          </motion.div>
        </section>

        <AdSlot slot="in-content" className="container mb-8" />

        {/* ─── KEY FACTORS ─── */}
        <section id="factors" className="container scroll-mt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-4xl space-y-6"
          >
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              Key Factors to Consider When Evaluating {degreeTitle}
            </h2>

            <div className="space-y-5">
              {[
                {
                  title: 'Total Cost of Education',
                  body: 'Beyond tuition, consider textbooks, supplies, technology, housing, transportation, and other fees that can add 20-40% to your total education costs.',
                },
                {
                  title: 'Opportunity Cost',
                  body: 'The income you forgo while studying represents a significant hidden cost. For a 4-year degree, this could mean $100,000+ in lost earnings.',
                },
                {
                  title: 'Starting Salary vs. Career Trajectory',
                  body: 'Some degrees have lower starting salaries but steeper growth curves. Consider 10-year and 20-year earnings, not just entry-level pay.',
                },
                {
                  title: 'Industry Stability and Automation Risk',
                  body: 'Future-proof your career by understanding which roles are growing, stable, or at risk of automation and outsourcing.',
                },
                {
                  title: 'Geographic Flexibility',
                  body: 'Can you work remotely? Are jobs concentrated in expensive cities? Location requirements significantly impact real take-home pay.',
                },
              ].map(({ title, body }) => (
                <div key={title} className="flex items-start gap-4">
                  <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ─── CTA BOX 1 ─── */}
        <section className="container pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-4xl rounded-2xl border border-primary/25 bg-primary/5 p-8 text-center"
          >
            <TrendingUp className="mx-auto mb-4 h-10 w-10 text-primary" aria-hidden="true" />
            <h3 className="mb-3 text-xl font-bold text-foreground">
              Get Your Personalized ROI Calculation
            </h3>
            <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
              Use our free calculator to see exactly how {degreeTitle} stacks up for your specific situation,
              location, and financial goals.
            </p>
            <Button asChild size="lg">
              <Link to={calculatorLink}>
                Calculate Now <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </motion.div>
        </section>

        <AdSlot slot="in-content" className="container mb-8" />

        {/* ─── HOW ROI IS CALCULATED ─── */}
        <section id="calculation" className="container scroll-mt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-4xl space-y-6"
          >
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              How We Calculate Education ROI
            </h2>

            <p className="leading-relaxed text-muted-foreground">
              Our ROI calculation methodology is based on industry-standard financial modeling used by education consultants
              and financial advisors. We take a comprehensive approach that goes beyond simple "salary minus tuition" math.
            </p>

            <div className="space-y-4 rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground">ROI Formula Components:</h3>

              <div className="space-y-4">
                {[
                  { title: 'Direct Education Costs', body: 'Tuition, fees, books, supplies, and technology requirements' },
                  { title: 'Living Expenses During Studies', body: 'Housing, food, transportation, and personal expenses for the duration of the program' },
                  { title: 'Opportunity Cost', body: 'Income you would have earned if working instead of studying (often the largest hidden cost)' },
                  { title: 'Expected Post-Graduation Salary', body: 'Median starting salary based on verified data from graduates in the field' },
                  { title: 'Career Growth Trajectory', body: 'Expected salary increases over 10-30 years based on industry norms and advancement opportunities' },
                  { title: 'Market Demand & Job Security', body: 'Industry growth projections, automation risk, and employment stability factors' },
                ].map(({ title, body }, i) => (
                  <div key={title} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{title}</h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="leading-relaxed text-muted-foreground">
              This comprehensive approach gives a realistic, conservative, and transparent picture of what students
              can expect financially over the long term. We adjust for inflation, regional cost differences, and market conditions.
            </p>
          </motion.div>
        </section>

        {/* ─── CAREER PROSPECTS ─── */}
        <section id="career" className="container scroll-mt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-4xl space-y-6"
          >
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              Career Prospects and Job Market Outlook
            </h2>

            <p className="leading-relaxed text-muted-foreground">
              Understanding the job market is crucial for evaluating education ROI. A degree with excellent financial returns
              today might face saturation or automation risks in the future. Here's what you need to know about careers
              related to {degreeTitle}.
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-6">
                <Users className="mb-4 h-8 w-8 text-primary" aria-hidden="true" />
                <h3 className="mb-3 font-semibold text-foreground">Employment Opportunities</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {[
                    'Job availability in major cities vs. rural areas',
                    'Entry-level position requirements and competition',
                    'Industry sectors with highest demand',
                    'Remote work and freelance opportunities',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-0.5 text-primary" aria-hidden="true">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <Award className="mb-4 h-8 w-8 text-secondary" aria-hidden="true" />
                <h3 className="mb-3 font-semibold text-foreground">Career Advancement</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {[
                    'Typical career progression timeline',
                    'Additional certifications that boost earnings',
                    'Management and leadership opportunities',
                    'Entrepreneurship and consulting potential',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-0.5 text-secondary" aria-hidden="true">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-xl border border-warning/25 bg-warning/5 p-6">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
                <Clock className="h-5 w-5 text-warning" aria-hidden="true" />
                Future-Proofing Considerations
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                As automation and AI reshape the job market, it's essential to consider which skills remain valuable.
                Fields requiring human creativity, complex problem-solving, emotional intelligence, and strategic thinking
                tend to be more resilient to technological disruption. Evaluate how {degreeTitle} prepares you for
                an evolving workplace.
              </p>
            </div>
          </motion.div>
        </section>

        <AdSlot slot="in-content" className="container mb-8" />

        {/* ─── COMPARISON SECTION ─── */}
        <section id="comparison" className="container scroll-mt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-4xl space-y-6"
          >
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              Compare {degreeTitle} with Similar Degrees
            </h2>

            <p className="leading-relaxed text-muted-foreground">
              Before making your final decision, it's worth exploring related degrees that might offer better ROI,
              align more closely with your interests, or provide more career flexibility.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  to: '/majors',
                  title: 'Compare Different Majors →',
                  body: `See how ${degreeTitle} stacks up against other popular degree programs in terms of ROI, salary, and job prospects.`,
                },
                {
                  to: '/countries',
                  title: 'Best Countries for Education ROI →',
                  body: `Discover which countries offer the best value for ${degreeTitle} based on tuition costs and post-graduation salaries.`,
                },
                {
                  to: '/calculator',
                  title: 'ROI Calculator →',
                  body: 'Get a personalized ROI estimate based on your specific situation, location, and financial circumstances.',
                },
                {
                  to: '/blog',
                  title: 'Education Finance Blog →',
                  body: 'Read expert insights on maximizing education ROI, reducing student debt, and career planning strategies.',
                },
              ].map(({ to, title, body }) => (
                <Link
                  key={to + title}
                  to={to}
                  className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:bg-surface"
                >
                  <h3 className="mb-2 font-semibold text-foreground transition-colors group-hover:text-primary">
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
                </Link>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ─── CTA BOX 2 ─── */}
        <section className="container pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-4xl rounded-2xl border border-primary/25 bg-primary/5 p-8"
          >
            <div className="flex flex-col items-center gap-6 md:flex-row">
              <div className="flex-1">
                <h3 className="mb-3 text-2xl font-bold text-foreground">
                  Ready to Make an Informed Decision?
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  Use our comprehensive ROI calculator to see exact numbers for {degreeTitle} based on your location,
                  program choice, and financial situation. Get instant results in under 2 minutes.
                </p>
              </div>
              <Button asChild size="lg" className="shrink-0">
                <Link to={calculatorLink}>
                  Start Calculator <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </section>

        <AdSlot slot="below-results" className="container mb-8" />

        {/* FAQs */}
        {page.faqs && page.faqs.length > 0 && (
          <section id="faqs" className="container scroll-mt-20 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mx-auto max-w-3xl"
            >
              <h2 className="mb-8 text-center text-2xl font-bold text-foreground md:text-3xl">
                Frequently Asked <span className="text-primary">Questions</span>
              </h2>
              <Accordion type="single" collapsible className="space-y-3">
                {page.faqs.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`faq-${i}`}
                    className="rounded-xl border border-border bg-card px-6"
                  >
                    <AccordionTrigger className="text-left text-base font-medium text-foreground hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {/* JSON-LD for FAQs */}
              <Helmet>
                <script type="application/ld+json">
                  {JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'FAQPage',
                    mainEntity: page.faqs.map((faq) => ({
                      '@type': 'Question',
                      name: faq.question,
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: faq.answer,
                      },
                    })),
                  })}
                </script>
              </Helmet>
            </motion.div>
          </section>
        )}

        {/* ─── BOTTOM LINE SECTION ─── */}
        <section className="container pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-4xl space-y-6"
          >
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              The Bottom Line: {page.h1Title}
            </h2>

            <p className="text-lg leading-relaxed text-muted-foreground">
              The decision to pursue {degreeTitle} should be based on comprehensive financial analysis, career goals,
              and personal interests. While ROI is important, it's not the only factor to consider.
            </p>

            <div className="space-y-4 rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground">Key Takeaways:</h3>
              <ul className="space-y-2">
                {[
                  'Calculate total costs including opportunity cost, not just tuition',
                  'Consider long-term career trajectory, not just starting salary',
                  'Evaluate job market demand and future-proofing potential',
                  'Compare with alternative degrees and career paths',
                  'Use data-driven tools like our ROI calculator for personalized insights',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="leading-relaxed text-muted-foreground">
              Remember, the best degree is one that aligns with your strengths, interests, and career goals while
              providing solid financial returns. Use our calculator to get specific numbers for your situation.
            </p>
          </motion.div>
        </section>

        <AdSlot slot="in-content" className="container mb-8" />

        {/* Final CTA */}
        <section className="container pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border bg-card p-10 text-center shadow-card md:p-16"
          >
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              Calculate Your Education ROI in 2 Minutes
            </h2>
            <p className="mx-auto mt-4 max-w-lg leading-relaxed text-muted-foreground">
              Get instant, personalized ROI analysis for {degreeTitle} based on your specific situation.
              Make data-driven decisions about your education investment.
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link to={calculatorLink}>
                Start Free Calculator
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </motion.div>
        </section>
      </div>
    </>
  );
};

export default SeoPage;
