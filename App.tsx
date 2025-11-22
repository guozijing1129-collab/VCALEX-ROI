
import React, { useState, useEffect, useMemo } from 'react';
import ControlPanel from './components/ControlPanel';
import { CostComparisonChart, StaffingChart, VolumeChart, EfficiencyGauge } from './components/DashboardCharts';
import { SimulationState, SimulationMetrics, ScenarioType, ChartDataPoint } from './types';
import { analyzeSimulation } from './services/geminiService';

const INITIAL_STATE: SimulationState = {
  projectName: "ZENAVA Pilot 2025",
  dailyVolume: 20000, 
  currentHeadcount: 80, 
  avgSalary: 100000, 
  salaryAdjustment: 0, 
  
  baselineAiRate: 0.60, 
  baselineVoiceRate: 0.30, // 30% voice share * 0.3 = 0.09
  baselineTextRate: 0.73,  // 70% text share * 0.73 = 0.511 => Total ~0.60
  
  aiResolutionRate: 0.86, 
  aiEfficiencyBoost: 1.4, // Updated to reflect sum of default enhance factors (40%)
  aiSystemCost: 500000, 
  
  volumeVoiceShare: 30, 
  automateVoiceRate: 0.70, 
  automateTextRate: 0.93, 

  enhanceSmartFill: 10,
  enhanceKnowledge: 10,
  enhanceNavigation: 5,
  enhanceSummary: 5,
  enhanceInsight: 5,
  enhanceRisk: 5,
};

// --- Apple-style AI Avatar Component ---
const AppleAIAvatar: React.FC<{ className?: string, isAnimating?: boolean }> = ({ className, isAnimating }) => (
  <div className={`relative flex items-center justify-center rounded-full overflow-hidden bg-black ${className}`}>
    {/* Base Gradient Layer */}
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-black"></div>
    
    {/* Animated Glowing Orbs */}
    <div className={`absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-blue-500 rounded-full blur-xl opacity-60 mix-blend-screen ${isAnimating ? 'animate-pulse' : ''}`} style={{ animationDuration: '3s' }}></div>
    <div className={`absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-cyan-400 rounded-full blur-xl opacity-60 mix-blend-screen ${isAnimating ? 'animate-pulse' : ''}`} style={{ animationDuration: '4s', animationDelay: '0.5s' }}></div>
    <div className={`absolute top-[30%] right-[-10%] w-[60%] h-[60%] bg-purple-500 rounded-full blur-xl opacity-60 mix-blend-screen ${isAnimating ? 'animate-pulse' : ''}`} style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
    <div className={`absolute bottom-[10%] left-[10%] w-[50%] h-[50%] bg-pink-500 rounded-full blur-xl opacity-50 mix-blend-screen ${isAnimating ? 'animate-pulse' : ''}`} style={{ animationDuration: '4.5s', animationDelay: '1.5s' }}></div>
    
    {/* Glass/Gloss Overlay */}
    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-50"></div>
    <div className="absolute inset-0 rounded-full border border-white/20 shadow-[inset_0_0_12px_rgba(255,255,255,0.2)]"></div>
    
    {/* Central Core Shine */}
    <div className="absolute w-[30%] h-[30%] bg-white rounded-full blur-md opacity-40 mix-blend-overlay"></div>
  </div>
);

// --- Smooth Typewriter ---
const TypewriterEffect: React.FC<{ text: string; speed?: number }> = ({ text, speed = 10 }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    // Pre-process text: remove double newlines to avoid paragraph gaps (隔行), ensure compact spacing
    const content = (text || '').replace(/\n\s*\n/g, '\n');
    
    let i = 0;
    const timer = setInterval(() => {
      if (i < content.length) {
        setDisplayedText((prev) => prev + content.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <p className="text-zinc-100 text-sm leading-snug font-normal whitespace-pre-wrap tracking-wide transition-all">
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
        
        <div className={`flex-1 overflow-hidden transition-all duration-300 bg-black/20 ${isOpen ? 'max-h-[260px] opacity-100' : 'max-h-0 opacity-0'}`}>
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
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobileControlOpen, setIsMobileControlOpen] = useState(false);

  // Handle Dark Mode Logic
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }, [isDarkMode]);

  const handleScenarioChange = (newScenario: ScenarioType) => {
    setScenario(newScenario);
    switch (newScenario) {
      case ScenarioType.DAILY:
        // Voice Share 30% -> weighted ~0.60
        setState(prev => ({ ...prev, dailyVolume: 20000, currentHeadcount: 80, baselineVoiceRate: 0.30, baselineTextRate: 0.73, baselineAiRate: 0.601, volumeVoiceShare: 30, automateVoiceRate: 0.70, automateTextRate: 0.93, aiResolutionRate: 0.77, salaryAdjustment: 0 }));
        break;
      case ScenarioType.PEAK:
        // Voice Share 25% -> weighted ~0.60
        setState(prev => ({ ...prev, dailyVolume: 40000, currentHeadcount: 160, baselineVoiceRate: 0.35, baselineTextRate: 0.68, baselineAiRate: 0.5975, volumeVoiceShare: 25, automateVoiceRate: 0.65, automateTextRate: 0.90, aiResolutionRate: 0.83, salaryAdjustment: 0 })); 
        break;
      case ScenarioType.NIGHT:
        // Voice Share 10% -> weighted ~0.60
        setState(prev => ({ ...prev, dailyVolume: 2500, currentHeadcount: 5, baselineVoiceRate: 0.10, baselineTextRate: 0.65, baselineAiRate: 0.595, volumeVoiceShare: 10, automateVoiceRate: 0.80, automateTextRate: 0.98, aiResolutionRate: 0.96, salaryAdjustment: 0 })); 
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

  const handleShare = async () => {
    const shareText = `[ALEXAGI ZENAVA ROI Analysis]\n` +
      `Project: ${state.projectName}\n` +
      `ROI: ${metrics.roi.toFixed(0)}%\n` +
      `Annual Savings: ¥${(metrics.savings / 10000).toFixed(1)}w\n` +
      `Payback Period: ${metrics.yearsToBreakeven < 1 ? (metrics.yearsToBreakeven * 12).toFixed(1) + " months" : metrics.yearsToBreakeven.toFixed(1) + " years"}\n` +
      `Workload Reduction: ${(metrics.humanWorkloadReduction / 10000).toFixed(0)}w tasks\n\n` +
      `AI Strategic Insight:\n${analysis || "Analysis pending..."}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `ZENAVA Analysis - ${state.projectName}`,
          text: shareText,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Analysis copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy', err);
      }
    }
  };

  // Export Print Handler
  const handleExportPrint = () => {
    alert("提示：\n请使用【横向】布局以获得最佳效果。\n请在打印设置中勾选【背景图形】选项。\n\nTip:\nPlease set layout to 'Landscape'.\nEnable 'Background graphics' for best results.");
    window.print();
  };

  useEffect(() => {
     setAnalysis("系统就绪。请点击右侧按钮，基于当前配置生成AI可行性分析报告。\nSystem ready. Click button to generate AI analysis.");
  }, []);

  return (
    <div className="flex flex-col h-[100dvh] lg:h-screen overflow-hidden selection:bg-blue-500/30 bg-transparent w-full">
      
      {/* Header */}
      <header className="flex justify-between items-center px-4 py-3 shrink-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-md h-[56px] w-full">
        <div className="flex items-center gap-3">
           {/* Logo - Apple Style AI Icon */}
           <AppleAIAvatar className="w-8 h-8 shadow-lg shadow-blue-500/20 border border-white/10" isAnimating={true} />
           <div>
              <h1 className="text-sm font-semibold text-white tracking-wide truncate max-w-[200px] lg:max-w-none">ZENAVA智能客服ROI价值仿真</h1>
              <p className="text-[10px] text-zinc-400 font-medium hidden lg:block">ALEXAGI AI Feasibility Assessment Unit</p>
           </div>
        </div>
        
        {/* Header Controls - Hidden on Print */}
        <div className="flex items-center gap-4 no-print">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>

             <div 
                className="hidden lg:flex items-center gap-3 cursor-pointer group" 
                onClick={() => setShowComparison(!showComparison)}
             >
                <span className={`text-[11px] font-medium transition-colors ${!showComparison ? 'text-white' : 'text-zinc-500'}`}>Baseline</span>
                <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 relative ${showComparison ? 'bg-green-500' : 'bg-zinc-600'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${showComparison ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
                <span className={`text-[11px] font-medium transition-colors ${showComparison ? 'text-white' : 'text-zinc-500'}`}>Target</span>
             </div>

            <button 
                onClick={handleExportPrint}
                className="hidden lg:block px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium rounded-md transition-all active:scale-95 border border-white/5"
            >
                导出 Export
            </button>
            
            {/* Mobile Menu Toggle - Could extend here, but keeping it simple for now */}
        </div>
      </header>

      {/* Main Content - Responsive Container */}
      {/* 16:9 (Desktop): Fixed h-screen layout. 9:16 (Mobile): Scrollable vertical layout. */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden p-2 lg:p-1.5 gap-4 lg:gap-1.5 relative w-full">
        
        {/* Sidebar - Full width on Mobile, Fixed width on Desktop */}
        <div className="w-full lg:w-[320px] h-auto lg:h-full flex flex-col no-print z-10 shrink-0">
          <ControlPanel 
            state={state} 
            onChange={(updates) => setState(prev => ({ ...prev, ...updates }))}
            scenario={scenario}
            onScenarioChange={handleScenarioChange}
          />
        </div>
        
        {/* Dashboard Grid - Adaptive Layout */}
        <div className="flex-1 h-auto lg:h-full min-w-0 z-10 flex flex-col gap-3 lg:gap-1.5 pb-6 lg:pb-0">
            
            {/* Top Row (Cost, Staff, Opt) */}
            {/* Mobile: Stacked Column. Desktop: 3-Col Grid */}
            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-3 lg:gap-1.5 lg:flex-[4] lg:min-h-0">
                <div className="h-[300px] lg:h-full"><CostComparisonChart data={costTrendData} showComparison={showComparison} isDarkMode={isDarkMode} /></div>
                <div className="h-[300px] lg:h-full"><StaffingChart data={staffingData} isDarkMode={isDarkMode} /></div>
                <div className="flex flex-col gap-3 lg:gap-1.5 h-auto lg:h-full lg:min-h-0">
                    <div className="h-[200px] lg:flex-1 lg:min-h-0 relative"><EfficiencyGauge value={metrics.roi > 0 ? ((metrics.traditionalCost - metrics.aiModeCost) / metrics.traditionalCost * 100) : 0} /></div>
                    <div className="shrink-0"><ROICalculationDetails metrics={metrics} state={state} /></div>
                </div>
            </div>

            {/* Middle Row (Volume, Savings, Optimization) */}
            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-3 lg:gap-1.5 lg:flex-[2.5] lg:min-h-0">
                <div className="h-[250px] lg:h-full"><VolumeChart data={workloadData} subtitle={showComparison ? "Target" : "Current"} isDarkMode={isDarkMode} /></div>
                
                <div className="h-[140px] lg:h-full apple-glass rounded-2xl p-3 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl"></div>
                    <h3 className="text-zinc-400 text-[11px] font-semibold uppercase tracking-wide z-10">年度节省 / Savings</h3>
                    <div className="z-10">
                        <div className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
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

                <div className="h-[140px] lg:h-full apple-glass rounded-2xl p-3 flex flex-col justify-between relative overflow-hidden group">
                      <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
                    
                    {/* Header */}
                    <div className="flex justify-between items-start z-10 relative">
                         <h3 className="text-zinc-400 text-[11px] font-semibold uppercase tracking-wide">编制优化 / Optimization</h3>
                         <div className="flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 backdrop-blur-sm">
                             <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                             </svg>
                             <span className="text-[10px] font-bold text-emerald-400">
                                 {metrics.traditionalStaff > 0 ? ((1 - metrics.aiModeStaff / metrics.traditionalStaff) * 100).toFixed(0) : 0}%
                             </span>
                         </div>
                    </div>

                    {/* Graphical Body */}
                    <div className="z-10 mt-2 flex flex-col gap-3">
                        {/* Progress Bar Visual */}
                        <div className="relative w-full h-2.5 bg-zinc-700/30 rounded-full overflow-hidden">
                             {/* Tick marks or grid lines background for scale context */}
                            <div className="absolute inset-0 flex justify-between px-0.5">
                                <div className="w-px h-full bg-zinc-500/10"></div>
                                <div className="w-px h-full bg-zinc-500/10"></div>
                                <div className="w-px h-full bg-zinc-500/10"></div>
                                <div className="w-px h-full bg-zinc-500/10"></div>
                            </div>
                            <div 
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.4)] transition-all duration-1000"
                                style={{ width: `${metrics.traditionalStaff > 0 ? Math.min(100, (metrics.aiModeStaff / metrics.traditionalStaff) * 100) : 0}%` }}
                            >
                            </div>
                        </div>

                        {/* Data Points */}
                        <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                                <span className="text-[9px] text-zinc-500 uppercase tracking-wider">Current</span>
                                <span className="text-lg font-medium text-zinc-300 tabular-nums leading-none">
                                    {metrics.traditionalStaff.toFixed(0)}
                                </span>
                            </div>
                            
                             {/* Visual connector */}
                             <div className="mb-1.5 text-zinc-600/30">
                                 ······▶
                             </div>

                            <div className="flex flex-col items-end">
                                <span className="text-[9px] text-blue-400 uppercase tracking-wider font-semibold">Target AI</span>
                                <span className="text-2xl font-bold text-white tabular-nums leading-none drop-shadow-sm">
                                    {metrics.aiModeStaff.toFixed(1)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row (Analysis) */}
            <div className="min-h-[300px] lg:min-h-0 lg:flex-[2.5] relative rounded-2xl border border-white/10 overflow-hidden flex flex-col lg:flex-row w-full">
                <div className="absolute inset-0 bg-black">
                    <div className="siri-gradient absolute inset-0 opacity-40"></div>
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-xl"></div>
                </div>
                
                {/* Left Avatar Section - Responsive */}
                <div className="w-full lg:w-[160px] h-[140px] lg:h-auto flex lg:flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-white/5 bg-white/5 shrink-0 relative z-10 gap-4 lg:gap-0 p-4 lg:p-0">
                     {/* Avatar Image */}
                     <div className="relative w-20 h-20 lg:w-24 lg:h-24 p-1 shrink-0">
                        <AppleAIAvatar className="w-full h-full border-2 border-white/10 shadow-2xl shadow-purple-500/20" isAnimating={isAnalyzing} />
                     </div>
                     <div className="flex flex-col lg:items-center text-left lg:text-center lg:mt-3">
                          <div className="text-white text-xs font-semibold leading-tight">ZENAVA AI<br/>价值ROI分析</div>
                          <div className="text-zinc-400 text-[9px] mt-1">Gemini 2.5 Pro</div>
                     </div>
                     
                     <button
                        onClick={handleShare}
                        className="ml-auto lg:ml-0 lg:mt-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/5 text-[9px] font-medium text-zinc-300 hover:text-white transition-all active:scale-95 group no-print"
                     >
                        <svg className="w-3 h-3 text-zinc-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Share
                     </button>
                </div>

                {/* Right Content Section */}
                <div className="flex-1 flex flex-col p-0 min-w-0 relative z-10 h-[300px] lg:h-auto">
                    <div className="flex justify-between items-center px-4 py-2 border-b border-white/5 shrink-0">
                          <h3 className="text-zinc-300 text-[11px] font-medium tracking-wide">策略分析 / STRATEGIC INSIGHT</h3>
                          <button 
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className="px-3 py-1 bg-white text-black hover:bg-zinc-200 disabled:opacity-50 text-[10px] font-semibold rounded-full transition-all active:scale-95 shadow-lg shadow-white/10 no-print"
                        >
                            {isAnalyzing ? '思考中 Thinking...' : '生成分析 Analyze'}
                        </button>
                    </div>
                    
                    {/* KPI Summary Bar */}
                    <div className="grid grid-cols-3 gap-2 px-4 py-3 border-b border-white/5 bg-white/5 backdrop-blur-sm">
                        <div className="space-y-0.5">
                             <div className="text-[8px] text-zinc-500 uppercase tracking-wider font-bold">ROI</div>
                             <div className="text-base font-bold text-white leading-none">
                                 {metrics.roi.toFixed(0)}%
                             </div>
                        </div>
                        <div className="space-y-0.5 border-l border-white/10 pl-3">
                             <div className="text-[8px] text-zinc-500 uppercase tracking-wider font-bold">Payback</div>
                             <div className="text-base font-bold text-blue-400 leading-none">
                                 {metrics.yearsToBreakeven < 1 
                                    ? <>{(metrics.yearsToBreakeven * 12).toFixed(1)}<span className="text-[10px] ml-0.5 font-normal opacity-70">mo</span></>
                                    : <>{metrics.yearsToBreakeven.toFixed(1)}<span className="text-[10px] ml-0.5 font-normal opacity-70">yr</span></>
                                 }
                             </div>
                        </div>
                        <div className="space-y-0.5 border-l border-white/10 pl-3">
                             <div className="text-[8px] text-zinc-500 uppercase tracking-wider font-bold">Workload Lift</div>
                             <div className="text-base font-bold text-emerald-400 leading-none">
                                 {(metrics.humanWorkloadReduction / 10000).toFixed(0)}<span className="text-[10px] ml-0.5 font-normal opacity-70">w</span>
                             </div>
                        </div>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                        <TypewriterEffect text={analysis} speed={15} />
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      {/* Print Watermark / QR Code Footer - Only Visible in Print */}
      <div className="print-only fixed bottom-4 right-4 flex flex-col items-center gap-2 p-4 border border-zinc-200 rounded-xl bg-white/90 backdrop-blur-sm scale-90 origin-bottom-right">
          <div className="text-[10px] font-semibold text-zinc-500 tracking-widest uppercase mb-1">SCAN FOR MOBILE</div>
          <div className="w-24 h-24 bg-white p-1 rounded-lg border border-zinc-100 shadow-sm">
              {/* Placeholder for User QR Code */}
              <img 
                src="./zenava_qr.png" 
                alt="Scan for Analysis" 
                className="w-full h-full object-contain mix-blend-multiply opacity-90" 
              />
          </div>
          <div className="text-[9px] text-zinc-400 font-mono mt-1">ZENAVA INTELLIGENCE</div>
      </div>

    </div>
  );
};

export default App;
