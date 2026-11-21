import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitCompareArrows,
  Trophy,
  AlertCircle,
  Loader2,
  ChevronDown,
  Sparkles,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import {
  fetchCountries,
  fetchMajors,
  fetchDegreeLevels,
  fetchCurrencies,
  fetchUniversities,
  compareOptions,
} from '@/lib/api';
import type {
  RoiCalculationRequest,
  CountryDto,
  MajorDto,
  DegreeLevelDto,
  CurrencyDto,
  CompareResponse,
} from '@/types/api';
import { VERDICT_CONFIG } from '@/types/api';

// ─── UNCHANGED LOGIC ──────────────────────────────────────────────────────────

const defaultOption: Partial<RoiCalculationRequest> = {
  countryCode: '', majorId: undefined, degreeLevelId: undefined,
  tuitionAnnual: 0, livingCostAnnual: 0, otherCostsAnnual: 0, durationYears: 4,
  loanAmount: 0, interestRate: 0, loanTermYears: 10, partTimeIncomeAnnual: 0,
  expectedSalaryAfter: 0, currentSalary: 0, inflationRate: 3, taxRate: 25,
  calculationYears: 10, currencyCode: 'USD',
};

function isOptionComplete(opt: Partial<RoiCalculationRequest>) {
  return !!(
    opt.countryCode &&
    opt.majorId &&
    opt.degreeLevelId &&
    (opt.tuitionAnnual ?? 0) > 0 &&
    // The API validates livingCostAnnual as strictly positive.
    (opt.livingCostAnnual ?? 0) > 0 &&
    (opt.expectedSalaryAfter ?? 0) > 0
  );
}

const VERDICT_STYLES = {
  Excellent: { bg: 'bg-success/10', color: 'text-success', border: 'border-success/30' },
  Good: { bg: 'bg-success/10', color: 'text-success', border: 'border-success/30' },
  Fair: { bg: 'bg-warning/10', color: 'text-warning', border: 'border-warning/30' },
  Poor: { bg: 'bg-destructive/10', color: 'text-destructive', border: 'border-destructive/30' },
} as const;

// ─── OPTION FORM ──────────────────────────────────────────────────────────────

const OptionForm = ({
  label, option, onChange, countries, majors, degreeLevels, currencies, index,
}: {
  label: string;
  option: Partial<RoiCalculationRequest>;
  onChange: (opt: Partial<RoiCalculationRequest>) => void;
  countries: CountryDto[] | undefined;
  majors: MajorDto[] | undefined;
  degreeLevels: DegreeLevelDto[] | undefined;
  currencies: CurrencyDto[] | undefined;
  index: number;
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const selectedCountry = countries?.find(c => c.code === option.countryCode);
  const { data: universities } = useQuery({
    queryKey: ['universities', selectedCountry?.id],
    queryFn: () => fetchUniversities(selectedCountry!.id),
    enabled: !!selectedCountry?.id,
  });

  const update = (key: keyof RoiCalculationRequest, value: string | number) => onChange({ ...option, [key]: value });
  const numUpdate = (key: keyof RoiCalculationRequest, value: string) => {
    const num = parseFloat(value);
    update(key, isNaN(num) ? 0 : num);
  };
  const complete = isOptionComplete(option);
  const prefix = `option-${index}`;
  const accentDot = index === 0 ? 'bg-primary' : 'bg-secondary';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.25, 1, 0.5, 1] }}
      className="flex-1"
    >
      <div
        className={`relative overflow-hidden rounded-xl border bg-card shadow-card transition-colors ${
          complete ? 'border-primary/35' : 'border-border'
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className={`h-2 w-2 rounded-full ${accentDot}`} aria-hidden="true" />
            <h2 className="text-sm font-semibold text-foreground">{label}</h2>
          </div>
          {complete ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-2xs font-semibold text-success">
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
              Ready
            </span>
          ) : (
            <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-2xs font-medium text-muted-foreground">
              Incomplete
            </span>
          )}
        </div>

        <div className="space-y-5 p-5">
          {/* Education */}
          <div>
            <p className="mb-3 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Education details</p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor={`${prefix}-country`} className="text-xs text-muted-foreground">Country</Label>
                <Select value={option.countryCode || ''} onValueChange={v => update('countryCode', v)}>
                  <SelectTrigger id={`${prefix}-country`} className="h-11 text-sm">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries?.map(c => <SelectItem key={c.id} value={c.code}>{c.name}</SelectItem>)}
                    {(!countries || countries.length === 0) && <SelectItem value="_none" disabled>No countries</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`${prefix}-university`} className="text-xs text-muted-foreground">
                  University <span className="font-normal">(optional)</span>
                </Label>
                <Select value={option.universityId ? String(option.universityId) : ''} onValueChange={v => update('universityId', parseInt(v))} disabled={!selectedCountry}>
                  <SelectTrigger id={`${prefix}-university`} className="h-11 text-sm">
                    <SelectValue placeholder={selectedCountry ? 'Select university' : 'Select country first'} />
                  </SelectTrigger>
                  <SelectContent>
                    {universities?.map(u => <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>)}
                    {(!universities || universities.length === 0) && <SelectItem value="_none" disabled>No universities</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor={`${prefix}-major`} className="text-xs text-muted-foreground">Major</Label>
                  <Select value={option.majorId ? String(option.majorId) : ''} onValueChange={v => update('majorId', parseInt(v))}>
                    <SelectTrigger id={`${prefix}-major`} className="h-11 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {majors?.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>)}
                      {(!majors || majors.length === 0) && <SelectItem value="_none" disabled>No majors</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`${prefix}-degree`} className="text-xs text-muted-foreground">Degree</Label>
                  <Select value={option.degreeLevelId ? String(option.degreeLevelId) : ''} onValueChange={v => {
                    const deg = degreeLevels?.find(d => d.id === parseInt(v));
                    onChange({ ...option, degreeLevelId: parseInt(v), durationYears: deg?.typicalDurationYears || 4 });
                  }}>
                    <SelectTrigger id={`${prefix}-degree`} className="h-11 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {degreeLevels?.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                      {(!degreeLevels || degreeLevels.length === 0) && <SelectItem value="_none" disabled>None</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Costs */}
          <div>
            <p className="mb-3 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Financials</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor={`${prefix}-tuition`} className="text-xs text-muted-foreground">
                  Annual tuition <span className="text-secondary">*</span>
                </Label>
                <Input id={`${prefix}-tuition`} className="h-11 text-sm" type="number" min={0} value={option.tuitionAnnual ?? ''} onChange={e => numUpdate('tuitionAnnual', e.target.value)} placeholder="25,000" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`${prefix}-living`} className="text-xs text-muted-foreground">Living cost / yr <span className="text-destructive">*</span></Label>
                <Input id={`${prefix}-living`} className="h-11 text-sm" type="number" min={0} value={option.livingCostAnnual ?? ''} onChange={e => numUpdate('livingCostAnnual', e.target.value)} placeholder="15,000" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`${prefix}-salary`} className="text-xs text-muted-foreground">
                  Expected salary <span className="text-secondary">*</span>
                </Label>
                <Input id={`${prefix}-salary`} className="h-11 text-sm" type="number" min={0} value={option.expectedSalaryAfter ?? ''} onChange={e => numUpdate('expectedSalaryAfter', e.target.value)} placeholder="75,000" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`${prefix}-duration`} className="text-xs text-muted-foreground">Duration (yrs)</Label>
                <Input id={`${prefix}-duration`} className="h-11 text-sm" type="number" min={1} max={10} value={option.durationYears ?? ''} onChange={e => numUpdate('durationYears', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Advanced toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            aria-expanded={showAdvanced}
            aria-controls={`${prefix}-advanced`}
            className="flex w-full items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {showAdvanced ? 'Hide' : 'Show'} advanced options
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>

          <AnimatePresence initial={false}>
            {showAdvanced && (
              <motion.div
                id={`${prefix}-advanced`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                className="overflow-hidden"
              >
                <div className="rounded-lg border border-border bg-background/40 p-4">
                  <p className="mb-3 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Advanced</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label htmlFor={`${prefix}-other`} className="text-xs text-muted-foreground">Other costs / yr</Label><Input id={`${prefix}-other`} className="h-11 text-sm" type="number" min={0} value={option.otherCostsAnnual ?? ''} onChange={e => numUpdate('otherCostsAnnual', e.target.value)} /></div>
                    <div className="space-y-1.5"><Label htmlFor={`${prefix}-loan`} className="text-xs text-muted-foreground">Loan amount</Label><Input id={`${prefix}-loan`} className="h-11 text-sm" type="number" min={0} value={option.loanAmount ?? ''} onChange={e => numUpdate('loanAmount', e.target.value)} /></div>
                    <div className="space-y-1.5"><Label htmlFor={`${prefix}-interest`} className="text-xs text-muted-foreground">Interest rate %</Label><Input id={`${prefix}-interest`} className="h-11 text-sm" type="number" min={0} max={30} step={0.1} value={option.interestRate ?? ''} onChange={e => numUpdate('interestRate', e.target.value)} /></div>
                    <div className="space-y-1.5"><Label htmlFor={`${prefix}-term`} className="text-xs text-muted-foreground">Loan term (yrs)</Label><Input id={`${prefix}-term`} className="h-11 text-sm" type="number" min={1} max={30} value={option.loanTermYears ?? ''} onChange={e => numUpdate('loanTermYears', e.target.value)} /></div>
                    <div className="space-y-1.5"><Label htmlFor={`${prefix}-parttime`} className="text-xs text-muted-foreground">Part-time income</Label><Input id={`${prefix}-parttime`} className="h-11 text-sm" type="number" min={0} value={option.partTimeIncomeAnnual ?? ''} onChange={e => numUpdate('partTimeIncomeAnnual', e.target.value)} /></div>
                    <div className="space-y-1.5"><Label htmlFor={`${prefix}-current`} className="text-xs text-muted-foreground">Current salary</Label><Input id={`${prefix}-current`} className="h-11 text-sm" type="number" min={0} value={option.currentSalary ?? ''} onChange={e => numUpdate('currentSalary', e.target.value)} /></div>
                    <div className="space-y-1.5"><Label htmlFor={`${prefix}-tax`} className="text-xs text-muted-foreground">Tax rate %</Label><Input id={`${prefix}-tax`} className="h-11 text-sm" type="number" min={0} max={60} value={option.taxRate ?? ''} onChange={e => numUpdate('taxRate', e.target.value)} /></div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`${prefix}-currency`} className="text-xs text-muted-foreground">Currency</Label>
                      <Select value={option.currencyCode || 'USD'} onValueChange={v => update('currencyCode', v)}>
                        <SelectTrigger id={`${prefix}-currency`} className="h-11 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {currencies?.map(c => <SelectItem key={c.code} value={c.code}>{c.symbol} {c.code}</SelectItem>)}
                          {(!currencies || currencies.length === 0) && <SelectItem value="_none" disabled>None</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

// ─── RESULT CARD ──────────────────────────────────────────────────────────────

const ResultCard = ({ label, result, isWinner, index }: { label: string; result: CompareResponse['optionA']; isWinner: boolean; index: number }) => {
  const verdict = result.roiResults.verdict;
  const vd = VERDICT_STYLES[verdict];
  const accentDot = index === 0 ? 'bg-primary' : 'bg-secondary';

  const metrics = [
    { icon: DollarSign, label: 'Net ROI', value: `$${result.roiResults.netRoi.toLocaleString()}`, highlight: true },
    { icon: TrendingUp, label: 'ROI %', value: `${result.roiResults.roiPercentage}%`, highlight: false },
    { icon: Clock, label: 'Break-even', value: `${result.roiResults.breakEvenYears} yrs`, highlight: false },
    { icon: Sparkles, label: 'Annual return', value: `${result.roiResults.annualizedReturn}%`, highlight: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.25, 1, 0.5, 1] }}
      className={`relative flex-1 overflow-hidden rounded-xl border bg-card shadow-card ${
        isWinner ? 'border-primary/40' : 'border-border'
      }`}
    >
      {isWinner && (
        <div className="absolute right-0 top-0">
          <div className="flex items-center gap-1.5 rounded-bl-lg bg-primary px-3 py-1.5 text-2xs font-bold uppercase tracking-wider text-primary-foreground">
            <Trophy className="h-3 w-3" aria-hidden="true" />
            Winner
          </div>
        </div>
      )}

      <div className="p-5 pt-6">
        <div className="mb-5 flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${accentDot}`} aria-hidden="true" />
          <h3 className="text-sm font-semibold text-foreground">{label}</h3>
        </div>

        <div className="space-y-3">
          {metrics.map(({ icon: Icon, label: mLabel, value, highlight }) => (
            <div key={mLabel} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                <span className="text-sm text-muted-foreground">{mLabel}</span>
              </div>
              <span className={highlight ? 'text-lg font-bold tabular-nums text-primary' : 'text-sm font-semibold tabular-nums text-foreground'}>
                {value}
              </span>
            </div>
          ))}

          <div className="my-1 h-px bg-border" />

          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">Verdict</span>
            <Badge className={`${vd.bg} ${vd.color} ${vd.border} border text-2xs font-semibold tracking-wide`}>
              {VERDICT_CONFIG[verdict].label}
            </Badge>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const ComparePage = () => {
  const [optionA, setOptionA] = useState<Partial<RoiCalculationRequest>>({ ...defaultOption });
  const [optionB, setOptionB] = useState<Partial<RoiCalculationRequest>>({ ...defaultOption });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompareResponse | null>(null);

  const { data: countries, isLoading: countriesLoading, isError: countriesError } = useQuery({ queryKey: ['countries'], queryFn: fetchCountries });
  const { data: majors, isLoading: majorsLoading, isError: majorsError } = useQuery({ queryKey: ['majors'], queryFn: () => fetchMajors() });
  const { data: degreeLevels, isLoading: degreesLoading, isError: degreesError } = useQuery({ queryKey: ['degree-levels'], queryFn: fetchDegreeLevels });
  const { data: currencies, isLoading: currenciesLoading, isError: currenciesError } = useQuery({ queryKey: ['currencies'], queryFn: fetchCurrencies });

  const isRefLoading = countriesLoading || majorsLoading || degreesLoading || currenciesLoading;
  const hasRefError = countriesError || majorsError || degreesError || currenciesError;
  const bothReady = isOptionComplete(optionA) && isOptionComplete(optionB);

  const handleCompare = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await compareOptions({ optionA: optionA as RoiCalculationRequest, optionB: optionB as RoiCalculationRequest, comparisonType: 'university' });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Comparison failed. Please try again.');
    } finally { setLoading(false); }
  };

  if (hasRefError) {
    return (
      <div className="page-shell flex min-h-[70vh] items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-card"
        >
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-lg font-semibold text-foreground">Couldn’t load comparison data</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The reference data could not be loaded from the server. Check your connection and try again.
          </p>
        </motion.div>
      </div>
    );
  }

  if (isRefLoading) {
    return (
      <div className="page-shell" aria-busy="true" aria-live="polite">
        <div className="container max-w-5xl py-14">
          <div className="mx-auto flex max-w-md flex-col items-center gap-3 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Loading comparison data…</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-96 animate-pulse rounded-xl border border-border bg-card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      {/* Hero */}
      <section className="border-b border-border">
        <div className="container max-w-5xl py-10 md:py-12">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_260px] md:items-start md:gap-10">
            <div>
              <span className="eyebrow">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Education ROI calculator
              </span>

              <h1 className="mt-3 max-w-xl font-heading text-[clamp(2rem,3.6vw,2.9rem)] font-[450] leading-[1.08] tracking-[-0.04em] text-foreground">
                Compare education ROI options
              </h1>

              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                Make smarter university decisions with a side-by-side financial return analysis across
                programs, countries, and majors.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                {['Net present value', 'Break-even analysis', 'Salary projections', 'Loan calculator'].map((tag) => (
                  <span key={tag} className="rounded-full border border-border bg-card px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                What the comparison shows
              </p>
              <ul className="mt-3 space-y-2.5">
                {[
                  { icon: TrendingUp, label: 'Net present value' },
                  { icon: Clock, label: 'Break-even timing' },
                  { icon: DollarSign, label: 'Salary projections' },
                  { icon: Trophy, label: 'Stronger ROI option' },
                ].map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-2.5 text-xs text-foreground/80">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-primary">
                      <Icon className="h-3 w-3" aria-hidden="true" />
                    </span>
                    {label}
                  </li>
                ))}
              </ul>
              <p className="mt-3 border-t border-border pt-2.5 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                Two options · one verdict
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Forms */}
      <div className="container max-w-5xl py-10 md:py-12">

        {/* VS divider */}
        <div className="flex flex-col items-stretch gap-5 md:flex-row">
          <OptionForm label="Option A" option={optionA} onChange={setOptionA} countries={countries} majors={majors} degreeLevels={degreeLevels} currencies={currencies} index={0} />

          <div className="hidden min-w-[44px] flex-col items-center justify-center gap-2 px-2 md:flex" aria-hidden="true">
            <div className="w-px flex-1 bg-border" />
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-2xs font-bold text-muted-foreground">
              VS
            </div>
            <div className="w-px flex-1 bg-border" />
          </div>

          <div className="flex items-center justify-center py-1 md:hidden" aria-hidden="true">
            <div className="flex items-center gap-3 text-2xs font-bold text-muted-foreground">
              <div className="h-px w-16 bg-border" />
              VS
              <div className="h-px w-16 bg-border" />
            </div>
          </div>

          <OptionForm label="Option B" option={optionB} onChange={setOptionB} countries={countries} majors={majors} degreeLevels={degreeLevels} currencies={currencies} index={1} />
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-8 flex flex-col items-center gap-2"
        >
          <Button
            size="lg"
            className="gap-2.5 px-8"
            disabled={!bothReady || loading}
            onClick={handleCompare}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <GitCompareArrows className="h-5 w-5" aria-hidden="true" />}
            {loading ? 'Calculating ROI…' : 'Compare now'}
          </Button>

          <AnimatePresence>
            {!bothReady && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-muted-foreground"
              >
                Fill in both options to run a comparison
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-5 flex items-center gap-2.5 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
              role="alert"
            >
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-12 space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight">Comparison results</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">Based on your financial inputs and career projections</p>
              </div>

              <div className="flex flex-col gap-5 md:flex-row">
                <ResultCard label="Option A" result={result.optionA} isWinner={result.summary.winner === 'A'} index={0} />
                <ResultCard label="Option B" result={result.optionB} isWinner={result.summary.winner === 'B'} index={1} />
              </div>

              {/* Summary panel */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="overflow-hidden rounded-xl border border-border bg-card shadow-card"
              >
                <div className="flex items-center gap-3 border-b border-border bg-surface/40 px-5 py-3.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface text-success">
                    <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <h3 className="text-sm font-semibold text-foreground">Key differences</h3>
                </div>

                <div className="space-y-6 p-5 sm:p-6">
                  <div className="grid gap-4 sm:grid-cols-3">
                    {[
                      { label: 'ROI difference', value: `$${Math.abs(result.summary.roiDifference).toLocaleString()}`, className: 'text-primary' },
                      { label: 'Cost difference', value: `$${Math.abs(result.summary.costDifference).toLocaleString()}`, className: 'text-success' },
                      { label: 'Break-even diff', value: `${Math.abs(result.summary.breakEvenDifference)} yrs`, className: 'text-secondary' },
                    ].map((item) => (
                      <div key={item.label} className="rounded-lg border border-border bg-background/40 px-3 py-4 text-center">
                        <p className="mb-1 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">{item.label}</p>
                        <p className={`text-xl font-bold tabular-nums ${item.className}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {result.summary.keyDifferences.length > 0 ? (
                    <ul className="space-y-2.5">
                      {result.summary.keyDifferences.map((diff, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                          {diff}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="py-2 text-center text-sm text-muted-foreground">No comparison data available</p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ComparePage;
