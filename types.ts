
export interface SimulationState {
  dailyVolume: number; // Total inquiries per day
  currentHeadcount: number; // Current number of agents (Baseline)
  avgSalary: number; // Annual salary per agent (RMB)
  salaryAdjustment: number; // Percentage adjustment for salary sensitivity (-30 to +30)
  baselineAiRate: number; // Existing automation rate (e.g., 0.6) corresponding to current headcount
  aiResolutionRate: number; // Target % handled by AI (0-1) [Weighted Average]
  aiEfficiencyBoost: number; // Efficiency gain for humans using AI tools (e.g. 1.3x)
  aiSystemCost: number; // Annual cost of AI system
  
  // Automate Factors (Breakdown)
  volumeVoiceShare: number; // Percentage of volume that is Voice (0-100)
  automateVoiceRate: number; // Resolution rate for Voice (0-1)
  automateTextRate: number; // Resolution rate for Text (0-1)

  // Enhance Factors (Percentage points, e.g., 10 for 10%)
  enhanceSmartFill: number; // Smart form filling
  enhanceKnowledge: number; // Knowledge recommendation
  enhanceNavigation: number; // SOP/Business Navigation
  enhanceSummary: number; // Conversation Summary & Transfer
}

export interface SimulationMetrics {
  traditionalStaff: number;
  traditionalCost: number;
  aiModeStaff: number;
  aiModeCost: number;
  savings: number;
  roi: number;
  yearsToBreakeven: number;
  humanWorkloadReduction: number;
  impliedCapacity: number; // Calculated capacity per person (Daily)
  impliedEfficiency: number; // Annual capacity per person
}

export enum ScenarioType {
  DAILY = 'DAILY',
  PEAK = 'PEAK',
  NIGHT = 'NIGHT'
}

export interface ChartDataPoint {
  name: string;
  Traditional?: number;
  AIMode?: number;
  [key: string]: string | number | undefined;
}