
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell,
} from 'recharts';
import { ChartDataPoint } from '../types';

const formatTooltipValue = (value: number, name: string) => {
  const isCurrency = name.includes('成本') || name.includes('费用') || name.includes('Cost') || name.includes('节省');

  if (isCurrency) {
    if (Math.abs(value) >= 1000000) {
      return `¥${(value / 1000000).toFixed(2)}M`;
    }
    if (Math.abs(value) >= 10000) {
      return `¥${(value / 10000).toFixed(1)}w`;
    }
    return `¥${value.toLocaleString()}`;
  }

  if (Math.abs(value) >= 10000) {
    return `${(value / 10000).toFixed(1)}w`;
  }
  return value.toLocaleString();
};

// iOS Style Popover Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-2.5 rounded-xl shadow-2xl text-[10px] min-w-[140px] dark:bg-zinc-900/80 light:bg-white light:border-blue-200 light:shadow-blue-500/10 light:text-slate-800">
        <div className="mb-1.5 pb-1 border-b border-white/10 text-zinc-400 font-semibold tracking-wide light:text-slate-500 light:border-slate-200">
           {label}
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span className="text-zinc-300 font-medium light:text-slate-700">{entry.name}</span>
            </div>
            <span className="text-white font-semibold tabular-nums light:text-blue-900">
              {typeof entry.value === 'number' 
                ? formatTooltipValue(entry.value, entry.name)
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CardHeader = ({ title, subtitle, color }: { title: string, subtitle?: string, color: string }) => (
    <div className="flex justify-between items-center mb-0 px-1">
      <h3 className={`text-[10px] font-semibold flex items-center gap-1.5 ${color}`}>
        {title}
      </h3>
      {subtitle && (
        <span className="text-[8px] font-medium text-zinc-500 bg-zinc-800/50 px-1.5 py-0.5 rounded text-center uppercase tracking-wider">
            {subtitle}
        </span>
      )}
    </div>
);

interface ChartProps {
    data: ChartDataPoint[];
    isDarkMode?: boolean;
}

export const CostComparisonChart: React.FC<ChartProps & { showComparison: boolean }> = ({ data, showComparison, isDarkMode = true }) => {
  const gridColor = isDarkMode ? "#333" : "#e2e8f0"; // Slate 200 for light mode
  const axisColor = isDarkMode ? "#71717a" : "#64748b"; // Slate 500 for text

  return (
    <div className="apple-glass h-full w-full p-1.5 flex flex-col rounded-2xl transition-all duration-300">
      <CardHeader title="成本预测 (3Y) / Cost Proj" subtitle="Forecast" color="text-zinc-200" />
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 2, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradTrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradAI" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} opacity={0.6} />
            <XAxis dataKey="name" tick={{ fontSize: 8, fill: axisColor, fontFamily: 'Inter' }} axisLine={false} tickLine={false} dy={5} />
            <YAxis tick={{ fontSize: 8, fill: axisColor, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: isDarkMode ? 'rgba(255,255,255,0.1)' : '#cbd5e1', strokeWidth: 1 }} />
            <Legend verticalAlign="top" height={16} iconSize={6} iconType="circle" wrapperStyle={{ fontSize: '9px', fontFamily: 'Inter', color: axisColor, top: -5, right: 0 }}/>
            <Area
              name="传统模式 / Traditional"
              type="monotone"
              dataKey="Traditional"
              stroke="#ef4444" // Red-500
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#gradTrad)"
              animationDuration={1500}
            />
            {showComparison && (
              <Area
                  name="AI模式 / AI Mode"
                  type="monotone"
                  dataKey="AIMode"
                  stroke="#22c55e" // Green-500
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gradAI)"
                  animationDuration={1500}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const StaffingChart: React.FC<ChartProps> = ({ data, isDarkMode = true }) => {
    const gridColor = isDarkMode ? "#333" : "#e2e8f0";
    const axisColor = isDarkMode ? "#71717a" : "#64748b";

    return (
        <div className="apple-glass h-full w-full p-1.5 flex flex-col rounded-2xl transition-all duration-300">
            <CardHeader title="人力对比 / Headcount" color="text-zinc-200" />
            <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} opacity={0.6} />
                <XAxis dataKey="name" tick={{ fontSize: 8, fill: axisColor, fontFamily: 'Inter' }} axisLine={false} tickLine={false} dy={5} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }} />
                <Bar name="Agents" dataKey="value" radius={[6, 6, 6, 6]} barSize={32} animationDuration={1000}>
                    {data.map((entry: any, index: number) => (
                    <Cell 
                        key={`cell-${index}`} 
                        fill={index === 0 ? '#3b82f6' : '#6366f1'} // Blue-500 : Indigo-500
                    />
                    ))}
                </Bar>
                </BarChart>
            </ResponsiveContainer>
            </div>
        </div>
    );
};

export const VolumeChart: React.FC<ChartProps & { subtitle?: string }> = ({ data, subtitle, isDarkMode = true }) => {
  const gridColor = isDarkMode ? "#333" : "#e2e8f0";
  const axisColor = isDarkMode ? "#71717a" : "#64748b";

  return (
    <div className="apple-glass h-full w-full p-1.5 flex flex-col rounded-2xl transition-all duration-300">
      <CardHeader title="工作量结构 / Mix" subtitle={subtitle} color="text-zinc-200" />
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 2, right: 0, left: -20, bottom: 0 }} stackOffset="expand">
            <defs>
               <linearGradient id="gradMixAI" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="gradMixHuman" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
                 <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} opacity={0.6} />
            <XAxis dataKey="name" tick={{ fontSize: 8, fill: axisColor, fontFamily: 'Inter' }} axisLine={false} tickLine={false} dy={5} />
            <YAxis tick={{ fontSize: 8, fill: axisColor, fontFamily: 'Inter' }} tickFormatter={(val) => `${(val*100).toFixed(0)}%`} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="AIHandled" name="AI" stackId="1" stroke="#3b82f6" strokeWidth={0} fill="url(#gradMixAI)" animationDuration={1000} />
            <Area type="monotone" dataKey="HumanHandled" name="Human" stackId="1" stroke="#f59e0b" strokeWidth={0} fill="url(#gradMixHuman)" animationDuration={1000} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const EfficiencyGauge: React.FC<{ value: number }> = ({ value }) => (
  <div className="apple-glass h-full w-full p-1 flex flex-col items-center relative overflow-hidden rounded-2xl group">
    <h3 className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider absolute top-1.5 left-2 z-20 light:text-slate-400">
        成本优化 / Optimization
    </h3>
    
    <div className="flex-1 w-full min-h-0 flex items-center justify-center relative z-10 p-1">
        <div className="aspect-square h-full max-h-full w-auto relative">
             <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Background Circle */}
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-zinc-800/30 dark:text-zinc-800 light:text-slate-200" strokeWidth="8" />
                {/* Value Circle - Rotated -90deg equivalent via transform */}
                <circle 
                    cx="50" cy="50" r="42" fill="none" stroke="#22c55e" strokeWidth="8" 
                    strokeLinecap="round"
                    strokeDasharray={`${value * 2.64} 264`} 
                    transform="rotate(-90 50 50)"
                    className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                />
                {/* SVG Text for perfect scaling */}
                <text x="50" y="48" textAnchor="middle" className="fill-white light:fill-blue-900 font-bold" fontSize="22" dy=".3em">
                    {value.toFixed(0)}%
                </text>
                <text x="50" y="68" textAnchor="middle" className="fill-zinc-400 light:fill-slate-500 font-medium" fontSize="6">
                    COST REDUCTION
                </text>
             </svg>
        </div>
    </div>
  </div>
);
