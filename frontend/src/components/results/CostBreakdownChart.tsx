import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Label,
  Sector,
} from 'recharts';

const CHART_COLORS = ['#2a4bd0', '#0f766e', '#b45309', '#15803d', '#656975'];

const INK = '#1c253a';
const MUTED = '#656975';
const FONT = 'Inter, ui-sans-serif, system-ui, sans-serif';

interface CostBreakdownChartProps {
  data: { name: string; value: number }[];
  currencySymbol: string;
  totalInvestment: number;
  formatCurrency: (value: number, symbol?: string) => string;
}

const RADIAN = Math.PI / 180;

interface ActiveShapeProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  payload: { name: string };
  percent: number;
}

/** Active slice renderer — slight emphasis, no overlay */
const renderActiveShape = (props: ActiveShapeProps) => {
  const {
    cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent,
  } = props;

  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const mx = cx + (outerRadius + 18) * cos;
  const my = cy + (outerRadius + 18) * sin;
  const ex = mx + (cos >= 0 ? 14 : -14);
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="none"
      />
      <path
        d={`M${cx + outerRadius * cos},${cy + outerRadius * sin}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        strokeWidth={1}
        strokeOpacity={0.5}
        fill="none"
      />
      <circle cx={cx + outerRadius * cos} cy={cy + outerRadius * sin} r={2.5} fill={fill} />
      <text
        x={ex + (cos >= 0 ? 6 : -6)}
        y={ey - 6}
        textAnchor={textAnchor}
        fill={INK}
        fontSize={12}
        fontWeight={600}
        fontFamily={FONT}
      >
        {payload.name}
      </text>
      <text
        x={ex + (cos >= 0 ? 6 : -6)}
        y={ey + 10}
        textAnchor={textAnchor}
        fill={MUTED}
        fontSize={11}
        fontFamily={FONT}
      >
        {(percent * 100).toFixed(1)}%
      </text>
    </g>
  );
};

/** Outside labels with leader lines for readable, non-overlapping text */
const renderCustomLabel = (props: {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  name: string;
  percent: number;
  index: number;
}) => {
  const { cx, cy, midAngle, outerRadius, name, percent, index } = props;
  if (percent < 0.03) return null;

  const lineLen = 20;
  const extraLen = 14;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);

  const sx = cx + outerRadius * cos;
  const sy = cy + outerRadius * sin;
  const mx = cx + (outerRadius + lineLen) * cos;
  const my = cy + (outerRadius + lineLen) * sin;
  const ex = mx + (cos >= 0 ? extraLen : -extraLen);
  const ey = my;

  const textAnchor = cos >= 0 ? 'start' : 'end';
  const color = CHART_COLORS[index % CHART_COLORS.length];

  return (
    <g>
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={color}
        strokeWidth={1}
        strokeOpacity={0.45}
        fill="none"
      />
      <circle cx={sx} cy={sy} r={2} fill={color} />
      <text
        x={ex + (cos >= 0 ? 6 : -6)}
        y={ey}
        textAnchor={textAnchor}
        dominantBaseline="central"
        fill={INK}
        fontSize={11}
        fontWeight={500}
        fontFamily={FONT}
      >
        {name}
      </text>
      <text
        x={ex + (cos >= 0 ? 6 : -6)}
        y={ey + 14}
        textAnchor={textAnchor}
        dominantBaseline="central"
        fill={MUTED}
        fontSize={10}
        fontFamily={FONT}
      >
        {(percent * 100).toFixed(1)}%
      </text>
    </g>
  );
};

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number }>;
  formatCurrency: (value: number, symbol?: string) => string;
  currencySymbol: string;
}

const ChartTooltip = ({ active, payload, formatCurrency, currencySymbol }: ChartTooltipProps) => {
  if (!active || !payload?.[0]) return null;
  const { name, value } = payload[0];
  if (value === undefined) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3.5 py-2.5 shadow-raised">
      <p className="text-2xs text-muted-foreground">{name}</p>
      <p className="mt-0.5 text-sm font-semibold text-foreground">
        {formatCurrency(value, currencySymbol)}
      </p>
    </div>
  );
};

export const CostBreakdownChart = ({ data, currencySymbol, totalInvestment, formatCurrency }: CostBreakdownChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
      className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6"
    >
      <h2 className="text-base font-semibold text-foreground">Cost breakdown</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Total investment: <span className="font-medium text-foreground">{formatCurrency(totalInvestment, currencySymbol)}</span>
      </p>
      <div
        className="mt-3 h-72 sm:h-80"
        role="img"
        aria-label="Donut chart showing the composition of total education cost"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={82}
              dataKey="value"
              paddingAngle={2}
              stroke="none"
              label={activeIndex === undefined ? renderCustomLabel : undefined}
              labelLine={false}
              animationBegin={150}
              animationDuration={800}
              animationEasing="ease-out"
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(undefined)}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
              <Label
                value={formatCurrency(totalInvestment, currencySymbol)}
                position="center"
                fill={INK}
                fontSize={16}
                fontWeight={700}
                fontFamily={FONT}
              />
            </Pie>
            <Tooltip
              content={<ChartTooltip formatCurrency={formatCurrency} currencySymbol={currencySymbol} />}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-2">
        {data.map((d, i) => (
          <button
            type="button"
            key={d.name}
            className="flex items-center gap-2 rounded px-1.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onMouseEnter={() => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(undefined)}
            onFocus={() => setActiveIndex(i)}
            onBlur={() => setActiveIndex(undefined)}
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
              aria-hidden="true"
            />
            {d.name}
          </button>
        ))}
      </div>
    </motion.div>
  );
};
