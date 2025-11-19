
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

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col h-full shadow-2xl overflow-hidden font-sans">
      <div className="mb-6 shrink-0">
        <h2 className="text-emerald-400 text-sm font-bold tracking-wider uppercase mb-3 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          模拟参数配置
        </h2>
        
        {/* Scenarios */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onScenarioChange(ScenarioType.DAILY)}
            className={`py-2 text-xs font-medium rounded transition-all ${
              scenario === ScenarioType.DAILY
                ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-700 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            基础日常
          </button>
          <button
            onClick={() => onScenarioChange(ScenarioType.PEAK)}
            className={`py-2 text-xs font-medium rounded transition-all ${
              scenario === ScenarioType.PEAK
                ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-700 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            大促峰值
          </button>
          <button
            onClick={() => onScenarioChange(ScenarioType.NIGHT)}
            className={`py-2 text-xs font-medium rounded transition-all ${
              scenario === ScenarioType.NIGHT
                ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-700 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            夜间值守
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
        
        {/* 1. 业务基础 */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase border-b border-slate-800 pb-1 flex items-center gap-2">
            业务基础 <span className="text-slate-600">Business Baseline</span>
          </h3>
          
          {/* Daily Volume */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-slate-300 text-xs">日均咨询量</label>
              <span className="text-slate-200 text-xs font-mono bg-slate-800 px-1.5 rounded">{state.dailyVolume.toLocaleString()} 单</span>
            </div>
            <input
              type="range"
              min="1000"
              max="50000"
              step="500"
              value={state.dailyVolume}
              onChange={(e) => onChange({ dailyVolume: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Baseline AI Rate (Hidden Context in typical UI, but exposed here for logic control) */}
          <div>
             <div className="flex justify-between mb-1">
               <label className="text-slate-300 text-xs">当前自动化率 (Baseline)</label>
               <span className="text-slate-200 text-xs font-mono bg-slate-800 px-1.5 rounded">{(state.baselineAiRate * 100).toFixed(0)}%</span>
             </div>
             <input
               type="range"
               min="0"
               max="0.80"
               step="0.05"
               value={state.baselineAiRate}
               onChange={(e) => onChange({ baselineAiRate: Number(e.target.value) })}
               className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-500"
             />
              <p className="text-[10px] text-slate-500 mt-1">现有 {state.currentHeadcount} 人是在此自动化水平下的配置</p>
          </div>

           {/* Current Headcount */}
           <div>
            <div className="flex justify-between mb-1">
              <label className="text-slate-300 text-xs">当前人员编制</label>
              <span className="text-slate-200 text-xs font-mono bg-slate-800 px-1.5 rounded">{state.currentHeadcount} 人</span>
            </div>
            <input
              type="range"
              min="5"
              max="500"
              step="1"
              value={state.currentHeadcount}
              onChange={(e) => onChange({ currentHeadcount: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
             <div className="flex justify-between mt-1 text-[10px] text-slate-500">
                <span>人均处理 (人工):</span>
                <span className="font-mono text-slate-400">{impliedCapacity} 单/人/天</span>
            </div>
          </div>
        </div>

        {/* 2. 成本与投入 */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase border-b border-slate-800 pb-1 flex items-center gap-2">
             成本与投入 <span className="text-slate-600">Cost & Investment</span>
          </h3>
          
          {/* Agent Salary */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-slate-300 text-xs">人工综合年成本 (基准)</label>
              <span className="text-slate-200 text-xs font-mono bg-slate-800 px-1.5 rounded">{formatCurrency(state.avgSalary)}</span>
            </div>
            <input
              type="range"
              min="50000"
              max="300000"
              step="5000"
              value={state.avgSalary}
              onChange={(e) => onChange({ avgSalary: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>

          {/* Salary Sensitivity */}
          <div>
             <div className="flex justify-between mb-1">
               <label className="text-slate-300 text-xs">薪资波动模拟</label>
               <span className={`text-xs font-mono px-1.5 rounded ${state.salaryAdjustment > 0 ? 'text-rose-400 bg-rose-900/30' : state.salaryAdjustment < 0 ? 'text-emerald-400 bg-emerald-900/30' : 'text-slate-400 bg-slate-800'}`}>
                 {state.salaryAdjustment > 0 ? '+' : ''}{state.salaryAdjustment}%
               </span>
             </div>
             <input
               type="range"
               min="-30"
               max="30"
               step="5"
               value={state.salaryAdjustment}
               onChange={(e) => onChange({ salaryAdjustment: Number(e.target.value) })}
               className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
             />
             <p className="text-[10px] text-slate-500 mt-1">
               实际计算年薪: <span className="font-mono text-slate-400">{formatCurrency(effectiveSalary)}</span>
             </p>
          </div>

           {/* AI System Cost */}
           <div>
            <div className="flex justify-between mb-1">
              <label className="text-slate-300 text-xs">AI项目年投入</label>
              <span className="text-slate-200 text-xs font-mono bg-slate-800 px-1.5 rounded">{formatCurrency(state.aiSystemCost)}</span>
            </div>
            <input
              type="range"
              min="100000"
              max="2000000"
              step="50000"
              value={state.aiSystemCost}
              onChange={(e) => onChange({ aiSystemCost: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">包含软件授权费、模型Token费、运营服务费</p>
          </div>
        </div>

        {/* 3. AI能力模型 */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase border-b border-slate-800 pb-1 flex items-center gap-2">
            AI能力模型 (目标) <span className="text-slate-600">Target Capabilities</span>
          </h3>
          
          {/* Automate */}
          <div className="bg-emerald-900/10 p-3 rounded border border-emerald-900/30">
            <div className="flex justify-between mb-1">
              <label className="text-emerald-400 text-xs font-bold">Automate (独立解决)</label>
              <span className="text-emerald-400 text-xs font-mono bg-emerald-900/30 px-1.5 rounded">{(state.aiResolutionRate * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={state.baselineAiRate}
              max="0.99"
              step="0.01"
              value={state.aiResolutionRate}
              onChange={(e) => onChange({ aiResolutionRate: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">从 {(state.baselineAiRate * 100).toFixed(0)}% 提升至 {(state.aiResolutionRate * 100).toFixed(0)}%</p>
          </div>

          {/* Enhance */}
          <div className="bg-purple-900/10 p-3 rounded border border-purple-900/30">
            <div className="flex justify-between mb-1">
              <label className="text-purple-400 text-xs font-bold">Enhance (辅助提效)</label>
              <span className="text-purple-400 text-xs font-mono bg-purple-900/30 px-1.5 rounded">{(state.aiEfficiencyBoost).toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.1"
              value={state.aiEfficiencyBoost}
              onChange={(e) => onChange({ aiEfficiencyBoost: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">人机协同模式下的产能提升倍数</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ControlPanel;
