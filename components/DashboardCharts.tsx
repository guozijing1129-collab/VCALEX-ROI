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
} from 'recharts';
import { SimulationMetrics, ChartDataPoint } from '../types';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-xl text-xs">
        <p className="text-slate-300 mb-2 font-semibold">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
            <span className="text-slate-400">{entry.name}:</span>
            <span className="text-slate-100 font-mono">
              {typeof entry.value === 'number' && entry.value > 1000 
                ? `¥${(entry.value/10000).toFixed(1)}万` 
                : entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const CostComparisonChart: React.FC<{ data: ChartDataPoint[] }> = ({ data }) => (
  <div className="h-full w-full bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col shadow-lg">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">三年累计成本预测</h3>
      <span className="text-emerald-500 text-xs font-mono flex items-center gap-1">
        <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block"></span>
        显著节约
      </span>
    </div>
    <div className="flex-1 min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} iconSize={8} wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }}/>
          <Area
            name="传统模式成本"
            type="monotone"
            dataKey="Traditional"
            stroke="#ef4444"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorTrad)"
          />
          <Area
            name="AI模式成本"
            type="monotone"
            dataKey="AIMode"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorAI)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const StaffingChart: React.FC<{ data: ChartDataPoint[] }> = ({ data }) => (
  <div className="h-full w-full bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col shadow-lg">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">人力需求对比</h3>
      <span className="text-blue-400 text-xs font-mono">单位: 人</span>
    </div>
    <div className="flex-1 min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
          <Bar name="所需坐席数" dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30}>
            {data.map((entry: any, index: number) => (
               <cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#8b5cf6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const VolumeChart: React.FC<{ data: ChartDataPoint[] }> = ({ data }) => (
  <div className="h-full w-full bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col shadow-lg">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">工作量分布结构</h3>
      <span className="text-purple-400 text-xs font-mono">AI vs 人工</span>
    </div>
    <div className="flex-1 min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} stackOffset="expand">
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="AIHandled" name="AI处理量" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
          <Area type="monotone" dataKey="HumanHandled" name="人工处理量" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const EfficiencyGauge: React.FC<{ value: number }> = ({ value }) => (
  <div className="h-full w-full bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-center items-center relative overflow-hidden shadow-lg">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider absolute top-4 left-4">成本优化率 (ROI)</h3>
    <div className="text-center z-10 flex flex-col items-center">
        <span className="text-5xl font-bold text-white block tracking-tighter drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
            {value.toFixed(0)}<span className="text-2xl text-emerald-500">%</span>
        </span>
        <span className="text-slate-400 text-xs font-medium mt-2 block tracking-widest">综合成本降低</span>
    </div>
    {/* Decorative background curve */}
    <svg className="absolute bottom-0 w-full h-16 opacity-10" viewBox="0 0 100 20" preserveAspectRatio="none">
        <path d="M0 20 Q 50 0 100 20 L 100 20 L 0 20 Z" fill="#10b981" />
    </svg>
  </div>
);