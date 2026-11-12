import 'package:intl/intl.dart';

class CurrencyFormatter {
  static final NumberFormat _idrFormat = NumberFormat.currency(
    locale: 'id_ID',
    symbol: 'Rp ',
    decimalDigits: 0,
  );

  static final NumberFormat _usdFormat = NumberFormat.currency(
    locale: 'en_US',
    symbol: '\$ ',
    decimalDigits: 2,
  );

  static final NumberFormat _compactIdr = NumberFormat.compactCurrency(
    locale: 'id_ID',
    symbol: 'Rp ',
    decimalDigits: 1,
  );

  static final NumberFormat _compactUsd = NumberFormat.compactCurrency(
    locale: 'en_US',
    symbol: '\$ ',
    decimalDigits: 1,
  );

  /// Formats nominal values with dynamic currency switching and optional CPI inflation discounting
  static String format(
    double valueInIdr, {
    String currency = 'IDR',
    double usdRate = 15850.0,
    bool inflationAdjusted = false,
    bool compact = false,
  }) {
    // 3.5% CPI annual inflation discount
    final double adjusted = inflationAdjusted ? (valueInIdr / 1.035) : valueInIdr;

    if (currency.toUpperCase() == 'USD') {
      final double usdVal = adjusted / usdRate;
      if (compact) {
        return _compactUsd.format(usdVal);
      }
      return _usdFormat.format(usdVal);
    }

    if (compact) {
      return _compactIdr.format(adjusted);
    }
    return _idrFormat.format(adjusted);
  }

  /// Formats precise unit counts for assets, supporting 8 decimal places for BTC
  static String formatUnits(String assetCode, double units) {
    if (assetCode == 'CRYPTO_BTC') {
      return units.toStringAsFixed(8);
    }
    if (assetCode == 'MMF_IDR') {
      return NumberFormat('#,##0', 'id_ID').format(units.round());
    }
    return NumberFormat('#,##0.0000', 'en_US').format(units);
  }

  /// Formats percentage ratios with optional sign prefix
  static String formatPercent(double ratio, {bool includeSign = false}) {
    final double pct = ratio * 100.0;
    final String sign = (includeSign && pct > 0) ? '+' : '';
    return '$sign${pct.toStringAsFixed(1)}%';
  }
}
