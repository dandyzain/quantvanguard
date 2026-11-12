/**
 * QuantVanguard Public Launch Verification Test Suite
 * Tests:
 * 1. Public user registration & token generation
 * 2. Public user login & session verification
 * 3. Multi-tenant portfolio isolation (User vs Demo)
 * 4. Dynamic asset addition, update & deletion (BBCA, NVDA, etc.)
 * 5. Live market quotes & asset search API
 */

import { POST as registerHandler } from '@/app/api/v1/auth/register/route';
import { POST as loginHandler } from '@/app/api/v1/auth/login/route';
import { GET as meHandler } from '@/app/api/v1/auth/me/route';
import { GET as summaryHandler } from '@/app/api/v1/portfolio/summary/route';
import {
  POST as addHoldingHandler,
  PUT as updateHoldingHandler,
  DELETE as deleteHoldingHandler,
} from '@/app/api/v1/portfolio/holdings/route';
import { GET as pricesHandler } from '@/app/api/v1/market/prices/route';
import { GET as searchHandler } from '@/app/api/v1/market/search/route';
import { NextRequest } from 'next/server';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`[FAIL] ${msg}`);
    process.exit(1);
  }
  console.log(`[PASS] ${msg}`);
}

async function runPublicFeaturesTests() {
  console.log('=== QuantVanguard Public Features Verification Suite ===\n');

  // --- 1. User Registration ---
  console.log('--- 1. Testing User Registration ---');
  const regEmail = `test-investor-${Date.now()}@quantvanguard.app`;
  const regReq = new NextRequest('http://localhost:3000/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Budi Santoso',
      email: regEmail,
      password: 'investorPassword123',
    }),
  });
  const regRes = await registerHandler(regReq);
  const regJson = await regRes.json();

  assert(regRes.status === 200, 'Registration status must be 200');
  assert(regJson.success === true, 'Registration success must be true');
  assert(regJson.data.user.email === regEmail, 'User email must match input');
  assert(regJson.data.user.name === 'Budi Santoso', 'User name must match input');
  assert(!regJson.data.user.isDemoUser, 'User isDemoUser must be false');
  assert(typeof regJson.data.token === 'string' && regJson.data.token.startsWith('qv-usr-'), 'Token must be valid user token');

  const userToken = regJson.data.token;

  // --- 2. User Session Verification (/auth/me) ---
  console.log('\n--- 2. Testing User Session Verification (/auth/me) ---');
  const meReq = new NextRequest('http://localhost:3000/api/v1/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  const meRes = await meHandler(meReq);
  const meJson = await meRes.json();
  assert(meRes.status === 200, 'Auth me status must be 200');
  assert(meJson.data.user.email === regEmail, 'Session belongs to registered user');

  // --- 3. Multi-Tenant Portfolio Isolation ---
  console.log('\n--- 3. Testing Multi-Tenant Portfolio Isolation ---');
  // Check user's portfolio summary
  const userSumReq = new NextRequest('http://localhost:3000/api/v1/portfolio/summary', {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  const userSumRes = await summaryHandler(userSumReq);
  const userSumJson = await userSumRes.json();
  assert(userSumJson.data.portfolioName.includes('Budi Santoso'), 'User portfolio name matches user');
  assert(userSumJson.data.holdings.length === 0, 'New registered user must start fresh with 0 holdings');
  assert(userSumJson.data.totalValue === 0, 'New registered user total value must be exactly 0');
  assert(userSumJson.data.totalCostBasis === 0, 'New registered user cost basis must be exactly 0');
  assert(userSumJson.data.hasActiveDriftAlert === false, 'New registered user has no drift alert');

  // Check demo recruiter portfolio summary
  const demoSumReq = new NextRequest('http://localhost:3000/api/v1/portfolio/summary', {
    headers: { Authorization: 'Bearer demo-session-token-recruiter' },
  });
  const demoSumRes = await summaryHandler(demoSumReq);
  const demoSumJson = await demoSumRes.json();
  assert(demoSumJson.data.portfolioName.includes('Recruiter Demo'), 'Demo portfolio remains intact');
  assert(userSumJson.data.portfolioId !== demoSumJson.data.portfolioId, 'Portfolios must have distinct IDs');

  // --- 4. Dynamic Asset Addition (Saham Indonesia & US Tech) ---
  console.log('\n--- 4. Testing Dynamic Asset Addition & Portfolio Modification ---');
  // Add NVDA to user portfolio
  const addReq = new NextRequest('http://localhost:3000/api/v1/portfolio/holdings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({
      assetCode: 'NVDA',
      name: 'NVIDIA Corporation',
      units: 15,
      costBasisPrice: 2200000,
    }),
  });
  const addRes = await addHoldingHandler(addReq);
  const addJson = await addRes.json();
  assert(addRes.status === 200, 'Add holding status must be 200');
  assert(addJson.success === true, 'Add holding success must be true');

  // Verify NVDA is now in user's portfolio summary
  const updatedUserSumRes = await summaryHandler(userSumReq);
  const updatedUserSumJson = await updatedUserSumRes.json();
  const hasNvda = updatedUserSumJson.data.holdings.some((h: any) => h.assetCode === 'NVDA');
  assert(hasNvda, 'NVDA holding must be present in user portfolio');

  // Verify NVDA is NOT in demo recruiter's portfolio (isolation test)
  const freshDemoSumRes = await summaryHandler(demoSumReq);
  const freshDemoSumJson = await freshDemoSumRes.json();
  const demoHasNvda = freshDemoSumJson.data.holdings.some((h: any) => h.assetCode === 'NVDA');
  assert(!demoHasNvda, 'Demo portfolio MUST NOT be affected by user additions (strict isolation)');

  // Update units
  const updateReq = new NextRequest('http://localhost:3000/api/v1/portfolio/holdings', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({
      assetCode: 'NVDA',
      units: 20,
    }),
  });
  const updateRes = await updateHoldingHandler(updateReq);
  const updateJson = await updateRes.json();
  assert(updateJson.data.holding.units === 20, 'NVDA units updated to 20');

  // Delete holding
  const delReq = new NextRequest('http://localhost:3000/api/v1/portfolio/holdings?assetCode=NVDA', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${userToken}` },
  });
  const delRes = await deleteHoldingHandler(delReq);
  const delJson = await delRes.json();
  assert(delJson.success === true, 'Delete NVDA success must be true');

  // --- 5. Market Quotes & Universal Search ---
  console.log('\n--- 5. Testing Market Quotes & Universal Search ---');
  const pricesRes = await pricesHandler();
  const pricesJson = await pricesRes.json();
  assert(pricesJson.data.prices.length >= 4, 'Price catalog contains multi-asset quotes');

  const searchReq = new NextRequest('http://localhost:3000/api/v1/market/search?q=BCA');
  const searchRes = await searchHandler(searchReq);
  const searchJson = await searchRes.json();
  assert(searchJson.data.assets.length > 0, 'Search for BCA returns BBCA');
  assert(searchJson.data.assets[0].assetCode === 'BBCA', 'Found asset is BBCA');

  console.log('\n========================================================');
  console.log('PUBLIC FEATURES TEST SUMMARY: ALL VERIFICATIONS PASSED');
  console.log('========================================================');
}

runPublicFeaturesTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
