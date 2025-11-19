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

const ROICalculationDetails: React.FC<{ metrics: SimulationMetrics, state: SimulationState }> = ({ metrics, state }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const formatCurrency = (val: number) => `¥${(val / 10000).toFixed(1)}万`;

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-sm transition-all duration-300 h-full no-break backdrop-blur-sm hover:border-slate-700 group flex flex-col">
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-4 py-3 flex justify-between items-center text-[10px] font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors uppercase tracking-wider shrink-0"
        >
            <span className="flex items-center gap-2 group-hover:text-emerald-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-600 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              ROI测算关键公式
            </span>
            <svg className={`w-3 h-3 transition-transform duration-300 text-slate-600 group-hover:text-white ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </button>
        
        <div className={`flex-1 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 text-xs space-y-4 h-full overflow-y-auto custom-scrollbar">
               
               {/* Formula 1 */}
               <div className="space-y-1.5">
                  <h4 className="text-emerald-400 font-bold text-[11px] flex items-center gap-2">
                    1. 原始人力需求 (Baseline)
                  </h4>
                  <div className="bg-slate-900/80 px-2 py-1.5 rounded border border-slate-800 font-mono text-slate-400 text-[10px]">
                    需求 = 总会话量 ÷ 人工人效
                  </div>
                  <p className="text-[10px] text-slate-500 leading-snug pl-2 border-l border-slate-800">
                     基于当前编制 <strong className="text-slate-400">{state.currentHeadcount}人</strong> 反推人效为 <strong className="text-slate-400">{metrics.impliedEfficiency.toFixed(0)}</strong> 单/人/年。
                  </p>
               </div>

               {/* Formula 2 */}
               <div className="space-y-1.5">
                  <h4 className="text-blue-400 font-bold text-[11px] flex items-center gap-2">
                    2. AI上线后人力需求 (Target)
                  </h4>
                  <div className="bg-slate-900/80 px-2 py-1.5 rounded border border-slate-800 font-mono text-slate-400 text-[10px]">
                    需求 = 会话量 × (1-解决率) ÷ (人效 × (1+提升率))
                  </div>
                  <p className="text-[10px] text-slate-500 leading-snug pl-2 border-l border-slate-800">
                    目标解决率 <strong className="text-slate-400">{(state.aiResolutionRate * 100).toFixed(1)}%</strong>，
                    提升率 <strong className="text-slate-400">{((state.aiEfficiencyBoost - 1) * 100).toFixed(0)}%</strong>
                    → 需 <strong className="text-slate-300">{metrics.aiModeStaff.toFixed(1)} 人</strong>
                  </p>
               </div>

               {/* Formula 3 */}
               <div className="space-y-1.5">
                  <h4 className="text-purple-400 font-bold text-[11px] flex items-center gap-2">
                    3. 成本节省 & ROI
                  </h4>
                  <div className="bg-slate-900/80 px-2 py-1.5 rounded border border-slate-800 font-mono text-slate-400 text-[10px]">
                    节省 = (旧成本 - 新人工成本) - AI投入
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                     <div className="bg-slate-800/30 px-2 py-1 rounded border border-slate-800/50">
                        <div className="text-[9px] text-slate-500">年度净收益</div>
                        <div className="text-emerald-400 font-mono font-bold text-[11px]">{formatCurrency(metrics.savings)}</div>
                     </div>
                     <div className="bg-slate-800/30 px-2 py-1 rounded border border-slate-800/50">
                        <div className="text-[9px] text-slate-500">年度投入</div>
                        <div className="text-rose-400 font-mono font-bold text-[11px]">{formatCurrency(state.aiSystemCost)}</div>
                     </div>
                  </div>
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

  // Scenario Logic
  const handleScenarioChange = (newScenario: ScenarioType) => {
    setScenario(newScenario);
    switch (newScenario) {
      case ScenarioType.DAILY:
        setState(prev => {
            const vShare = 30; 
            const vRate = 0.70;
            const tRate = 0.93;
            const wRate = (vRate * vShare/100) + (tRate * (100-vShare)/100);
            return { 
                ...prev, 
                dailyVolume: 20000, 
                currentHeadcount: 80,
                baselineAiRate: 0.60,
                volumeVoiceShare: vShare,
                automateVoiceRate: vRate,
                automateTextRate: tRate,
                aiResolutionRate: wRate,
                salaryAdjustment: 0
            };
        });
        break;
      case ScenarioType.PEAK:
        setState(prev => {
            const vShare = 25; 
            const vRate = 0.65;
            const tRate = 0.90;
            const wRate = (vRate * vShare/100) + (tRate * (100-vShare)/100);
            return { 
                ...prev, 
                dailyVolume: 40000, 
                currentHeadcount: 160,
                baselineAiRate: 0.60,
                volumeVoiceShare: vShare,
                automateVoiceRate: vRate,
                automateTextRate: tRate,
                aiResolutionRate: wRate,
                salaryAdjustment: 0
            }
        }); 
        break;
      case ScenarioType.NIGHT:
        setState(prev => {
            const vShare = 10;
            const vRate = 0.80;
            const tRate = 0.98;
            const wRate = (vRate * vShare/100) + (tRate * (100-vShare)/100);
            return { 
                ...prev, 
                dailyVolume: 2500, 
                currentHeadcount: 5,
                baselineAiRate: 0.60,
                volumeVoiceShare: vShare,
                automateVoiceRate: vRate,
                automateTextRate: tRate,
                aiResolutionRate: wRate,
                salaryAdjustment: 0
            }
        }); 
        break;
    }
  };

  // Metric Calculation
  const metrics = useMemo<SimulationMetrics>(() => {
    const { dailyVolume, currentHeadcount, avgSalary, salaryAdjustment, baselineAiRate, aiResolutionRate, aiEfficiencyBoost, aiSystemCost } = state;
    
    const annualVolume = dailyVolume * 365;
    const effectiveSalary = avgSalary * (1 + (salaryAdjustment || 0) / 100);

    const volumeHandledByHumansCurrent = annualVolume * (1 - baselineAiRate);
    const humanEfficiency = currentHeadcount > 0 ? volumeHandledByHumansCurrent / currentHeadcount : 0;
    
    const traditionalStaff = currentHeadcount;
    const traditionalCost = traditionalStaff * effectiveSalary;

    const aiModeStaff = (humanEfficiency > 0) 
        ? (annualVolume * (1 - aiResolutionRate)) / (humanEfficiency * aiEfficiencyBoost)
        : 0;

    const aiModeLaborCost = aiModeStaff * effectiveSalary;
    const aiModeCost = aiModeLaborCost + aiSystemCost;

    const savings = traditionalCost - aiModeCost;
    const roi = (savings / (aiSystemCost || 1)) * 100;
    const humanWorkloadReduction = annualVolume * (aiResolutionRate - baselineAiRate);

    return {
      traditionalStaff,
      traditionalCost,
      aiModeStaff,
      aiModeCost,
      savings,
      roi,
      yearsToBreakeven: aiSystemCost / (savings > 0 ? savings : 1),
      humanWorkloadReduction,
      impliedCapacity: humanEfficiency / 365, 
      impliedEfficiency: humanEfficiency,
    };
  }, [state]);

  const costTrendData: ChartDataPoint[] = useMemo(() => {
    const data = [];
    for (let year = 1; year <= 3; year++) {
      data.push({
        name: `Y${year}`,
        Traditional: metrics.traditionalCost * year,
        AIMode: metrics.aiModeCost * year,
      });
    }
    return data;
  }, [metrics]);

  const staffingData: ChartDataPoint[] = useMemo(() => [
      { name: '现有编制', value: metrics.traditionalStaff },
      { name: 'AI模式', value: metrics.aiModeStaff },
  ], [metrics]);

  const workloadData: ChartDataPoint[] = useMemo(() => [
        { name: '早高峰', AIHandled: state.dailyVolume * 0.3 * state.aiResolutionRate, HumanHandled: state.dailyVolume * 0.3 * (1 - state.aiResolutionRate) },
        { name: '平峰期', AIHandled: state.dailyVolume * 0.4 * state.aiResolutionRate, HumanHandled: state.dailyVolume * 0.4 * (1 - state.aiResolutionRate) },
        { name: '晚高峰', AIHandled: state.dailyVolume * 0.3 * state.aiResolutionRate, HumanHandled: state.dailyVolume * 0.3 * (1 - state.aiResolutionRate) },
  ], [state]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysis("正在分析模拟数据...");
    const result = await analyzeSimulation(state, metrics);
    setAnalysis(result);
    setIsAnalyzing(false);
  };
  
  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
     setAnalysis("就绪。请点击右侧按钮开始基于标杆案例的AI经济性分析。");
  }, []);

  return (
    <div className="h-screen bg-slate-950 text-slate-50 font-sans selection:bg-emerald-500/30 flex flex-col overflow-hidden">
      
      {/* Header */}
      <header className="flex justify-between items-center px-5 py-3 border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-md shrink-0 z-20 h-[60px]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-tight">ALEXAGI 客服价值ROI预估模型</h1>
            <p className="text-[10px] text-slate-400 tracking-wide">Industry Benchmark & AI Feasibility Model</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="hidden lg:flex gap-6 text-[10px] font-mono text-slate-500 no-print border-r border-slate-800 pr-6">
               <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]"></span> 目标解决率: {(state.aiResolutionRate * 100).toFixed(0)}%</span>
               <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_5px_#a855f7]"></span> 人效提升: {state.aiEfficiencyBoost.toFixed(2)}x</span>
            </div>
            
            <button 
                onClick={handlePrint}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium rounded-lg transition-colors border border-slate-800 hover:border-slate-700 no-print shadow-sm active:scale-95"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                导出报告
            </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden p-4 gap-4 relative h-[calc(100vh-60px)]">
        
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>

        {/* Left Sidebar - Controls */}
        <div className="w-1/4 h-full min-w-[300px] max-w-[400px] flex flex-col no-print z-10 shrink-0">
          <ControlPanel 
            state={state} 
            onChange={(updates) => setState(prev => ({ ...prev, ...updates }))}
            scenario={scenario}
            onScenarioChange={handleScenarioChange}
          />
        </div>

        {/* Main Dashboard - Right Column */}
        <div className="flex-1 flex flex-col gap-4 h-full min-w-0 z-10">
            
            {/* Scrollable Chart Area - Top and Middle Rows */}
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar flex flex-col gap-4 pb-2 min-h-0">
                {/* Top Row: Main Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[300px]">
                    <div className="hover:scale-[1.005] transition-transform duration-300">
                        <CostComparisonChart data={costTrendData} />
                    </div>
                    <div className="hover:scale-[1.005] transition-transform duration-300">
                        <StaffingChart data={staffingData} />
                    </div>
                    {/* ROI & Formula */}
                    <div className="flex flex-col gap-4 h-full">
                        <div className="flex-1 min-h-0 hover:scale-[1.005] transition-transform duration-300">
                            <EfficiencyGauge value={((metrics.traditionalCost - metrics.aiModeCost) / metrics.traditionalCost) * 100} />
                        </div>
                        <div className="shrink-0 hover:scale-[1.005] transition-transform duration-300">
                            <ROICalculationDetails metrics={metrics} state={state} />
                        </div>
                    </div>
                </div>

                {/* Middle Row: Secondary Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[180px]">
                    <div className="hover:scale-[1.005] transition-transform duration-300">
                        <VolumeChart data={workloadData} />
                    </div>
                    
                    {/* Annual Savings Card */}
                    <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur border border-slate-800 rounded-xl p-5 flex flex-col relative overflow-hidden shadow-lg group hover:border-emerald-500/30 hover:scale-[1.005] transition-all duration-300">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors duration-500"></div>
                        <h3 className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-2 z-10">
                            年度预计节省
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px]">P&L Impact</span>
                        </h3>
                        <div className="flex-1 flex flex-col justify-center z-10">
                            <span className="text-3xl font-bold text-white tracking-tight drop-shadow-sm">
                            ¥{(metrics.savings / 10000).toFixed(0)}万
                            </span>
                            <span className="text-emerald-500 text-xs mt-1 flex items-center gap-1 font-medium">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>
                            优化幅度 {((metrics.savings / metrics.traditionalCost) * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full bg-slate-800 h-1 mt-auto rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 shadow-[0_0_8px_#10b981]" style={{ width: Math.max(0, Math.min(100, ((metrics.savings / metrics.traditionalCost) * 100))).toFixed(0) + '%' }}></div>
                        </div>
                    </div>

                    {/* Headcount Impact Card */}
                    <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur border border-slate-800 rounded-xl p-5 flex flex-col relative overflow-hidden shadow-lg hover:border-blue-500/30 hover:scale-[1.005] transition-all duration-300 group">
                        <div className="absolute right-0 bottom-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors duration-500"></div>
                        <h3 className="text-slate-400 text-[10px] font-bold uppercase z-10">人力编制优化</h3>
                        <div className="flex-1 flex flex-col justify-center gap-4 mt-1 z-10">
                            <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                                <span className="text-slate-500 text-xs">现有编制</span>
                                <div className="text-right">
                                    <span className="text-xl font-mono text-slate-300 group-hover:text-white transition-colors">{metrics.traditionalStaff.toFixed(0)}</span>
                                    <span className="text-[9px] text-slate-600 block">Baseline</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-blue-400 text-xs font-medium">AI模式预测</span>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-white drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]">{metrics.aiModeStaff.toFixed(1)}</span>
                                    <span className="text-[9px] text-slate-600 block">Target</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Fixed Area: AI Analysis - Matches Control Panel Bottom */}
            <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-5 relative shadow-lg no-break shrink-0 hover:border-indigo-500/30 transition-colors duration-300 min-h-[200px] flex flex-col">
                <div className="flex justify-between items-start mb-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm">智能决策分析</h3>
                            <p className="text-[10px] text-slate-400">基于 Gemini 2.5 Flash 实时推理</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-indigo-900/20 no-print hover:shadow-indigo-600/30 active:scale-95"
                    >
                        {isAnalyzing ? (
                            <><svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> 分析中...</>
                        ) : (
                            <><svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> 生成评估</>
                        )}
                    </button>
                </div>
                <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800/50 flex-1 overflow-y-auto custom-scrollbar">
                    <p className="text-slate-300 text-xs leading-relaxed font-sans whitespace-pre-wrap">
                        {analysis}
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;