import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Globe,
  Calculator,
  BarChart3,
  ArrowRight,
  BookOpen,
  CircleDollarSign,
  LineChart,
  Wallet,
  GitCompareArrows,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdSlot } from '@/components/ads/AdSlot';
import journeyGif from '@/assets/mascot/edu-roi-journey.gif';
import journeyStill from '@/assets/mascot/edu-roi-journey-still.png';

/* Editorial photography — illustrative only, hosted by Unsplash. */
const PHOTOS = {
  library: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1000&q=80',
  campus: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80',
  study: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1000&q=80',
  finance: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=80',
};

const CAPABILITIES = [
  { icon: Wallet, label: 'Model every cost' },
  { icon: LineChart, label: 'Project long-term returns' },
  { icon: GitCompareArrows, label: 'Compare side by side' },
];

const FEATURES = [
  {
    icon: Calculator,
    title: 'Complete cost model',
    description: 'Tuition, living costs, loans, funding, and opportunity cost in a single calculation.',
  },
  {
    icon: Globe,
    title: 'Global coverage',
    description: 'Compare education costs and outcomes across countries and currencies.',
  },
  {
    icon: BarChart3,
    title: 'Visual breakdowns',
    description: 'Clear charts for cost composition, earnings growth, and break-even timing.',
  },
  {
    icon: CircleDollarSign,
    title: 'Career projections',
    description: 'See annualized returns and the point where your investment pays back.',
  },
];

const STATS = [
  { value: '50+', label: 'Countries', icon: Globe },
  { value: '200+', label: 'Majors', icon: BookOpen },
  { value: '30 yr', label: 'Projection horizon', icon: LineChart },
  { value: '5', label: 'Cost factors modeled', icon: Wallet },
];

const STEPS = [
  {
    step: '01',
    title: 'Enter your details',
    desc: 'Choose a country, major, university, and the costs that apply to your plan.',
  },
  {
    step: '02',
    title: 'Review the analysis',
    desc: 'See total cost, projected earnings, break-even timing, and annualized return.',
  },
  {
    step: '03',
    title: 'Decide with evidence',
    desc: 'Compare alternatives, share the report, and move forward with a clear picture.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 1, 0.5, 1] as [number, number, number, number] },
  }),
};

/* ── EduROI journey visual ─────────────────────────────────────────────────
   The supplied 12-frame animation is used directly so its exact timing,
   transitions and narrative copy are preserved. A first-frame PNG is used
   for reduced-motion and as a load fallback. */

const JourneyMascot = ({ reduceMotion }: { reduceMotion: boolean }) => {
  const [failed, setFailed] = useState(false);
  const showStatic = reduceMotion || failed;

  return (
    <div className="pointer-events-none relative mx-auto w-full max-w-[320px] sm:max-w-[440px] lg:max-w-[520px]">
      <div
        className="journey-stage relative select-none pt-2"
        role="img"
        aria-label="EduROI journey illustration showing the move from wondering whether a degree is worth it to comparing, calculating and seeing a positive ROI"
      >
        <div className="journey-halo" aria-hidden="true" />
        <img
          src={showStatic ? journeyStill : journeyGif}
          alt=""
          width={362}
          height={360}
          className="journey-visual"
          draggable={false}
          decoding="async"
          onError={() => setFailed(true)}
        />
      </div>

      <div className="journey-caption mx-auto mt-5 max-w-[400px] text-center sm:mt-6 lg:mx-0 lg:max-w-none lg:text-left">
        <p className="font-mono text-[12px] uppercase tracking-[0.15em] text-muted-foreground">
          The EduROI journey
        </p>
        <p className="mt-2 font-heading text-[23px] font-medium tracking-[-0.025em] text-foreground sm:text-[26px]">
          From wonder to win.
        </p>
        <p className="mt-2 text-[15px] leading-[1.6] text-muted-foreground sm:text-[16px]">
          Compare outcomes, calculate the return, and decide with evidence.
        </p>
      </div>

      <div className="mx-auto mt-5 grid max-w-[400px] grid-cols-1 gap-3 border-t border-border pt-4 text-left sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-border lg:mx-0 lg:max-w-none">
        {[
          { label: 'All-in cost', detail: 'Tuition, living, funding' },
          { label: 'Break-even', detail: 'The year it pays back' },
          { label: 'Annualized ROI', detail: 'Return on the investment' },
        ].map((item, i) => (
          <div key={item.label} className={i === 0 ? 'sm:pr-4' : 'sm:px-4'}>
            <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-primary">
              {item.label}
            </p>
            <p className="mt-1 text-[13px] leading-snug text-muted-foreground sm:text-[14px]">
              {item.detail}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const Index = () => {
  const reduceMotion = useReducedMotion();
  const initial = reduceMotion ? false : 'hidden';

  return (
    <div className="page-shell">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="grain-paper pointer-events-none absolute inset-0" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full opacity-60"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 68%)' }}
          aria-hidden="true"
        />
        <div className="container relative z-10">
          <div className="grid items-center gap-12 py-10 md:py-14 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-14 lg:py-16">
            <div className="max-w-[660px]">
              <motion.p
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="eyebrow"
              >
                Education ROI platform
              </motion.p>

              <motion.h1
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.06 }}
                className="mt-4 max-w-[13ch] font-heading text-[clamp(2.6rem,5vw,3.9rem)] font-[450] leading-[1.05] tracking-[-0.045em] text-foreground"
              >
                Is your degree worth the investment?
              </motion.h1>

              <motion.p
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.12 }}
                className="mt-5 max-w-[470px] text-[16px] leading-[1.65] text-muted-foreground sm:text-[17px]"
              >
                Calculate the real return on your education. Compare universities, majors, and
                countries before you commit time and money.
              </motion.p>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.18 }}
                className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4"
              >
                <Button asChild size="lg">
                  <Link to="/calculator">
                    Calculate your ROI
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Link
                  to="/majors"
                  className="footer-link text-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
                >
                  Browse majors
                </Link>
              </motion.div>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={reduceMotion ? undefined : { opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.24 }}
                className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-border pt-5"
              >
                {CAPABILITIES.map((item) => (
                  <span key={item.label} className="flex items-center gap-2 text-[13px] text-muted-foreground sm:text-[14px]">
                    <item.icon className="h-4 w-4 text-primary" aria-hidden="true" />
                    {item.label}
                  </span>
                ))}
              </motion.div>

              <motion.p
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={reduceMotion ? undefined : { opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
              >
                Free to use · No sign-up required
              </motion.p>
            </div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative"
            >
              <JourneyMascot reduceMotion={Boolean(reduceMotion)} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Coverage strip */}
      <section className="border-b border-border bg-card/50" aria-label="Coverage">
        <div className="container grid gap-5 py-5 sm:grid-cols-2 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
            Built for decisions across
          </p>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6 lg:justify-items-end">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
                  <stat.icon className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <dd className="font-mono text-sm font-medium tracking-[-0.01em] text-foreground">
                    {stat.value}
                  </dd>
                  <dt className="truncate text-[12px] text-muted-foreground">{stat.label}</dt>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <AdSlot slot="header" className="container my-6" />

      {/* Features — editorial bento */}
      <section className="container py-12 md:py-16">
        <div className="flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between md:gap-12">
          <div>
            <span className="eyebrow">What you get</span>
            <h2 className="mt-4 max-w-xl font-heading text-[clamp(1.9rem,3vw,2.65rem)] font-[450] leading-[1.12] tracking-[-0.04em]">
              Everything you need to decide with confidence
            </h2>
          </div>
          <div className="max-w-xs md:pb-1">
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              The analysis covers the factors that actually change the outcome of an education
              investment.
            </p>
            <Link
              to="/calculator"
              className="footer-link mt-4 text-sm font-medium text-primary underline decoration-primary/25 underline-offset-4 transition-colors hover:decoration-primary"
            >
              Run the model
              <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-12">
          {/* Image tile */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card lg:col-span-5">
            <img
              src={PHOTOS.library}
              alt="Library shelves lined with books"
              width={1000}
              height={1200}
              loading="lazy"
              decoding="async"
              className="h-64 w-full object-cover sm:h-72 lg:h-full lg:min-h-[340px]"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent"
              aria-hidden="true"
            />
            <div className="absolute inset-x-5 bottom-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/65">
                Built on real inputs
              </p>
              <p className="mt-2 max-w-[240px] font-heading text-lg font-medium leading-snug tracking-[-0.02em] text-white">
                Real cost structures, not national averages.
              </p>
            </div>
          </div>

          {/* Feature cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i}
                initial={initial}
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={fadeUp}
                className="group rounded-2xl border border-border bg-card p-5 shadow-card transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-raised"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-primary">
                  <feature.icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-[16px] font-medium text-foreground">{feature.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial statement band */}
      <section className="container pb-12 md:pb-16">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55 }}
          className="relative overflow-hidden rounded-[28px] border border-border"
        >
          <img
            src={PHOTOS.campus}
            alt="University campus building at dusk"
            width={1600}
            height={900}
            loading="lazy"
            decoding="async"
            className="h-[340px] w-full object-cover md:h-[400px]"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/80 to-ink/25"
            aria-hidden="true"
          />
          <div className="absolute inset-0 flex items-end p-6 md:items-center md:p-12">
            <div className="max-w-lg">
              <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/65">
                The decision, not the brochure
              </p>
              <h2 className="mt-4 font-heading text-[clamp(1.8rem,3.2vw,2.75rem)] font-[450] leading-[1.08] tracking-[-0.04em] text-white">
                The degree is the input. The return is the decision.
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/75">
                EduROI turns tuition, living costs, funding, and projected earnings into one clear
                financial picture.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {['Cost', 'Earnings', 'Payback'].map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.06] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-white/85"
                  >
                    <span className="h-1 w-1 rounded-full bg-white/70" aria-hidden="true" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* How it works — split with photography */}
      <section className="border-y border-border bg-surface/45 py-12 md:py-16">
        <div className="container grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative order-2 lg:order-1">
            <div className="overflow-hidden rounded-[24px] border border-border bg-card shadow-raised">
              <img
                src={PHOTOS.study}
                alt="Student reviewing notes and planning at a desk"
                width={1000}
                height={800}
                loading="lazy"
                decoding="async"
                className="h-[300px] w-full object-cover sm:h-[380px]"
              />
            </div>
            <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-border bg-card/95 p-4 shadow-raised backdrop-blur-sm sm:inset-x-auto sm:left-5 sm:max-w-[270px]">
              <p className="font-mono text-[10px] uppercase tracking-[0.13em] text-muted-foreground">
                Built for clarity
              </p>
              <p className="mt-1.5 text-sm font-medium leading-snug text-foreground">
                Every input maps to an outcome you can defend.
              </p>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <span className="eyebrow">How it works</span>
            <h2 className="mt-4 max-w-sm font-heading text-[clamp(1.9rem,3vw,2.65rem)] font-[450] leading-[1.12] tracking-[-0.04em]">
              Three steps to clarity
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              A structured analysis, from the first input to a decision you can defend.
            </p>

            <div className="mt-7">
              {STEPS.map((item, i) => (
                <motion.div
                  key={item.step}
                  custom={i}
                  initial={initial}
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  variants={fadeUp}
                  className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-1 border-t border-border py-5 first:border-t-0 first:pt-0 last:pb-0"
                >
                  <span className="font-mono text-[11px] font-medium tracking-[0.1em] text-primary">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="font-heading text-lg font-medium tracking-[-0.02em] text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-12 md:py-16">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[28px] bg-ink"
        >
          <img
            src={PHOTOS.finance}
            alt=""
            aria-hidden="true"
            width={1600}
            height={900}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/50"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                'radial-gradient(70% 90% at 20% 0%, rgba(42,75,208,0.32) 0%, transparent 70%)',
            }}
            aria-hidden="true"
          />
          <div className="relative z-10 px-6 py-12 md:px-14 md:py-16">
            <div className="max-w-2xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/65">
                Start with your numbers
              </p>
              <h2 className="mt-4 font-heading text-[clamp(1.9rem,3.4vw,2.9rem)] font-[450] leading-[1.08] tracking-[-0.04em] text-white">
                Ready to calculate your education ROI?
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#b2bbc7]">
                Model tuition, living costs, funding, and projected earnings in one place.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Button asChild size="lg" className="bg-white text-ink hover:bg-white/90">
                  <Link to="/calculator">
                    Start the calculator
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Link
                  to="/countries"
                  className="footer-link text-sm font-medium text-white underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white"
                >
                  Explore countries
                </Link>
              </div>
              <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.13em] text-white/60">
                Free to use · No sign-up required
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Index;
