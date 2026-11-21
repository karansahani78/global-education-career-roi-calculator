import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Clock, ArrowRight, ArrowUpRight, BookOpen } from 'lucide-react';
import { AdSlot } from '@/components/ads/AdSlot';
import { Button } from '@/components/ui/button';

export const BLOG_POSTS = [
  {
    slug: 'is-college-worth-it-in-2025',
    title: 'Is College Worth It in 2025? The Data-Driven Answer',
    excerpt: 'With tuition costs rising and remote work exploding, millions are questioning whether a degree still delivers value. We analyzed 10,000+ salary data points to give you the real answer.',
    category: 'Education ROI',
    readTime: '12 min read',
    date: 'February 10, 2026',
    tags: ['College ROI', 'Tuition', 'Career', 'Worth It'],
    featured: true,
  },
  {
    slug: 'highest-roi-degrees-2025',
    title: 'Top 15 Highest ROI Degrees in 2025 (Ranked by Net Return)',
    excerpt: 'Not all degrees are created equal. Computer Science, Nursing, and Engineering consistently top the ROI charts — but the results might surprise you. Full salary data included.',
    category: 'Best Degrees',
    readTime: '10 min read',
    date: 'February 8, 2026',
    tags: ['Best Degrees', 'ROI', 'Salary', 'Rankings'],
    featured: true,
  },
  {
    slug: 'student-loan-roi-strategy',
    title: 'How to Maximize ROI When Taking Student Loans: The Complete Strategy',
    excerpt: 'Student loan debt hit $1.7 trillion — but borrowing strategically can still lead to excellent returns. Learn exactly how to calculate if your loan is worth taking.',
    category: 'Student Loans',
    readTime: '9 min read',
    date: 'February 5, 2026',
    tags: ['Student Loans', 'Debt', 'Strategy', 'ROI'],
    featured: false,
  },
  {
    slug: 'study-abroad-roi-worth-it',
    title: 'Study Abroad ROI: Is an International Degree Worth the Extra Cost?',
    excerpt: 'International degrees cost 2–5x more, but can unlock global career opportunities and higher salaries. We compare ROI across 20 countries to help you decide.',
    category: 'Study Abroad',
    readTime: '11 min read',
    date: 'February 2, 2026',
    tags: ['Study Abroad', 'International', 'Countries', 'ROI'],
    featured: false,
  },
  {
    slug: 'computer-science-degree-roi',
    title: 'Computer Science Degree ROI in 2025: Is It Still the King?',
    excerpt: 'CS grads earn an average of $105,000 starting salary — but with bootcamps and self-taught developers flooding the market, does a CS degree still make financial sense?',
    category: 'Tech Careers',
    readTime: '8 min read',
    date: 'January 28, 2026',
    tags: ['Computer Science', 'Tech', 'Salary', 'Bootcamp'],
    featured: false,
  },
  {
    slug: 'break-even-analysis-education',
    title: 'Education Break-Even Analysis: How Long Until Your Degree Pays Off?',
    excerpt: 'Most degrees take 5–12 years to break even financially. Learn how to calculate your personal break-even point and what to do if it takes too long.',
    category: 'Financial Planning',
    readTime: '7 min read',
    date: 'January 24, 2026',
    tags: ['Break-Even', 'Financial Planning', 'Analysis', 'Timeline'],
    featured: false,
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  'Education ROI': 'border-primary/20 bg-primary/[0.06] text-primary',
  'Best Degrees': 'border-secondary/20 bg-secondary/[0.06] text-secondary',
  'Student Loans': 'border-warning/20 bg-warning/[0.06] text-warning',
  'Study Abroad': 'border-primary/20 bg-primary/[0.06] text-primary',
  'Tech Careers': 'border-secondary/20 bg-secondary/[0.06] text-secondary',
  'Financial Planning': 'border-success/20 bg-success/[0.06] text-success',
};

/* Decorative cover art for featured stories. */
const FEATURED_COVERS: Record<string, string> = {
  'is-college-worth-it-in-2025':
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
  'highest-roi-degrees-2025':
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
};

const BlogPage = () => {
  const featured = BLOG_POSTS.filter(p => p.featured);
  const rest = BLOG_POSTS.filter(p => !p.featured);
  const reduceMotion = useReducedMotion();

  return (
    <>
      <Helmet>
        <title>Education ROI Blog – Expert Guides on Degree Value & Career Finance | EduROI</title>
        <meta name="description" content="Expert articles on education ROI, degree rankings, student loan strategies, and career finance. Data-driven guides to help you make smarter education investment decisions." />
        <link rel="canonical" href="https://eduroi.com/blog" />
        <meta property="og:title" content="Education ROI Blog – EduROI" />
        <meta property="og:description" content="Expert articles on education ROI, degree rankings, student loan strategies, and career finance." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://eduroi.com/blog" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: 'EduROI Blog',
            description: 'Expert guides on education ROI, degree value, and career finance',
            url: 'https://eduroi.com/blog',
            publisher: {
              '@type': 'Organization',
              name: 'EduROI',
              logo: { '@type': 'ImageObject', url: 'https://eduroi.com/logo.png' },
            },
            blogPost: BLOG_POSTS.map(p => ({
              '@type': 'BlogPosting',
              headline: p.title,
              description: p.excerpt,
              url: `https://eduroi.com/blog/${p.slug}`,
              datePublished: p.date,
              author: { '@type': 'Organization', name: 'EduROI' },
            })),
          })}
        </script>
      </Helmet>

      <div className="page-shell">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="grain-paper pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="container relative z-10 max-w-6xl py-10 md:py-14">
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
              >
                <span className="eyebrow">
                  <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                  Insights
                </span>
                <h1 className="mt-4 max-w-3xl font-heading text-[clamp(2.3rem,4.2vw,3.4rem)] font-[450] leading-[1.08] tracking-[-0.045em]">
                  Make smarter <span className="text-primary">education</span> decisions
                </h1>
                <p className="mt-4 max-w-2xl text-[15px] leading-[1.65] text-muted-foreground">
                  Data-driven guides on degree ROI, student loans, career finance, and making your
                  education investment actually pay off.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {['College ROI', 'Student loans', 'Career finance', 'Break-even'].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border bg-card px-3 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.12 }}
                className="relative hidden lg:block"
              >
                <div className="overflow-hidden rounded-[26px] border border-border bg-card shadow-raised">
                  <img
                    src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80"
                    alt="Students seated in a university lecture hall"
                    width={1200}
                    height={800}
                    loading="eager"
                    decoding="async"
                    className="h-[280px] w-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 left-5 rounded-2xl border border-border bg-card px-4 py-3 shadow-raised">
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                    The EduROI journal
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    Evidence over assumptions.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <div className="container max-w-5xl pb-20">
          <AdSlot slot="in-content" className="my-8" />

          {/* Featured Posts */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-12"
          >
            <div className="mb-6 flex items-center justify-between gap-4 border-b border-border pb-3">
              <h2 className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Featured articles
              </h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">
                {String(featured.length).padStart(2, '0')}
              </span>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {featured.map((post, i) => (
                <motion.div
                  key={post.slug}
                  initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                  animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i }}
                >
                  <Link
                    to={`/blog/${post.slug}`}
                    className="group glass-card glass-card-hover flex h-full flex-col p-6"
                  >
                    <div className="relative -mx-6 -mt-6 mb-5 h-40 overflow-hidden">
                      <img
                        src={FEATURED_COVERS[post.slug]}
                        alt=""
                        aria-hidden="true"
                        width={1200}
                        height={600}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <div
                        className="absolute inset-0 bg-gradient-to-t from-ink/30 to-transparent"
                        aria-hidden="true"
                      />
                    </div>

                    <div className="mb-5 flex items-center justify-between gap-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.1em] ${CATEGORY_COLORS[post.category]}`}>
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {post.readTime}
                      </span>
                    </div>

                    <h3 className="font-heading text-xl font-medium leading-snug tracking-[-0.025em] text-foreground transition-colors group-hover:text-primary">
                      {post.title}
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {post.excerpt}
                    </p>

                    <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                      <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground/80">
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-medium text-primary">
                        Read article
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <AdSlot slot="below-results" className="mb-12" />

          {/* All Other Posts */}
          <div>
            <div className="mb-2 flex items-center justify-between gap-4 border-b border-border pb-3">
              <h2 className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                All articles
              </h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">
                {String(rest.length).padStart(2, '0')}
              </span>
            </div>

            {rest.map((post, i) => (
              <motion.div
                key={post.slug}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.04 * i }}
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="group flex flex-col gap-3 border-b border-border py-6 transition-colors md:flex-row md:items-center md:justify-between md:gap-10"
                >
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.1em] ${CATEGORY_COLORS[post.category]}`}>
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {post.readTime}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground/70">
                        {post.date}
                      </span>
                    </div>
                    <h3 className="font-heading text-lg font-medium tracking-[-0.02em] text-foreground transition-colors group-hover:text-primary">
                      {post.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                      {post.excerpt}
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-2 text-xs font-medium text-muted-foreground transition-colors group-hover:text-primary">
                    Read
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>

          <AdSlot slot="in-content" className="my-10" />

          {/* CTA */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="ink-panel relative overflow-hidden rounded-[28px] px-6 py-12 text-center md:px-12 md:py-14"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background:
                  'radial-gradient(70% 90% at 50% 0%, rgba(42,75,208,0.32) 0%, transparent 70%)',
              }}
              aria-hidden="true"
            />
            <div className="relative z-10">
              <h2 className="font-heading text-[clamp(1.75rem,2.6vw,2.25rem)] font-[450] tracking-[-0.035em] text-white">
                Ready to calculate your ROI?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#b2bbc7]">
                Stop guessing. Use our free calculator to get a data-driven answer in under 2 minutes.
              </p>
              <Button asChild size="lg" className="mt-7 bg-white text-ink hover:bg-white/90">
                <Link to="/calculator">
                  Calculate your ROI free
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default BlogPage;
