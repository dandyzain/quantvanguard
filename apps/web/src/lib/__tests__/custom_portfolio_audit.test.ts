import { NextRequest } from 'next/server';
import { POST as postAuditCustom } from '../../app/api/v1/ai-profiler/audit-custom/route';
import {
  calculateCustomPortfolioMetrics,
  generateDeterministicCustomAudit,
  auditCustomPortfolio,
} from '../ai/portfolio-doctor';
import { CustomPortfolioAuditInput } from '../types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    process.exit(1);
  }
  console.log(`[PASS] ${message}`);
}

async function runCustomPortfolioAuditTests() {
  console.log('=== QuantVanguard Custom Portfolio Builder & AI Doctor Verification ===\n');

  // Test 1: Quantitative Metrics Calculation & Normalization
  console.log('--- 1. Quantitative Calculation & Weight Normalization ---');
  const sampleInput: CustomPortfolioAuditInput = {
    horizonYears: 10,
    monthlyIncome: 20_000_000,
    monthlyExpenses: 8_000_000,
    portfolioCapital: 100_000_000,
    primaryGoal: 'PASSIVE_DIVIDEND_INCOME',
    holdings: [
      { assetCode: 'SBN_ORI', weight: 30 },
      { assetCode: 'BBRI', weight: 25 },
      { assetCode: 'ETF_SCHD', weight: 25 },
      { assetCode: 'MMF_IDR', weight: 20 },
    ],
  };

  const metrics = calculateCustomPortfolioMetrics(sampleInput);
  assert(metrics.normalizedHoldings.length === 4, 'Should normalize 4 holdings');
  const weightSum = metrics.normalizedHoldings.reduce((sum, h) => sum + h.weight, 0);
  assert(Math.abs(weightSum - 1.0) < 0.01, `Normalized weights must sum to 100% (got ${weightSum})`);
  assert(metrics.weightedCagr > 0.06, `Weighted CAGR should be positive (got ${metrics.weightedCagr})`);
  assert(metrics.estimatedMonthlyPassiveIncome > 300_000, `Should calculate monthly passive income (got Rp ${metrics.estimatedMonthlyPassiveIncome})`);

  // Test 2: Horizon Mismatch Detection (1 year with heavy volatile assets)
  console.log('\n--- 2. Short Horizon with Volatile Assets Mismatch Detection ---');
  const volatileShortInput: CustomPortfolioAuditInput = {
    horizonYears: 1, // Short 1-year horizon!
    monthlyIncome: 15_000_000,
    monthlyExpenses: 10_000_000,
    portfolioCapital: 50_000_000,
    primaryGoal: 'AGGRESSIVE_WEALTH_ACCUMULATION',
    holdings: [
      { assetCode: 'CRYPTO_BTC', weight: 50 },
      { assetCode: 'NVDA', weight: 40 },
      { assetCode: 'MMF_IDR', weight: 10 },
    ],
  };

  const shortMetrics = calculateCustomPortfolioMetrics(volatileShortInput);
  const shortAudit = generateDeterministicCustomAudit(volatileShortInput, shortMetrics);
  assert(shortAudit.healthScore < 75, `Short horizon with volatile assets should lower score (got ${shortAudit.healthScore})`);
  const hasHorizonWarning = shortAudit.weaknesses.some((w) => w.toLowerCase().includes('horison') || w.toLowerCase().includes('jangka'));
  assert(hasHorizonWarning, 'Must flag horizon mismatch vulnerability');

  // Test 3: Emergency Fund & Cash Shortage Detection
  console.log('\n--- 3. Emergency Fund Deficit Detection ---');
  const cashDeficitInput: CustomPortfolioAuditInput = {
    horizonYears: 7,
    monthlyIncome: 20_000_000,
    monthlyExpenses: 15_000_000, // High monthly expenses
    portfolioCapital: 20_000_000,
    primaryGoal: 'BALANCED_GROWTH',
    holdings: [
      { assetCode: 'BBCA', weight: 50 },
      { assetCode: 'ETF_VOO', weight: 50 }, // 0% cash!
    ],
  };
  const deficitMetrics = calculateCustomPortfolioMetrics(cashDeficitInput);
  const deficitAudit = generateDeterministicCustomAudit(cashDeficitInput, deficitMetrics);
  const hasCashWarning = deficitAudit.weaknesses.some((w) => w.toLowerCase().includes('likuiditas') || w.toLowerCase().includes('cadangan') || w.toLowerCase().includes('darurat'));
  assert(hasCashWarning, 'Must flag emergency fund / liquidity shortage');

  // Test 4: Full Service Call with Structured Output
  console.log('\n--- 4. Full AI Doctor Audit Execution ---');
  const fullAudit = await auditCustomPortfolio(sampleInput);
  assert(fullAudit.healthScore >= 50 && fullAudit.healthScore <= 100, `Health score must be between 50-100 (got ${fullAudit.healthScore})`);
  assert(fullAudit.strengths.length >= 2, `Should provide at least 2 strengths (got ${fullAudit.strengths.length})`);
  assert(fullAudit.recommendations.length >= 1, `Should provide actionable recommendations (got ${fullAudit.recommendations.length})`);
  assert(Boolean(fullAudit.horizonAlignmentVerdict), 'Should provide horizon alignment verdict');
  assert(Boolean(fullAudit.incomeCashflowVerdict), 'Should provide income cashflow verdict');

  // Test 5: REST API Route POST /api/v1/ai-profiler/audit-custom
  console.log('\n--- 5. Testing REST API POST /api/v1/ai-profiler/audit-custom ---');
  const req = new NextRequest('http://localhost:3000/api/v1/ai-profiler/audit-custom', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...sampleInput,
      applyToPortfolio: true,
    }),
  });

  const res = await postAuditCustom(req);
  assert(res.status === 200, 'API status must be 200 OK');
  const json = await res.json();
  assert(json.success === true, 'API response success must be true');
  assert(json.data.healthScore > 0, 'API must return health score');
  assert(json.data.normalizedHoldings.length === 4, 'API must return normalized holdings');

  console.log('\n========================================================');
  console.log('CUSTOM PORTFOLIO AUDIT TEST SUMMARY: ALL VERIFICATIONS PASSED');
  console.log('========================================================\n');
}

runCustomPortfolioAuditTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
