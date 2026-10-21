import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import {
  TrendingUp,
  Calendar,
  DollarSign,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
import { Sale } from '../types';

interface WeeklySalesTrendChartProps {
  sales: Sale[];
  currency: string;
}

export const WeeklySalesTrendChart: React.FC<WeeklySalesTrendChartProps> = ({
  sales,
  currency,
}) => {
  const [timeRange, setTimeRange] = useState<'7days' | '8weeks'>('7days');
  const [chartType, setChartType] = useState<'area' | 'line'>('area');

  // Compute daily sales for the last 7 days
  const dailyData = useMemo(() => {
    const data = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const nextDay = new Date(d);
      nextDay.setDate(d.getDate() + 1);

      // Filter sales belonging to this day
      const daySales = sales.filter((s) => {
        const saleDate = new Date(s.createdAt);
        return saleDate >= d && saleDate < nextDay;
      });

      const dayTotal = daySales.reduce((acc, s) => acc + (s.total || 0), 0);
      const dayInvoices = daySales.length;

      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

      data.push({
        label: `${dayName} (${dayNum})`,
        shortLabel: dayName,
        sales: dayTotal,
        invoices: dayInvoices,
        rawDate: d,
      });
    }

    return data;
  }, [sales]);

  // Compute weekly sales for the last 8 weeks
  const weeklyData = useMemo(() => {
    const data = [];
    const now = new Date();

    for (let i = 7; i >= 0; i--) {
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - i * 7);
      weekEnd.setHours(23, 59, 59, 999);

      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);

      const weekSales = sales.filter((s) => {
        const saleDate = new Date(s.createdAt);
        return saleDate >= weekStart && saleDate <= weekEnd;
      });

      const total = weekSales.reduce((acc, s) => acc + (s.total || 0), 0);
      const invoices = weekSales.length;

      const startFormatted = weekStart.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const endFormatted = weekEnd.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      data.push({
        label: `${startFormatted} - ${endFormatted}`,
        shortLabel: `Wk ${8 - i}`,
        sales: total,
        invoices,
        rawDate: weekStart,
      });
    }

    return data;
  }, [sales]);

  const activeData = timeRange === '7days' ? dailyData : weeklyData;

  // Calculate summary metrics for the selected view
  const summary = useMemo(() => {
    const totalSales = activeData.reduce((acc, d) => acc + d.sales, 0);
    const totalInvoices = activeData.reduce((acc, d) => acc + d.invoices, 0);
    const avgSales = activeData.length > 0 ? Math.round(totalSales / activeData.length) : 0;

    let peak = { label: '', sales: 0 };
    activeData.forEach((d) => {
      if (d.sales > peak.sales) {
        peak = { label: d.label, sales: d.sales };
      }
    });

    // Trend comparison (first half vs second half)
    const mid = Math.floor(activeData.length / 2);
    const firstHalfSales = activeData.slice(0, mid).reduce((a, b) => a + b.sales, 0);
    const secondHalfSales = activeData.slice(mid).reduce((a, b) => a + b.sales, 0);
    const diff = secondHalfSales - firstHalfSales;
    const percentGrowth =
      firstHalfSales > 0 ? Math.round((diff / firstHalfSales) * 100) : secondHalfSales > 0 ? 100 : 0;

    return {
      totalSales,
      totalInvoices,
      avgSales,
      peak,
      percentGrowth,
    };
  }, [activeData]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const salesVal = payload.find((p: any) => p.dataKey === 'sales')?.value || 0;
      const invVal = payload.find((p: any) => p.dataKey === 'invoices')?.value || 0;

      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl border border-slate-800 text-xs space-y-1.5 min-w-[180px]">
          <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between">
            <span>{label}</span>
            <span className="text-[10px] text-emerald-400 font-mono">
              {timeRange === '7days' ? 'Daily Trend' : 'Weekly Trend'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Total Sales:</span>
            <span className="font-bold font-mono text-emerald-400 text-sm">
              {currency}{salesVal.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Invoices Made:</span>
            <span className="font-semibold font-mono text-sky-400">
              {invVal} {invVal === 1 ? 'sale' : 'sales'}
            </span>
          </div>
          {invVal > 0 && (
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800 text-slate-400">
              <span>Avg per Invoice:</span>
              <span className="font-mono text-slate-200">
                {currency}{Math.round(salesVal / invVal).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all">
      {/* Top Header & Range Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center space-x-2">
                <span>Weekly Sales Trends</span>
                <span className="text-[10px] font-bold bg-emerald-100/80 text-emerald-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Recharts
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Visualize revenue trajectory, transaction volume, and performance peaks over time
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls: 7 Days / 8 Weeks Toggle & Area/Line Toggle */}
        <div className="flex items-center space-x-2 self-stretch sm:self-auto justify-between sm:justify-end">
          {/* Style Toggle */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/70 text-xs">
            <button
              onClick={() => setChartType('area')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                chartType === 'area'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Area
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                chartType === 'line'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Line
            </button>
          </div>

          {/* Time Range Toggle */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/70 text-xs">
            <button
              onClick={() => setTimeRange('7days')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                timeRange === '7days'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setTimeRange('8weeks')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                timeRange === '8weeks'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 8 Weeks
            </button>
          </div>
        </div>
      </div>

      {/* Mini KPI summary stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="p-3 bg-slate-50/70 rounded-2xl border border-slate-200/60">
          <div className="text-[11px] font-medium text-slate-500">Period Total Sales</div>
          <div className="text-lg font-black text-slate-900 font-mono mt-0.5">
            {currency}{summary.totalSales.toLocaleString()}
          </div>
        </div>

        <div className="p-3 bg-slate-50/70 rounded-2xl border border-slate-200/60">
          <div className="text-[11px] font-medium text-slate-500">Total Invoices</div>
          <div className="text-lg font-black text-sky-700 font-mono mt-0.5">
            {summary.totalInvoices}
          </div>
        </div>

        <div className="p-3 bg-slate-50/70 rounded-2xl border border-slate-200/60">
          <div className="text-[11px] font-medium text-slate-500">Average per {timeRange === '7days' ? 'Day' : 'Week'}</div>
          <div className="text-lg font-black text-emerald-700 font-mono mt-0.5">
            {currency}{summary.avgSales.toLocaleString()}
          </div>
        </div>

        <div className="p-3 bg-slate-50/70 rounded-2xl border border-slate-200/60">
          <div className="text-[11px] font-medium text-slate-500">Trajectory</div>
          <div className="flex items-center space-x-1.5 mt-0.5">
            {summary.percentGrowth >= 0 ? (
              <span className="flex items-center text-emerald-700 font-bold text-sm font-mono">
                <ArrowUpRight className="w-4 h-4 mr-0.5" />
                +{summary.percentGrowth}%
              </span>
            ) : (
              <span className="flex items-center text-rose-600 font-bold text-sm font-mono">
                <ArrowDownRight className="w-4 h-4 mr-0.5" />
                {summary.percentGrowth}%
              </span>
            )}
            <span className="text-[10px] text-slate-500">vs earlier</span>
          </div>
        </div>
      </div>

      {/* Recharts Canvas */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart
              data={activeData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="invoicesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey={timeRange === '7days' ? 'shortLabel' : 'shortLabel'}
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                yAxisId="salesAxis"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  value >= 1000 ? `${currency}${(value / 1000).toFixed(0)}k` : `${currency}${value}`
                }
              />
              <YAxis
                yAxisId="invoicesAxis"
                orientation="right"
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(value) => <span className="text-xs font-semibold text-slate-700">{value}</span>}
              />
              <Area
                yAxisId="salesAxis"
                type="monotone"
                dataKey="sales"
                name={`Sales Revenue (${currency})`}
                stroke="#059669"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#salesGradient)"
              />
              <Line
                yAxisId="invoicesAxis"
                type="monotone"
                dataKey="invoices"
                name="Invoice Count"
                stroke="#0284c7"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#0284c7', strokeWidth: 1.5, stroke: '#ffffff' }}
              />
            </AreaChart>
          ) : (
            <LineChart
              data={activeData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey={timeRange === '7days' ? 'shortLabel' : 'shortLabel'}
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                yAxisId="salesAxis"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  value >= 1000 ? `${currency}${(value / 1000).toFixed(0)}k` : `${currency}${value}`
                }
              />
              <YAxis
                yAxisId="invoicesAxis"
                orientation="right"
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(value) => <span className="text-xs font-semibold text-slate-700">{value}</span>}
              />
              <Line
                yAxisId="salesAxis"
                type="monotone"
                dataKey="sales"
                name={`Sales Revenue (${currency})`}
                stroke="#059669"
                strokeWidth={3}
                dot={{ r: 4, fill: '#059669', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 6, fill: '#047857' }}
              />
              <Line
                yAxisId="invoicesAxis"
                type="monotone"
                dataKey="invoices"
                name="Invoice Count"
                stroke="#0284c7"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#0284c7', strokeWidth: 1.5, stroke: '#ffffff' }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
