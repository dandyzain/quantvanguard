import 'package:flutter/material.dart';

enum AssetCode {
  mmfIdr(
    'MMF_IDR',
    'Money Market (RDPU)',
    'MMF',
    Color(0xFF10B981),
    4,
    'High-liquidity cash buffer with ~4.85% annual yield and near-zero volatility.',
  ),
  etfVoo(
    'ETF_VOO',
    'Vanguard S&P 500 ETF',
    'VOO',
    Color(0xFF3B82F6),
    4,
    'US large-cap equity index tracker with ~10.5% historical annualized CAGR.',
  ),
  goldXau(
    'GOLD_XAU',
    'Physical Gold (XAU)',
    'XAU',
    Color(0xFFEAB308),
    4,
    'Stagflation hedge and crisis safe-haven store of value (~8.0% historical CAGR).',
  ),
  cryptoBtc(
    'CRYPTO_BTC',
    'Bitcoin Digital Reserve',
    'BTC',
    Color(0xFFF97316),
    8,
    'High-beta asymmetric digital reserve asset supporting up to 8 decimal places.',
  );

  final String code;
  final String displayName;
  final String ticker;
  final Color brandColor;
  final int precisionDecimals;
  final String description;

  const AssetCode(
    this.code,
    this.displayName,
    this.ticker,
    this.brandColor,
    this.precisionDecimals,
    this.description,
  );

  static AssetCode fromString(String code) {
    return AssetCode.values.firstWhere(
      (e) => e.code == code,
      orElse: () => AssetCode.mmfIdr,
    );
  }
}
