import { NextRequest } from 'next/server';
import { POST as authGuestDemo } from '../../app/api/v1/auth/guest-demo/route';
import { GET as getPortfolioSummary } from '../../app/api/v1/portfolio/summary/route';
import { POST as postRebalanceCalculate } from '../../app/api/v1/rebalance/calculate/route';
import { POST as postAiProfilerDiagnose } from '../../app/api/v1/ai-profiler/diagnose/route';
import { POST as postStressTestSimulate } from '../../app/api/v1/stress-test/simulate/route';

async function runApiIntegrationTests() {
  console.log('=== QuantVanguard REST API Integration Verification Suite ===\n');
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

  // 1. POST /api/v1/auth/guest-demo
  console.log('--- 1. Testing POST /api/v1/auth/guest-demo ---');
  const reqAuth = new NextRequest('http://localhost:3000/api/v1/auth/guest-demo', {
    method: 'POST',
  });
  const resAuth = await authGuestDemo(reqAuth);
  const dataAuth = await resAuth.json();

  assert(resAuth.status === 200, 'Status must be 200 OK');
  assert(resAuth.headers.get('access-control-allow-origin') === '*', 'CORS Allow-Origin header present');
  assert(dataAuth.success === true, 'Response success must be true');
  assert(dataAuth.data.user.email === 'recruiter-demo@quantvanguard.internal', 'Demo email verified');
  assert(dataAuth.data.activeDriftAlert === true, 'Active drift alert flagged');

  // 2. GET /api/v1/portfolio/summary
  console.log('\n--- 2. Testing GET /api/v1/portfolio/summary ---');
  const reqSummary = new NextRequest('http://localhost:3000/api/v1/portfolio/summary?currency=IDR', {
    method: 'GET',
    headers: { Authorization: `Bearer ${dataAuth.data.token}` },
  });
  const resSummary = await getPortfolioSummary(reqSummary);
  const dataSummary = await resSummary.json();

  assert(resSummary.status === 200, 'Status must be 200 OK');
  assert(dataSummary.success === true, 'Response success must be true');
  assert(dataSummary.data.totalValue >= 149000000 && dataSummary.data.totalValue <= 151000000, 'Total value is ~150M IDR');
  assert(dataSummary.data.holdings.length === 4, 'Contains all 4 core asset holdings');
  const btcHolding = dataSummary.data.holdings.find((h: any) => h.assetCode === 'CRYPTO_BTC');
  assert(btcHolding.isAlertTriggered === true, 'BTC triggers alert (+7.33% drift)');

  // 3. POST /api/v1/rebalance/calculate (Zero-Sell Mode)
  console.log('\n--- 3. Testing POST /api/v1/rebalance/calculate (Zero-Sell) ---');
  const reqRebal = new NextRequest('http://localhost:3000/api/v1/rebalance/calculate', {
    method: 'POST',
    body: JSON.stringify({
      mode: 'ZERO_SELL_INFLOW',
      inflowAmount: 15000000,
    }),
  });
  const resRebal = await postRebalanceCalculate(reqRebal);
  const dataRebal = await resRebal.json();

  assert(resRebal.status === 200, 'Status must be 200 OK');
  assert(dataRebal.data.mode === 'ZERO_SELL_INFLOW', 'Mode is ZERO_SELL_INFLOW');
  assert(dataRebal.data.summary.totalSold === 0, 'Zero units sold strictly enforced');
  assert(dataRebal.data.taxDragAvoided > 0, 'Tax drag avoided calculated');

  // 4. POST /api/v1/ai-profiler/diagnose
  console.log('\n--- 4. Testing POST /api/v1/ai-profiler/diagnose ---');
  const reqProfile = new NextRequest('http://localhost:3000/api/v1/ai-profiler/diagnose', {
    method: 'POST',
    body: JSON.stringify({
      emergencyFundMonths: 8.0,
      monthlySavingsRatio: 0.35,
      investmentHorizonYears: 12,
      incomeStabilityScore: 80,
      crashReactionScore: 75,
      volatilityComfortScore: 70,
      experienceYears: 6,
    }),
  });
  const resProfile = await postAiProfilerDiagnose(reqProfile);
  const dataProfile = await resProfile.json();

  assert(resProfile.status === 200, 'Status must be 200 OK');
  assert(dataProfile.data.strategyName === 'BALANCED_LIQUID_CORE', 'Mapped to BALANCED_LIQUID_CORE');
  assert(dataProfile.data.geminiDiagnosis.dominant_bias.length > 0, 'Dominant bias diagnosed');
  assert(dataProfile.data.geminiDiagnosis.execution_rules.length === 3, '3 execution rules provided');

  // 5. POST /api/v1/stress-test/simulate
  console.log('\n--- 5. Testing POST /api/v1/stress-test/simulate ---');
  const reqStress = new NextRequest('http://localhost:3000/api/v1/stress-test/simulate', {
    method: 'POST',
    body: JSON.stringify({
      preset: '2008_GFC',
      monthlyExpenses: 12500000,
    }),
  });
  const resStress = await postStressTestSimulate(reqStress);
  const dataStress = await resStress.json();

  assert(resStress.status === 200, 'Status must be 200 OK');
  assert(dataStress.data.scenarioName === '2008 Global Financial Crisis', '2008 GFC preset simulated');
  assert(dataStress.data.liquidRunway.runwayMonths === 6.3, 'Liquid runway equals 6.3 months');
  assert(dataStress.data.projections.tenYearTrajectories.length === 11, 'Projections included');

  console.log(`\n========================================================`);
  console.log(`API INTEGRATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================================`);

  if (failed > 0) process.exit(1);
}

runApiIntegrationTests();
