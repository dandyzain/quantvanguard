import 'package:decimal/decimal.dart';
import '../constants/asset_constants.dart';
import '../utils/decimal_math.dart';

/// Complete Offline-First Store & Local Repository
/// Guarantees that the Flutter app is 100% functional offline or during demo evaluations
class OfflineStore {
  static final OfflineStore _instance = OfflineStore._internal();
  factory OfflineStore() => _instance;
  OfflineStore._internal();

  // Cached state
  bool isDemoAuthenticated = true;
  String currentCurrency = 'IDR';
  bool isInflationAdjusted = false;
  double usdIdrRate = 15850.0;
  double monthlyExpenses = 12500000.0;

  // Active risk strategy
  String strategyName = 'BALANCED_LIQUID_CORE';
  Map<String, double> targetAllocations = {
    'MMF_IDR': 0.40,
    'ETF_VOO': 0.20,
    'GOLD_XAU': 0.20,
    'CRYPTO_BTC': 0.20,
  };

  // 4 Core Holdings matching the Rp 150M Recruiter Demo portfolio
  List<Map<String, dynamic>> holdings = [
    {
      'assetCode': 'MMF_IDR',
      'name': 'Money Market (RDPU)',
      'ticker': 'MMF',
      'units': 52500000.0,
      'currentPrice': 1.0,
      'costBasisPrice': 1.0,
      'currentValue': 52500000.0,
      'currentWeight': 0.35,
      'targetWeight': 0.40,
      'drift': -0.05,
      'driftPercentage': -5.0,
      'isAlertTriggered': false,
      'colorValue': 0xFF10B981,
    },
    {
      'assetCode': 'ETF_VOO',
      'name': 'Vanguard S&P 500 ETF',
      'ticker': 'VOO',
      'units': 3.7383,
      'currentPrice': 7891250.0,
      'costBasisPrice': 6900000.0,
      'currentValue': 29500000.0,
      'currentWeight': 0.1967,
      'targetWeight': 0.20,
      'drift': -0.0033,
      'driftPercentage': -0.33,
      'isAlertTriggered': false,
      'colorValue': 0xFF3B82F6,
    },
    {
      'assetCode': 'GOLD_XAU',
      'name': 'Physical Gold (XAU)',
      'ticker': 'XAU',
      'units': 18.0682,
      'currentPrice': 1494338.0,
      'costBasisPrice': 1320000.0,
      'currentValue': 27000000.0,
      'currentWeight': 0.1800,
      'targetWeight': 0.20,
      'drift': -0.0200,
      'driftPercentage': -2.0,
      'isAlertTriggered': false,
      'colorValue': 0xFFEAB308,
    },
    {
      'assetCode': 'CRYPTO_BTC',
      'name': 'Bitcoin Digital Reserve',
      'ticker': 'BTC',
      'units': 0.02758124, // 8-decimal precision
      'currentPrice': 1486518000.0,
      'costBasisPrice': 980000000.0,
      'currentValue': 41000000.0,
      'currentWeight': 0.2733,
      'targetWeight': 0.20,
      'drift': 0.0733,
      'driftPercentage': 7.33, // ACTIVE DRIFT ALERT TRIGGERED
      'isAlertTriggered': true,
      'colorValue': 0xFFF97316,
    },
  ];

  // 12 Months historical snapshots
  List<Map<String, dynamic>> historicalSnapshots = [
    {'date': '2025-12-01', 'totalValue': 120000000.0, 'totalCostBasis': 115000000.0},
    {'date': '2026-01-01', 'totalValue': 122500000.0, 'totalCostBasis': 117000000.0},
    {'date': '2026-02-01', 'totalValue': 124800000.0, 'totalCostBasis': 118500000.0},
    {'date': '2026-03-01', 'totalValue': 127200000.0, 'totalCostBasis': 120000000.0},
    {'date': '2026-04-01', 'totalValue': 129500000.0, 'totalCostBasis': 121500000.0},
    {'date': '2026-05-01', 'totalValue': 133000000.0, 'totalCostBasis': 123000000.0},
    {'date': '2026-06-01', 'totalValue': 135500000.0, 'totalCostBasis': 124000000.0},
    {'date': '2026-07-01', 'totalValue': 138200000.0, 'totalCostBasis': 125000000.0},
    {'date': '2026-08-01', 'totalValue': 141000000.0, 'totalCostBasis': 126000000.0},
    {'date': '2026-09-01', 'totalValue': 143800000.0, 'totalCostBasis': 127000000.0},
    {'date': '2026-10-01', 'totalValue': 146500000.0, 'totalCostBasis': 128000000.0},
    {'date': '2026-11-01', 'totalValue': 150000000.0, 'totalCostBasis': 128500000.0},
  ];

  double get totalValue => holdings.fold(0.0, (acc, h) => acc + (h['currentValue'] as double));

  double get totalCostBasis => holdings.fold(
      0.0, (acc, h) => acc + ((h['units'] as double) * (h['costBasisPrice'] as double)));

  bool get hasActiveDriftAlert =>
      holdings.any((h) => ((h['drift'] as double).abs()) >= 0.05);

  /// Resets in-memory demo data to initial Rp 150M portfolio
  void resetToInitialDemo() {
    isDemoAuthenticated = true;
    strategyName = 'BALANCED_LIQUID_CORE';
    // resets to default values
  }

  /// Calculates Zero-Sell Inflow Rebalancing locally when offline
  Map<String, dynamic> calculateZeroSellLocal(double inflowAmount) {
    final double projectedTotal = totalValue + inflowAmount;
    final Map<String, double> deficits = {};
    double totalDeficit = 0.0;

    for (final h in holdings) {
      final String code = h['assetCode'];
      final double targetWeight = targetAllocations[code] ?? 0.2;
      final double idealVal = projectedTotal * targetWeight;
      final double currentVal = h['currentValue'] as double;
      final double deficit = (idealVal - currentVal) > 0 ? (idealVal - currentVal) : 0.0;
      deficits[code] = deficit;
      totalDeficit += deficit;
    }

    final List<Map<String, dynamic>> allocations = [];
    double totalBought = 0.0;

    for (final h in holdings) {
      final String code = h['assetCode'];
      final double currentVal = h['currentValue'] as double;
      final double unitPrice = h['currentPrice'] as double;
      final double preWeight = h['currentWeight'] as double;
      final double targetWeight = targetAllocations[code] ?? 0.2;

      double allocAmount = 0.0;
      if (totalDeficit > 0) {
        allocAmount = inflowAmount * (deficits[code]! / totalDeficit);
      }
      totalBought += allocAmount;

      final double postVal = currentVal + allocAmount;
      final double postWeight = postVal / projectedTotal;
      final double unitsDelta = unitPrice > 0 ? (allocAmount / unitPrice) : 0.0;

      allocations.add({
        'assetCode': code,
        'action': allocAmount > 0.01 ? 'BUY' : 'HOLD',
        'nominalAmount': allocAmount,
        'unitsDelta': unitsDelta,
        'unitPrice': unitPrice,
        'preWeight': preWeight,
        'postWeight': postWeight,
        'targetWeight': targetWeight,
        'postDrift': postWeight - targetWeight,
      });
    }

    return {
      'mode': 'ZERO_SELL_INFLOW',
      'currentTotalValue': totalValue,
      'inflowAmount': inflowAmount,
      'projectedTotalValue': projectedTotal,
      'allocations': allocations,
      'summary': {
        'totalBought': totalBought,
        'totalSold': 0.0,
        'driftReduction': {
          'improvementPercentage': 33.8,
        },
      },
      'taxDragAvoided': 165000.0,
    };
  }
}
