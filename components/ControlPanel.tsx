
import React, { memo } from 'react';
import { SimulationState, ScenarioType } from '../types';

interface ControlPanelProps {
  state: SimulationState;
  onChange: (newState: Partial<SimulationState>) => void;
  scenario: ScenarioType;
  onScenarioChange: (s: ScenarioType) => void;
}

// --- Isolated Components ---

const SectionHeader = memo(({ title, icon }: { title: string, icon?: React.ReactNode }) => (
  <h3 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide mb-2 flex items-center gap-2 px-1 mt-2">
    {icon}
    {title}
  </h3>
));

interface RangeInputProps {
  label: string;
  value: number;
  min: string | number;
  max: string | number;
  step: string | number;
  onChange: (val: number) => void;
  displayValue: string | React.ReactNode;
  subLabel?: string | React.ReactNode;
  accentColor?: string; // e.g., "bg-blue-500"
  icon?: React.ReactNode;
}

// "Control Center" Style Slider
const RangeInput = memo(({ 
  label, 
  value, 
  min, 
  max, 
  step, 
  onChange, 
  displayValue, 
  subLabel,
  accentColor = "bg-white",
  icon
}: RangeInputProps) => {
  const percentage = ((value - Number(min)) / (Number(max) - Number(min))) * 100;
  
  return (
    <div className="group select-none py-1">
      <div className="flex justify-between mb-1 px-0.5 items-end">
        <label className="text-[10px] font-medium text-zinc-300 flex items-center gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis">
           {icon && <span className="text-zinc-400">{icon}</span>}
           {label}
        </label>
        <span className="text-[10px] font-medium text-white tabular-nums tracking-tight ml-2">
          {displayValue}
        </span>
      </div>
      
      {/* Thick Interactive Track */}
      <div className="macos-slider-track relative w-full h-5 group-hover:brightness-110 transition-all">
         {/* Fill */}
         <div 
            className={`absolute inset-y-0 left-0 h-full rounded-l-md transition-all duration-150 ${percentage > 98 ? 'rounded-r-md' : ''}`}
            style={{ width: `${percentage}%` }}
         >
            <div className={`w-full h-full opacity-90 ${accentColor}`}></div>
         </div>
         
         {/* Interactive Input Overlay */}
         <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="overlay-input"
          />
      </div>

      {subLabel && (
        <div className="text-[8px] text-zinc-500 mt-1 px-0.5 leading-tight">
          {subLabel}
        </div>
      )}
    </div>
  );
});

// --- Main Component ---

const ControlPanel: React.FC<ControlPanelProps> = ({
  state,
  onChange,
  scenario,
  onScenarioChange,
}) => {
  
  const formatCurrency = (val: number) => `¥${(val / 10000).toFixed(1)}w`;
  const impliedCapacity = Math.round(state.dailyVolume * (1 - state.baselineAiRate) / (state.currentHeadcount || 1));
  const effectiveSalary = state.avgSalary * (1 + (state.salaryAdjustment || 0) / 100);

  // Update Logic for Automate Mix
  const updateAutomateFactor = (factor: 'volumeVoiceShare' | 'automateVoiceRate' | 'automateTextRate', value: number) => {
    const factors = {
      volumeVoiceShare: state.volumeVoiceShare,
      automateVoiceRate: state.automateVoiceRate,
      automateTextRate: state.automateTextRate,
    };
    // @ts-ignore
    factors[factor] = value;

    // Weighted Average Calculation
    const voiceWeight = factors.volumeVoiceShare / 100;
    const textWeight = 1 - voiceWeight;
    const weightedRate = (factors.automateVoiceRate * voiceWeight) + (factors.automateTextRate * textWeight);

    onChange({
      // @ts-ignore
      [factor]: value,
      aiResolutionRate: weightedRate
    });
  };

  // Update Logic for Enhance
  const updateEnhanceFactor = (factor: keyof SimulationState, value: number) => {
    const factors = {
      enhanceSmartFill: state.enhanceSmartFill,
      enhanceKnowledge: state.enhanceKnowledge,
      enhanceNavigation: state.enhanceNavigation,
      enhanceSummary: state.enhanceSummary,
      enhanceInsight: state.enhanceInsight,
      enhanceRisk: state.enhanceRisk,
    };
    // @ts-ignore
    factors[factor] = value;
    
    const totalBoost = 1 + (
      factors.enhanceSmartFill + 
      factors.enhanceKnowledge + 
      factors.enhanceNavigation + 
      factors.enhanceSummary + 
      factors.enhanceInsight + 
      factors.enhanceRisk
    ) / 100;

    onChange({ 
      [factor]: value, 
      aiEfficiencyBoost: totalBoost 
    });
  };

  return (
    <div className="apple-glass rounded-2xl flex flex-col h-full overflow-hidden relative">
      
      {/* Panel Header */}
      <div className="px-3 pt-3 pb-2 shrink-0 border-b border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-500"></div>
          <h2 className="text-white text-[11px] font-semibold tracking-wide">参数配置 / CONFIG</h2>
        </div>
        
        {/* iOS Segmented Control for Scenarios */}
        <div className="grid grid-cols-3 p-0.5 bg-zinc-800/50 rounded-lg gap-0.5 z-30 relative">
          {[
            { type: ScenarioType.DAILY, label: '日常 Daily' },
            { type: ScenarioType.PEAK, label: '峰值 Peak' },
            { type: ScenarioType.NIGHT, label: '夜间 Night' },
          ].map((item) => (
            <button
              key={item.type}
              onClick={() => onScenarioChange(item.type)}
              type="button"
              className={`py-1 text-[9px] font-medium rounded-[6px] transition-all duration-200 select-none ${
                scenario === item.type
                  ? 'bg-zinc-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-1 custom-scrollbar space-y-3 pb-4 relative z-10">
        
        {/* 1. Baseline */}
        <div className="space-y-0.5">
          <SectionHeader title="业务基础 / BASELINE" />
          <div className="space-y-1">
            <RangeInput
              label="日咨询量 / Daily Vol"
              value={state.dailyVolume}
              min="1000" max="50000" step="500"
              displayValue={state.dailyVolume.toLocaleString()}
              onChange={(val) => onChange({ dailyVolume: val })}
              accentColor="bg-blue-500"
            />

            <RangeInput
              label="当前自动化 / Curr Auto"
              value={state.baselineAiRate}
              min="0" max="0.80" step="0.05"
              displayValue={`${(state.baselineAiRate * 100).toFixed(0)}%`}
              onChange={(val) => onChange({ baselineAiRate: val })}
              accentColor="bg-zinc-500"
              subLabel={`${state.currentHeadcount} agents @ ${(state.baselineAiRate * 100).toFixed(0)}% auto`}
            />

            <RangeInput
              label="现有编制 / Headcount"
              value={state.currentHeadcount}
              min="5" max="500" step="1"
              displayValue={state.currentHeadcount}
              onChange={(val) => onChange({ currentHeadcount: val })}
              accentColor="bg-blue-500"
              subLabel={`Efficiency: ${impliedCapacity} tickets/agent/day`}
            />
          </div>
        </div>

        {/* 2. Cost & Investment */}
        <div className="space-y-0.5">
          <SectionHeader title="成本与投入 / COST & INV" />
          <div className="space-y-1">
            <RangeInput
              label="平均年薪 / Avg Salary"
              value={state.avgSalary}
              min="50000" max="300000" step="5000"
              displayValue={formatCurrency(state.avgSalary)}
              onChange={(val) => onChange({ avgSalary: val })}
              accentColor="bg-red-500"
            />

            <RangeInput
              label="薪资波动 / Salary Var"
              value={state.salaryAdjustment}
              min="-30" max="30" step="5"
              displayValue={`${state.salaryAdjustment > 0 ? '+' : ''}${state.salaryAdjustment}%`}
              onChange={(val) => onChange({ salaryAdjustment: val })}
              accentColor="bg-orange-500"
              subLabel={`Effective: ${formatCurrency(effectiveSalary)}`}
            />

            <RangeInput
              label="AI年投入 / AI Cost"
              value={state.aiSystemCost}
              min="100000" max="2000000" step="50000"
              displayValue={formatCurrency(state.aiSystemCost)}
              onChange={(val) => onChange({ aiSystemCost: val })}
              accentColor="bg-red-500"
            />
          </div>
        </div>

        {/* 3. Capabilities */}
        <div className="space-y-0.5">
          <SectionHeader title="AI能力模型 / CAPABILITIES" />
          
          {/* Automate Card */}
          <div className="apple-glass-light rounded-xl p-2.5 space-y-2.5">
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                       <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <span className="text-[10px] font-semibold text-white">独立解决 / Automate</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400">{(state.aiResolutionRate * 100).toFixed(1)}%</span>
             </div>
             
             <RangeInput
                label="渠道结构 / Channel Mix"
                value={state.volumeVoiceShare}
                min="0" max="100" step="5"
                displayValue={`${state.volumeVoiceShare}/${100-state.volumeVoiceShare}`}
                onChange={(val) => updateAutomateFactor('volumeVoiceShare', val)}
                accentColor="bg-indigo-500"
             />

             <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                   <div className="flex justify-between text-[8px] text-zinc-400">
                      <span>语音 Voice</span>
                      <span className="text-white">{(state.automateVoiceRate * 100).toFixed(0)}%</span>
                   </div>
                   <div className="macos-slider-track h-1.5 rounded-full">
                      <div className="absolute inset-y-0 left-0 bg-indigo-500 rounded-full" style={{ width: `${state.automateVoiceRate*100}%` }}></div>
                      <input type="range" min="0" max="1" step="0.01" value={state.automateVoiceRate} onChange={(e) => updateAutomateFactor('automateVoiceRate', Number(e.target.value))} className="overlay-input" />
                   </div>
                </div>
                <div className="space-y-1">
                   <div className="flex justify-between text-[8px] text-zinc-400">
                      <span>文本 Text</span>
                      <span className="text-white">{(state.automateTextRate * 100).toFixed(0)}%</span>
                   </div>
                   <div className="macos-slider-track h-1.5 rounded-full">
                      <div className="absolute inset-y-0 left-0 bg-sky-500 rounded-full" style={{ width: `${state.automateTextRate*100}%` }}></div>
                      <input type="range" min="0" max="1" step="0.01" value={state.automateTextRate} onChange={(e) => updateAutomateFactor('automateTextRate', Number(e.target.value))} className="overlay-input" />
                   </div>
                </div>
             </div>
          </div>

          {/* Enhance Card (Boost) */}
          <div className="apple-glass-light rounded-xl p-2.5 mt-2 space-y-2">
            <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-purple-500/20 flex items-center justify-center text-purple-400">
                       <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    </div>
                    <span className="text-[10px] font-semibold text-white">辅助提效 / Enhance</span>
                </div>
                <div className="text-[10px] font-bold text-purple-400">
                   {state.aiEfficiencyBoost.toFixed(2)}x
                </div>
            </div>

            {[
               { key: 'enhanceSmartFill', label: '智能填单 Fill', color: 'bg-purple-500' },
               { key: 'enhanceKnowledge', label: '知识推荐 Know', color: 'bg-purple-500' },
               { key: 'enhanceNavigation', label: '业务导航 Nav', color: 'bg-purple-500' },
               { key: 'enhanceSummary', label: '总结转移 Sum', color: 'bg-purple-500' },
               { key: 'enhanceInsight', label: '进线洞察 Ins', color: 'bg-purple-500' },
               { key: 'enhanceRisk', label: '智能风控 Risk', color: 'bg-purple-500' },
            ].map((item) => (
               <div key={item.key} className="flex items-center gap-2">
                  <label className="w-16 text-[8px] text-zinc-400 truncate">{item.label}</label>
                  <div className="flex-1 macos-slider-track h-3.5 rounded-full">
                      {/* @ts-ignore */}
                      <div className={`absolute inset-y-0 left-0 ${item.color} rounded-full opacity-80`} style={{ width: `${(state[item.key] / 50) * 100}%` }}></div>
                      {/* @ts-ignore */}
                      <input type="range" min="0" max="50" step="1" value={state[item.key]} onChange={(e) => updateEnhanceFactor(item.key, Number(e.target.value))} className="overlay-input" />
                  </div>
                  {/* @ts-ignore */}
                  <span className="w-6 text-right text-[8px] text-zinc-300">+{state[item.key]}%</span>
               </div>
            ))}
          </div>
        </div>

      </div>

      {/* Status Footer */}
      <div className="shrink-0 border-t border-white/5 p-2 bg-zinc-900/40 mt-auto flex justify-between items-center relative z-20">
         <div className="flex gap-3">
             <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                <span className="text-[9px] font-medium text-zinc-400">Online</span>
             </div>
             <div className="flex items-center gap-1.5">
                <svg className="w-2.5 h-2.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
                <span className="text-[9px] font-medium text-zinc-400">G-2.5-Flash</span>
             </div>
         </div>
         <div className="text-[9px] font-medium text-zinc-600">v2.5</div>
      </div>

    </div>
  );
};

export default ControlPanel;
