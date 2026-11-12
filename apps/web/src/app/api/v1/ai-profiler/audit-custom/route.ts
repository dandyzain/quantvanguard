import { NextRequest } from 'next/server';
import { apiSuccess, apiError, handleOptions, verifyDemoAuth } from '@/lib/api-response';
import { auditCustomPortfolio } from '@/lib/ai/portfolio-doctor';
import { getUserStateFromRequest } from '@/lib/prisma';
import { CustomPortfolioAuditInput, TargetAllocations } from '@/lib/types';

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request: NextRequest) {
  verifyDemoAuth(request);
  const activeStore = getUserStateFromRequest(request);

  try {
    const body = await request.json().catch(() => ({}));

    const input: CustomPortfolioAuditInput = {
      horizonYears: Number(body.horizonYears || 5),
      monthlyIncome: Number(body.monthlyIncome || 15_000_000),
      monthlyExpenses: Number(body.monthlyExpenses || 8_000_000),
      portfolioCapital: Number(body.portfolioCapital || 100_000_000),
      primaryGoal: body.primaryGoal || 'BALANCED_GROWTH',
      userNotes: body.userNotes || '',
      holdings: Array.isArray(body.holdings) ? body.holdings : [],
    };

    if (input.holdings.length === 0) {
      return apiError(
        'Pilih minimal 1 instrumen aset untuk diaudit oleh AI.',
        'EMPTY_PORTFOLIO_AUDIT',
        400
      );
    }

    const auditResult = await auditCustomPortfolio(input);

    // If requested, apply this audited custom portfolio to the active user's target allocations
    if (body.applyToPortfolio === true) {
      const newTargets: TargetAllocations = {
        MMF_IDR: 0,
        ETF_VOO: 0,
        GOLD_XAU: 0,
        CRYPTO_BTC: 0,
      };

      for (const h of auditResult.normalizedHoldings) {
        newTargets[h.assetCode] = h.weight;
      }

      activeStore.riskProfile.targetAllocations = newTargets;
      activeStore.riskProfile.strategyName = 'BALANCED_LIQUID_CORE';
      activeStore.portfolio.monthlyExpenses = input.monthlyExpenses;
    }

    return apiSuccess(auditResult);
  } catch (error: any) {
    return apiError(
      error.message || 'Gagal menjalankan audit AI terhadap portofolio kustom',
      'PORTFOLIO_AUDIT_ERROR',
      500
    );
  }
}
