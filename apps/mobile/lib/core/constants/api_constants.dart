import 'dart:io' show Platform;
import 'package:flutter/foundation.dart';

class ApiConstants {
  /// Resolves the optimal backend host depending on the current runtime platform:
  /// - Android emulator uses 10.0.2.2 to reach host machine localhost:3000
  /// - iOS simulator, macOS, Windows, Linux, and Web use localhost:3000
  static String get defaultBaseUrl {
    if (kIsWeb) {
      return 'http://localhost:3000/api/v1';
    }
    try {
      if (Platform.isAndroid) {
        return 'http://10.0.2.2:3000/api/v1';
      }
    } catch (_) {
      // Fallback if Platform is not available
    }
    return 'http://localhost:3000/api/v1';
  }

  // Base API paths matching Next.js App Router backend
  static const String endpointHealth = '/health';
  static const String endpointGuestDemo = '/auth/guest-demo';
  static const String endpointPortfolioSummary = '/portfolio/summary';
  static const String endpointRebalanceCalculate = '/rebalance/calculate';
  static const String endpointAiProfilerDiagnose = '/ai-profiler/diagnose';
  static const String endpointStressTestSimulate = '/stress-test/simulate';
  static const String endpointMarketPrices = '/market/prices';

  // Request timeouts
  static const Duration connectTimeout = Duration(seconds: 8);
  static const Duration receiveTimeout = Duration(seconds: 8);

  // Default USD/IDR anchor rate
  static const double defaultUsdIdrRate = 15850.0;
  // Default annual CPI inflation rate (3.5%)
  static const double defaultAnnualCpiInflation = 0.035;
}
