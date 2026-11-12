import { NextResponse } from 'next/server';

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

export function handleOptions() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    {
      status,
      headers: CORS_HEADERS,
    }
  );
}

export function apiError(message: string, code = 'BAD_REQUEST', status = 400, details?: any) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
      timestamp: new Date().toISOString(),
    },
    {
      status,
      headers: CORS_HEADERS,
    }
  );
}

export function verifyDemoAuth(request: Request): { authorized: boolean; token?: string } {
  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader) {
    // For demo convenience, allow access even if Bearer token is omitted in demo mode
    return { authorized: true, token: 'demo-session-token' };
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  return { authorized: true, token: token || 'demo-session-token' };
}
