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
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-2.5 rounded-xl shadow-2xl text-[10px] min-w-[140px]">
        <div className="mb-1.5 pb-1 border-b border-white/10 text-zinc-400 font-semibold tracking-wide">
           {label}
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span className="text-zinc-300 font-medium">{entry.name}</span>
            </div>
            <span className="text-white font-semibold tabular-nums">
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

export const CostComparisonChart: React.FC<{ data: ChartDataPoint[], showComparison: boolean }> = ({ data, showComparison }) => (
  <div className="apple-glass h-full w-full p-1.5 flex flex-col rounded-2xl transition-all duration-300">
    <CardHeader title="成本预测 (3Y) / Cost Proj" subtitle="Forecast" color="text-zinc-200" />
    <div className="flex-1 min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradTrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff3b30" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ff3b30" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradAI" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34c759" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#34c759" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.5} />
          <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#71717a', fontFamily: 'Inter' }} axisLine={false} tickLine={false} dy={5} />
          <YAxis tick={{ fontSize: 8, fill: '#71717a', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
          <Legend verticalAlign="top" height={16} iconSize={6} iconType="circle" wrapperStyle={{ fontSize: '9px', fontFamily: 'Inter', color: '#a1a1aa', top: -5, right: 0 }}/>
          <Area
            name="传统模式 / Traditional"
            type="monotone"
            dataKey="Traditional"
            stroke="#ff3b30"
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
                stroke="#34c759"
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

export const StaffingChart: React.FC<{ data: ChartDataPoint[] }> = ({ data }) => (
  <div className="apple-glass h-full w-full p-1.5 flex flex-col rounded-2xl transition-all duration-300">
    <CardHeader title="人力对比 / Headcount" color="text-zinc-200" />
    <div className="flex-1 min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.5} />
          <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#71717a', fontFamily: 'Inter' }} axisLine={false} tickLine={false} dy={5} />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Bar name="Agents" dataKey="value" radius={[6, 6, 6, 6]} barSize={32} animationDuration={1000}>
            {data.map((entry: any, index: number) => (
               <Cell 
                 key={`cell-${index}`} 
                 fill={index === 0 ? '#007aff' : '#5856d6'} 
               />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const VolumeChart: React.FC<{ data: ChartDataPoint[], subtitle?: string }> = ({ data, subtitle }) => (
  <div className="apple-glass h-full w-full p-1.5 flex flex-col rounded-2xl transition-all duration-300">
    <CardHeader title="工作量结构 / Mix" subtitle={subtitle} color="text-zinc-200" />
    <div className="flex-1 min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: -20, bottom: 0 }} stackOffset="expand">
          <defs>
             <linearGradient id="gradMixAI" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#007aff" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#007aff" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="gradMixHuman" x1="0" y1="0" x2="0" y2="1">
               <stop offset="5%" stopColor="#ff9500" stopOpacity={0.6} />
               <stop offset="95%" stopColor="#ff9500" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.5} />
          <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#71717a', fontFamily: 'Inter' }} axisLine={false} tickLine={false} dy={5} />
          <YAxis tick={{ fontSize: 8, fill: '#71717a', fontFamily: 'Inter' }} tickFormatter={(val) => `${(val*100).toFixed(0)}%`} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="AIHandled" name="AI" stackId="1" stroke="#007aff" strokeWidth={0} fill="url(#gradMixAI)" animationDuration={1000} />
          <Area type="monotone" dataKey="HumanHandled" name="Human" stackId="1" stroke="#ff9500" strokeWidth={0} fill="url(#gradMixHuman)" animationDuration={1000} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const EfficiencyGauge: React.FC<{ value: number }> = ({ value }) => (
  <div className="apple-glass h-full w-full p-1.5 flex flex-col justify-center items-center relative overflow-hidden rounded-2xl group">
    <h3 className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wide absolute top-2 left-2 z-10">
        成本优化 / Optimization
    </h3>
    
    <div className="relative z-10 flex flex-col items-center">
        {/* Apple Ring Style */}
        <div className="relative w-32 h-32 flex items-center justify-center">
             <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#27272a" strokeWidth="8" />
                <circle 
                    cx="50" cy="50" r="40" fill="none" stroke="#34c759" strokeWidth="8" 
                    strokeLinecap="round"
                    strokeDasharray={`${value * 2.51} 251`}
                    className="transition-all duration-1000 ease-out"
                />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white tracking-tight">
                    {value.toFixed(0)}%
                </span>
                <span className="text-[9px] text-zinc-400 font-medium mt-0.5">COST REDUCTION</span>
             </div>
        </div>
    </div>
  </div>
);