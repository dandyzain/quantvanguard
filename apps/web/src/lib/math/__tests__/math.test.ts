import {
  calculateCurrentPortfolio,
  calculateFullRebalance,
  calculateZeroSellInflowRebalance,
  HoldingInput,
} from '../rebalancer';
import { simulateMacroStressTest, calculate10YearProjections } from '../stresstest';
import { calculate2DRiskScores } from '../../ai/profiler';
import { TargetAllocations } from '../../types';

// Standard recruiter demo portfolio fixtures
const DEMO_HOLDINGS: HoldingInput[] = [
  { assetCode: 'MMF_IDR', units: 52500000.0, currentPrice: 1.0 },
  { assetCode: 'ETF_VOO', units: 3.7383, currentPrice: 7891250.0 }, // ~29.5M
  { assetCode: 'GOLD_XAU', units: 18.0682, currentPrice: 1494338.0 }, // ~27.0M
  { assetCode: 'CRYPTO_BTC', units: 0.02758124, currentPrice: 1486518000.0 }, // ~41.0M
];

const TARGETS: TargetAllocations = {
  MMF_IDR: 0.4,
  ETF_VOO: 0.2,
  GOLD_XAU: 0.2,
  CRYPTO_BTC: 0.2,
};

function runMathUnitTests() {
  console.log('=== QuantVanguard Mathematical Engine Verification Suite ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: any) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`, details || '');
      failed++;
    }
  }

  // TEST 1: Initial Portfolio Valuation & BTC Drift Alert
  console.log('\n--- 1. Initial Portfolio Valuation & Drift Detection ---');
  const current = calculateCurrentPortfolio(DEMO_HOLDINGS, TARGETS, 0.05);
  assert(
    Math.abs(current.totalValue - 150000000) < 1000,
    `Total valuation should equal Rp 150,000,000 (actual: ${current.totalValue})`
  );
  assert(
    current.hasActiveDriftAlert === true,
    'Active drift alert must be triggered due to BTC allocation exceeding threshold'
  );

  const btcItem = current.breakdown.find((b) => b.assetCode === 'CRYPTO_BTC')!;
  assert(
    Math.round(btcItem.currentWeight * 100) === 27,
    `BTC current weight should be ~27% (actual: ${(btcItem.currentWeight * 100).toFixed(2)}%)`
  );
  assert(
    btcItem.drift > 0.05,
    `BTC drift should be > +5% (actual: +${(btcItem.drift * 100).toFixed(2)}%)`
  );

  // TEST 2: Full Rebalance Self-Financing & Precision Invariance
  console.log('\n--- 2. Full Rebalance Self-Financing Invariance ---');
  const fullRebalance = calculateFullRebalance(DEMO_HOLDINGS, TARGETS, 0.05);
  const totalBought = fullRebalance.summary.totalBought;
  const totalSold = fullRebalance.summary.totalSold;

  assert(
    fullRebalance.mode === 'FULL',
    'Rebalance mode must be FULL'
  );
  assert(
    Math.abs(totalBought - totalSold) < 1.0,
    `Self-financing invariance sum(buys) == sum(sells): buys=${totalBought}, sells=${totalSold}`
  );

  const btcFull = fullRebalance.allocations.find((a) => a.assetCode === 'CRYPTO_BTC')!;
  assert(
    btcFull.action === 'SELL',
    `BTC action in full rebalance must be SELL (actual: ${btcFull.action})`
  );
  assert(
    Math.abs(btcFull.nominalAmount - 11000000) < 5000,
    `BTC sell nominal must be ~Rp 11,000,000 (actual: ${btcFull.nominalAmount})`
  );
  assert(
    Math.abs(btcFull.postWeight - 0.2) < 0.001,
    `Post rebalance BTC weight must hit exact 20.0% target (actual: ${(btcFull.postWeight * 100).toFixed(2)}%)`
  );

  // TEST 3: "Zero-Sell" Smart Inflow Rebalance (No Tax/Fee Drag)
  console.log('\n--- 3. Zero-Sell Smart Inflow Rebalancing Engine ---');
  const inflowAmount = 15000000; // Rp 15M monthly salary savings
  const zeroSell = calculateZeroSellInflowRebalance(DEMO_HOLDINGS, TARGETS, inflowAmount, 0.05);

  assert(
    zeroSell.mode === 'ZERO_SELL_INFLOW',
    'Rebalance mode must be ZERO_SELL_INFLOW'
  );
  assert(
    zeroSell.summary.totalSold === 0,
    `STRICT ZERO-SELL GUARANTEE: totalSold must be exactly 0 (actual: ${zeroSell.summary.totalSold})`
  );

  const btcZero = zeroSell.allocations.find((a) => a.assetCode === 'CRYPTO_BTC')!;
  assert(
    btcZero.action === 'HOLD',
    `Overweight BTC action must be HOLD under Zero-Sell (actual: ${btcZero.action})`
  );
  assert(
    btcZero.nominalAmount === 0,
    `Zero capital allocated to overweight BTC (actual: ${btcZero.nominalAmount})`
  );
  assert(
    btcZero.unitsDelta === 0,
    `Zero BTC units sold or purchased (actual: ${btcZero.unitsDelta})`
  );
  assert(
    btcZero.postWeight < btcZero.preWeight,
    `BTC weight monotonically reduced without selling: ${btcZero.preWeight.toFixed(4)} -> ${btcZero.postWeight.toFixed(4)}`
  );
  assert(
    zeroSell.summary.driftReduction.postTotalAbsoluteDrift < zeroSell.summary.driftReduction.preTotalAbsoluteDrift,
    'Total absolute portfolio drift must strictly decrease'
  );
  assert(
    (zeroSell.taxDragAvoided || 0) > 0,
    `Tax & trading fee drag avoided should be calculated (actual: Rp ${zeroSell.taxDragAvoided})`
  );

  // TEST 4: Macro Stress-Test & Liquid Survival Runway (2008 GFC)
  console.log('\n--- 4. Macro Stress-Test & Liquid Survival Runway Engine ---');
  const stress = simulateMacroStressTest(DEMO_HOLDINGS, {
    preset: '2008_GFC',
    monthlyExpenses: 12500000,
  });

  assert(
    stress.scenarioName === '2008 Global Financial Crisis',
    'Scenario name must match 2008 GFC'
  );
  assert(
    stress.totalDrawdownPercentage < 0,
    `Total drawdown must be negative (actual: ${stress.totalDrawdownPercentage}%)`
  );
  assert(
    stress.liquidRunway.runwayMonths >= 6.0 && stress.liquidRunway.runwayMonths <= 7.0,
    `2008 GFC Liquid runway should be ~6.3 months (actual: ${stress.liquidRunway.runwayMonths} months)`
  );
  assert(
    stress.liquidRunway.status === 'MODERATE_RESILIENCE',
    `Status should be MODERATE_RESILIENCE (actual: ${stress.liquidRunway.status})`
  );
  assert(
    stress.liquidRunway.goldHaircutPercent === 15,
    'Gold liquidation haircut must be 15%'
  );

  // TEST 5: 10-Year Monte Carlo Projections & DCA Comparison
  console.log('\n--- 5. 10-Year Monte Carlo & Lump-Sum vs DCA ---');
  const projections = calculate10YearProjections(150000000, 5000000, TARGETS);
  assert(
    projections.tenYearTrajectories.length === 11,
    `10-year trajectory must have 11 annual milestones (actual: ${projections.tenYearTrajectories.length})`
  );

  const y10 = projections.tenYearTrajectories[10];
  assert(
    y10.rebalancedGrowth > y10.baselineMedian,
    `Disciplined rebalancing captures volatility harvest premium: rebalanced=${y10.rebalancedGrowth} > baseline=${y10.baselineMedian}`
  );
  assert(
    projections.lumpSumVsDca.dca.totalPrincipalContributed === 600000000,
    'DCA 10-year principal = 5M * 120 = 600M'
  );
  assert(
    projections.lumpSumVsDca.dca.maxHistoricalDrawdown > projections.lumpSumVsDca.lumpSum.maxHistoricalDrawdown,
    'DCA should experience lower maximum drawdown risk than Lump-Sum'
  );

  // TEST 6: AI Profiler 2D Deterministic Scorer
  console.log('\n--- 6. Hybrid AI Profiler 2D Deterministic Scorer ---');
  const profileScores = calculate2DRiskScores({
    emergencyFundMonths: 8.0,
    monthlySavingsRatio: 0.35,
    investmentHorizonYears: 12,
    incomeStabilityScore: 80,
    crashReactionScore: 75,
    volatilityComfortScore: 70,
    experienceYears: 6,
  });

  assert(
    profileScores.capacityScore >= 65 && profileScores.capacityScore <= 80,
    `Capacity score should be ~73.5 (actual: ${profileScores.capacityScore})`
  );
  assert(
    profileScores.toleranceScore >= 65 && profileScores.toleranceScore <= 75,
    `Tolerance score should be ~69.8 (actual: ${profileScores.toleranceScore})`
  );
  assert(
    profileScores.strategyName === 'BALANCED_LIQUID_CORE',
    `Strategy must correctly map to BALANCED_LIQUID_CORE (actual: ${profileScores.strategyName})`
  );
  assert(
    profileScores.targetAllocations.MMF_IDR === 0.4 && profileScores.targetAllocations.CRYPTO_BTC === 0.2,
    'Target allocations match 40% MMF and 20% BTC'
  );

  console.log(`\n========================================================`);
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runMathUnitTests();
