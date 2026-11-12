import { apiSuccess, handleOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET() {
  return apiSuccess({
    status: 'ONLINE',
    version: '1.0.0',
    service: 'QuantVanguard API Gateway',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('placeholder')),
    assetUniverse: ['MMF_IDR', 'ETF_VOO', 'GOLD_XAU', 'CRYPTO_BTC'],
  });
}
