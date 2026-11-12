import { apiSuccess, handleOptions } from '@/lib/api-response';
import { getAllLiveQuotes, DEFAULT_USD_IDR_RATE } from '@/lib/services/market-data';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET() {
  const usdRate = DEFAULT_USD_IDR_RATE;
  const quotes = getAllLiveQuotes(usdRate);

  return apiSuccess({
    usdIdrRate: usdRate,
    prices: quotes,
    lastUpdated: new Date().toISOString(),
  });
}
