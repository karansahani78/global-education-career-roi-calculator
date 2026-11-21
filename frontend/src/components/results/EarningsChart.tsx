import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface EarningsChartProps {
  data: { year: number; cumulativeInvestment: number; cumulativeEarnings: number; netPosition: number }[];
  currencySymbol: string;
  formatCurrency: (value: number, symbol?: string) => string;
}

const AXIS_TICK = { fill: '#656975', fontSize: 11 };
const GRID_STROKE = 'rgba(28,37,58,0.08)';
const AXIS_STROKE = 'rgba(28,37,58,0.16)';

export const EarningsChart = ({ data, currencySymbol, formatCurrency }: EarningsChartProps) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.45, duration: 0.5 }}
    className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6"
  >
    <h2 className="text-base font-semibold text-foreground">Cumulative position over time</h2>
    <p className="mt-1 text-sm text-muted-foreground">
      Earnings, investment, and net position across the projection period.
    </p>
    <div className="mt-4 h-64 sm:h-72" role="img" aria-label="Line chart of cumulative earnings, investment, and net position over time">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
          <XAxis
            dataKey="year"
            stroke={AXIS_STROKE}
            tick={AXIS_TICK}
            tickMargin={8}
            label={{ value: 'Year', position: 'insideBottom', offset: -4, fill: '#656975', fontSize: 11 }}
          />
          <YAxis
            tickFormatter={(v) => formatCurrency(v)}
            stroke={AXIS_STROKE}
            tick={AXIS_TICK}
            tickMargin={4}
            width={56}
          />
          <Tooltip
            formatter={(v: number) => formatCurrency(v, currencySymbol)}
            contentStyle={{
              background: '#ffffff',
              border: '1px solid #dedfdc',
              borderRadius: '12px',
              color: '#1c253a',
              boxShadow: '0 12px 32px -20px rgba(28,37,58,0.35)',
              fontSize: '13px',
            }}
            labelStyle={{ color: '#656975', fontSize: 11 }}
            cursor={{ stroke: 'rgba(28,37,58,0.2)' }}
          />
          <Legend wrapperStyle={{ color: '#656975', fontSize: 11, paddingTop: 12 }} />
          <Line
            type="monotone"
            dataKey="cumulativeEarnings"
            stroke="#15803d"
            name="Earnings"
            strokeWidth={2}
            dot={false}
            animationDuration={900}
            animationEasing="ease-out"
          />
          <Line
            type="monotone"
            dataKey="cumulativeInvestment"
            stroke="#b45309"
            name="Investment"
            strokeWidth={2}
            dot={false}
            animationDuration={900}
            animationEasing="ease-out"
          />
          <Line
            type="monotone"
            dataKey="netPosition"
            stroke="#2a4bd0"
            name="Net position"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
            animationDuration={900}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);
