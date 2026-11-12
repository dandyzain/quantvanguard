import { NextRequest } from 'next/server';
import { apiSuccess, apiError, handleOptions, verifyDemoAuth } from '@/lib/api-response';
import { inMemoryStore } from '@/lib/prisma';
import { calculate10YearProjections } from '@/lib/math/stresstest';

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request: NextRequest) {
  verifyDemoAuth(request);

  try {
    const body = await request.json().catch(() => ({}));
    const initialCapital = Number(body.initialCapital ?? 150000000);
    const monthlyDca = Number(body.monthlyDcaAmount ?? 5000000);
    const targets = body.targetAllocations || inMemoryStore.riskProfile.targetAllocations;

    const result = calculate10YearProjections(initialCapital, monthlyDca, targets);
    return apiSuccess(result);
  } catch (error: any) {
    return apiError(error.message || 'Failed to simulate Monte Carlo projections', 'MONTE_CARLO_ERROR', 500);
  }
}
