import { NextRequest } from 'next/server';
import { apiSuccess, handleOptions } from '@/lib/api-response';
import { resetDemoStore } from '@/lib/prisma';

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request: NextRequest) {
  try {
    // Reset in-memory / demo state to fresh Rp 150M portfolio with +7.33% BTC drift alert
    const demoState = resetDemoStore();

    return apiSuccess({
      user: demoState.user,
      portfolioId: demoState.portfolio.id,
      token: 'demo-session-token-recruiter',
      activeDriftAlert: true,
      driftSummary: {
        asset: 'CRYPTO_BTC',
        currentWeight: 0.2733,
        targetWeight: 0.2,
        driftPercentage: 7.33,
        alert: 'BTC is over-allocated by +7.33% beyond target guardrail.',
      },
      message: 'Recruiter Guest Demo portfolio successfully initialized with Rp 150,000,000.',
    });
  } catch (error: any) {
    return apiSuccess({
      user: {
        id: 'demo-user-recruiter-uuid',
        email: 'recruiter-demo@quantvanguard.internal',
        name: 'Recruiter Guest Portfolio',
        isDemoUser: true,
      },
      portfolioId: 'demo-portfolio-uuid',
      token: 'demo-session-token-recruiter',
      activeDriftAlert: true,
    });
  }
}
