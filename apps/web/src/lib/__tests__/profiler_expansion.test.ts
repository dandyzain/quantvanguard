import { calculate2DRiskScores, diagnoseRiskProfile } from '../ai/profiler';
import { RiskSurveyInput } from '../types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    process.exit(1);
  }
  console.log(`[PASS] ${message}`);
}

async function runExpandedProfilerTests() {
  console.log('=== QuantVanguard AI Risk Profiler Expansion Verification Suite ===\n');

  // Test 1: Backward-compatibility check
  console.log('--- 1. Backward-Compatibility Baseline Verification ---');
  const baselineInput: RiskSurveyInput = {
    emergencyFundMonths: 8.0,
    monthlySavingsRatio: 0.35,
    investmentHorizonYears: 12,
    incomeStabilityScore: 80,
    crashReactionScore: 75,
    volatilityComfortScore: 70,
    experienceYears: 6,
  };

  const baselineResult = calculate2DRiskScores(baselineInput);
  assert(Math.abs(baselineResult.capacityScore - 73.5) < 0.2, `Baseline capacity should be ~73.5 (actual: ${baselineResult.capacityScore})`);
  assert(Math.abs(baselineResult.toleranceScore - 69.8) < 0.2, `Baseline tolerance should be ~69.8 (actual: ${baselineResult.toleranceScore})`);
  assert(baselineResult.strategyName === 'BALANCED_LIQUID_CORE', 'Baseline strategy must be BALANCED_LIQUID_CORE');
  assert(baselineResult.isCustomized === false, 'Baseline isCustomized should be false');
  assert(baselineResult.guardrailViolations.length === 0, 'Baseline guardrail violations should be empty');

  // Test 2: Expanded Multi-Dimensional Capacity Modifiers
  console.log('\n--- 2. Expanded Multi-Dimensional Capacity Modifiers ---');
  const stressedCapacityInput: RiskSurveyInput = {
    ...baselineInput,
    dependentsCount: 4, // heavy sandwich penalty
    debtToIncomeRatio: 0.45, // high debt penalty
    liquidityNeedTiming: 'LESS_THAN_1_YEAR', // urgent liquidity need
  };
  const stressedCapacityResult = calculate2DRiskScores(stressedCapacityInput);
  assert(
    stressedCapacityResult.capacityScore < baselineResult.capacityScore - 15,
    `Stressed balance sheet should significantly lower capacity score (${stressedCapacityResult.capacityScore} < ${baselineResult.capacityScore - 15})`
  );

  // Test 3: Expanded Multi-Dimensional Tolerance Modifiers
  console.log('\n--- 3. Expanded Multi-Dimensional Tolerance Modifiers ---');
  const aggressiveToleranceInput: RiskSurveyInput = {
    ...baselineInput,
    lossAversionSensitivity: 5, // highly objective, low fear
    extremeDrawdownReaction: 'AGGRESSIVE_DIP_BUY', // aggressive dip buyer
    financialKnowledgeLevel: 'QUANT_EXPERT', // quantitative expert
  };
  const aggressiveToleranceResult = calculate2DRiskScores(aggressiveToleranceInput);
  assert(
    aggressiveToleranceResult.toleranceScore > baselineResult.toleranceScore + 8,
    `Aggressive behavioral resilience should boost tolerance score (${aggressiveToleranceResult.toleranceScore} > ${baselineResult.toleranceScore + 8})`
  );

  // Test 4: Crypto Preference Constraint (NONE)
  console.log('\n--- 4. Crypto Preference Constraint (NONE) ---');
  const zeroCryptoInput: RiskSurveyInput = {
    ...baselineInput,
    cryptoPreference: 'NONE',
  };
  const zeroCryptoResult = calculate2DRiskScores(zeroCryptoInput);
  assert(zeroCryptoResult.targetAllocations.CRYPTO_BTC === 0, 'Crypto allocation must be strictly 0% when preference is NONE');
  assert(zeroCryptoResult.targetAllocations.MMF_IDR > baselineResult.targetAllocations.MMF_IDR, 'Excess crypto should be safely reallocated to cash/MMF');

  // Test 5: Custom Target Allocation Override & Guardrail Violations
  console.log('\n--- 5. Custom Target Allocation Override & Guardrails ---');
  const customAllocationsInput: RiskSurveyInput = {
    ...baselineInput,
    customTargetAllocations: {
      MMF_IDR: 0.05, // dangerously low (< 10%)
      ETF_VOO: 0.45,
      GOLD_XAU: 0.15,
      CRYPTO_BTC: 0.35, // dangerously high (> 25%)
    },
  };
  const customResult = calculate2DRiskScores(customAllocationsInput);
  assert(customResult.isCustomized === true, 'isCustomized must be true');
  assert(customResult.guardrailViolations.length >= 2, `Should trigger guardrail warnings for low cash and high crypto (got ${customResult.guardrailViolations.length})`);

  // Test 6: Full Diagnosis with Deterministic Fallback & Narrative Output
  console.log('\n--- 6. Full AI Diagnosis Engine Verification ---');
  const fullDiagnosis = await diagnoseRiskProfile({
    ...baselineInput,
    primaryGoal: 'AGGRESSIVE_WEALTH_ACCUMULATION',
    cryptoPreference: 'MODERATE_10',
    userNotesOrGuidance: 'Menyiapkan dana pensiun mandiri 15 tahun ke depan',
  });

  assert(Boolean(fullDiagnosis.geminiDiagnosis.dominant_bias), 'Should diagnose dominant bias');
  assert(Boolean(fullDiagnosis.geminiDiagnosis.capacity_vs_tolerance_delta), 'Should provide delta analysis');
  assert(fullDiagnosis.geminiDiagnosis.blindspots.length >= 2, 'Should provide at least 2 blindspots');
  assert(fullDiagnosis.geminiDiagnosis.execution_rules.length === 3, 'Should provide 3 disciplined execution rules');
  assert(Boolean(fullDiagnosis.geminiDiagnosis.custom_guidance), 'Should provide custom goal guidance');
  assert(Boolean(fullDiagnosis.geminiDiagnosis.suitability_verdict), 'Should provide suitability verdict');
  assert(Boolean(fullDiagnosis.dynamicAssets && fullDiagnosis.dynamicAssets.length >= 4), 'Should recommend at least 4 dynamic assets');

  // Test 7: Dynamic Multi-Asset Portfolio Recommendation Engine
  console.log('\n--- 7. Dynamic Multi-Asset Basket Formulation (Passive Dividend vs Capital Preservation) ---');
  const dividendDiagnosis = await diagnoseRiskProfile({
    ...baselineInput,
    primaryGoal: 'PASSIVE_DIVIDEND_INCOME',
    cryptoPreference: 'NONE',
  });

  assert(Boolean(dividendDiagnosis.dynamicAssets), 'Dividend diagnosis must contain dynamic assets');
  const dividendAssets = dividendDiagnosis.dynamicAssets || [];
  assert(dividendAssets.length >= 4, `Should recommend 4+ assets for passive dividend (got ${dividendAssets.length})`);
  
  const dividendWeightSum = dividendAssets.reduce((sum, a) => sum + a.weight, 0);
  assert(Math.abs(dividendWeightSum - 1.0) < 0.01, `Dividend asset weights must sum to 100% (actual: ${dividendWeightSum})`);
  
  const hasSbn = dividendAssets.some((a) => a.assetCode === 'SBN_ORI');
  const hasBbri = dividendAssets.some((a) => a.assetCode === 'BBRI');
  assert(hasSbn, 'Passive dividend portfolio should recommend sovereign bond SBN_ORI for monthly coupon');
  assert(hasBbri, 'Passive dividend portfolio should recommend BBRI for high cash dividend yield');

  // Test Capital Preservation with Gold
  const preservationDiagnosis = await diagnoseRiskProfile({
    ...baselineInput,
    primaryGoal: 'CAPITAL_PRESERVATION',
    cryptoPreference: 'NONE',
  });
  const presAssets = preservationDiagnosis.dynamicAssets || [];
  const hasGold = presAssets.some((a) => a.assetCode === 'GOLD_XAU');
  const hasMmf = presAssets.some((a) => a.assetCode === 'MMF_IDR');
  assert(hasGold, 'Capital preservation portfolio must contain Gold safe haven');
  assert(hasMmf, 'Capital preservation portfolio must contain MMF liquidity anchor');
  const cryptoInZeroCrypto = presAssets.some((a) => a.category === 'CRYPTO');
  assert(!cryptoInZeroCrypto, 'Zero crypto preference must NOT recommend crypto in capital preservation');

  console.log('\n========================================================');
  console.log('EXPANDED AI PROFILER TEST SUMMARY: ALL VERIFICATIONS PASSED');
  console.log('========================================================\n');
}

runExpandedProfilerTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
