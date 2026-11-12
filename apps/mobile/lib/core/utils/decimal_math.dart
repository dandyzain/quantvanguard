import 'package:decimal/decimal.dart';

class DecimalMath {
  static Decimal d(num value) => Decimal.parse(value.toString());

  static Decimal mul(num a, num b) => (d(a) * d(b));

  static Decimal div(num a, num b) {
    final denom = d(b);
    if (denom == Decimal.zero) return Decimal.zero;
    return (d(a) / denom).toDecimal(scaleOnInfinitePrecision: 8);
  }

  static Decimal add(num a, num b) => (d(a) + d(b));

  static Decimal sub(num a, num b) => (d(a) - d(b));

  static double toDouble(Decimal val) => val.toDouble();

  /// Calculates percentage drift: currentWeight - targetWeight
  static double calculateDrift(double currentVal, double totalVal, double targetWeight) {
    if (totalVal <= 0) return 0.0;
    final currentWeight = currentVal / totalVal;
    return currentWeight - targetWeight;
  }
}
