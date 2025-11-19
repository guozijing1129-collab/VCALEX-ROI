import React from 'react';
import { SimulationState, ScenarioType } from '../types';

interface ControlPanelProps {
  state: SimulationState;
  onChange: (newState: Partial<SimulationState>) => void;
  scenario: ScenarioType;
  onScenarioChange: (s: ScenarioType) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  state,
  onChange,
  scenario,
  onScenarioChange,
}) => {
  
  const formatCurrency = (val: number) => `¥${(val / 10000).toFixed(1)}万`;
  const impliedCapacity = Math.round(state.dailyVolume * (1 - state.baselineAiRate) / (state.currentHeadcount || 1));
  const effectiveSalary = state.avgSalary * (1 + (state.salaryAdjustment || 0) / 100);

  const updateAutomateFactor = (factor: 'volumeVoiceShare' | 'automateVoiceRate' | 'automateTextRate', value: number) => {
    const factors = {
      volumeVoiceShare: state.volumeVoiceShare,
      automateVoiceRate: state.automateVoiceRate,
      automateTextRate: state.automateTextRate,
    };
    factors[factor] = value;

    // Weighted Average Calculation
    const voiceWeight = factors.volumeVoiceShare / 100;
    const textWeight = 1 - voiceWeight;
    const weightedRate = (factors.automateVoiceRate * voiceWeight) + (factors.automateTextRate * textWeight);

    onChange({
      [factor]: value,
      aiResolutionRate: weightedRate
    });
  };

  const updateEnhanceFactor = (factor: keyof SimulationState, value: number) => {
    const factors = {
      enhanceSmartFill: state.enhanceSmartFill,
      enhanceKnowledge: state.enhanceKnowledge,
      enhanceNavigation: state.enhanceNavigation,
      enhanceSummary: state.enhanceSummary,
    };
    // @ts-ignore
    factors[factor] = value;
    
    const totalBoost = 1 + (
      factors.enhanceSmartFill + 
      factors.enhanceKnowledge + 
      factors.enhanceNavigation + 
      factors.enhanceSummary
    ) / 100;

    onChange({ 
      [factor]: value, 
      aiEfficiencyBoost: totalBoost 
    });
  };

  const SectionHeader = ({ title, subtitle, icon }: { title: string, subtitle: string, icon?: React.ReactNode }) => (
    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between group select-none">
      <span className="flex items-center gap-2 text-slate-300 group-hover:text-white transition-colors">
        {icon}
        {title}
      </span>
      <span className="text-[9px] text-slate-600 font-normal group-hover:text-slate-500 transition-colors">{subtitle}</span>
    </h3>
  );

  // Custom slider with dynamic fill background
  const RangeInput = ({ 
    label, 
    value, 
    min, 
    max, 
    step, 
    onChange, 
    displayValue, 
    subLabel,
    accentColor = "#10b981" // Default emerald-500 hex
  }: any) => {
    const percentage = ((value - Number(min)) / (Number(max) - Number(min))) * 100;
    
    return (
      <div className="group select-none">
        <div className="flex justify-between mb-1 items-end">
          <label className="text-slate-400 text-[10px] font-medium group-hover:text-slate-200 transition-colors cursor-pointer truncate pr-2">{label}</label>
          <span 
            className="text-slate-200 text-[10px] font-mono bg-slate-800 border border-slate-700 px-1.5 py-px rounded shadow-sm group-hover:border-slate-600 transition-colors min-w-[36px] text-center"
            style={{ color: accentColor }}
          >
            {displayValue}
          </span>
        </div>
        <div className="relative w-full h-3.5 flex items-center">
           <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="relative z-10 w-full h-1 bg-transparent appearance-none cursor-pointer focus:outline-none"
            style={{
                background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${percentage}%, #1e293b ${percentage}%, #1e293b 100%)`
            }}
          />
        </div>
        {subLabel && <div className="text-[9px] text-slate-500 mt-px leading-tight font-light">{subLabel}</div>}
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-xl flex flex-col h-full shadow-2xl overflow-hidden font-sans relative transition-all duration-300 hover:shadow-slate-900/50 hover:border-slate-700/80">
      {/* Decorative Top Line */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500/80 via-blue-500/80 to-purple-500/80"></div>

      <div className="p-4 pb-2 shrink-0 bg-gradient-to-b from-slate-800/20 to-transparent">
        <h2 className="text-emerald-400 text-xs font-bold tracking-widest uppercase mb-3 flex items-center gap-2 select-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          模拟参数配置
        </h2>
        
        {/* Scenarios */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { type: ScenarioType.DAILY, label: '基础日常' },
            { type: ScenarioType.PEAK, label: '大促峰值' },
            { type: ScenarioType.NIGHT, label: '夜间值守' },
          ].map((item) => (
            <button
              key={item.type}
              onClick={() => onScenarioChange(item.type)}
              className={`py-1.5 text-[10px] font-medium rounded-md transition-all duration-200 border select-none ${
                scenario === item.type
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                  : 'bg-slate-800/40 text-slate-500 border-transparent hover:bg-slate-800 hover:text-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar space-y-5 pb-6">
        
        {/* 1. 业务基础 */}
        <div className="space-y-3">
          <SectionHeader title="业务基础" subtitle="Baseline" />
          <div className="space-y-3">
            <RangeInput
              label="日均咨询量"
              value={state.dailyVolume}
              min="1000" max="50000" step="500"
              displayValue={`${state.dailyVolume.toLocaleString()}`}
              onChange={(val: number) => onChange({ dailyVolume: val })}
              accentColor="#3b82f6" // blue-500
            />

            <RangeInput
              label="当前自动化率 (Baseline)"
              value={state.baselineAiRate}
              min="0" max="0.80" step="0.05"
              displayValue={`${(state.baselineAiRate * 100).toFixed(0)}%`}
              onChange={(val: number) => onChange({ baselineAiRate: val })}
              accentColor="#64748b" // slate-500
              subLabel={`现有 ${state.currentHeadcount} 人是在此自动化水平下的配置`}
            />

            <RangeInput
              label="当前人员编制"
              value={state.currentHeadcount}
              min="5" max="500" step="1"
              displayValue={`${state.currentHeadcount} 人`}
              onChange={(val: number) => onChange({ currentHeadcount: val })}
              accentColor="#3b82f6" // blue-500
              subLabel={<span className="flex justify-between"><span>人工人效:</span> <span className="font-mono text-slate-400">{impliedCapacity} 单/人/天</span></span>}
            />
          </div>
        </div>

        {/* 2. 成本与投入 */}
        <div className="space-y-3 pt-3 border-t border-slate-800/50">
          <SectionHeader title="成本与投入" subtitle="Cost & Investment" />
          <div className="space-y-3">
            <RangeInput
              label="人工综合年成本 (基准)"
              value={state.avgSalary}
              min="50000" max="300000" step="5000"
              displayValue={formatCurrency(state.avgSalary)}
              onChange={(val: number) => onChange({ avgSalary: val })}
              accentColor="#f43f5e" // rose-500
            />

            <RangeInput
              label="薪资波动模拟"
              value={state.salaryAdjustment}
              min="-30" max="30" step="5"
              displayValue={`${state.salaryAdjustment > 0 ? '+' : ''}${state.salaryAdjustment}%`}
              onChange={(val: number) => onChange({ salaryAdjustment: val })}
              accentColor="#f97316" // orange-500
              subLabel={<span className="flex justify-between"><span>实际测算:</span> <span className="font-mono text-slate-400">{formatCurrency(effectiveSalary)}</span></span>}
            />

            <RangeInput
              label="AI项目年投入"
              value={state.aiSystemCost}
              min="100000" max="2000000" step="50000"
              displayValue={formatCurrency(state.aiSystemCost)}
              onChange={(val: number) => onChange({ aiSystemCost: val })}
              accentColor="#f43f5e" // rose-500
              subLabel="含软件授权、Token费及运营服务"
            />
          </div>
        </div>

        {/* 3. AI能力模型 */}
        <div className="space-y-3 pt-3 border-t border-slate-800/50">
          <SectionHeader title="AI能力模型 (目标)" subtitle="Target Capabilities" />
          
          {/* Automate Breakdown */}
          <div className="bg-slate-800/30 rounded-lg border border-emerald-500/10 overflow-hidden hover:border-emerald-500/30 transition-colors">
             <div className="bg-emerald-900/10 px-3 py-1.5 flex justify-between items-center border-b border-emerald-500/10">
                <label className="text-emerald-400 text-[10px] font-bold uppercase tracking-wide">Automate 独立解决</label>
                <span className="text-emerald-300 text-[11px] font-mono font-bold">
                   {(state.aiResolutionRate * 100).toFixed(1)}%
                </span>
             </div>
             
             <div className="p-3 space-y-3">
                {/* Mix */}
                <RangeInput
                    label={`渠道结构: 语音 ${state.volumeVoiceShare}% / 文本 ${100 - state.volumeVoiceShare}%`}
                    value={state.volumeVoiceShare}
                    min="0" max="100" step="5"
                    displayValue="Mix"
                    onChange={(val: number) => updateAutomateFactor('volumeVoiceShare', val)}
                    accentColor="#6366f1" // indigo-500
                    subLabel="Voice vs Text Volume"
                />
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-[9px] text-indigo-300 font-medium">
                            <span>语音智能体</span>
                            <span>{(state.automateVoiceRate * 100).toFixed(0)}%</span>
                        </div>
                         <input 
                           type="range" min="0" max="1" step="0.01" 
                           value={state.automateVoiceRate}
                           onChange={(e) => updateAutomateFactor('automateVoiceRate', Number(e.target.value))}
                           className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer"
                           style={{ background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${state.automateVoiceRate*100}%, #1e293b ${state.automateVoiceRate*100}%, #1e293b 100%)`}}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-[9px] text-sky-300 font-medium">
                            <span>文本智能体</span>
                            <span>{(state.automateTextRate * 100).toFixed(0)}%</span>
                        </div>
                         <input 
                           type="range" min="0" max="1" step="0.01" 
                           value={state.automateTextRate}
                           onChange={(e) => updateAutomateFactor('automateTextRate', Number(e.target.value))}
                           className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer"
                           style={{ background: `linear-gradient(to right, #0ea5e9 0%, #0ea5e9 ${state.automateTextRate*100}%, #1e293b ${state.automateTextRate*100}%, #1e293b 100%)`}}
                        />
                    </div>
                </div>
             </div>
          </div>

          {/* Enhance Breakdown */}
          <div className="bg-slate-800/30 rounded-lg border border-purple-500/10 overflow-hidden hover:border-purple-500/30 transition-colors">
            <div className="bg-purple-900/10 px-3 py-1.5 flex justify-between items-center border-b border-purple-500/10">
                <label className="text-purple-400 text-[10px] font-bold uppercase tracking-wide">Enhance 辅助提效</label>
                <span className="text-purple-300 text-[11px] font-mono font-bold">
                   {state.aiEfficiencyBoost.toFixed(2)}x
                </span>
            </div>
            <div className="p-3 space-y-2.5">
                 {[
                    { key: 'enhanceSmartFill', label: '智能填单', color: '#c084fc' },
                    { key: 'enhanceKnowledge', label: '知识推荐', color: '#a855f7' },
                    { key: 'enhanceNavigation', label: '业务导航', color: '#9333ea' },
                    { key: 'enhanceSummary', label: '总结转移', color: '#7e22ce' },
                 ].map((item) => (
                    <div key={item.key} className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 w-14 shrink-0">{item.label}</span>
                        
                        <div className="flex-1 h-3.5 flex items-center relative">
                            <input 
                                type="range" min="0" max="50" step="1" 
                                // @ts-ignore
                                value={state[item.key]}
                                // @ts-ignore
                                onChange={(e) => updateEnhanceFactor(item.key, Number(e.target.value))}
                                className="w-full h-1 bg-transparent appearance-none cursor-pointer z-10 focus:outline-none"
                                style={{
                                    // @ts-ignore
                                    background: `linear-gradient(to right, ${item.color} 0%, ${item.color} ${state[item.key]*2}%, #1e293b ${state[item.key]*2}%, #1e293b 100%)`
                                }}
                            />
                        </div>

                        <span className="text-[10px] font-mono text-purple-300 w-8 text-right font-medium">
                            {/* @ts-ignore */}+{state[item.key]}%
                        </span>
                    </div>
                 ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ControlPanel;