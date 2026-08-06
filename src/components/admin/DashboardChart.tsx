'use client'

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts'

export interface ChartDataPoint {
  date: string
  revenue: number
  priorRevenue?: number
}

interface DashboardChartProps {
  data: ChartDataPoint[]
  targetValue?: number
  showPriorPeriod?: boolean
  targetLabel?: string
}

const formatCurrency = (value: number) => {
  if (value >= 1_000_000) return `KES ${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `KES ${(value / 1_000).toFixed(0)}K`
  return `KES ${value.toFixed(0)}`
}

export function DashboardChart({
  data,
  targetValue,
  showPriorPeriod = true,
}: DashboardChartProps) {
  const hasPriorData =
    showPriorPeriod && data.some((d) => d.priorRevenue !== undefined && d.priorRevenue > 0)
  const maxRevenue = Math.max(
    ...data.map((d) => d.revenue),
    ...data.map((d) => d.priorRevenue || 0),
    targetValue || 0,
  )

  return (
    <div className="w-full" style={{ minHeight: 300, height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 16, left: 0, bottom: 20 }}
        >
          <defs>
            <linearGradient id="chartRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="chartPrior" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--muted-foreground)" stopOpacity={0.12} />
              <stop offset="95%" stopColor="var(--muted-foreground)" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--border)"
          />

          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            dy={10}
            interval={Math.max(1, Math.floor(data.length / 10))}
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            tickFormatter={formatCurrency}
            domain={[0, maxRevenue * 1.15 || 10]}
            width={90}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: 12,
            }}
            labelStyle={{ color: 'var(--foreground)', fontWeight: 600, marginBottom: 4 }}
            itemStyle={{ color: 'var(--muted-foreground)' }}
            labelFormatter={(date) => `Date: ${date}`}
            formatter={(value: number, name: string) => {
              const label =
                name === 'revenue'
                  ? 'Current Period'
                  : name === 'priorRevenue'
                  ? 'Prior Period'
                  : name
              return [formatCurrency(value), label]
            }}
          />

          <Legend
            iconType="circle"
            iconSize={8}
            layout="horizontal"
            align="center"
            verticalAlign="bottom"
            wrapperStyle={{
              paddingTop: 16,
              fontSize: 12,
              color: 'var(--muted-foreground)',
            }}
          />

          {targetValue ? (
            <ReferenceLine
              y={targetValue}
              stroke="var(--secondary)"
              strokeDasharray="5 5"
              strokeWidth={1.5}
              label={{
                value: `Target: ${formatCurrency(targetValue)}`,
                position: 'insideTopRight',
                fill: 'var(--muted-foreground)',
                fontSize: 10,
                dy: -6,
              }}
            />
          ) : null}

          {hasPriorData && (
            <Area
              type="monotone"
              dataKey="priorRevenue"
              stroke="var(--muted-foreground)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#chartPrior)"
              legendType="line"
              name="priorRevenue"
              isAnimationActive={false}
              dot={false}
            />
          )}

          <Area
            type="monotone"
            dataKey="revenue"
            stroke="var(--primary)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#chartRevenue)"
            legendType="line"
            name="revenue"
            activeDot={{
              r: 5,
              strokeWidth: 2,
              fill: 'var(--primary)',
              stroke: 'var(--background)',
            }}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}