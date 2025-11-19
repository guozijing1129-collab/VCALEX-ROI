import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Legend,
  Cell,
} from 'recharts';
import { SimulationMetrics, ChartDataPoint } from '../types';

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
      <div className="bg-slate-950/90 backdrop-blur-md border border-slate-700/80 p-3 rounded-lg shadow-2xl text-[10px] z-50">
        <p className="text-slate-400 mb-2 font-semibold border-b border-slate-800 pb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-6 mb-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shadow-[0_0_6px]" style={{ backgroundColor: entry.color, boxShadow: `0 0 6px ${entry.color}` }}></span>
              <span className="text-slate-300">{entry.name}</span>
            </div>
            <span className="text-slate-100 font-mono font-medium">
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

export const CostComparisonChart: React.FC<{ data: ChartDataPoint[] }> = ({ data }) => (
  <div className="h-full w-full bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-5 flex flex-col shadow-lg relative overflow-hidden group hover:border-rose-500/30 transition-colors">
    {/* Background Gradient Effect */}
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-800/20 to-transparent pointer-events-none opacity-50"></div>
    
    <div className="flex justify-between items-start mb-3 z-10">
      <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
        <span className="w-1 h-3 bg-rose-500 rounded-full shadow-[0_0_8px_#f43f5e]"></span>
        三年成本预测
      </h3>
      <span className="text-emerald-500 text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20 shadow-sm">
        显著节约
      </span>
    </div>
    <div className="flex-1 min-h-0 z-10">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
          <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} dy={5} />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={24} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#94a3b8', top: -5, right: 0 }}/>
          <Area
            name="传统模式"
            type="monotone"
            dataKey="Traditional"
            stroke="#f43f5e"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorTrad)"
            activeDot={{ r: 4, strokeWidth: 0, fill: '#fff' }}
          />
          <Area
            name="AI模式"
            type="monotone"
            dataKey="AIMode"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorAI)"
            activeDot={{ r: 4, strokeWidth: 0, fill: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const StaffingChart: React.FC<{ data: ChartDataPoint[] }> = ({ data }) => (
  <div className="h-full w-full bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-5 flex flex-col shadow-lg hover:border-blue-500/30 transition-colors">
    <div className="flex justify-between items-start mb-3">
      <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
        <span className="w-1 h-3 bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6]"></span>
        人力需求对比
      </h3>
      <span className="text-blue-400 text-[10px] font-mono bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">单位: 人</span>
    </div>
    <div className="flex-1 min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }} barGap={0}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
          <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} dy={5} />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b', opacity: 0.4 }} />
          <Bar name="所需坐席数" dataKey="value" radius={[4, 4, 0, 0]} barSize={45} animationDuration={1000}>
            {data.map((entry: any, index: number) => (
               <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#8b5cf6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const VolumeChart: React.FC<{ data: ChartDataPoint[] }> = ({ data }) => (
  <div className="h-full w-full bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-5 flex flex-col shadow-lg hover:border-purple-500/30 transition-colors">
    <div className="flex justify-between items-start mb-3">
      <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
         <span className="w-1 h-3 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]"></span>
         工作量结构
      </h3>
      <span className="text-purple-400 text-[10px] font-mono bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">AI vs 人工</span>
    </div>
    <div className="flex-1 min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} stackOffset="expand">
          <defs>
            <linearGradient id="colorAIHandled" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.4} />
            </linearGradient>
            <linearGradient id="colorHumanHandled" x1="0" y1="0" x2="0" y2="1">
               <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
               <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.4} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
          <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} dy={5} />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="AIHandled" name="AI处理量" stackId="1" stroke="#10b981" fill="url(#colorAIHandled)" animationDuration={1000} />
          <Area type="monotone" dataKey="HumanHandled" name="人工处理量" stackId="1" stroke="#f59e0b" fill="url(#colorHumanHandled)" animationDuration={1000} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const EfficiencyGauge: React.FC<{ value: number }> = ({ value }) => (
  <div className="h-full w-full bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-5 flex flex-col justify-center items-center relative overflow-hidden shadow-lg group hover:border-emerald-500/30 transition-colors">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
    
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
    
    <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider absolute top-4 left-5 z-10 flex items-center gap-2">
        ROI 成本优化率
    </h3>
    
    <div className="text-center z-10 flex flex-col items-center mt-2">
        <div className="relative">
           <span className="text-6xl font-bold text-white block tracking-tighter drop-shadow-[0_0_25px_rgba(16,185,129,0.4)] scale-100 group-hover:scale-105 transition-transform duration-300">
               {value.toFixed(0)}<span className="text-3xl text-emerald-500 align-top">%</span>
           </span>
           <div className="absolute -inset-8 bg-emerald-500/10 rounded-full blur-2xl -z-10 opacity-50 group-hover:opacity-80 transition-opacity"></div>
        </div>
        <span className="text-slate-500 text-[10px] font-medium mt-3 block tracking-widest border border-slate-700/50 px-3 py-1 rounded-full bg-slate-800/30 backdrop-blur-sm">
            综合成本降低
        </span>
    </div>
    
    {/* Decorative Wave */}
    <svg className="absolute bottom-0 w-full h-16 opacity-10 text-emerald-500" viewBox="0 0 100 20" preserveAspectRatio="none">
        <path d="M0 20 Q 25 5 50 15 T 100 20 L 100 20 L 0 20 Z" fill="currentColor" />
    </svg>
  </div>
);