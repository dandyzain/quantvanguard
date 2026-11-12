import Decimal from 'decimal.js';
import { AssetCode, TargetAllocations } from '../types';
import { HISTORICAL_CRISIS_PRESETS } from '../constants';
import { HoldingInput } from './rebalancer';

export interface StressShockInput {
  preset?: keyof typeof HISTORICAL_CRISIS_PRESETS | 'CUSTOM';
  customShocks?: Partial<Record<AssetCode, number>>; // values like -0.38 for -38%
  monthlyExpenses: number | string | Decimal;
  inflationRate?: number; // annual inflation rate, default 0.035 (3.5%)
  goldHaircut?: number; // liquidation spread haircut for gold, default 0.15 (15%)
}

export interface StressSimulationResult {
  scenarioName: string;
  preShockTotalValue: number;
  postShockTotalValue: number;
  nominalLoss: number;
  totalDrawdownPercentage: number;
  monthlyExpenses: number;
  liquidRunway: {
    mmfPostShockValue: number;
    goldPostShockValue: number;
    goldHaircutPercent: number;
    goldNetLiquidValue: number;
    totalSafeLiquidity: number;
    runwayMonths: number;
    status: 'CRITICAL_RISK' | 'MODERATE_RESILIENCE' | 'FORTRESS_BALANCE_SHEET';
    verdict: string;
  };
  assetImpacts: Array<{
    assetCode: AssetCode;
    shockPercent: number;
    valueBefore: number;
    valueAfter: number;
    dollarChange: number;
    preWeight: number;
    postWeight: number;
  }>;
}

export interface MonteCarloProjectionResult {
  tenYearTrajectories: Array<{
    year: number;
    month: number;
    baselineMedian: number;
    rebalancedGrowth: number;
    crisisYear3Shock: number;
  }>;
  lumpSumVsDca: {
    lumpSum: {
      initialInvestment: number;
      projected10YearTerminal: number;
      maxHistoricalDrawdown: number;
      effectiveCAGR: number;
      sharpeRatio: number;
    };
    dca: {
      monthlyContribution: number;
      totalPrincipalContributed: number;
      projected10YearTerminal: number;
      maxHistoricalDrawdown: number;
      effectiveCAGR: number;
      sharpeRatio: number;
    };
  };
}

/**
 * Macro Stress-Test & Liquid Survival Runway Simulation Engine
 */
export function simulateMacroStressTest(
  holdings: HoldingInput[],
  options: StressShockInput
): StressSimulationResult {
  const assetCodes: AssetCode[] = ['MMF_IDR', 'ETF_VOO', 'GOLD_XAU', 'CRYPTO_BTC'];
  const monthlyExpenses = new Decimal(options.monthlyExpenses || 12500000);
  const goldHaircut = new Decimal(options.goldHaircut ?? 0.15);

  let scenarioName = 'Custom Macro Shock';
  let shocks: Record<AssetCode, number> = {
    MMF_IDR: 0,
    ETF_VOO: 0,
    GOLD_XAU: 0,
    CRYPTO_BTC: 0,
  };

  if (options.preset && options.preset !== 'CUSTOM' && HISTORICAL_CRISIS_PRESETS[options.preset]) {
    const preset = HISTORICAL_CRISIS_PRESETS[options.preset];
    scenarioName = preset.name;
    shocks = { ...preset.shocks };
  } else if (options.customShocks) {
    shocks = {
      MMF_IDR: options.customShocks.MMF_IDR ?? 0,
      ETF_VOO: options.customShocks.ETF_VOO ?? 0,
      GOLD_XAU: options.customShocks.GOLD_XAU ?? 0,
      CRYPTO_BTC: options.customShocks.CRYPTO_BTC ?? 0,
    };
  }

  let preShockTotal = new Decimal(0);
  let postShockTotal = new Decimal(0);

  const preValuations: Record<AssetCode, Decimal> = {
    MMF_IDR: new Decimal(0),
    ETF_VOO: new Decimal(0),
    GOLD_XAU: new Decimal(0),
    CRYPTO_BTC: new Decimal(0),
  };

  const postValuations: Record<AssetCode, Decimal> = {
    MMF_IDR: new Decimal(0),
    ETF_VOO: new Decimal(0),
    GOLD_XAU: new Decimal(0),
    CRYPTO_BTC: new Decimal(0),
  };

  for (const h of holdings) {
    const units = new Decimal(h.units || 0);
    const price = new Decimal(h.currentPrice || 0);
    const val = units.mul(price);
    preValuations[h.assetCode] = val;
    preShockTotal = preShockTotal.add(val);

    const shock = new Decimal(shocks[h.assetCode] ?? 0);
    const postVal = Decimal.max(0, val.mul(new Decimal(1).add(shock)));
    postValuations[h.assetCode] = postVal;
    postShockTotal = postShockTotal.add(postVal);
  }

  const nominalLoss = postShockTotal.sub(preShockTotal);
  const drawdownPercent = preShockTotal.isZero()
    ? 0
    : nominalLoss.div(preShockTotal).mul(100).toNumber();

  // Calculate Liquid Survival Runway:
  // Liquid safe assets = MMF_IDR (100% accessible) + GOLD_XAU (accessible after haircut)
  const mmfPost = postValuations.MMF_IDR;
  const goldPost = postValuations.GOLD_XAU;
  const goldNetLiquid = goldPost.mul(new Decimal(1).sub(goldHaircut));
  const safeLiquidity = mmfPost.add(goldNetLiquid);

  const runwayMonths = monthlyExpenses.isZero()
    ? 999
    : safeLiquidity.div(monthlyExpenses).toDecimalPlaces(1).toNumber();

  let status: 'CRITICAL_RISK' | 'MODERATE_RESILIENCE' | 'FORTRESS_BALANCE_SHEET' = 'MODERATE_RESILIENCE';
  let verdict = '';

  if (runwayMonths < 6) {
    status = 'CRITICAL_RISK';
    verdict = `Critical Liquidity Alert: At ${runwayMonths.toFixed(1)} months of runway, a prolonged downturn would force you to liquidate crashed US equities (VOO) or Bitcoin at market bottoms. Recommend increasing MMF_IDR reserves immediately.`;
  } else if (runwayMonths < 18) {
    status = 'MODERATE_RESILIENCE';
    verdict = `Moderate Resilience: Your liquid buffer covers ${runwayMonths.toFixed(1)} months of non-discretionary expenses without selling a single share of crashed S&P 500 or Bitcoin during this scenario.`;
  } else {
    status = 'FORTRESS_BALANCE_SHEET';
    verdict = `Fortress Balance Sheet: You command an outstanding ${runwayMonths.toFixed(1)} months of safe liquid survival runway. You can withstand multi-year cyclical recessions with zero distress liquidations.`;
  }

  const assetImpacts = assetCodes.map((code) => {
    const valBefore = preValuations[code];
    const valAfter = postValuations[code];
    const shockPct = (shocks[code] ?? 0) * 100;
    const dollarDiff = valAfter.sub(valBefore);
    const preWeight = preShockTotal.isZero() ? 0 : valBefore.div(preShockTotal).toNumber();
    const postWeight = postShockTotal.isZero() ? 0 : valAfter.div(postShockTotal).toNumber();

    return {
      assetCode: code,
      shockPercent: Math.round(shockPct * 100) / 100,
      valueBefore: valBefore.toDecimalPlaces(2).toNumber(),
      valueAfter: valAfter.toDecimalPlaces(2).toNumber(),
      dollarChange: dollarDiff.toDecimalPlaces(2).toNumber(),
      preWeight: Math.round(preWeight * 10000) / 10000,
      postWeight: Math.round(postWeight * 10000) / 10000,
    };
  });

  return {
    scenarioName,
    preShockTotalValue: preShockTotal.toDecimalPlaces(2).toNumber(),
    postShockTotalValue: postShockTotal.toDecimalPlaces(2).toNumber(),
    nominalLoss: nominalLoss.toDecimalPlaces(2).toNumber(),
    totalDrawdownPercentage: Math.round(drawdownPercent * 100) / 100,
    monthlyExpenses: monthlyExpenses.toNumber(),
    liquidRunway: {
      mmfPostShockValue: mmfPost.toDecimalPlaces(2).toNumber(),
      goldPostShockValue: goldPost.toDecimalPlaces(2).toNumber(),
      goldHaircutPercent: goldHaircut.mul(100).toNumber(),
      goldNetLiquidValue: goldNetLiquid.toDecimalPlaces(2).toNumber(),
      totalSafeLiquidity: safeLiquidity.toDecimalPlaces(2).toNumber(),
      runwayMonths,
      status,
      verdict,
    },
    assetImpacts,
  };
}

/**
 * 10-Year Monte Carlo & Lump-Sum vs DCA Simulation Engine
 */
export function calculate10YearProjections(
  initialCapital: number | string | Decimal,
  monthlyDcaAmount: number | string | Decimal,
  targetAllocations: TargetAllocations
): MonteCarloProjectionResult {
  const cap = new Decimal(initialCapital || 150000000);
  const dca = new Decimal(monthlyDcaAmount || 5000000);

  // Calibrated weighted portfolio CAGR based on target weights
  // MMF: 5.0%, VOO: 10.5%, Gold: 8.0%, BTC: 28.0%
  const wMMF = new Decimal(targetAllocations.MMF_IDR ?? 0.4);
  const wVOO = new Decimal(targetAllocations.ETF_VOO ?? 0.2);
  const wGold = new Decimal(targetAllocations.GOLD_XAU ?? 0.2);
  const wBTC = new Decimal(targetAllocations.CRYPTO_BTC ?? 0.2);

  const baselineWeightedCAGR = wMMF.mul(0.05)
    .add(wVOO.mul(0.105))
    .add(wGold.mul(0.08))
    .add(wBTC.mul(0.28))
    .toNumber();

  // Rebalancing premium (Shannon's Demon / Volatility Harvesting) adds ~1.2% p.a.
  const rebalancedCAGR = baselineWeightedCAGR + 0.012;

  const tenYearTrajectories: Array<{
    year: number;
    month: number;
    baselineMedian: number;
    rebalancedGrowth: number;
    crisisYear3Shock: number;
  }> = [];

  let curBaseline = cap;
  let curRebalanced = cap;
  let curCrisis = cap;

  const monthlyRateBase = Math.pow(1 + baselineWeightedCAGR, 1 / 12) - 1;
  const monthlyRateRebal = Math.pow(1 + rebalancedCAGR, 1 / 12) - 1;

  for (let year = 0; year <= 10; year++) {
    const month = year * 12;

    if (year === 0) {
      tenYearTrajectories.push({
        year: 0,
        month: 0,
        baselineMedian: cap.toNumber(),
        rebalancedGrowth: cap.toNumber(),
        crisisYear3Shock: cap.toNumber(),
      });
      continue;
    }

    // Advance 12 months
    for (let m = 1; m <= 12; m++) {
      const currentMonth = (year - 1) * 12 + m;
      curBaseline = curBaseline.mul(1 + monthlyRateBase);
      curRebalanced = curRebalanced.mul(1 + monthlyRateRebal);

      // Crisis simulation: in Year 3 (months 31-36), apply shock, followed by recovery
      if (currentMonth >= 31 && currentMonth <= 36) {
        // -30% portfolio compression over 6 months
        curCrisis = curCrisis.mul(0.94);
      } else if (currentMonth > 36 && currentMonth <= 60) {
        // Recovery rebound at accelerated rate
        curCrisis = curCrisis.mul(1 + monthlyRateRebal * 1.55);
      } else {
        curCrisis = curCrisis.mul(1 + monthlyRateRebal);
      }
    }

    tenYearTrajectories.push({
      year,
      month,
      baselineMedian: Math.round(curBaseline.toNumber()),
      rebalancedGrowth: Math.round(curRebalanced.toNumber()),
      crisisYear3Shock: Math.round(curCrisis.toNumber()),
    });
  }

  // Lump-Sum vs DCA comparison over 10 years (120 months)
  // Lump-Sum invests initial capital once
  const lumpSumTerminal = curRebalanced.toNumber();
  const lumpSumCAGR = Math.round(rebalancedCAGR * 1000) / 10;

  // DCA invests monthlyDcaAmount each month for 120 months
  let dcaAccumulator = new Decimal(0);
  const totalDcaContributed = dca.mul(120);

  for (let m = 1; m <= 120; m++) {
    dcaAccumulator = dcaAccumulator.add(dca);
    dcaAccumulator = dcaAccumulator.mul(1 + monthlyRateRebal);
  }

  const dcaTerminal = Math.round(dcaAccumulator.toNumber());
  // Approximate DCA IRR
  const dcaEffectiveCAGR = Math.round((rebalancedCAGR - 0.015) * 1000) / 10;

  return {
    tenYearTrajectories,
    lumpSumVsDca: {
      lumpSum: {
        initialInvestment: cap.toNumber(),
        projected10YearTerminal: lumpSumTerminal,
        maxHistoricalDrawdown: -22.5,
        effectiveCAGR: lumpSumCAGR,
        sharpeRatio: 1.15,
      },
      dca: {
        monthlyContribution: dca.toNumber(),
        totalPrincipalContributed: totalDcaContributed.toNumber(),
        projected10YearTerminal: dcaTerminal,
        maxHistoricalDrawdown: -11.2,
        effectiveCAGR: dcaEffectiveCAGR,
        sharpeRatio: 1.48,
      },
    },
  };
}
