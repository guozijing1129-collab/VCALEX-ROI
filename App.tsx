
import React, { useState, useEffect, useMemo } from 'react';
import ControlPanel from './components/ControlPanel';
import { CostComparisonChart, StaffingChart, VolumeChart, EfficiencyGauge } from './components/DashboardCharts';
import { SimulationState, SimulationMetrics, ScenarioType, ChartDataPoint } from './types';
import { analyzeSimulation } from './services/geminiService';

const INITIAL_STATE: SimulationState = {
  dailyVolume: 20000, 
  currentHeadcount: 80, 
  avgSalary: 100000, 
  salaryAdjustment: 0, 
  baselineAiRate: 0.6, 
  aiResolutionRate: 0.86, 
  aiEfficiencyBoost: 1.3, 
  aiSystemCost: 500000, 
  
  volumeVoiceShare: 30, 
  automateVoiceRate: 0.70, 
  automateTextRate: 0.93, 

  enhanceSmartFill: 10,
  enhanceKnowledge: 10,
  enhanceNavigation: 5,
  enhanceSummary: 5,
};

// --- Smooth Typewriter ---
const TypewriterEffect: React.FC<{ text: string; speed?: number }> = ({ text, speed = 10 }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <p className="text-zinc-100 text-sm leading-relaxed font-normal whitespace-pre-wrap tracking-wide transition-all">
      {displayedText}
    </p>
  );
};

const ROICalculationDetails: React.FC<{ metrics: SimulationMetrics, state: SimulationState }> = ({ metrics, state }) => {
  const [isOpen, setIsOpen] = useState(false);
  const formatCurrency = (val: number) => `¥${(val / 10000).toFixed(1)}w`;

  // Visualizer for Neural Boost
  const NeuralCore = ({ boost }: { boost: number }) => {
    const maxNodes = 12;
    const activeNodes = Math.min(maxNodes, Math.floor((boost - 1.0) / 0.05)); 

    return (
      <div className="mt-auto pt-2 border-t border-white/5">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[9px] text-zinc-500 font-medium uppercase">Efficiency Gain 效能增益</span>
          <span className="text-[10px] font-bold text-purple-400">{boost.toFixed(2)}x</span>
        </div>
        <div className="flex gap-1 h-1.5">
          {[...Array(maxNodes)].map((_, i) => {
            const isActive = i < activeNodes;
            return (
              <div 
                key={i}
                className={`flex-1 rounded-full transition-all duration-500 ${isActive ? 'bg-purple-500' : 'bg-zinc-800'}`}
                style={{ opacity: isActive ? 1 : 0.3 }}
              />
            )
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="apple-glass h-full flex flex-col rounded-2xl overflow-hidden transition-all">
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-3 py-2 flex justify-between items-center text-[10px] font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors shrink-0 cursor-pointer outline-none"
        >
            <span>ROI测算公式 / Formula</span>
            <svg className={`w-3 h-3 text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
        </button>
        
        <div className={`flex-1 overflow-hidden transition-all duration-300 bg-black/20 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-3 space-y-3 h-full overflow-y-auto custom-scrollbar flex flex-col">
               
               <div className="space-y-1">
                  <h4 className="text-emerald-400 font-semibold text-[10px]">现有需求 Baseline</h4>
                  <p className="text-[9px] text-zinc-400 leading-tight">
                     {state.currentHeadcount} agents handling {(state.dailyVolume * (1-state.baselineAiRate)).toLocaleString()} manual tasks.
                  </p>
               </div>

               <div className="space-y-1">
                  <h4 className="text-blue-400 font-semibold text-[10px]">目标需求 Target</h4>
                  <p className="text-[9px] text-zinc-400 leading-tight">
                    Reduced to {metrics.aiModeStaff.toFixed(1)} agents via {(state.aiResolutionRate*100).toFixed(0)}% automation.
                  </p>
               </div>

               <div className="space-y-1 flex-1 flex flex-col">
                  <h4 className="text-purple-400 font-semibold text-[10px]">ROI 计算 Calc</h4>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                     <div className="bg-zinc-800/50 rounded p-1.5">
                        <div className="text-[8px] text-zinc-500">节省 Savings</div>
                        <div className="text-emerald-400 font-semibold text-[10px]">{formatCurrency(metrics.savings)}</div>
                     </div>
                     <div className="bg-zinc-800/50 rounded p-1.5">
                        <div className="text-[8px] text-zinc-500">投入 Cost</div>
                        <div className="text-rose-400 font-semibold text-[10px]">{formatCurrency(state.aiSystemCost)}</div>
                     </div>
                  </div>
                  <NeuralCore boost={state.aiEfficiencyBoost} />
               </div>

            </div>
        </div>
    </div>
  );
}

const App: React.FC = () => {
  const [state, setState] = useState<SimulationState>(INITIAL_STATE);
  const [scenario, setScenario] = useState<ScenarioType>(ScenarioType.DAILY);
  const [analysis, setAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showComparison, setShowComparison] = useState(true);

  const handleScenarioChange = (newScenario: ScenarioType) => {
    setScenario(newScenario);
    switch (newScenario) {
      case ScenarioType.DAILY:
        setState(prev => ({ ...prev, dailyVolume: 20000, currentHeadcount: 80, baselineAiRate: 0.60, volumeVoiceShare: 30, automateVoiceRate: 0.70, automateTextRate: 0.93, aiResolutionRate: 0.77, salaryAdjustment: 0 }));
        break;
      case ScenarioType.PEAK:
        setState(prev => ({ ...prev, dailyVolume: 40000, currentHeadcount: 160, baselineAiRate: 0.60, volumeVoiceShare: 25, automateVoiceRate: 0.65, automateTextRate: 0.90, aiResolutionRate: 0.83, salaryAdjustment: 0 })); 
        break;
      case ScenarioType.NIGHT:
        setState(prev => ({ ...prev, dailyVolume: 2500, currentHeadcount: 5, baselineAiRate: 0.60, volumeVoiceShare: 10, automateVoiceRate: 0.80, automateTextRate: 0.98, aiResolutionRate: 0.96, salaryAdjustment: 0 })); 
        break;
    }
  };

  const metrics = useMemo<SimulationMetrics>(() => {
    const { dailyVolume, currentHeadcount, avgSalary, salaryAdjustment, baselineAiRate, aiResolutionRate, aiEfficiencyBoost, aiSystemCost } = state;
    const annualVolume = dailyVolume * 365;
    const effectiveSalary = avgSalary * (1 + (salaryAdjustment || 0) / 100);
    const volumeHandledByHumansCurrent = annualVolume * (1 - baselineAiRate);
    const humanEfficiency = currentHeadcount > 0 ? volumeHandledByHumansCurrent / currentHeadcount : 0;
    const traditionalStaff = currentHeadcount;
    const traditionalCost = traditionalStaff * effectiveSalary;
    const aiModeStaff = (humanEfficiency > 0) ? (annualVolume * (1 - aiResolutionRate)) / (humanEfficiency * aiEfficiencyBoost) : 0;
    const aiModeLaborCost = aiModeStaff * effectiveSalary;
    const aiModeCost = aiModeLaborCost + aiSystemCost;
    const savings = traditionalCost - aiModeCost;
    const roi = (savings / (aiSystemCost || 1)) * 100;
    
    return {
      traditionalStaff, traditionalCost, aiModeStaff, aiModeCost, savings, roi,
      yearsToBreakeven: aiSystemCost / (savings > 0 ? savings : 1),
      humanWorkloadReduction: annualVolume * (aiResolutionRate - baselineAiRate),
      impliedCapacity: humanEfficiency / 365, impliedEfficiency: humanEfficiency,
    };
  }, [state]);

  const costTrendData: ChartDataPoint[] = useMemo(() => {
    const data = [];
    for (let year = 1; year <= 3; year++) {
      data.push({ name: `Y${year}`, Traditional: metrics.traditionalCost * year, AIMode: metrics.aiModeCost * year });
    }
    return data;
  }, [metrics]);

  const staffingData: ChartDataPoint[] = useMemo(() => {
      const base = [{ name: 'Baseline', value: metrics.traditionalStaff }];
      if (showComparison) base.push({ name: 'Target', value: metrics.aiModeStaff });
      return base;
  }, [metrics, showComparison]);

  const workloadData: ChartDataPoint[] = useMemo(() => {
      const rate = showComparison ? state.aiResolutionRate : state.baselineAiRate;
      return [
        { name: '早高峰 Morn', AIHandled: state.dailyVolume * 0.3 * rate, HumanHandled: state.dailyVolume * 0.3 * (1 - rate) },
        { name: '平峰期 Day', AIHandled: state.dailyVolume * 0.4 * rate, HumanHandled: state.dailyVolume * 0.4 * (1 - rate) },
        { name: '晚高峰 Eve', AIHandled: state.dailyVolume * 0.3 * rate, HumanHandled: state.dailyVolume * 0.3 * (1 - rate) },
      ];
  }, [state, showComparison]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysis(""); 
    const result = await analyzeSimulation(state, metrics);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  useEffect(() => {
     setAnalysis("系统就绪。请点击右侧按钮，基于当前配置生成AI可行性分析报告。\nSystem ready. Click button to generate AI analysis.");
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden selection:bg-blue-500/30">
      
      {/* macOS Style Toolbar */}
      <header className="flex justify-between items-center px-6 py-3 shrink-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-md h-[56px]">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg shadow-blue-500/20 flex items-center justify-center text-white font-bold text-lg">
              A
           </div>
           <div>
              <h1 className="text-sm font-semibold text-white tracking-wide">ALEXAGI ZENAVA智能客服ROI价值仿真模型</h1>
              <p className="text-[10px] text-zinc-400 font-medium">AI Feasibility Assessment Unit</p>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
             {/* iOS Style Toggle */}
             <div 
                className="flex items-center gap-3 cursor-pointer group" 
                onClick={() => setShowComparison(!showComparison)}
             >
                <span className={`text-[11px] font-medium transition-colors ${!showComparison ? 'text-white' : 'text-zinc-500'}`}>现有 Baseline</span>
                <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 relative ${showComparison ? 'bg-green-500' : 'bg-zinc-600'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${showComparison ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
                <span className={`text-[11px] font-medium transition-colors ${showComparison ? 'text-white' : 'text-zinc-500'}`}>AI模式 Target</span>
             </div>

            <button 
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium rounded-md transition-all active:scale-95 border border-white/5"
            >
                导出报告 Export
            </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden p-2 gap-2 relative h-[calc(100vh-56px)]">
        
        {/* Sidebar */}
        <div className="w-[320px] h-full flex flex-col no-print z-10 shrink-0">
          <ControlPanel 
            state={state} 
            onChange={(updates) => setState(prev => ({ ...prev, ...updates }))}
            scenario={scenario}
            onScenarioChange={handleScenarioChange}
          />
        </div>

        {/* Dashboard */}
        <div className="flex-1 flex flex-col gap-0 h-full min-w-0 z-10">
            
            {/* Charts Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 min-h-0 pb-0">
                
                {/* Top Row: Cost, Staffing, Gauge - Increased height */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 h-[36vh] min-h-[260px] shrink-0">
                    <CostComparisonChart data={costTrendData} showComparison={showComparison} />
                    <StaffingChart data={staffingData} />
                    <div className="flex flex-col gap-2 h-full">
                        <div className="flex-1 min-h-0"><EfficiencyGauge value={metrics.roi > 0 ? ((metrics.traditionalCost - metrics.aiModeCost) / metrics.traditionalCost * 100) : 0} /></div>
                        <div className="shrink-0"><ROICalculationDetails metrics={metrics} state={state} /></div>
                    </div>
                </div>

                {/* Middle Row: Volume, KPIs - Balanced height */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 h-[26vh] min-h-[180px] shrink-0">
                    <VolumeChart data={workloadData} subtitle={showComparison ? "Target" : "Current"} />
                    
                    {/* KPI Card: Savings */}
                    <div className="apple-glass rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl"></div>
                        <h3 className="text-zinc-400 text-[11px] font-semibold uppercase tracking-wide z-10">年度节省 / Savings</h3>
                        <div className="z-10">
                            <div className="text-3xl font-bold text-white tracking-tight">
                                ¥{(metrics.savings / 10000).toFixed(0)}<span className="text-lg text-zinc-500 font-medium">w</span>
                            </div>
                            <div className="text-emerald-400 text-[11px] font-medium mt-1">
                                ▲ {((metrics.savings / metrics.traditionalCost) * 100).toFixed(1)}% 优化幅度
                            </div>
                        </div>
                        <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden mt-2">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.max(0, Math.min(100, ((metrics.savings / metrics.traditionalCost) * 100)))}%` }}></div>
                        </div>
                    </div>

                    {/* KPI Card: Headcount */}
                    <div className="apple-glass rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group">
                         <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
                        <h3 className="text-zinc-400 text-[11px] font-semibold uppercase tracking-wide z-10">编制优化 / Optimization</h3>
                        <div className="flex items-end justify-between z-10 mt-2">
                            <div>
                                <div className="text-[10px] text-zinc-500 mb-0.5">Current</div>
                                <div className="text-xl font-medium text-zinc-300">{metrics.traditionalStaff.toFixed(0)}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-blue-400 mb-0.5 font-semibold">Target</div>
                                <div className="text-3xl font-bold text-white">{metrics.aiModeStaff.toFixed(1)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Analysis - Reduced Height */}
            <div className="h-[22vh] min-h-[160px] shrink-0 relative mt-0 overflow-hidden rounded-2xl border border-white/10">
                {/* Aurora Background */}
                <div className="absolute inset-0 bg-black">
                    <div className="siri-gradient absolute inset-0 opacity-40"></div>
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-xl"></div>
                </div>
                
                <div className="relative z-10 flex h-full">
                     {/* Floating Orb / Status */}
                     <div className="w-[160px] flex flex-col items-center justify-center border-r border-white/5 bg-white/5">
                         <div className={`w-16 h-16 rounded-full blur-xl transition-all duration-1000 ${isAnalyzing ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse' : 'bg-white/10'}`}></div>
                         <div className="absolute w-12 h-12 bg-gradient-to-tr from-blue-400 to-purple-500 rounded-full shadow-lg shadow-purple-500/30"></div>
                         <div className="mt-6 text-center">
                             <div className="text-white text-xs font-semibold">ZENAVA AI 价值ROI分析</div>
                             <div className="text-zinc-400 text-[10px]">Gemini 2.5 Pro</div>
                         </div>
                     </div>

                     {/* Content Area */}
                     <div className="flex-1 flex flex-col p-0">
                        <div className="flex justify-between items-center px-6 py-3 border-b border-white/5">
                             <h3 className="text-zinc-300 text-[11px] font-medium tracking-wide">策略分析 / STRATEGIC INSIGHT</h3>
                             <button 
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                className="px-4 py-1.5 bg-white text-black hover:bg-zinc-200 disabled:opacity-50 text-[11px] font-semibold rounded-full transition-all active:scale-95 shadow-lg shadow-white/10"
                            >
                                {isAnalyzing ? '思考中 Thinking...' : '生成分析 Analyze'}
                            </button>
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                            <TypewriterEffect text={analysis} speed={15} />
                        </div>
                     </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default App;
