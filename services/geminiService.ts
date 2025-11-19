import { GoogleGenAI } from "@google/genai";
import { SimulationState, SimulationMetrics } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSimulation = async (
  state: SimulationState,
  metrics: SimulationMetrics
): Promise<string> => {
  const capacity = metrics.impliedCapacity;

  const prompt = `
    你是一位专注于企业数字化转型的高级CFO和AI解决方案顾问。
    请根据以下“AI客服智能体”引入的ROI模拟数据（基于行业标杆客户案例逻辑）进行分析。
    
    **模拟参数配置:**
    - 日均咨询量: ${state.dailyVolume.toLocaleString()} 单
    - 当前人员编制: ${state.currentHeadcount} 人
    - 人工单人日产能(推算): ${capacity} 单/天
    - 人工综合年薪: ¥${state.avgSalary.toLocaleString()}
    - AI独立解决率: ${(state.aiResolutionRate * 100).toFixed(1)}%
    - AI系统年成本: ¥${state.aiSystemCost.toLocaleString()}

    **计算结果:**
    - 传统模式所需人数: ${metrics.traditionalStaff.toFixed(1)} 人
    - AI模式所需人数: ${metrics.aiModeStaff.toFixed(1)} 人
    - 传统模式年成本: ¥${(metrics.traditionalCost / 1000000).toFixed(2)}M (百万)
    - AI模式年成本: ¥${(metrics.aiModeCost / 1000000).toFixed(2)}M (百万)
    - 预计年节省金额: ¥${(metrics.savings / 1000000).toFixed(2)}M (百万)
    - 节省比例: ${((metrics.savings / metrics.traditionalCost) * 100).toFixed(1)}%

    **分析要求:**
    请提供一份简洁、专业的执行摘要（150字以内），使用中文回答。
    1. **财务影响**: 强调成本节约的规模和ROI。
    2. **运营效率**: 点评人力释放情况（从繁琐咨询中解放）。
    3. **战略建议**: 基于行业最佳实践（如夜间覆盖、大促弹性），给出是否推进的建议。
    
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