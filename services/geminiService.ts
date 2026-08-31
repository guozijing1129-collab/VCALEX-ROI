
import { GoogleGenAI } from "@google/genai";
import { SimulationState, SimulationMetrics } from "../types";

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

export const analyzeSimulation = async (
  state: SimulationState,
  metrics: SimulationMetrics
): Promise<string> => {
  const ai = getGeminiClient();
  if (!ai) {
    return "未配置 GEMINI_API_KEY。ROI 测算大屏可正常使用；配置密钥后可生成 ZENAVA 战略分析。";
  }

  const effectiveSalary = state.avgSalary * (1 + (state.salaryAdjustment || 0) / 100);

  const prompt = `
    你是一位专注于企业数字化转型与AI组织变革的高级战略顾问（ZENAVA首席分析师）。
    请根据以下“ALEXAGI ZENAVA智能客服ROI价值仿真模型”的模拟数据，生成一份具有战略高度的价值分析微报告。
    
    **模拟参数配置:**
    - 日均咨询量: ${state.dailyVolume.toLocaleString()} 单
    - 当前人员编制: ${state.currentHeadcount} 人
    - 推算人工年人效: ${metrics.impliedEfficiency.toLocaleString()} 单/人/年 (基于当前${(state.baselineAiRate * 100).toFixed(0)}%自动化率)
    - 人工综合年薪: ¥${effectiveSalary.toLocaleString()} ${state.salaryAdjustment ? `(含 ${state.salaryAdjustment}% 薪资波动调整)` : ''}
    
    **AI能力模型:**
    - 目标综合独立解决率 (Automate): ${(state.aiResolutionRate * 100).toFixed(1)}%
    - 目标人效提升 (Enhance): ${state.aiEfficiencyBoost.toFixed(2)}倍
    - AI系统年投入: ¥${state.aiSystemCost.toLocaleString()}

    **测算结果:**
    - 现有编制 (Baseline): ${metrics.traditionalStaff.toFixed(0)} 人 -> AI模式目标: ${metrics.aiModeStaff.toFixed(1)} 人
    - 预计年节省金额: ¥${(metrics.savings / 1000000).toFixed(2)}M
    - ROI (投资回报率): ${metrics.roi.toFixed(1)}%
    - 投资回收期: ${metrics.yearsToBreakeven < 1 ? (metrics.yearsToBreakeven * 12).toFixed(1) + "个月" : metrics.yearsToBreakeven.toFixed(1) + "年"}

    **分析要求:**
    请输出一段约220字的深度分析，必须包含以下三个维度的洞察（请使用方括号[]标记维度）：
    
    1. **[财务杠杆]**: 简评 ${metrics.roi.toFixed(0)}% ROI 下的成本结构优化与资金效率。
    2. **[组织重构]**: (核心重点) 深度剖析从 ${metrics.traditionalStaff.toFixed(0)}人 缩减至 ${metrics.aiModeStaff.toFixed(1)}人 背后，企业如何完成从“人力规模驱动”向“算力驱动”的范式转移。阐述高AI渗透率如何推动组织“去规模化”带来的管理熵减、人才密度提升，以及从单纯的服务交付向“AI训练与数据运营”的职能进化。
    3. **[战略建议]**: 给出一句极具前瞻性的行动指引。

    **风格要求:**
    - 语言犀利、专业，富有科技感。
    - 重点突出“人机协同”、“组织进化”、“算力替代人力”等抽象概念。
    - 段落之间用换行分隔，不要使用Markdown标题符号。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });
    return response.text || "ZENAVA AI 正在进行深度价值运算，请稍候...";
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "分析服务连接中断，请检查网络配置。";
  }
};
