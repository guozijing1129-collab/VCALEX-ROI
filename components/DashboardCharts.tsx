
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
      return `¥${(value / 10000).toFixed(1)}万`;
    }
    return `¥${value.toLocaleString()}`;
  }

  if (Math.abs(value) >= 10000) {
    return `${(value / 10000).toFixed(1)}万`;
  }
  return value.toLocaleString();
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/90 backdrop-blur-xl border border-cyan-500/30 p-2 shadow-[0_0_15px_rgba(6,182,212,0.15)] text-[9px] z-50 min-w-[120px]">
        <div className="flex items-center justify-between mb-1 border-b border-slate-800 pb-0.5">
           <span className="text-cyan-400 font-mono font-bold uppercase">{label}</span>
           <span className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse"></span>
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 mb-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-0.5 h-2 rounded-sm" style={{ backgroundColor: entry.color, boxShadow: `0 0 5px ${entry.color}` }}></span>
              <span className="text-slate-300 font-mono tracking-tight">{entry.name}</span>
            </div>
            <span className="text-white font-mono font-bold" style={{ textShadow: `0 0 5px ${entry.color}`}}>
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

export const CostComparisonChart: React.FC<{ data: ChartDataPoint[], showComparison: boolean }> = ({ data, showComparison }) => (
  <div className="hud-card h-full w-full p-1.5 flex flex-col group hover:border-rose-500/50 transition-all duration-300">
    <div className="flex justify-between items-start mb-0 z-10">
      <h3 className="text-rose-400 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 border border-rose-500 bg-rose-500/20 shadow-[0_0_5px_#f43f5e]"></span>
        三年成本预测
      </h3>
      <span className="text-emerald-400 text-[8px] font-mono px-1.5 py-0.5 bg-emerald-900/30 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
        COST PROJECTION
      </span>
    </div>
    <div className="flex-1 min-h-0 z-10">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <filter id="glowTrad" height="200%">
               <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
               <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.95 0 0 0 0 0.24 0 0 0 0 0.36 0 0 0 1 0" result="glow" />
               <feMerge>
                   <feMergeNode in="glow" />
                   <feMergeNode in="SourceGraphic" />
               </feMerge>
            </filter>
            <filter id="glowAI" height="200%">
               <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
               <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.06 0 0 0 0 0.72 0 0 0 0 0.50 0 0 0 1 0" result="glow" />
               <feMerge>
                   <feMergeNode in="glow" />
                   <feMergeNode in="SourceGraphic" />
               </feMerge>
            </filter>
            <linearGradient id="colorTrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 2" stroke="#334155" vertical={false} opacity={0.3} />
          <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#64748b', fontFamily: 'monospace' }} axisLine={false} tickLine={false} dy={2} />
          <YAxis tick={{ fontSize: 8, fill: '#64748b', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={16} iconSize={6} iconType="rect" wrapperStyle={{ fontSize: '8px', fontFamily: 'monospace', color: '#94a3b8', top: -2, right: 0 }}/>
          <Area
            name="传统模式"
            type="monotone"
            dataKey="Traditional"
            stroke="#f43f5e"
            strokeWidth={1.5}
            fillOpacity={1}
            fill="url(#colorTrad)"
            filter="url(#glowTrad)"
            animationDuration={1500}
          />
          {showComparison && (
            <Area
                name="AI模式"
                type="monotone"
                dataKey="AIMode"
                stroke="#10b981"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#colorAI)"
                filter="url(#glowAI)"
                animationDuration={1500}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const StaffingChart: React.FC<{ data: ChartDataPoint[] }> = ({ data }) => (
  <div className="hud-card h-full w-full p-1.5 flex flex-col group hover:border-blue-500/50 transition-all duration-300">
    <div className="flex justify-between items-start mb-0">
      <h3 className="text-blue-400 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 border border-blue-500 bg-blue-500/20 shadow-[0_0_5px_#3b82f6]"></span>
        人力需求对比
      </h3>
      <span className="text-blue-300 text-[8px] font-mono px-1.5 py-0.5 bg-blue-900/30 border border-blue-500/30 shadow-[0_0_8px_rgba(59,130,246,0.2)]">HEADCOUNT</span>
    </div>
    <div className="flex-1 min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }} barGap={0}>
          <CartesianGrid strokeDasharray="2 2" stroke="#334155" vertical={false} opacity={0.3} />
          <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#64748b', fontFamily: 'monospace' }} axisLine={false} tickLine={false} dy={2} />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#3b82f6', opacity: 0.1 }} />
          <Bar name="所需坐席数" dataKey="value" radius={[2, 2, 0, 0]} barSize={30} animationDuration={1000}>
            {data.map((entry: any, index: number) => (
               <Cell 
                 key={`cell-${index}`} 
                 fill={index === 0 ? '#3b82f6' : '#8b5cf6'} 
                 stroke={index === 0 ? '#60a5fa' : '#a78bfa'}
                 strokeWidth={1}
                 style={{ filter: `drop-shadow(0 0 4px ${index === 0 ? '#3b82f6' : '#8b5cf6'})` }}
               />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const VolumeChart: React.FC<{ data: ChartDataPoint[], subtitle?: string }> = ({ data, subtitle }) => (
  <div className="hud-card h-full w-full p-1.5 flex flex-col group hover:border-purple-500/50 transition-all duration-300">
    <div className="flex justify-between items-start mb-0">
      <h3 className="text-purple-400 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
         <span className="w-1.5 h-1.5 border border-purple-500 bg-purple-500/20 shadow-[0_0_5px_#a855f7]"></span>
         工作量结构
      </h3>
      <span className="text-purple-300 text-[8px] font-mono px-1.5 py-0.5 bg-purple-900/30 border border-purple-500/30 shadow-[0_0_8px_rgba(168,85,247,0.2)]">
         {subtitle || "WORKLOAD MIX"}
      </span>
    </div>
    <div className="flex-1 min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: -20, bottom: 0 }} stackOffset="expand">
          <defs>
            <linearGradient id="colorAIHandled" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorHumanHandled" x1="0" y1="0" x2="0" y2="1">
               <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
               <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 2" stroke="#334155" vertical={false} opacity={0.3} />
          <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#64748b', fontFamily: 'monospace' }} axisLine={false} tickLine={false} dy={2} />
          <YAxis tick={{ fontSize: 8, fill: '#64748b', fontFamily: 'monospace' }} tickFormatter={(val) => `${(val*100).toFixed(0)}%`} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="AIHandled" name="AI处理量" stackId="1" stroke="#10b981" strokeWidth={1.5} fill="url(#colorAIHandled)" animationDuration={1000} style={{ filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.5))' }} />
          <Area type="monotone" dataKey="HumanHandled" name="人工处理量" stackId="1" stroke="#f59e0b" strokeWidth={1.5} fill="url(#colorHumanHandled)" animationDuration={1000} style={{ filter: 'drop-shadow(0 0 4px rgba(245,158,11,0.5))' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const EfficiencyGauge: React.FC<{ value: number }> = ({ value }) => (
  <div className="hud-card h-full w-full p-1.5 flex flex-col justify-center items-center relative overflow-hidden group hover:border-emerald-500/50 transition-all duration-300">
    {/* Scanning Circle Animation */}
    <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
         <div className="w-[140px] h-[140px] border border-emerald-500/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
         <div className="absolute w-[120px] h-[120px] border-t border-b border-emerald-400/50 rounded-full animate-[spin_5s_linear_infinite_reverse]"></div>
    </div>

    <h3 className="text-emerald-400 text-[9px] font-bold uppercase tracking-widest absolute top-2 left-3 z-10 flex items-center gap-1.5">
        ROI 成本优化率
    </h3>
    
    <div className="text-center z-10 flex flex-col items-center mt-1">
        <div className="relative">
           <span className="text-6xl font-bold text-white block tracking-tighter drop-shadow-[0_0_25px_rgba(16,185,129,0.4)] font-mono">
               {value.toFixed(0)}<span className="text-2xl text-emerald-500 align-top">%</span>
           </span>
        </div>
        <span className="text-emerald-200/70 text-[8px] font-mono mt-1 block tracking-widest border border-emerald-500/20 px-2 py-0.5 bg-emerald-900/20 backdrop-blur-sm">
            COST REDUCTION
        </span>
    </div>
  </div>
);
