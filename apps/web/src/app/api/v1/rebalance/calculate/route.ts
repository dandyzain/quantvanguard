import { NextRequest } from 'next/server';
import { apiSuccess, apiError, handleOptions, verifyDemoAuth } from '@/lib/api-response';
import { getUserStateFromRequest } from '@/lib/prisma';
import {
  calculateFullRebalance,
  calculateZeroSellInflowRebalance,
  HoldingInput,
} from '@/lib/math/rebalancer';
import { TargetAllocations } from '@/lib/types';
import { getLiveQuote } from '@/lib/services/market-data';

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request: NextRequest) {
  verifyDemoAuth(request);
  const activeStore = getUserStateFromRequest(request);

  try {
    const body = await request.json().catch(() => ({}));
    const mode = body.mode === 'FULL' ? 'FULL' : 'ZERO_SELL_INFLOW';
    const inflowAmount = Number(body.inflowAmount ?? 15000000);
    const driftThreshold = Number(body.driftThreshold ?? 0.05);

    const sourceHoldings = body.holdings || activeStore.holdings;
    const holdings: HoldingInput[] = sourceHoldings.map((h: any) => {
      const livePrice = getLiveQuote(h.assetCode, activeStore.portfolio.usdIdrRate).priceIdr;
      return {
        assetCode: h.assetCode,
        units: h.units,
        currentPrice: h.currentPrice || livePrice,
      };
    });

    const targets: TargetAllocations =
      body.targets || activeStore.riskProfile.targetAllocations;

    let result;
    if (mode === 'FULL') {
      result = calculateFullRebalance(holdings, targets, driftThreshold);
    } else {
      result = calculateZeroSellInflowRebalance(holdings, targets, inflowAmount, driftThreshold);
    }

    return apiSuccess(result);
  } catch (error: any) {
    return apiError(error.message || 'Failed to calculate rebalance plan', 'REBALANCE_CALCULATION_ERROR', 500);
  }
}
