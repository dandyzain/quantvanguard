import { NextRequest } from 'next/server';
import { apiSuccess, apiError, handleOptions, verifyDemoAuth } from '@/lib/api-response';
import { diagnoseRiskProfile } from '@/lib/ai/profiler';
import { getUserStateFromRequest } from '@/lib/prisma';
import { RiskSurveyInput } from '@/lib/types';

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request: NextRequest) {
  verifyDemoAuth(request);
  const activeStore = getUserStateFromRequest(request);

  try {
    const body = await request.json().catch(() => ({}));

    const input: RiskSurveyInput = {
      userId: body.userId || activeStore.user.id,
      emergencyFundMonths: Number(body.emergencyFundMonths ?? 8.0),
      monthlySavingsRatio: Number(body.monthlySavingsRatio ?? 0.35),
      investmentHorizonYears: Number(body.investmentHorizonYears ?? 12),
      incomeStabilityScore: Number(body.incomeStabilityScore ?? 80),
      crashReactionScore: Number(body.crashReactionScore ?? 75),
      volatilityComfortScore: Number(body.volatilityComfortScore ?? 70),
      experienceYears: Number(body.experienceYears ?? 6),

      // Expanded multi-dimensional inputs
      dependentsCount: body.dependentsCount !== undefined ? Number(body.dependentsCount) : undefined,
      debtToIncomeRatio: body.debtToIncomeRatio !== undefined ? Number(body.debtToIncomeRatio) : undefined,
      liquidityNeedTiming: body.liquidityNeedTiming,
      lossAversionSensitivity: body.lossAversionSensitivity !== undefined ? Number(body.lossAversionSensitivity) : undefined,
      extremeDrawdownReaction: body.extremeDrawdownReaction,
      financialKnowledgeLevel: body.financialKnowledgeLevel,

      // Customization & preferences
      primaryGoal: body.primaryGoal,
      cryptoPreference: body.cryptoPreference,
      customTargetAllocations: body.customTargetAllocations,
      userNotesOrGuidance: body.userNotesOrGuidance,
    };

    const diagnosis = await diagnoseRiskProfile(input);

    // Update active user's risk profile so rebalancer and summary immediately pick up the new target allocations
    activeStore.riskProfile = {
      capacityScore: diagnosis.capacityScore,
      toleranceScore: diagnosis.toleranceScore,
      strategyName: diagnosis.strategyName,
      targetAllocations: diagnosis.targetAllocations,
      geminiDiagnosis: diagnosis.geminiDiagnosis,
    };

    return apiSuccess(diagnosis);
  } catch (error: any) {
    return apiError(
      error.message || 'Failed to process AI risk diagnostic',
      'AI_PROFILER_ERROR',
      500
    );
  }
}
