
import React, { memo } from 'react';
import { SimulationState, ScenarioType } from '../types';

interface ControlPanelProps {
  state: SimulationState;
  onChange: (newState: Partial<SimulationState>) => void;
  scenario: ScenarioType;
  onScenarioChange: (s: ScenarioType) => void;
}

// --- Isolated Components for Performance ---

const SectionHeader = memo(({ title, subtitle, icon }: { title: string, subtitle: string, icon?: React.ReactNode }) => (
  <h3 className="text-[9px] font-bold text-cyan-500/80 uppercase tracking-widest mb-2 flex items-center justify-between group select-none border-b border-cyan-900/30 pb-1 mt-0.5">
    <span className="flex items-center gap-1.5 text-cyan-100 group-hover:text-white transition-colors drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
      {icon}
      {title}
    </span>
    <span className="text-[8px] text-cyan-700 font-mono group-hover:text-cyan-500 transition-colors">{subtitle}</span>
  </h3>
));

interface RangeInputProps {
  label: string | React.ReactNode;
  value: number;
  min: string | number;
  max: string | number;
  step: string | number;
  onChange: (val: number) => void;
  displayValue: string | React.ReactNode;
  subLabel?: string | React.ReactNode;
  accentColor?: string;
  variant?: 'default' | 'power-bar'; // Added variant for different visual styles
}

const RangeInput = memo(({ 
  label, 
  value, 
  min, 
  max, 
  step, 
  onChange, 
  displayValue, 
  subLabel,
  accentColor = "#06b6d4",
  variant = 'default'
}: RangeInputProps) => {
  const percentage = ((value - Number(min)) / (Number(max) - Number(min))) * 100;
  
  if (variant === 'power-bar') {
    return (
      <div className="group/slider select-none py-1 relative z-10">
         <div className="flex justify-between mb-1 items-center">
            <label className="text-slate-400 text-[9px] font-medium uppercase tracking-tighter group-hover/slider:text-white transition-colors">
              {label}
            </label>
            <span className="text-[9px] font-mono font-bold" style={{ color: accentColor }}>
              {displayValue}
            </span>
         </div>
         <div className="relative w-full h-3 bg-slate-900/80 rounded-sm border border-slate-800 overflow-hidden flex gap-[1px] cursor-pointer">
            {/* Segmented Background */}
            {[...Array(20)].map((_, i) => (
              <div key={i} className="flex-1 border-r border-slate-950/50 bg-transparent last:border-0"></div>
            ))}
            
            {/* Active Fill */}
            <div 
              className="absolute inset-y-0 left-0 transition-all duration-200 opacity-80 group-hover/slider:opacity-100"
              style={{ 
                width: `${percentage}%`, 
                backgroundColor: accentColor,
                boxShadow: `0 0 8px ${accentColor}`
              }}
            ></div>

            {/* Input Overlay - Increased Height for better touch target */}
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />
         </div>
      </div>
    )
  }

  return (
    <div className="group/slider select-none py-0.5 relative z-10">
      <div className="flex justify-between mb-0.5 items-end">
        <label className="text-slate-400 text-[9px] font-medium group-hover/slider:text-cyan-200 transition-colors cursor-pointer truncate pr-2 tracking-wide font-mono uppercase opacity-80 group-hover/slider:opacity-100">
          {label}
        </label>
        <span 
          className="text-white text-[9px] font-mono bg-slate-900 border border-slate-700/50 px-1.5 py-0 rounded-sm shadow-[0_0_10px_rgba(0,0,0,0.5)] group-hover/slider:border-cyan-500/40 transition-all min-w-[40px] text-right relative overflow-hidden"
          style={{ color: accentColor, textShadow: `0 0 8px ${accentColor}60` }}
        >
          <span className="absolute inset-0 bg-current opacity-5"></span>
          {displayValue}
        </span>
      </div>
      <div className="relative w-full h-4 flex items-center">
          {/* Track Background */}
          <div className="absolute w-full h-1 bg-slate-800/60 rounded-full overflow-hidden group-hover/slider:bg-slate-800 transition-colors">
             {/* Subtle grid texture for track */}
             <div className="w-full h-full opacity-20" style={{ backgroundImage: 'linear-gradient(90deg, transparent 50%, #000 50%)', backgroundSize: '4px 100%' }}></div>
          </div>
          
          {/* Interactive Input - Hit Area Fix */}
         <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          style={{
              // Using a mask or transparent background to ensure clickability
          }}
        />
        
        {/* Visual Thumb/Fill (Non-interactive representation) */}
        <div className="absolute h-1 pointer-events-none z-10 rounded-full" 
             style={{ 
                 width: `${percentage}%`,
                 background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} 100%)`
             }}>
        </div>
         <div className="absolute h-3 w-3 bg-white border border-slate-400 rounded-sm shadow pointer-events-none z-10" 
             style={{ 
                 left: `calc(${percentage}% - 6px)`,
                 backgroundColor: '#fff',
                 boxShadow: `0 0 10px ${accentColor}`
             }}>
        </div>
      </div>
      
      {/* Tech Ruler/Ticks */}
      <div className="flex justify-between px-1 -mt-1 opacity-20 group-hover/slider:opacity-40 transition-opacity duration-300 pointer-events-none">
           {[...Array(11)].map((_, i) => (
               <div key={i} className={`w-px ${i % 5 === 0 ? 'h-1 bg-slate-300' : 'h-0.5 bg-slate-500'}`}></div>
           ))}
      </div>

      {subLabel && (
        <div className="text-[8px] text-slate-500 mt-0.5 leading-tight font-light tracking-wide font-mono pl-2 border-l border-slate-800 group-hover/slider:border-slate-600 transition-colors group-hover/slider:text-slate-400">
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
  
  const formatCurrency = (val: number) => `¥${(val / 10000).toFixed(1)}万`;
  const impliedCapacity = Math.round(state.dailyVolume * (1 - state.baselineAiRate) / (state.currentHeadcount || 1));
  const effectiveSalary = state.avgSalary * (1 + (state.salaryAdjustment || 0) / 100);

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

  return (
    <div className="hud-card rounded-xl flex flex-col h-full overflow-hidden relative border border-slate-800/60 shadow-2xl bg-[#050b14]">
      
      {/* Header / Scanline */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent z-0"></div>
      <div className="absolute top-0 inset-x-0 h-12 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none z-0"></div>

      <div className="p-3 pb-1 shrink-0 relative z-20">
        <h2 className="text-cyan-400 text-[10px] font-bold tracking-[0.2em] uppercase mb-3 flex items-center gap-2 select-none">
          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-sm animate-pulse shadow-[0_0_8px_#22d3ee]"></span>
          模拟参数配置
        </h2>
        
        {/* Scenarios Buttons - Forced Z-Index */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-900/90 rounded border border-slate-800/50 relative z-30">
          {[
            { type: ScenarioType.DAILY, label: '基础日常' },
            { type: ScenarioType.PEAK, label: '大促峰值' },
            { type: ScenarioType.NIGHT, label: '夜间值守' },
          ].map((item) => (
            <button
              key={item.type}
              onClick={() => onScenarioChange(item.type)}
              type="button"
              className={`py-2 text-[10px] font-mono rounded-sm transition-all duration-200 border select-none relative overflow-hidden group active:scale-95 cursor-pointer z-30 ${
                scenario === item.type
                  ? 'bg-cyan-950/40 text-cyan-300 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                  : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {/* Button Hover Glint */}
              <div className={`absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite] ${scenario !== item.type && 'hidden'}`}></div>
              <span className="relative z-10">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-1 custom-scrollbar space-y-3 pb-4 relative z-10">
        
        {/* 1. 业务基础 */}
        <div className="space-y-1">
          <SectionHeader title="业务基础" subtitle="BASELINE" />
          <div className="space-y-1 pl-1">
            <RangeInput
              label="日均咨询量"
              value={state.dailyVolume}
              min="1000" max="50000" step="500"
              displayValue={`${state.dailyVolume.toLocaleString()}`}
              onChange={(val: number) => onChange({ dailyVolume: val })}
              accentColor="#3b82f6"
            />

            <RangeInput
              label="当前自动化率"
              value={state.baselineAiRate}
              min="0" max="0.80" step="0.05"
              displayValue={`${(state.baselineAiRate * 100).toFixed(0)}%`}
              onChange={(val: number) => onChange({ baselineAiRate: val })}
              accentColor="#94a3b8"
              subLabel={`配置基准: ${state.currentHeadcount}人 @ ${(state.baselineAiRate * 100).toFixed(0)}% 自动化`}
            />

            <RangeInput
              label="当前人员编制"
              value={state.currentHeadcount}
              min="5" max="500" step="1"
              displayValue={`${state.currentHeadcount} 人`}
              onChange={(val: number) => onChange({ currentHeadcount: val })}
              accentColor="#3b82f6"
              subLabel={<span className="flex justify-between"><span>人工人效:</span> <span className="font-mono text-cyan-200">{impliedCapacity} 单/人/天</span></span>}
            />
          </div>
        </div>

        {/* 2. 成本与投入 */}
        <div className="space-y-1">
          <SectionHeader title="成本与投入" subtitle="COST & INVESTMENT" />
          <div className="space-y-1 pl-1">
            <RangeInput
              label="人工综合年成本"
              value={state.avgSalary}
              min="50000" max="300000" step="5000"
              displayValue={formatCurrency(state.avgSalary)}
              onChange={(val: number) => onChange({ avgSalary: val })}
              accentColor="#f43f5e"
            />

            <RangeInput
              label="薪资波动模拟"
              value={state.salaryAdjustment}
              min="-30" max="30" step="5"
              displayValue={`${state.salaryAdjustment > 0 ? '+' : ''}${state.salaryAdjustment}%`}
              onChange={(val: number) => onChange({ salaryAdjustment: val })}
              accentColor="#fb923c"
              subLabel={<span className="flex justify-between"><span>实际测算:</span> <span className="font-mono text-orange-200">{formatCurrency(effectiveSalary)}</span></span>}
            />

            <RangeInput
              label="AI项目年投入"
              value={state.aiSystemCost}
              min="100000" max="2000000" step="50000"
              displayValue={formatCurrency(state.aiSystemCost)}
              onChange={(val: number) => onChange({ aiSystemCost: val })}
              accentColor="#f43f5e"
              subLabel="含软件授权、Token费及运营服务"
            />
          </div>
        </div>

        {/* 3. AI能力模型 */}
        <div className="space-y-1">
          <SectionHeader title="AI能力模型" subtitle="CAPABILITIES" />
          
          {/* Automate Breakdown */}
          <div className="bg-slate-900/40 rounded-sm border border-emerald-500/20 overflow-hidden hover:border-emerald-500/40 transition-all group">
             <div className="bg-emerald-950/30 px-2 py-1 flex justify-between items-center border-b border-emerald-500/20">
                <label className="text-emerald-400 text-[9px] font-bold uppercase tracking-wide flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-emerald-500 rounded-sm rotate-45 shadow-[0_0_5px_#10b981]"></span>
                    Automate 独立解决
                </label>
                <span className="text-emerald-300 text-[10px] font-mono font-bold text-glow">
                   {(state.aiResolutionRate * 100).toFixed(1)}%
                </span>
             </div>
             
             <div className="p-2 space-y-3">
                {/* Mix */}
                <RangeInput
                    label={`渠道结构: 语音 ${state.volumeVoiceShare}% / 文本 ${100 - state.volumeVoiceShare}%`}
                    value={state.volumeVoiceShare}
                    min="0" max="100" step="5"
                    displayValue="MIX"
                    onChange={(val: number) => updateAutomateFactor('volumeVoiceShare', val)}
                    accentColor="#818cf8"
                    subLabel="Voice vs Text Volume Share"
                />
                <div className="grid grid-cols-2 gap-3 pt-0.5">
                    <div className="space-y-1 group/voice">
                        <div className="flex justify-between text-[8px] text-indigo-300 font-mono uppercase tracking-wider opacity-80 group-hover/voice:opacity-100">
                            <span>语音智能体</span>
                            <span className="text-white font-bold">{(state.automateVoiceRate * 100).toFixed(0)}%</span>
                        </div>
                        <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden group-hover/voice:h-2.5 transition-all">
                            <input 
                                type="range" min="0" max="1" step="0.01" 
                                value={state.automateVoiceRate}
                                onChange={(e) => updateAutomateFactor('automateVoiceRate', Number(e.target.value))}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            />
                            <div className="absolute inset-0 w-full h-full" style={{ background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${state.automateVoiceRate*100}%, transparent ${state.automateVoiceRate*100}%)` }}></div>
                        </div>
                    </div>
                    <div className="space-y-1 group/text">
                        <div className="flex justify-between text-[8px] text-sky-300 font-mono uppercase tracking-wider opacity-80 group-hover/text:opacity-100">
                            <span>文本智能体</span>
                            <span className="text-white font-bold">{(state.automateTextRate * 100).toFixed(0)}%</span>
                        </div>
                        <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden group-hover/text:h-2.5 transition-all">
                             <input 
                                type="range" min="0" max="1" step="0.01" 
                                value={state.automateTextRate}
                                onChange={(e) => updateAutomateFactor('automateTextRate', Number(e.target.value))}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            />
                            <div className="absolute inset-0 w-full h-full" style={{ background: `linear-gradient(to right, #0ea5e9 0%, #0ea5e9 ${state.automateTextRate*100}%, transparent ${state.automateTextRate*100}%)` }}></div>
                        </div>
                    </div>
                </div>
             </div>
          </div>

          {/* Enhance Breakdown - REVAMPED for "Fuller" Look */}
          <div className="bg-slate-950 border border-purple-500/30 rounded-sm overflow-hidden mt-2 shadow-[0_0_15px_rgba(168,85,247,0.1)] relative group z-10">
            {/* Tech Background Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-600/10 rounded-bl-full pointer-events-none"></div>
            
            {/* Header Area with Big Stat */}
            <div className="p-3 border-b border-purple-500/20 bg-gradient-to-r from-purple-950/40 to-transparent flex items-center justify-between">
                <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-full border border-purple-500/50 flex items-center justify-center bg-purple-900/20 relative">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <div className="absolute inset-0 border border-purple-400/30 rounded-full animate-[ping_3s_infinite]"></div>
                     </div>
                     <div>
                        <label className="text-purple-300 text-[9px] font-bold uppercase tracking-widest block">Enhance</label>
                        <span className="text-[8px] text-purple-400/60 font-mono">辅助提效模块</span>
                     </div>
                </div>
                <div className="text-right">
                   <div className="text-2xl font-mono font-bold text-white leading-none drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]">
                      {state.aiEfficiencyBoost.toFixed(2)}<span className="text-sm text-purple-500">x</span>
                   </div>
                </div>
            </div>

            {/* Sliders Area */}
            <div className="p-3 space-y-2.5 bg-slate-900/20">
                 {[
                    { key: 'enhanceSmartFill', label: '智能填单', color: '#c084fc' },
                    { key: 'enhanceKnowledge', label: '知识推荐', color: '#a855f7' },
                    { key: 'enhanceNavigation', label: '业务导航', color: '#9333ea' },
                    { key: 'enhanceSummary', label: '总结转移', color: '#7e22ce' },
                 ].map((item) => (
                    <RangeInput 
                        key={item.key}
                        label={item.label}
                        // @ts-ignore
                        value={state[item.key]}
                        min="0" max="50" step="1"
                        // @ts-ignore
                        onChange={(val) => updateEnhanceFactor(item.key, val)}
                        // @ts-ignore
                        displayValue={`+${state[item.key]}%`}
                        accentColor={item.color}
                        variant="power-bar"
                    />
                 ))}
            </div>
          </div>
        </div>

      </div>

      {/* SYSTEM FOOTER - Pinned to bottom */}
      <div className="shrink-0 border-t border-slate-800/60 p-2 bg-slate-950/80 mt-auto flex justify-between items-center relative z-20">
         <div className="flex gap-3">
             <div className="text-[8px] font-mono text-slate-500">
                 <span className="block text-slate-600 uppercase tracking-wider">CPU</span>
                 <span className="text-cyan-500">34%</span>
             </div>
             <div className="text-[8px] font-mono text-slate-500">
                 <span className="block text-slate-600 uppercase tracking-wider">RAM</span>
                 <span className="text-cyan-500">12GB</span>
             </div>
             <div className="text-[8px] font-mono text-slate-500">
                 <span className="block text-slate-600 uppercase tracking-wider">NET</span>
                 <span className="text-emerald-500">CONNECTED</span>
             </div>
         </div>
         <div className="w-16 h-4 bg-slate-900 rounded-sm overflow-hidden border border-slate-800 relative">
             <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-transparent animate-pulse"></div>
             <div className="absolute top-1/2 left-0 w-full h-[1px] bg-cyan-500/30"></div>
         </div>
      </div>

    </div>
  );
};

export default ControlPanel;
