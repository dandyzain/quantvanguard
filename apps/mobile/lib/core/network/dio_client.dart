import 'package:dio/dio.dart';
import '../constants/api_constants.dart';
import '../database/offline_store.dart';

class DioClient {
  static final DioClient _instance = DioClient._internal();
  factory DioClient() => _instance;

  late final Dio dio;
  final OfflineStore offlineStore = OfflineStore();

  DioClient._internal() {
    dio = Dio(
      BaseOptions(
        baseUrl: ApiConstants.defaultBaseUrl,
        connectTimeout: ApiConstants.connectTimeout,
        receiveTimeout: ApiConstants.receiveTimeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer demo-session-token-recruiter',
        },
      ),
    );

    // Add logging and offline fallback interceptor
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          return handler.next(options);
        },
        onResponse: (response, handler) {
          return handler.next(response);
        },
        onError: (DioException error, handler) async {
          // If connection fails, times out, or host unreachable -> resolve gracefully via offline cache
          final response = _handleOfflineFallback(error.requestOptions);
          if (response != null) {
            return handler.resolve(response);
          }
          return handler.next(error);
        },
      ),
    );
  }

  Response<Map<String, dynamic>>? _handleOfflineFallback(RequestOptions request) {
    final String path = request.path;

    if (path.contains(ApiConstants.endpointGuestDemo)) {
      return Response(
        requestOptions: request,
        statusCode: 200,
        data: {
          'success': true,
          'data': {
            'user': {
              'id': 'demo-user-recruiter-uuid',
              'email': 'recruiter-demo@quantvanguard.internal',
              'name': 'Recruiter Guest Portfolio',
              'isDemoUser': true,
            },
            'portfolioId': 'demo-portfolio-uuid',
            'token': 'demo-session-token-recruiter',
            'activeDriftAlert': true,
          },
        },
      );
    }

    if (path.contains(ApiConstants.endpointPortfolioSummary)) {
      return Response(
        requestOptions: request,
        statusCode: 200,
        data: {
          'success': true,
          'data': {
            'portfolioId': 'demo-portfolio-uuid',
            'portfolioName': 'Primary Wealth Portfolio (Recruiter Demo)',
            'baseCurrency': 'IDR',
            'displayCurrency': offlineStore.currentCurrency,
            'inflationAdjusted': offlineStore.isInflationAdjusted,
            'usdIdrRate': offlineStore.usdIdrRate,
            'totalValue': offlineStore.totalValue,
            'totalCostBasis': offlineStore.totalCostBasis,
            'unrealizedGainNominal': offlineStore.totalValue - offlineStore.totalCostBasis,
            'unrealizedGainPercentage':
                ((offlineStore.totalValue - offlineStore.totalCostBasis) /
                        offlineStore.totalCostBasis) *
                    100.0,
            'monthlyExpenses': offlineStore.monthlyExpenses,
            'hasActiveDriftAlert': offlineStore.hasActiveDriftAlert,
            'strategyName': offlineStore.strategyName,
            'targetAllocations': offlineStore.targetAllocations,
            'holdings': offlineStore.holdings,
            'historicalSnapshots': offlineStore.historicalSnapshots,
          },
        },
      );
    }

    if (path.contains(ApiConstants.endpointRebalanceCalculate)) {
      final double inflow = (request.data?['inflowAmount'] as num?)?.toDouble() ?? 15000000.0;
      final localPlan = offlineStore.calculateZeroSellLocal(inflow);
      return Response(
        requestOptions: request,
        statusCode: 200,
        data: {
          'success': true,
          'data': localPlan,
        },
      );
    }

    if (path.contains(ApiConstants.endpointAiProfilerDiagnose)) {
      return Response(
        requestOptions: request,
        statusCode: 200,
        data: {
          'success': true,
          'data': {
            'capacityScore': 73.5,
            'toleranceScore': 69.8,
            'strategyName': 'BALANCED_LIQUID_CORE',
            'targetAllocations': {
              'MMF_IDR': 0.40,
              'ETF_VOO': 0.20,
              'GOLD_XAU': 0.20,
              'CRYPTO_BTC': 0.20,
            },
            'geminiDiagnosis': {
              'dominant_bias': 'Pragmatic Barbell Opportunism with Calculated Risk Acceptance',
              'stress_resilience':
                  'High psychological stamina. Views -20% to -30% crashes as accumulation windows.',
              'capacity_vs_tolerance_delta':
                  'Harmonious Equilibrium (+3.7): Financial runway and psychological nerve are balanced.',
              'blindspots': [
                'Potential crypto drift during rapid market expansion',
                'Gold stagnation in high real yield regimes',
              ],
              'execution_rules': [
                'Enforce Zero-Sell Inflow Rebalancing monthly',
                'Trigger full rebalance only when Bitcoin drift exceeds +7.0%',
                'Maintain minimum 6-9 months expenses in MMF_IDR at all times',
              ],
            },
          },
        },
      );
    }

    return null;
  }
}
