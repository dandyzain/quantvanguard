import { NextRequest } from 'next/server';
import { apiSuccess, handleOptions, verifyDemoAuth } from '@/lib/api-response';
import { getUserStateFromRequest } from '@/lib/prisma';
import { calculateCurrentPortfolio } from '@/lib/math/rebalancer';
import { DEFAULT_USD_IDR_RATE, getAssetMetadata } from '@/lib/constants';
import { getLiveQuote } from '@/lib/services/market-data';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: NextRequest) {
  verifyDemoAuth(request);
  const activeStore = getUserStateFromRequest(request);

  const { searchParams } = new URL(request.url);
  const currency = (searchParams.get('currency') || 'IDR').toUpperCase();
  const inflationAdjusted = searchParams.get('inflationAdjusted') === 'true';

  const usdRate = activeStore.portfolio.usdIdrRate || DEFAULT_USD_IDR_RATE;
  const rateMultiplier = currency === 'USD' ? 1 / usdRate : 1;

  // Inflation discount (3.5% annual rate applied over 1 year)
  const inflationDiscount = inflationAdjusted ? 1 / 1.035 : 1;
  const totalMultiplier = rateMultiplier * inflationDiscount;

  // If user has no holdings, return clean fresh baseline
  if (activeStore.holdings.length === 0) {
    const formattedSnapshots = (activeStore.historicalSnapshots || []).map((s) => ({
      date: s.date,
      totalValue: 0,
      totalCostBasis: 0,
    }));

    return apiSuccess({
      portfolioId: activeStore.portfolio.id,
      portfolioName: activeStore.portfolio.name,
      baseCurrency: activeStore.portfolio.baseCurrency,
      displayCurrency: currency,
      inflationAdjusted,
      usdIdrRate: usdRate,
      totalValue: 0,
      totalCostBasis: 0,
      unrealizedGainNominal: 0,
      unrealizedGainPercentage: 0,
      monthlyExpenses: 0,
      hasActiveDriftAlert: false,
      totalAbsoluteDrift: 0,
      strategyName: activeStore.riskProfile.strategyName,
      targetAllocations: activeStore.riskProfile.targetAllocations,
      holdings: [],
      historicalSnapshots: formattedSnapshots,
    });
  }

  const holdingsInput = activeStore.holdings.map((h) => {
    const livePrice = getLiveQuote(h.assetCode, usdRate).priceIdr;
    return {
      assetCode: h.assetCode,
      units: h.units,
      currentPrice: livePrice || h.currentPrice,
      costBasisPrice: h.costBasisPrice,
    };
  });

  const targets = activeStore.riskProfile.targetAllocations;
  const { totalValue, breakdown, hasActiveDriftAlert, totalAbsoluteDrift } =
    calculateCurrentPortfolio(holdingsInput, targets, 0.05);

  let totalCostBasisIdr = 0;
  for (const h of activeStore.holdings) {
    totalCostBasisIdr += h.units * h.costBasisPrice;
  }

  const convertedTotalValue = totalValue * totalMultiplier;
  const convertedCostBasis = totalCostBasisIdr * totalMultiplier;
  const unrealizedGainNominal = convertedTotalValue - convertedCostBasis;
  const unrealizedGainPct =
    convertedCostBasis > 0 ? (unrealizedGainNominal / convertedCostBasis) * 100 : 0;

  const convertedMonthlyExpenses = activeStore.portfolio.monthlyExpenses * rateMultiplier;

  const formattedHoldings = breakdown
    .filter((item) => {
      const rawHolding = activeStore.holdings.find((h) => h.assetCode === item.assetCode);
      return rawHolding && rawHolding.units > 0;
    })
    .map((item) => {
    const rawHolding = activeStore.holdings.find((h) => h.assetCode === item.assetCode);
    const convertedPrice = item.price * totalMultiplier;
    const convertedVal = item.value * totalMultiplier;
    const convertedCostPrice = (rawHolding?.costBasisPrice || item.price) * totalMultiplier;
    const metadata = getAssetMetadata(item.assetCode);

    return {
      assetCode: item.assetCode,
      name: rawHolding?.name || metadata.name || item.assetCode,
      units: item.units,
      currentPrice: Math.round(convertedPrice * 100) / 100,
      currentValue: Math.round(convertedVal * 100) / 100,
      costBasisPrice: Math.round(convertedCostPrice * 100) / 100,
      currentWeight: Math.round(item.currentWeight * 10000) / 10000,
      targetWeight: Math.round(item.targetWeight * 10000) / 10000,
      drift: Math.round(item.drift * 10000) / 10000,
      driftPercentage: Math.round(item.drift * 1000) / 10,
      isAlertTriggered: item.isAlertTriggered,
      color: metadata.color || '#3B82F6',
    };
  });

  const formattedSnapshots = (activeStore.historicalSnapshots || []).map((s) => ({
    date: s.date,
    totalValue: Math.round(s.totalValue * totalMultiplier),
    totalCostBasis: Math.round(s.totalCostBasis * totalMultiplier),
  }));

  return apiSuccess({
    portfolioId: activeStore.portfolio.id,
    portfolioName: activeStore.portfolio.name,
    baseCurrency: activeStore.portfolio.baseCurrency,
    displayCurrency: currency,
    inflationAdjusted,
    usdIdrRate: usdRate,
    totalValue: Math.round(convertedTotalValue * 100) / 100,
    totalCostBasis: Math.round(convertedCostBasis * 100) / 100,
    unrealizedGainNominal: Math.round(unrealizedGainNominal * 100) / 100,
    unrealizedGainPercentage: Math.round(unrealizedGainPct * 100) / 100,
    monthlyExpenses: Math.round(convertedMonthlyExpenses * 100) / 100,
    hasActiveDriftAlert,
    totalAbsoluteDrift: Math.round(totalAbsoluteDrift * 10000) / 10000,
    strategyName: activeStore.riskProfile.strategyName,
    targetAllocations: activeStore.riskProfile.targetAllocations,
    holdings: formattedHoldings,
    historicalSnapshots: formattedSnapshots,
  });
}
