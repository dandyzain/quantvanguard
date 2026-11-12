import { NextRequest } from 'next/server';
import { apiSuccess, apiError, handleOptions } from '@/lib/api-response';
import { registerUser } from '@/lib/auth';
import { getUserState } from '@/lib/prisma';

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { name, email, password } = body;

    if (!email || !password) {
      return apiError('Email dan kata sandi wajib diisi.', 'MISSING_FIELDS', 400);
    }

    const { user, token } = await registerUser(name || 'Investor', email, password);
    const userState = getUserState(user.id, user.email, user.name);

    return apiSuccess({
      user,
      token,
      portfolioId: userState.portfolio.id,
      message: 'Registrasi berhasil! Selamat datang di QuantVanguard.',
    });
  } catch (error: any) {
    return apiError(error.message || 'Gagal melakukan registrasi.', 'REGISTRATION_ERROR', 400);
  }
}
