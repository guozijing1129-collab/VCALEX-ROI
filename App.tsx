import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import ControlPanel from './components/ControlPanel';
import { CostComparisonChart, StaffingChart, VolumeChart, EfficiencyGauge } from './components/DashboardCharts';
import { SimulationState, SimulationMetrics, ScenarioType, ChartDataPoint } from './types';
import { analyzeSimulation } from './services/geminiService';

const INITIAL_STATE: SimulationState = {
  dailyVolume: 8000,
  currentHeadcount: 80, // Baseline headcount from case study
  avgSalary: 100000, // RMB per year
  aiResolutionRate: 0.86, // 86% based on case study
  aiEfficiencyBoost: 1.3, // 30% boost
  aiSystemCost: 500000, // Annual cost estimate
};

const ROICalculationDetails: React.FC<{ metrics: SimulationMetrics, state: SimulationState }> = ({ metrics, state }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const formatCurrency = (val: number) => `¥${(val / 10000).toFixed(1)}万`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg transition-all duration-300 mt-0 no-break">
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-4 py-3 flex justify-between items-center text-[10px] font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors uppercase tracking-wider"
        >
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              计算公式详解
            </span>
            <svg className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </button>
        
        {isOpen && (
            <div className="p-4 border-t border-slate-800 bg-slate-950/30 text-xs space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
               
               {/* Main Formula */}
               <div className="bg-slate-900/50 p-3 rounded border border-emerald-900/30">
                  <div className="text-emerald-400 font-mono text-center font-bold mb-1">
                    成本优化率 = ( 节省金额 ÷ 传统模式总成本 ) × 100%
                  </div>
                  <div className="flex justify-center items-center gap-2 text-[10px] text-slate-500 font-mono">
                     <span>({formatCurrency(metrics.savings)}</span>
                     <span>÷</span>
                     <span>{formatCurrency(metrics.traditionalCost)})</span>
                     <span>× 100% = {((metrics.savings / metrics.traditionalCost) * 100).toFixed(1)}%</span>
                  </div>
               </div>

               {/* Breakdown */}
               <div className="space-y-3 relative">
                  <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-800"></div>
                  
                  {/* Savings Item */}
                  <div className="ml-6 relative">
                     <div className="absolute -left-[17px] top-2 w-3 h-0.5 bg-slate-800"></div>
                     <h4 className="text-emerald-400 font-bold mb-1">1. 节省金额 ({formatCurrency(metrics.savings)})</h4>
                     <div className="bg-slate-800/50 p-2 rounded font-mono text-slate-400 text-[10px]">
                        = 传统总成本 - AI模式总成本
                     </div>
                  </div>

                  {/* Traditional Cost Item */}
                  <div className="ml-6 relative">
                     <div className="absolute -left-[17px] top-2 w-3 h-0.5 bg-slate-800"></div>
                     <h4 className="text-rose-400 font-bold mb-1">2. 传统模式总成本 ({formatCurrency(metrics.traditionalCost)})</h4>
                     <div className="bg-slate-800/50 p-2 rounded font-mono text-slate-400 text-[10px]">
                        = 人员编制({state.currentHeadcount}人) × 综合年薪({formatCurrency(state.avgSalary)})
                     </div>
                  </div>

                   {/* AI Cost Item */}
                   <div className="ml-6 relative">
                     <div className="absolute -left-[17px] top-2 w-3 h-0.5 bg-slate-800"></div>
                     <h4 className="text-blue-400 font-bold mb-1">3. AI模式总成本 ({formatCurrency(metrics.aiModeCost)})</h4>
                     <div className="bg-slate-800/50 p-2 rounded font-mono text-slate-400 text-[10px]">
                        = (AI后编制({metrics.aiModeStaff.toFixed(1)}人) × 年薪) + AI项目投入({formatCurrency(state.aiSystemCost)})
                     </div>
                  </div>
               </div>
            </div>
        )}
    </div>
  );
}

const App: React.FC = () => {
  const [state, setState] = useState<SimulationState>(INITIAL_STATE);
  const [scenario, setScenario] = useState<ScenarioType>(ScenarioType.DAILY);
  const [analysis, setAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Handle Scenario Presets based on Benchmark Case Study
  const handleScenarioChange = (newScenario: ScenarioType) => {
    setScenario(newScenario);
    switch (newScenario) {
      case ScenarioType.DAILY:
        // "基础日常 ~8,000 单/日, 80人"
        setState(prev => ({ 
            ...prev, 
            dailyVolume: 8000, 
            currentHeadcount: 80,
            aiResolutionRate: 0.86
        }));
        break;
      case ScenarioType.PEAK:
        // "大促峰值翻倍 ~16,000 单/日, 160人"
        setState(prev => ({ 
            ...prev, 
            dailyVolume: 16000, 
            currentHeadcount: 160,
            aiResolutionRate: 0.82 // Slightly lower resolution on complex peak queries
        })); 
        break;
      case ScenarioType.NIGHT:
        // "夜间薄弱时段 ~1,000 单/夜, 5人"
        setState(prev => ({ 
            ...prev, 
            dailyVolume: 1000, 
            currentHeadcount: 5,
            aiResolutionRate: 0.98 // High resolution for standard night queries
        })); 
        break;
    }
  };

  // Calculate Metrics
  const metrics = useMemo<SimulationMetrics>(() => {
    const { dailyVolume, currentHeadcount, avgSalary, aiResolutionRate, aiEfficiencyBoost, aiSystemCost } = state;
    
    // Traditional Calculation
    // Baseline is the current headcount provided
    const traditionalStaff = currentHeadcount; 
    const traditionalCost = traditionalStaff * avgSalary; // Annual cost

    // Implied capacity calculation for reference
    const impliedCapacity = dailyVolume / (currentHeadcount || 1);

    // AI Mode Calculation
    // Formula: New Staff = (Baseline Staff * (1 - AI Rate)) / Efficiency Boost
    // Explanation:
    // 1. Workload remaining for humans = Total Volume * (1 - AI Rate)
    // 2. New Human Capacity = Old Capacity * Boost
    // 3. Staff = Workload / New Capacity 
    //          = (Volume * (1 - Rate)) / ((Volume/OldStaff) * Boost)
    //          = OldStaff * ((1 - Rate) / Boost)
    
    const reductionFactor = (1 - aiResolutionRate) / aiEfficiencyBoost;
    const aiModeStaff = Math.max(0, currentHeadcount * reductionFactor);
    
    // Total AI Mode Cost
    const aiModeCost = (aiModeStaff * avgSalary) + aiSystemCost;

    const savings = traditionalCost - aiModeCost;
    const roi = (savings / aiSystemCost) * 100;
    const humanWorkloadReduction = dailyVolume * aiResolutionRate;

    return {
      traditionalStaff,
      traditionalCost,
      aiModeStaff,
      aiModeCost,
      savings,
      roi,
      yearsToBreakeven: aiSystemCost / (savings > 0 ? savings : 1),
      humanWorkloadReduction,
      impliedCapacity
    };
  }, [state]);

  // Prepare Chart Data
  const costTrendData: ChartDataPoint[] = useMemo(() => {
    const data = [];
    for (let year = 1; year <= 3; year++) {
      data.push({
        name: `第${year}年`,
        Traditional: metrics.traditionalCost * year,
        AIMode: metrics.aiModeCost * year + (year === 1 ? 100000 : 0), // Add 100k setup fee in Y1
      });
    }
    return data;
  }, [metrics]);

  const staffingData: ChartDataPoint[] = useMemo(() => {
    return [
      { name: '传统模式', value: metrics.traditionalStaff },
      { name: 'AI模式', value: metrics.aiModeStaff },
    ];
  }, [metrics]);

  const workloadData: ChartDataPoint[] = useMemo(() => {
    // Create a distribution visualization
    return [
        { name: '早高峰', AIHandled: state.dailyVolume * 0.3 * state.aiResolutionRate, HumanHandled: state.dailyVolume * 0.3 * (1 - state.aiResolutionRate) },
        { name: '平峰期', AIHandled: state.dailyVolume * 0.4 * state.aiResolutionRate, HumanHandled: state.dailyVolume * 0.4 * (1 - state.aiResolutionRate) },
        { name: '晚高峰', AIHandled: state.dailyVolume * 0.3 * state.aiResolutionRate, HumanHandled: state.dailyVolume * 0.3 * (1 - state.aiResolutionRate) },
    ]
  }, [state]);

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
    <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-6 font-sans selection:bg-emerald-500/30">
      
      {/* Header */}
      <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">ALEXAGI客服价值ROI预估模型 <span className="text-slate-500 font-normal text-sm">| ALEXAGI Value Model</span></h1>
            <p className="text-xs text-slate-400">行业标杆案例数据校准 (2025 Q2)</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="hidden md:flex gap-6 text-xs font-mono text-slate-400 no-print">
               <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 目标独立解决率: 86%</span>
               <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> 人效提升目标: 1.3x</span>
            </div>
            
            <button 
                onClick={handlePrint}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition-colors border border-slate-700 no-print"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                导出报告
            </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
        
        {/* Left Sidebar - Controls - Hidden on Print */}
        <div className="lg:col-span-3 h-full no-print">
          <ControlPanel 
            state={state} 
            onChange={(updates) => setState(prev => ({ ...prev, ...updates }))}
            scenario={scenario}
            onScenarioChange={handleScenarioChange}
          />
        </div>

        {/* Main Dashboard Grid - Expands on Print */}
        <div className="lg:col-span-9 flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar print:col-span-12 print:w-full print:h-auto print:overflow-visible">
          
          {/* Top Row Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3">
             <div className="h-[280px] md:h-auto min-h-[280px] print:h-[240px] print:min-h-0">
                <CostComparisonChart data={costTrendData} />
             </div>
             <div className="h-[280px] md:h-auto min-h-[280px] print:h-[240px] print:min-h-0">
                <StaffingChart data={staffingData} />
             </div>
             <div className="flex flex-col gap-4">
                <div className="h-[280px] print:h-[240px]">
                   <EfficiencyGauge value={((metrics.traditionalCost - metrics.aiModeCost) / metrics.traditionalCost) * 100} />
                </div>
                <ROICalculationDetails metrics={metrics} state={state} />
             </div>
          </div>

          {/* Middle Row Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[240px] print:grid-cols-3">
            <VolumeChart data={workloadData} />
            
            {/* Metric Card: Annual Savings */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col relative overflow-hidden shadow-lg print:shadow-none print:border-slate-200">
              <h3 className="text-slate-400 text-xs font-bold uppercase flex items-center gap-2">
                年度预计节省
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px]">P&L Impact</span>
              </h3>
              <div className="flex-1 flex items-center mt-4">
                <div>
                  <span className="text-4xl font-bold text-white tracking-tight print:text-slate-900">
                    ¥{(metrics.savings / 10000).toFixed(0)}万
                  </span>
                  <span className="block text-emerald-400 text-sm mt-2 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>
                    对比传统人工模式
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-800 h-1.5 mt-6 rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500" style={{ width: Math.max(0, Math.min(100, ((metrics.savings / metrics.traditionalCost) * 100))).toFixed(0) + '%' }}></div>
              </div>
            </div>

             {/* Metric Card: Headcount Impact */}
             <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col relative shadow-lg print:shadow-none print:border-slate-200">
               <h3 className="text-slate-400 text-xs font-bold uppercase">人力编制优化</h3>
               <div className="flex-1 flex flex-col justify-center gap-4 mt-2">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <span className="text-slate-400 text-sm">当前编制</span>
                    <div className="text-right">
                        <span className="text-2xl font-mono text-slate-200 print:text-slate-800">{metrics.traditionalStaff.toFixed(0)}</span>
                        <span className="text-xs text-slate-500 block">人</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-400 text-sm font-medium">AI引入后</span>
                    <div className="text-right">
                        <span className="text-3xl font-bold text-white print:text-slate-900">{metrics.aiModeStaff.toFixed(1)}</span>
                        <span className="text-xs text-slate-500 block">人 (当量)</span>
                    </div>
                  </div>
               </div>
             </div>
          </div>

          {/* Bottom Section: AI Analysis */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 min-h-[200px] relative shadow-lg print:shadow-none print:border-slate-200 no-break">
             <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-500/20 p-2 rounded-lg border border-indigo-500/30">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm print:text-slate-900">AI 经济分析师</h3>
                        <p className="text-xs text-slate-400">Powered by Gemini 2.5</p>
                    </div>
                </div>
                <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-indigo-900/20 no-print"
                >
                    {isAnalyzing ? (
                        <><svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> 分析中...</>
                    ) : (
                        <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> 生成评估报告</>
                    )}
                </button>
             </div>
             <div className="bg-slate-950/50 rounded-lg p-5 border border-slate-800 min-h-[100px] print:bg-white print:border-0 print:p-0">
                 <p className="text-slate-300 text-sm leading-relaxed font-sans whitespace-pre-wrap print:text-slate-800">
                     {analysis}
                 </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);