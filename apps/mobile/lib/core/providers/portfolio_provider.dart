import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../network/dio_client.dart';
import '../database/offline_store.dart';
import '../constants/api_constants.dart';

// State model for the active portfolio
class PortfolioState {
  final bool isLoading;
  final String? error;
  final String currency; // 'IDR' or 'USD'
  final bool isInflationAdjusted;
  final double totalValue;
  final double totalCostBasis;
  final double monthlyExpenses;
  final double usdIdrRate;
  final bool hasActiveDriftAlert;
  final String strategyName;
  final Map<String, double> targetAllocations;
  final List<Map<String, dynamic>> holdings;
  final List<Map<String, dynamic>> snapshots;

  PortfolioState({
    this.isLoading = false,
    this.error,
    this.currency = 'IDR',
    this.isInflationAdjusted = false,
    this.totalValue = 150000000.0,
    this.totalCostBasis = 128500000.0,
    this.monthlyExpenses = 12500000.0,
    this.usdIdrRate = 15850.0,
    this.hasActiveDriftAlert = true,
    this.strategyName = 'BALANCED_LIQUID_CORE',
    required this.targetAllocations,
    required this.holdings,
    required this.snapshots,
  });

  PortfolioState copyWith({
    bool? isLoading,
    String? error,
    String? currency,
    bool? isInflationAdjusted,
    double? totalValue,
    double? totalCostBasis,
    double? monthlyExpenses,
    double? usdIdrRate,
    bool? hasActiveDriftAlert,
    String? strategyName,
    Map<String, double>? targetAllocations,
    List<Map<String, dynamic>>? holdings,
    List<Map<String, dynamic>>? snapshots,
  }) {
    return PortfolioState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      currency: currency ?? this.currency,
      isInflationAdjusted: isInflationAdjusted ?? this.isInflationAdjusted,
      totalValue: totalValue ?? this.totalValue,
      totalCostBasis: totalCostBasis ?? this.totalCostBasis,
      monthlyExpenses: monthlyExpenses ?? this.monthlyExpenses,
      usdIdrRate: usdRate ?? this.usdIdrRate,
      hasActiveDriftAlert: hasActiveDriftAlert ?? this.hasActiveDriftAlert,
      strategyName: strategyName ?? this.strategyName,
      targetAllocations: targetAllocations ?? this.targetAllocations,
      holdings: holdings ?? this.holdings,
      snapshots: snapshots ?? this.snapshots,
    );
  }
}

class PortfolioNotifier extends StateNotifier<PortfolioState> {
  final DioClient _dioClient;
  final OfflineStore _offlineStore;

  PortfolioNotifier(this._dioClient, this._offlineStore)
      : super(PortfolioState(
          targetAllocations: Map<String, double>.from(_offlineStore.targetAllocations),
          holdings: List<Map<String, dynamic>>.from(_offlineStore.holdings),
          snapshots: List<Map<String, dynamic>>.from(_offlineStore.historicalSnapshots),
        )) {
    loadPortfolio();
  }

  Future<void> loadPortfolio() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _dioClient.dio.get(
        '${ApiConstants.endpointPortfolioSummary}?currency=${state.currency}&inflationAdjusted=${state.isInflationAdjusted}',
      );

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data['data'] as Map<String, dynamic>;
        state = state.copyWith(
          isLoading: false,
          totalValue: (data['totalValue'] as num).toDouble(),
          totalCostBasis: (data['totalCostBasis'] as num).toDouble(),
          monthlyExpenses: (data['monthlyExpenses'] as num).toDouble(),
          usdIdrRate: (data['usdIdrRate'] as num?)?.toDouble() ?? 15850.0,
          hasActiveDriftAlert: data['hasActiveDriftAlert'] as bool? ?? true,
          strategyName: data['strategyName'] as String? ?? 'BALANCED_LIQUID_CORE',
          targetAllocations: Map<String, double>.from(
            (data['targetAllocations'] as Map).map(
              (k, v) => MapEntry(k.toString(), (v as num).toDouble()),
            ),
          ),
          holdings: List<Map<String, dynamic>>.from(data['holdings'] ?? _offlineStore.holdings),
          snapshots: List<Map<String, dynamic>>.from(
              data['historicalSnapshots'] ?? _offlineStore.historicalSnapshots),
        );
      }
    } catch (e) {
      // Fallback gracefully to offline state
      state = state.copyWith(
        isLoading: false,
        totalValue: _offlineStore.totalValue,
        totalCostBasis: _offlineStore.totalCostBasis,
        holdings: _offlineStore.holdings,
      );
    }
  }

  void setCurrency(String newCurrency) {
    if (state.currency == newCurrency) return;
    state = state.copyWith(currency: newCurrency);
    _offlineStore.currentCurrency = newCurrency;
    loadPortfolio();
  }

  void toggleInflationAdjusted() {
    final next = !state.isInflationAdjusted;
    state = state.copyWith(isInflationAdjusted: next);
    _offlineStore.isInflationAdjusted = next;
    loadPortfolio();
  }

  Future<void> resetToGuestDemo() async {
    _offlineStore.resetToInitialDemo();
    await _dioClient.dio.post(ApiConstants.endpointGuestDemo);
    await loadPortfolio();
  }
}

final dioClientProvider = Provider<DioClient>((ref) => DioClient());
final offlineStoreProvider = Provider<OfflineStore>((ref) => OfflineStore());

final portfolioProvider =
    StateNotifierProvider<PortfolioNotifier, PortfolioState>((ref) {
  final dio = ref.watch(dioClientProvider);
  final store = ref.watch(offlineStoreProvider);
  return PortfolioNotifier(dio, store);
});
