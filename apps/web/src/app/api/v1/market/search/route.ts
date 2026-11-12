import { NextRequest } from 'next/server';
import { apiSuccess, handleOptions } from '@/lib/api-response';
import { searchAssetCatalog, DEFAULT_USD_IDR_RATE } from '@/lib/services/market-data';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || undefined;
  const results = searchAssetCatalog(query, DEFAULT_USD_IDR_RATE, category);

  return apiSuccess({
    query,
    category: category || 'ALL',
    count: results.length,
    assets: results,
  });
}
