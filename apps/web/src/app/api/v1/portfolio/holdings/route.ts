import { NextRequest } from 'next/server';
import { apiSuccess, apiError, handleOptions, verifyDemoAuth } from '@/lib/api-response';
import {
  getUserStateFromRequest,
  addHoldingToUserState,
  removeHoldingFromUserState,
} from '@/lib/prisma';
import { getLiveQuote } from '@/lib/services/market-data';
import { getAssetMetadata } from '@/lib/constants';

export async function OPTIONS() {
  return handleOptions();
}

/**
 * Add or top-up an asset holding
 */
export async function POST(request: NextRequest) {
  verifyDemoAuth(request);
  const activeStore = getUserStateFromRequest(request);

  try {
    const body = await request.json().catch(() => ({}));
    const { assetCode, units, costBasisPrice, name } = body;

    if (!assetCode) {
      return apiError('Kode aset (assetCode) wajib diisi.', 'MISSING_ASSET_CODE', 400);
    }

    const parsedUnits = Number(units);
    if (isNaN(parsedUnits) || parsedUnits <= 0) {
      return apiError('Jumlah unit harus berupa angka positif.', 'INVALID_UNITS', 400);
    }

    const quote = getLiveQuote(assetCode, activeStore.portfolio.usdIdrRate);
    const meta = getAssetMetadata(assetCode);
    const parsedCostBasis = Number(costBasisPrice) || quote.priceIdr;

    addHoldingToUserState(activeStore, {
      assetCode: assetCode.toUpperCase().trim(),
      name: name || quote.name || meta.name || assetCode,
      units: parsedUnits,
      currentPrice: quote.priceIdr,
      costBasisPrice: parsedCostBasis,
      currency: 'IDR',
    });

    return apiSuccess({
      message: `Aset ${assetCode} berhasil ditambahkan ke portofolio.`,
      holdingsCount: activeStore.holdings.length,
      holding: activeStore.holdings.find((h) => h.assetCode === assetCode.toUpperCase().trim()),
    });
  } catch (error: any) {
    return apiError(error.message || 'Gagal menambahkan aset.', 'ADD_HOLDING_ERROR', 400);
  }
}

/**
 * Update holding units or cost basis
 */
export async function PUT(request: NextRequest) {
  verifyDemoAuth(request);
  const activeStore = getUserStateFromRequest(request);

  try {
    const body = await request.json().catch(() => ({}));
    const { assetCode, units, costBasisPrice } = body;

    if (!assetCode) {
      return apiError('Kode aset (assetCode) wajib diisi.', 'MISSING_ASSET_CODE', 400);
    }

    const idx = activeStore.holdings.findIndex((h) => h.assetCode === assetCode.toUpperCase().trim());
    if (idx < 0) {
      return apiError(`Aset ${assetCode} tidak ditemukan di portofolio.`, 'NOT_FOUND', 404);
    }

    if (units !== undefined) {
      const parsedUnits = Number(units);
      if (isNaN(parsedUnits) || parsedUnits < 0) {
        return apiError('Jumlah unit tidak valid.', 'INVALID_UNITS', 400);
      }
      activeStore.holdings[idx].units = parsedUnits;
    }

    if (costBasisPrice !== undefined) {
      const parsedCost = Number(costBasisPrice);
      if (!isNaN(parsedCost) && parsedCost >= 0) {
        activeStore.holdings[idx].costBasisPrice = parsedCost;
      }
    }

    return apiSuccess({
      message: `Aset ${assetCode} berhasil diperbarui.`,
      holding: activeStore.holdings[idx],
    });
  } catch (error: any) {
    return apiError(error.message || 'Gagal memperbarui aset.', 'UPDATE_HOLDING_ERROR', 400);
  }
}

/**
 * Remove holding
 */
export async function DELETE(request: NextRequest) {
  verifyDemoAuth(request);
  const activeStore = getUserStateFromRequest(request);

  const { searchParams } = new URL(request.url);
  const assetCode = searchParams.get('assetCode') || '';

  if (!assetCode) {
    return apiError('Parameter assetCode wajib disertakan.', 'MISSING_PARAM', 400);
  }

  const removed = removeHoldingFromUserState(activeStore, assetCode.toUpperCase().trim());
  if (!removed) {
    return apiError(`Aset ${assetCode} tidak ditemukan di portofolio.`, 'NOT_FOUND', 404);
  }

  return apiSuccess({
    message: `Aset ${assetCode} berhasil dihapus dari portofolio.`,
    remainingHoldingsCount: activeStore.holdings.length,
  });
}
