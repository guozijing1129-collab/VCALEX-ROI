
import { GoogleGenAI } from "@google/genai";
import { SimulationState, SimulationMetrics } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSimulation = async (
  state: SimulationState,
  metrics: SimulationMetrics
): Promise<string> => {
  const effectiveSalary = state.avgSalary * (1 + (state.salaryAdjustment || 0) / 100);

  const prompt = `
    你是一位专注于企业数字化转型的高级CFO和AI解决方案顾问。
    请根据以下“ALEXAGI客服价值ROI预估模型”的模拟数据进行分析。
    
    **模拟参数配置:**
    - 日均咨询量: ${state.dailyVolume.toLocaleString()} 单
    - 当前人员编制: ${state.currentHeadcount} 人
    - 推算人工年人效: ${metrics.impliedEfficiency.toLocaleString()} 单/人/年 (基于当前${(state.baselineAiRate * 100).toFixed(0)}%自动化率)
    - 人工综合年薪: ¥${effectiveSalary.toLocaleString()} ${state.salaryAdjustment ? `(含 ${state.salaryAdjustment}% 薪资波动调整)` : ''}
    - 目标AI独立解决率: ${(state.aiResolutionRate * 100).toFixed(1)}%
    - 目标人效提升: ${state.aiEfficiencyBoost}倍 (Enhance)
    - AI系统年投入: ¥${state.aiSystemCost.toLocaleString()}

    **测算结果:**
    - 现有编制 (Baseline): ${metrics.traditionalStaff.toFixed(0)} 人
    - AI模式所需人数: ${metrics.aiModeStaff.toFixed(1)} 人
    - 现有模式年成本: ¥${(metrics.traditionalCost / 1000000).toFixed(2)}M
    - AI模式年成本: ¥${(metrics.aiModeCost / 1000000).toFixed(2)}M
    - 预计年节省金额: ¥${(metrics.savings / 1000000).toFixed(2)}M
    - ROI (投资回报率): ${metrics.roi.toFixed(1)}%

    **分析要求:**
    请提供一份简洁、专业的执行摘要（150字以内），使用中文回答。
    1. **财务洞察**: 评价ROI回报水平与成本优化幅度。
    2. **人效分析**: 点评从 ${metrics.traditionalStaff}人 优化至 ${metrics.aiModeStaff.toFixed(1)}人 的可行性与价值。
    3. **决策建议**: 结合大促峰值或夜间场景的潜在价值，给出推进建议。
    
    请直接输出分析段落，不要使用Markdown标题。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });
    return response.text || "暂时无法生成分析结果。";
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "无法连接AI分析服务，请检查配置。";
  }
};
