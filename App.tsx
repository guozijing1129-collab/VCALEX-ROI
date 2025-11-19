
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

// --- Typewriter Effect Component for AI Text ---
const TypewriterEffect: React.FC<{ text: string; speed?: number }> = ({ text, speed = 15 }) => {
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
    <p className="text-cyan-100 text-sm leading-7 font-mono whitespace-pre-wrap drop-shadow-[0_0_2px_rgba(34,211,238,0.5)] tracking-wide">
      {displayedText}
      <span className="inline-block w-2 h-4 bg-cyan-500 ml-1 animate-pulse align-middle shadow-[0_0_5px_#22d3ee]"></span>
    </p>
  );
};

const ROICalculationDetails: React.FC<{ metrics: SimulationMetrics, state: SimulationState }> = ({ metrics, state }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const formatCurrency = (val: number) => `¥${(val / 10000).toFixed(1)}万`;

  // Internal component for visualization
  const NeuralCore = ({ boost }: { boost: number }) => {
    // Map boost (e.g. 1.0 to 1.6) to a visual scale of 0-100%
    // Base is 1.0 (0 nodes), Max visualized is usually around 1.6 (all nodes)
    const maxNodes = 12;
    const activeNodes = Math.min(maxNodes, Math.floor((boost - 1.0) / 0.05)); 

    return (
      <div className="mt-auto pt-1 border-t border-slate-800/50">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[8px] text-slate-500 uppercase font-mono tracking-wider flex items-center gap-1">
            <span className="w-1 h-1 bg-purple-500 rounded-full animate-pulse"></span>
            AI Core
          </span>
          <span className="text-[9px] font-mono font-bold text-purple-400 drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]">
            {boost.toFixed(2)}x
          </span>
        </div>
        <div className="flex gap-0.5 h-1.5">
          {[...Array(maxNodes)].map((_, i) => {
            const isActive = i < activeNodes;
            return (
              <div 
                key={i}
                className={`flex-1 rounded-sm transition-all duration-500 ${isActive ? 'bg-gradient-to-t from-purple-600 to-purple-400 shadow-[0_0_6px_#a855f7]' : 'bg-slate-800/50'}`}
                style={{ 
                    opacity: isActive ? 1 : 0.2,
                    animation: isActive ? `pulse 2s infinite ${i * 0.1}s` : 'none'
                }}
              />
            )
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="hud-card h-full flex flex-col group hover:border-slate-600/50 transition-all duration-300 overflow-hidden">
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-2 py-1.5 flex justify-between items-center text-[9px] font-bold text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50 transition-colors uppercase tracking-widest shrink-0 cursor-pointer outline-none"
        >
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 group-hover:shadow-[0_0_10px_currentColor]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              ROI测算公式
            </span>
            <svg className={`w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </button>
        
        <div className={`flex-1 overflow-hidden transition-all duration-300 bg-slate-950/50 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-2 border-t border-slate-800 space-y-2 h-full overflow-y-auto custom-scrollbar flex flex-col">
               
               {/* Formula 1 */}
               <div className="space-y-0.5">
                  <h4 className="text-emerald-400 font-bold text-[9px] font-mono">01_BASELINE</h4>
                  <div className="bg-slate-900/80 px-2 py-0.5 border-l-2 border-emerald-500 font-mono text-slate-400 text-[8px]">
                    需求 = 总量 ÷ 人效
                  </div>
                  <p className="text-[8px] text-slate-500 pl-2">
                     当前 <span className="text-emerald-300">{state.currentHeadcount}人</span> → 人效 <span className="text-emerald-300">{metrics.impliedEfficiency.toFixed(0)}</span>
                  </p>
               </div>

               {/* Formula 2 */}
               <div className="space-y-0.5">
                  <h4 className="text-blue-400 font-bold text-[9px] font-mono">02_TARGET</h4>
                  <div className="bg-slate-900/80 px-2 py-0.5 border-l-2 border-blue-500 font-mono text-slate-400 text-[8px]">
                    需求 = 量 × (1-AI%) ÷ (人效 × 提效)
                  </div>
                  <p className="text-[8px] text-slate-500 pl-2">
                    Target <span className="text-blue-300">{(state.aiResolutionRate * 100).toFixed(1)}%</span> → <span className="text-blue-300">{metrics.aiModeStaff.toFixed(1)} 人</span>
                  </p>
               </div>

               {/* Formula 3 */}
               <div className="space-y-0.5 flex-1 flex flex-col">
                  <h4 className="text-purple-400 font-bold text-[9px] font-mono">03_ROI</h4>
                  <div className="bg-slate-900/80 px-2 py-0.5 border-l-2 border-purple-500 font-mono text-slate-400 text-[8px]">
                    节省 = (旧-新) - 投入
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-0.5">
                     <div className="border border-slate-800 px-1.5 py-0.5 bg-slate-900/50">
                        <div className="text-[8px] text-slate-500 uppercase">Net</div>
                        <div className="text-emerald-400 font-mono font-bold text-[9px]">{formatCurrency(metrics.savings)}</div>
                     </div>
                     <div className="border border-slate-800 px-1.5 py-0.5 bg-slate-900/50">
                        <div className="text-[8px] text-slate-500 uppercase">Invest</div>
                        <div className="text-rose-400 font-mono font-bold text-[9px]">{formatCurrency(state.aiSystemCost)}</div>
                     </div>
                  </div>
                  
                  {/* Dynamic Visualizer Integration */}
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
  const [showComparison, setShowComparison] = useState(true); // Default to true for better first impression

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

  const staffingData: ChartDataPoint[] = useMemo(() => {
      const base = [
          { name: '现有编制', value: metrics.traditionalStaff },
      ];
      if (showComparison) {
          base.push({ name: 'AI模式', value: metrics.aiModeStaff });
      }
      return base;
  }, [metrics, showComparison]);

  const workloadData: ChartDataPoint[] = useMemo(() => {
      const rate = showComparison ? state.aiResolutionRate : state.baselineAiRate;
      return [
        { name: '早高峰', AIHandled: state.dailyVolume * 0.3 * rate, HumanHandled: state.dailyVolume * 0.3 * (1 - rate) },
        { name: '平峰期', AIHandled: state.dailyVolume * 0.4 * rate, HumanHandled: state.dailyVolume * 0.4 * (1 - rate) },
        { name: '晚高峰', AIHandled: state.dailyVolume * 0.3 * rate, HumanHandled: state.dailyVolume * 0.3 * (1 - rate) },
      ];
  }, [state, showComparison]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysis(""); // Clear for typewriter effect
    const result = await analyzeSimulation(state, metrics);
    setAnalysis(result);
    setIsAnalyzing(false);
  };
  
  const handlePrint = () => {
    window.print();
  };

  // Initial generic welcome message
  useEffect(() => {
     setAnalysis("系统就绪。\n正在等待指令...\n请点击右侧按钮开始基于标杆案例的AI经济性分析。");
  }, []);

  return (
    <div className="h-screen bg-black text-slate-50 font-sans selection:bg-cyan-500/30 flex flex-col overflow-hidden relative">
      
      {/* GLOBAL CYBER BACKGROUND */}
      <div className="absolute inset-0 bg-tech-grid opacity-30 pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-80 pointer-events-none z-0"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500 shadow-[0_0_20px_#22d3ee] z-50 animate-pulse"></div>
      <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 z-0"></div>
      
      {/* Scanline Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

      {/* Header */}
      <header className="flex justify-between items-center px-4 py-2 border-b border-cyan-900/30 bg-slate-950/40 backdrop-blur-md shrink-0 z-20 h-[48px] relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 relative flex items-center justify-center group cursor-pointer">
             <div className="absolute inset-0 bg-cyan-500/20 rounded blur-md group-hover:bg-cyan-500/40 transition-all"></div>
             <div className="relative w-full h-full bg-slate-900 border border-cyan-500/50 rounded flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                 </svg>
             </div>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tighter text-white leading-none font-mono uppercase drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
                ALEXAGI <span className="text-cyan-500">ROI</span> MODEL
            </h1>
            <p className="text-[9px] text-cyan-700/80 tracking-[0.2em] font-mono mt-0.5">FEASIBILITY ASSESSMENT UNIT</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
            
             {/* Comparison Toggle */}
             <div className="flex items-center gap-2 no-print bg-slate-900/50 px-2.5 py-1 rounded-full border border-slate-800 cursor-pointer" onClick={() => setShowComparison(!showComparison)}>
                <span className={`text-[9px] font-mono tracking-wide transition-colors ${!showComparison ? 'text-cyan-400 font-bold text-glow' : 'text-slate-500'}`}>BASELINE</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowComparison(!showComparison); }}
                  className={`w-8 h-4 rounded-full p-0.5 transition-all duration-300 shadow-inner cursor-pointer active:scale-95 ${showComparison ? 'bg-cyan-600 shadow-[0_0_10px_#0891b2]' : 'bg-slate-700'}`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform duration-300 ${showComparison ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </button>
                <span className={`text-[9px] font-mono tracking-wide transition-colors ${showComparison ? 'text-cyan-400 font-bold text-glow' : 'text-slate-500'}`}>COMPARE AI</span>
             </div>

            <button 
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-900/20 hover:bg-cyan-800/30 text-cyan-300 text-[10px] font-mono font-bold rounded border border-cyan-500/30 no-print hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all active:scale-95 cursor-pointer"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                EXPORT
            </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden p-1 gap-1 relative h-[calc(100vh-48px)]">
        
        {/* Left Sidebar - Controls */}
        <div className="w-1/4 h-full min-w-[300px] max-w-[360px] flex flex-col no-print z-10 shrink-0">
          <ControlPanel 
            state={state} 
            onChange={(updates) => setState(prev => ({ ...prev, ...updates }))}
            scenario={scenario}
            onScenarioChange={handleScenarioChange}
          />
        </div>

        {/* Main Dashboard - Right Column - GAP REMOVED */}
        <div className="flex-1 flex flex-col gap-0 h-full min-w-0 z-10">
            
            {/* Scrollable Chart Area - Top and Middle Rows - FLEX-1 TO FILL */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1 min-h-0 pb-1">
                
                {/* Top Row: Main Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-1 h-[35vh] min-h-[260px] shrink-0">
                    <div className="hover:translate-y-[-2px] transition-transform duration-300">
                        <CostComparisonChart data={costTrendData} showComparison={showComparison} />
                    </div>
                    <div className="hover:translate-y-[-2px] transition-transform duration-300">
                        <StaffingChart data={staffingData} />
                    </div>
                    {/* ROI & Formula */}
                    <div className="flex flex-col gap-1 h-full">
                        <div className="flex-1 min-h-0 hover:translate-y-[-2px] transition-transform duration-300">
                            <EfficiencyGauge value={((metrics.traditionalCost - metrics.aiModeCost) / metrics.traditionalCost) * 100} />
                        </div>
                        <div className="shrink-0 hover:translate-y-[-2px] transition-transform duration-300">
                            <ROICalculationDetails metrics={metrics} state={state} />
                        </div>
                    </div>
                </div>

                {/* Middle Row: Secondary Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-1 h-[25vh] min-h-[180px] shrink-0">
                    <div className="hover:translate-y-[-2px] transition-transform duration-300">
                        <VolumeChart data={workloadData} subtitle={showComparison ? "TARGET MIX" : "BASELINE MIX"} />
                    </div>
                    
                    {/* Annual Savings Card */}
                    <div className="hud-card rounded-xl p-1.5 flex flex-col relative overflow-hidden group hover:border-emerald-500/50 transition-all duration-300">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors duration-500"></div>
                        <h3 className="text-emerald-400 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 z-10">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_#10b981] animate-pulse"></span>
                            年度预计节省
                        </h3>
                        <div className="flex-1 flex flex-col justify-center z-10">
                            <span className="text-3xl font-bold text-white tracking-tighter font-mono drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                            ¥{(metrics.savings / 10000).toFixed(0)}<span className="text-sm text-emerald-500/70 ml-1">万</span>
                            </span>
                            <span className="text-emerald-400/80 text-[10px] mt-1 flex items-center gap-1 font-mono">
                            ▲ 优化幅度 {((metrics.savings / metrics.traditionalCost) * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full bg-slate-800 h-0.5 mt-auto overflow-hidden relative">
                            <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" style={{ width: Math.max(0, Math.min(100, ((metrics.savings / metrics.traditionalCost) * 100))).toFixed(0) + '%' }}></div>
                        </div>
                    </div>

                    {/* Headcount Impact Card */}
                    <div className="hud-card rounded-xl p-1.5 flex flex-col relative overflow-hidden group hover:border-blue-500/50 transition-all duration-300">
                        <div className="absolute right-0 bottom-0 w-24 h-24 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors duration-500"></div>
                        <h3 className="text-blue-400 text-[9px] font-bold uppercase tracking-widest z-10 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_5px_#3b82f6] animate-pulse"></span>
                            人力编制优化
                        </h3>
                        <div className="flex-1 flex flex-col justify-center gap-3 mt-1 z-10">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                                <span className="text-slate-500 text-[9px] font-mono">CURRENT</span>
                                <div className="text-right">
                                    <span className="text-lg font-mono text-slate-300 group-hover:text-white transition-colors">{metrics.traditionalStaff.toFixed(0)}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-blue-400 text-[9px] font-mono font-bold text-glow">TARGET</span>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-white font-mono drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">{metrics.aiModeStaff.toFixed(1)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Fixed Area: AI Analysis - EXPANDED & SEAMLESS */}
            <div className="hud-card rounded-t-xl rounded-b-none relative shadow-lg no-break shrink-0 transition-colors duration-300 h-[32vh] min-h-[180px] flex overflow-hidden border-t border-indigo-500/30 border-x-0 border-b-0 hover:border-indigo-500/50 group z-20 -mt-[1px]">
                
                {/* Left: Status & Visualizer */}
                <div className="w-1/4 border-r border-indigo-500/20 bg-slate-950/60 flex flex-col">
                    <div className="p-2 border-b border-indigo-500/20 bg-slate-900/50">
                         <h3 className="text-indigo-100 font-bold text-[10px] font-mono tracking-wider flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-amber-400 animate-ping' : 'bg-indigo-500'}`}></span>
                            INTELLIGENCE
                         </h3>
                    </div>
                    
                    {/* Visualizer Area */}
                    <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                        {/* Rotating Rings */}
                        <div className="absolute w-32 h-32 border border-indigo-500/20 rounded-full animate-[spin_12s_linear_infinite]"></div>
                        <div className="absolute w-24 h-24 border-t-2 border-b-2 border-indigo-400/40 rounded-full animate-[spin_6s_linear_infinite_reverse]"></div>
                        <div className="absolute w-12 h-12 bg-indigo-500/10 rounded-full animate-pulse border border-indigo-500/30"></div>
                        
                        {/* Dynamic Waveform Simulation */}
                        <div className="absolute bottom-0 inset-x-0 h-12 flex items-end justify-center gap-0.5 opacity-50">
                           {[...Array(16)].map((_, i) => (
                              <div 
                                key={i} 
                                className="w-1 bg-indigo-500/60 rounded-t-sm animate-[pulse_0.8s_ease-in-out_infinite]"
                                style={{ 
                                    height: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random()}s`
                                }}
                              ></div>
                           ))}
                        </div>
                    </div>

                    {/* System Status Stats */}
                    <div className="p-2 grid grid-cols-2 gap-2 border-t border-indigo-500/20 text-[8px] font-mono text-indigo-400/70 bg-slate-900/30">
                         <div>
                            <div className="uppercase tracking-wider opacity-50">Latency</div>
                            <div className="text-indigo-300">12ms</div>
                         </div>
                         <div>
                             <div className="uppercase tracking-wider opacity-50">Model</div>
                             <div className="text-indigo-300">G-2.5</div>
                         </div>
                    </div>
                </div>

                {/* Right: Output Console */}
                <div className="flex-1 flex flex-col bg-slate-950/90 relative z-30">
                    <div className="flex justify-between items-center p-2 border-b border-slate-800/50 bg-slate-900/50">
                         <span className="text-[9px] text-indigo-400 font-mono tracking-widest">/// OUTPUT_STREAM_V1.2</span>
                         <button 
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className="px-4 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 disabled:opacity-50 text-indigo-300 hover:text-white text-[10px] font-mono font-bold rounded-sm border border-indigo-500/50 transition-all flex items-center gap-2 active:scale-95 cursor-pointer uppercase tracking-wider shadow-[0_0_10px_rgba(79,70,229,0.2)] relative z-50"
                        >
                            <span className={`w-1.5 h-1.5 rounded-sm ${isAnalyzing ? 'bg-amber-400' : 'bg-indigo-400'}`}></span>
                            {isAnalyzing ? '正在分析...' : '生成AI总结 / INITIATE ANALYSIS'}
                        </button>
                    </div>
                    
                    <div className="flex-1 p-4 overflow-y-auto custom-scrollbar relative">
                        {/* Decorative corner lines inside text area */}
                        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-indigo-500/30"></div>
                        <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-indigo-500/30"></div>
                        <TypewriterEffect text={analysis} speed={8} />
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default App;
