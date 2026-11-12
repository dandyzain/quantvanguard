import { NextRequest } from 'next/server';
import { apiSuccess, apiError, handleOptions } from '@/lib/api-response';
import { verifySessionToken } from '@/lib/auth';
import { getUserState } from '@/lib/prisma';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    return apiError('Token otentikasi tidak ditemukan.', 'UNAUTHORIZED', 401);
  }

  const user = verifySessionToken(token);
  if (!user) {
    return apiError('Sesi tidak valid atau telah kedaluwarsa.', 'UNAUTHORIZED', 401);
  }

  const userState = getUserState(user.id, user.email, user.name);

  return apiSuccess({
    user,
    portfolioId: userState.portfolio.id,
    portfolioName: userState.portfolio.name,
  });
}
