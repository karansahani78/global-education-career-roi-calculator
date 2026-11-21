import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  DollarSign,
  Briefcase,
  Settings2,
  Loader2,
  AlertCircle,
  Shield,
  TrendingUp,
  Globe,
  Zap,
  CheckCircle,
  RotateCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import {
  fetchCountries,
  fetchMajors,
  fetchDegreeLevels,
  fetchCurrencies,
  fetchUniversities,
  calculateRoi,
} from '@/lib/api';
import { AdSlot } from '@/components/ads/AdSlot';
import type { RoiCalculationRequest, CountryDto } from '@/types/api';

const STEPS = [
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'costs', label: 'Costs', icon: DollarSign },
  { id: 'income', label: 'Income', icon: Briefcase },
  { id: 'advanced', label: 'Advanced', icon: Settings2 },
];

const STORAGE_KEY = 'eduroi-calculator-form';

const defaultForm: Partial<RoiCalculationRequest> = {
  countryCode: '',
  majorId: undefined,
  degreeLevelId: undefined,
  tuitionAnnual: 0,
  livingCostAnnual: 0,
  otherCostsAnnual: 0,
  durationYears: 4,
  loanAmount: 0,
  interestRate: 5,
  loanTermYears: 10,
  partTimeIncomeAnnual: 0,
  expectedSalaryAfter: 0,
  currentSalary: 0,
  inflationRate: 3,
  taxRate: 25,
  calculationYears: 30,
  currencyCode: 'USD',
};

function loadForm(): Partial<RoiCalculationRequest> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...defaultForm, ...JSON.parse(saved) };
  } catch {
    // Corrupt or unavailable storage: fall back to a fresh form.
  }
  return { ...defaultForm };
}

function saveForm(form: Partial<RoiCalculationRequest>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  } catch {
    // Storage can be unavailable (e.g. private mode); saving is best-effort.
  }
}

const CalculatorPage = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Partial<RoiCalculationRequest>>(loadForm);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    data: countries,
    isLoading: countriesLoading,
    isError: countriesError,
    refetch: refetchCountries,
  } = useQuery({
    queryKey: ['countries'],
    queryFn: fetchCountries,
  });

  const {
    data: majors,
    isLoading: majorsLoading,
    isError: majorsError,
    refetch: refetchMajors,
  } = useQuery({
    queryKey: ['majors'],
    queryFn: () => fetchMajors(),
  });

  const {
    data: degreeLevels,
    isLoading: degreesLoading,
    isError: degreesError,
    refetch: refetchDegrees,
  } = useQuery({
    queryKey: ['degree-levels'],
    queryFn: fetchDegreeLevels,
  });

  const {
    data: currencies,
    isLoading: currenciesLoading,
    isError: currenciesError,
    refetch: refetchCurrencies,
  } = useQuery({
    queryKey: ['currencies'],
    queryFn: fetchCurrencies,
  });

  const selectedCountry = countries?.find((c: CountryDto) => c.code === form.countryCode);

  const { data: universities } = useQuery({
    queryKey: ['universities', selectedCountry?.id],
    queryFn: () => fetchUniversities(selectedCountry!.id),
    enabled: !!selectedCountry?.id,
  });

  useEffect(() => {
    const first = (...keys: string[]) => {
      for (const key of keys) {
        const value = searchParams.get(key);
        if (value !== null && value !== '') return value;
      }
      return null;
    };
    const asInt = (value: string | null) => {
      if (value === null) return undefined;
      const parsed = Number.parseInt(value, 10);
      return Number.isNaN(parsed) ? undefined : parsed;
    };
    const asNumber = (value: string | null) => {
      if (value === null) return undefined;
      const parsed = Number.parseFloat(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    };

    const countryParam = first('country', 'countryCode');
    const majorParam = asInt(first('major', 'majorId'));
    const degreeParam = asInt(first('degree', 'degreeLevelId'));
    const universityParam = asInt(first('university', 'universityId'));
    const tuitionParam = asNumber(first('tuitionAnnual', 'tuition'));
    const livingParam = asNumber(first('livingCostAnnual', 'livingCost'));
    const otherParam = asNumber(first('otherCostsAnnual', 'otherCosts'));
    const durationParam = asNumber(first('durationYears', 'duration'));
    const salaryParam = asNumber(first('expectedSalaryAfter', 'expectedSalary'));
    const currentSalaryParam = asNumber(first('currentSalary'));
    const currencyParam = first('currencyCode', 'currency');

    const patch: Partial<RoiCalculationRequest> = {};
    if (countryParam) patch.countryCode = countryParam;
    if (majorParam !== undefined) patch.majorId = majorParam;
    if (degreeParam !== undefined) patch.degreeLevelId = degreeParam;
    if (universityParam !== undefined) patch.universityId = universityParam;
    if (tuitionParam !== undefined) patch.tuitionAnnual = tuitionParam;
    if (livingParam !== undefined) patch.livingCostAnnual = livingParam;
    if (otherParam !== undefined) patch.otherCostsAnnual = otherParam;
    if (durationParam !== undefined) patch.durationYears = durationParam;
    if (salaryParam !== undefined) patch.expectedSalaryAfter = salaryParam;
    if (currentSalaryParam !== undefined) patch.currentSalary = currentSalaryParam;
    if (currencyParam) patch.currencyCode = currencyParam;

    if (Object.keys(patch).length > 0) {
      setForm(prev => ({ ...prev, ...patch }));
    }
  }, [searchParams]);

  useEffect(() => { saveForm(form); }, [form]);

  const update = (key: keyof RoiCalculationRequest, value: string | number) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const numUpdate = (key: keyof RoiCalculationRequest, value: string) => {
    const num = parseFloat(value);
    update(key, isNaN(num) ? 0 : num);
  };

  const canNext = () => {
    const livingCost = form.livingCostAnnual ?? 0;
    if (step === 0) return !!(form.countryCode && form.majorId && form.degreeLevelId);
    // The API validates livingCostAnnual as strictly positive.
    if (step === 1) return (form.tuitionAnnual ?? 0) > 0 && livingCost > 0;
    if (step === 2) return (form.expectedSalaryAfter ?? 0) > 0;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSubmitError(null);
    try {
      const result = await calculateRoi(form as RoiCalculationRequest);
      sessionStorage.setItem('eduroi-result', JSON.stringify(result));
      navigate(`/results/${result.uuid}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Calculation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const retryReferenceData = () => {
    refetchCountries();
    refetchMajors();
    refetchDegrees();
    refetchCurrencies();
  };

  const isReferenceLoading = countriesLoading || majorsLoading || degreesLoading || currenciesLoading;
  const hasReferenceError = countriesError || majorsError || degreesError || currenciesError;

  if (hasReferenceError) {
    return (
      <div className="page-shell flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-card">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-lg font-semibold text-foreground">Couldn’t load calculator data</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The reference data could not be loaded from the server. Check your connection and try again.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <Button onClick={retryReferenceData} className="gap-2">
              <RotateCw className="h-4 w-4" aria-hidden="true" />
              Try again
            </Button>
            <Button asChild variant="outline">
              <Link to="/">Go home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isReferenceLoading) {
    return (
      <div className="page-shell" aria-busy="true" aria-live="polite">
        <div className="container max-w-3xl py-14">
          <div className="mx-auto mb-10 flex max-w-md flex-col items-center gap-3 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Loading calculator data…</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-7 md:p-9">
            <div className="grid gap-5 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-24 animate-shimmer rounded bg-muted" />
                  <div className="h-11 w-full rounded-lg bg-muted" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── SEO ── */}
      <Helmet>
        <title>Free Education ROI Calculator – Is Your Degree Worth It? | EduROI</title>
        <meta name="description" content="Calculate the return on investment for any degree in under 2 minutes. Our free education ROI calculator shows net ROI, break-even years, lifetime earnings, and career outlook across 50+ countries." />
        <link rel="canonical" href="https://eduroi.com/calculator" />
        <meta property="og:title" content="Free Education ROI Calculator – EduROI" />
        <meta property="og:description" content="Calculate the true ROI of your degree in under 2 minutes. Compare costs, salaries, and break-even timelines." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://eduroi.com/calculator" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Education ROI Calculator – EduROI" />
        <meta name="twitter:description" content="Calculate the true ROI of your degree in under 2 minutes." />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'EduROI Education ROI Calculator',
            url: 'https://eduroi.com/calculator',
            description: 'Free education return on investment calculator. Calculate net ROI, break-even years, and lifetime earnings for any degree.',
            applicationCategory: 'FinanceApplication',
            operatingSystem: 'Web',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            featureList: [
              'Education ROI calculation',
              'Break-even timeline analysis',
              'Lifetime earnings projection',
              'Career outlook insights',
              'Multi-country support',
              'Shareable results',
            ],
          })}
        </script>
      </Helmet>

      <div className="page-shell">
        <div className="container max-w-3xl py-10 md:py-14">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8 grid gap-6 border-b border-border pb-6 md:grid-cols-[minmax(0,1fr)_228px] md:items-start md:gap-8"
          >
            <div>
              <span className="eyebrow">ROI calculator</span>
              <h1 className="mt-3 font-heading text-[clamp(2rem,3.6vw,2.75rem)] font-[450] leading-[1.08] tracking-[-0.04em] text-foreground">
                Education ROI calculator
              </h1>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                Work through four short steps to model the cost, funding, and earnings behind your
                education decision.
              </p>

              <ul className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-primary" aria-hidden="true" />Free, no registration</li>
                <li className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-primary" aria-hidden="true" />Market-based assumptions</li>
                <li className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-primary" aria-hidden="true" />50+ countries</li>
                <li className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary" aria-hidden="true" />Instant results</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                What you will see
              </p>
              <ul className="mt-3 space-y-2">
                {[
                  'Total cost of attendance',
                  'Break-even timeline',
                  'Annualized ROI',
                  'Comparison-ready results',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs leading-snug text-foreground/80">
                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-3 border-t border-border pt-2.5 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                4 steps · about 2 minutes
              </p>
            </div>
          </motion.div>

          {/* Ad above calculator */}
          <AdSlot slot="in-content" className="mb-8" />

          {/* Progress steps */}
          <nav aria-label="Calculator steps" className="mb-6">
            <ol className="flex items-center justify-between gap-1">
              {STEPS.map((s, i) => {
                const complete = i < step;
                const current = i === step;
                return (
                  <li key={s.id} className="flex flex-1 flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={() => i <= step && setStep(i)}
                      disabled={i > step}
                      aria-current={current ? 'step' : undefined}
                      aria-label={`Step ${i + 1}: ${s.label}${complete ? ' (completed)' : ''}`}
                      className="group flex flex-col items-center gap-2 rounded-lg px-2 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed"
                    >
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
                          current
                            ? 'border-primary bg-primary text-primary-foreground'
                            : complete
                              ? 'border-primary/30 bg-primary/10 text-primary'
                              : 'border-border bg-surface text-muted-foreground'
                        }`}
                      >
                        {complete ? (
                          <CheckCircle className="h-5 w-5" aria-hidden="true" />
                        ) : (
                          <s.icon className="h-5 w-5" aria-hidden="true" />
                        )}
                      </span>
                      <span className={current || complete ? 'text-foreground' : 'text-muted-foreground'}>
                        {s.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <div className="mt-4 h-1 overflow-hidden rounded-full bg-muted" role="presentation">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={false}
                animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
              />
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Step {step + 1} of {STEPS.length}
            </p>
          </nav>

          {/* Form card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
              className="rounded-xl border border-border bg-card p-6 shadow-card md:p-8"
            >
              {step === 0 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                      <GraduationCap className="h-5 w-5 text-primary" aria-hidden="true" />
                      Education details
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">Tell us about your education plans.</p>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Select value={form.countryCode || ''} onValueChange={(v) => update('countryCode', v)}>
                        <SelectTrigger id="country"><SelectValue placeholder="Select country" /></SelectTrigger>
                        <SelectContent>
                          {countries && countries.length > 0 ? countries.map(c => (
                            <SelectItem key={c.id} value={c.code}>{c.name}</SelectItem>
                          )) : (
                            <SelectItem value="_none" disabled>No countries available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="university">University <span className="font-normal text-muted-foreground">(optional)</span></Label>
                      <Select
                        value={form.universityId ? String(form.universityId) : ''}
                        onValueChange={(v) => update('universityId', parseInt(v))}
                        disabled={!selectedCountry}
                      >
                        <SelectTrigger id="university"><SelectValue placeholder={selectedCountry ? "Select university" : "Select country first"} /></SelectTrigger>
                        <SelectContent>
                          {universities && universities.length > 0 ? universities.map(u => (
                            <SelectItem key={u.id} value={String(u.id)}>{u.name} — {u.city}</SelectItem>
                          )) : (
                            <SelectItem value="_none" disabled>No universities available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="major">Major</Label>
                      <Select value={form.majorId ? String(form.majorId) : ''} onValueChange={(v) => update('majorId', parseInt(v))}>
                        <SelectTrigger id="major"><SelectValue placeholder="Select major" /></SelectTrigger>
                        <SelectContent>
                          {majors && majors.length > 0 ? majors.map(m => (
                            <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                          )) : (
                            <SelectItem value="_none" disabled>No majors available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="degree-level">Degree level</Label>
                      <Select value={form.degreeLevelId ? String(form.degreeLevelId) : ''} onValueChange={(v) => {
                        const deg = degreeLevels?.find(d => d.id === parseInt(v));
                        setForm(prev => ({ ...prev, degreeLevelId: parseInt(v), durationYears: deg?.typicalDurationYears || 4 }));
                      }}>
                        <SelectTrigger id="degree-level"><SelectValue placeholder="Select degree" /></SelectTrigger>
                        <SelectContent>
                          {degreeLevels && degreeLevels.length > 0 ? degreeLevels.map(d => (
                            <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                          )) : (
                            <SelectItem value="_none" disabled>No degree levels available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (years)</Label>
                      <Input id="duration" type="number" min={1} max={10} value={form.durationYears ?? ''} onChange={(e) => numUpdate('durationYears', e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                      <DollarSign className="h-5 w-5 text-primary" aria-hidden="true" />
                      Cost details
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">Enter your expected education costs.</p>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="tuition">Annual tuition</Label>
                      <Input id="tuition" type="number" min={0} value={form.tuitionAnnual ?? ''} onChange={(e) => numUpdate('tuitionAnnual', e.target.value)} placeholder="e.g. 25000" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="living-cost">Annual living cost <span className="text-destructive">*</span></Label>
                      <Input id="living-cost" type="number" min={0} value={form.livingCostAnnual ?? ''} onChange={(e) => numUpdate('livingCostAnnual', e.target.value)} placeholder="e.g. 15000" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="other-costs">Other annual costs</Label>
                      <Input id="other-costs" type="number" min={0} value={form.otherCostsAnnual ?? ''} onChange={(e) => numUpdate('otherCostsAnnual', e.target.value)} placeholder="e.g. 3000" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loan-amount">Loan amount</Label>
                      <Input id="loan-amount" type="number" min={0} value={form.loanAmount ?? ''} onChange={(e) => numUpdate('loanAmount', e.target.value)} placeholder="e.g. 50000" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="interest-rate">Interest rate (%)</Label>
                      <Input id="interest-rate" type="number" min={0} max={30} step={0.1} value={form.interestRate ?? ''} onChange={(e) => numUpdate('interestRate', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loan-term">Loan term (years)</Label>
                      <Input id="loan-term" type="number" min={1} max={30} value={form.loanTermYears ?? ''} onChange={(e) => numUpdate('loanTermYears', e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                      <Briefcase className="h-5 w-5 text-primary" aria-hidden="true" />
                      Income details
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Enter your <strong className="font-semibold text-foreground">annual</strong> income expectations (before tax).
                    </p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="expected-salary">Expected annual salary after graduation (before tax)</Label>
                      <Input
                        id="expected-salary"
                        type="number"
                        min={0}
                        value={form.expectedSalaryAfter ?? ''}
                        onChange={(e) => numUpdate('expectedSalaryAfter', e.target.value)}
                        placeholder="e.g. 75000 per year"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="current-salary">Current annual salary (before tax)</Label>
                      <Input
                        id="current-salary"
                        type="number"
                        min={0}
                        value={form.currentSalary ?? ''}
                        onChange={(e) => numUpdate('currentSalary', e.target.value)}
                        placeholder="e.g. 30000 per year"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="part-time">Part-time income during studies (annual)</Label>
                      <Input
                        id="part-time"
                        type="number"
                        min={0}
                        value={form.partTimeIncomeAnnual ?? ''}
                        onChange={(e) => numUpdate('partTimeIncomeAnnual', e.target.value)}
                        placeholder="e.g. 8000 per year"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                      <Settings2 className="h-5 w-5 text-primary" aria-hidden="true" />
                      Advanced settings
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">Fine-tune your calculation parameters.</p>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="tax-rate">Tax rate (%)</Label>
                      <Input id="tax-rate" type="number" min={0} max={60} value={form.taxRate ?? ''} onChange={(e) => numUpdate('taxRate', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inflation-rate">Inflation rate (%)</Label>
                      <Input id="inflation-rate" type="number" min={0} max={20} step={0.1} value={form.inflationRate ?? ''} onChange={(e) => numUpdate('inflationRate', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="calculation-years">Calculation period (years)</Label>
                      <Input id="calculation-years" type="number" min={5} max={50} value={form.calculationYears ?? ''} onChange={(e) => numUpdate('calculationYears', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={form.currencyCode || 'USD'} onValueChange={(v) => update('currencyCode', v)}>
                        <SelectTrigger id="currency"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {currencies && currencies.length > 0 ? currencies.map(c => (
                            <SelectItem key={c.code} value={c.code}>{c.symbol} {c.name} ({c.code})</SelectItem>
                          )) : (
                            <SelectItem value="_none" disabled>No currencies available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Submit error */}
          {submitError && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <AlertTitle>Calculation failed</AlertTitle>
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
            </Button>

            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="gap-2">
                Next <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading} className="gap-2 px-7">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Calculating…
                  </>
                ) : (
                  <>Calculate ROI <ArrowRight className="h-4 w-4" aria-hidden="true" /></>
                )}
              </Button>
            )}
          </div>

          <AdSlot slot="below-results" className="mt-8" />

          {/* SEO content */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mt-12 space-y-8"
          >
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">What you get from this calculator</h2>
              <ul className="mt-4 grid gap-3 md:grid-cols-2">
                {[
                  'Net ROI and ROI percentage for your degree',
                  'Break-even timeline in years',
                  'Lifetime earnings projection',
                  'Conservative, expected & optimistic scenarios',
                  'Career outlook and market demand analysis',
                  'Shareable results link',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <AdSlot slot="in-content" />

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">How the education ROI calculator works</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Our calculator uses a comprehensive financial model that accounts for total education costs
                (tuition, living, opportunity cost), post-graduation salary projections, tax rates, inflation,
                and loan interest. The result is a realistic, data-driven picture of your degree's financial return.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Unlike simple "salary minus tuition" estimates, EduROI calculates your <strong className="font-semibold text-foreground">true net ROI</strong> —
                the difference between what you earn with a degree versus what you would have earned without it,
                minus everything it cost you to get there.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Explore more ROI insights</h2>
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  { to: '/majors', title: 'Compare majors', desc: 'See which degrees offer the best ROI across fields' },
                  { to: '/countries', title: 'Best countries', desc: 'Discover where your degree delivers the highest return' },
                  { to: '/blog', title: 'Education finance blog', desc: 'Guides on maximising education ROI' },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/35 hover:bg-surface"
                  >
                    <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                      {item.title}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default CalculatorPage;
