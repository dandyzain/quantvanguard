import { NextRequest } from 'next/server';
import { apiSuccess, handleOptions } from '@/lib/api-response';
import { logoutSession } from '@/lib/auth';

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (token) {
    logoutSession(token);
  }

  return apiSuccess({
    loggedOut: true,
    message: 'Sesi berhasil diakhiri.',
  });
}
