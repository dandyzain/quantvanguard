import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  valueInIdr: number,
  currency: 'IDR' | 'USD' = 'IDR',
  usdRate = 15850.0,
  inflationAdjusted = false
): string {
  const adjustedVal = inflationAdjusted ? valueInIdr / 1.035 : valueInIdr;

  if (currency === 'USD') {
    const valUsd = adjustedVal / usdRate;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: valUsd >= 1000 ? 0 : 2,
    }).format(valUsd);
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(adjustedVal);
}

export function formatAssetUnits(assetCode: string, units: number): string {
  if (assetCode === 'CRYPTO_BTC') {
    return units.toFixed(8);
  }
  if (assetCode.startsWith('CRYPTO_')) {
    return units.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
  }
  if (assetCode === 'MMF_IDR' || assetCode === 'MMF_SUKUK') {
    return units.toLocaleString('id-ID', { maximumFractionDigits: 0 });
  }
  return units.toLocaleString('en-US', { maximumFractionDigits: 4 });
}

export function formatPercent(value: number, includeSign = false): string {
  const prefix = includeSign && value > 0 ? '+' : '';
  return `${prefix}${(value * 100).toFixed(1)}%`;
}
