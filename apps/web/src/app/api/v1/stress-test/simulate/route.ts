import { NextRequest } from 'next/server';
import { apiSuccess, apiError, handleOptions, verifyDemoAuth } from '@/lib/api-response';
import { getUserStateFromRequest } from '@/lib/prisma';
import {
  simulateMacroStressTest,
  calculate10YearProjections,
} from '@/lib/math/stresstest';
import { HoldingInput } from '@/lib/math/rebalancer';
import { getLiveQuote } from '@/lib/services/market-data';

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request: NextRequest) {
  verifyDemoAuth(request);
  const activeStore = getUserStateFromRequest(request);

  try {
    const body = await request.json().catch(() => ({}));
    const preset = body.preset || '2008_GFC';
    const customShocks = body.customShocks;
    const monthlyExpenses = Number(
      body.monthlyExpenses ?? activeStore.portfolio.monthlyExpenses ?? 12500000
    );
    const inflationRate = Number(body.inflationRate ?? 0.035);
    const goldHaircut = Number(body.goldHaircut ?? 0.15);
    const includeProjections = body.includeProjections !== false;

    const sourceHoldings = body.holdings || activeStore.holdings;
    const holdings: HoldingInput[] = sourceHoldings.map((h: any) => {
      const livePrice = getLiveQuote(h.assetCode, activeStore.portfolio.usdIdrRate).priceIdr;
      return {
        assetCode: h.assetCode,
        units: h.units,
        currentPrice: h.currentPrice || livePrice,
      };
    });

    const stressResult = simulateMacroStressTest(holdings, {
      preset,
      customShocks,
      monthlyExpenses,
      inflationRate,
      goldHaircut,
    });

    let projectionsResult = null;
    if (includeProjections) {
      const initialCapital = stressResult.preShockTotalValue;
      const monthlyDca = Number(body.monthlyDcaAmount ?? 5000000);
      const targets = activeStore.riskProfile.targetAllocations;
      projectionsResult = calculate10YearProjections(initialCapital, monthlyDca, targets);
    }

    return apiSuccess({
      ...stressResult,
      projections: projectionsResult,
    });
  } catch (error: any) {
    return apiError(
      error.message || 'Failed to simulate macro stress test',
      'STRESS_TEST_ERROR',
      500
    );
  }
}
