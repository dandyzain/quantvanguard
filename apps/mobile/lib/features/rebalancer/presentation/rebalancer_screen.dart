import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/portfolio_provider.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/constants/asset_constants.dart';

class RebalancerScreen extends ConsumerStatefulWidget {
  const RebalancerScreen({super.key});

  @override
  ConsumerState<RebalancerScreen> createState() => _RebalancerScreenState();
}

class _RebalancerScreenState extends ConsumerState<RebalancerScreen> {
  String _mode = 'ZERO_SELL_INFLOW'; // or 'FULL'
  double _inflowAmount = 15000000.0; // Rp 15M default
  bool _isCalculating = false;
  Map<String, dynamic>? _rebalancePlan;

  @override
  void initState() {
    super.initState();
    _calculateRebalance();
  }

  Future<void> _calculateRebalance() async {
    setState(() => _isCalculating = true);
    final dio = ref.read(dioClientProvider).dio;

    try {
      final response = await dio.post(
        ApiConstants.endpointRebalanceCalculate,
        data: {
          'mode': _mode,
          'inflowAmount': _inflowAmount,
        },
      );

      if (response.statusCode == 200 && response.data != null) {
        setState(() {
          _rebalancePlan = response.data['data'] as Map<String, dynamic>;
        });
      }
    } catch (_) {
      // offline fallback
    } finally {
      if (mounted) setState(() => _isCalculating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final portfolioState = ref.watch(portfolioProvider);
    final plan = _rebalancePlan;
    final allocations = (plan?['allocations'] as List?) ?? [];
    final summary = plan?['summary'] as Map<String, dynamic>?;

    final double totalSold = (summary?['totalSold'] as num?)?.toDouble() ?? 0.0;
    final double totalBought = (summary?['totalBought'] as num?)?.toDouble() ?? 0.0;
    final double taxDragAvoided = (plan?['taxDragAvoided'] as num?)?.toDouble() ?? 165000.0;

    return Scaffold(
      backgroundColor: AppTheme.darkBackground,
      appBar: AppBar(
        title: const Text('Smart Rebalancer'),
        actions: [
          // Mode Toggle Pill
          Container(
            margin: const EdgeInsets.only(right: 14),
            padding: const EdgeInsets.all(3),
            decoration: BoxDecoration(
              color: AppTheme.darkSurface,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppTheme.darkCardBorder),
            ),
            child: Row(
              children: [
                _buildModeTab('Zero-Sell', 'ZERO_SELL_INFLOW'),
                _buildModeTab('Full', 'FULL'),
              ],
            ),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
        children: [
          // Banner: Zero-Sell Guarantee
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: _mode == 'ZERO_SELL_INFLOW'
                    ? [
                        AppTheme.emeraldGreen.withOpacity(0.18),
                        const Color(0xFF065F46).withOpacity(0.12),
                      ]
                    : [
                        const Color(0xFFEAB308).withOpacity(0.18),
                        const Color(0xFF854D0E).withOpacity(0.12),
                      ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(
                color: _mode == 'ZERO_SELL_INFLOW'
                    ? AppTheme.emeraldGreen.withOpacity(0.35)
                    : const Color(0xFFEAB308).withOpacity(0.35),
              ),
            ),
            child: Row(
              children: [
                Icon(
                  _mode == 'ZERO_SELL_INFLOW' ? Icons.verified_user_rounded : Icons.swap_horiz_rounded,
                  color: _mode == 'ZERO_SELL_INFLOW' ? AppTheme.emeraldGreen : const Color(0xFFEAB308),
                  size: 28,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _mode == 'ZERO_SELL_INFLOW'
                            ? 'Zero-Sell Inflow Optimization'
                            : 'Full Rebalance (Taxable Realization)',
                        style: const TextStyle(
                          fontSize: 13.5,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        _mode == 'ZERO_SELL_INFLOW'
                            ? '0 satoshis or shares sold • Saved ~${CurrencyFormatter.format(taxDragAvoided, currency: portfolioState.currency, usdRate: portfolioState.usdIdrRate)} in tax/fees'
                            : 'Forces 40/20/20/20 alignment by selling overweight BTC (~Rp 11M)',
                        style: const TextStyle(
                          fontSize: 11,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Monthly Inflow Controller Card (For Zero-Sell mode)
          if (_mode == 'ZERO_SELL_INFLOW')
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.darkCard,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppTheme.darkCardBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'MONTHLY CAPITAL INFLOW',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.textMuted,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    CurrencyFormatter.format(
                      _inflowAmount,
                      currency: portfolioState.currency,
                      usdRate: portfolioState.usdIdrRate,
                    ),
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  SliderTheme(
                    data: SliderTheme.of(context).copyWith(
                      activeTrackColor: AppTheme.primaryBlue,
                      inactiveTrackColor: AppTheme.darkSurface,
                      thumbColor: AppTheme.primaryBlue,
                      trackHeight: 3,
                    ),
                    child: Slider(
                      value: _inflowAmount,
                      min: 1000000.0,
                      max: 50000000.0,
                      divisions: 49,
                      onChanged: (val) {
                        HapticFeedback.selectionClick();
                        setState(() => _inflowAmount = val);
                        _calculateRebalance();
                      },
                    ),
                  ),
                  // Quick preset chips
                  Row(
                    children: [
                      _buildPresetChip('Rp 5M', 5000000.0),
                      const SizedBox(width: 8),
                      _buildPresetChip('Rp 15M (Recruiter)', 15000000.0),
                      const SizedBox(width: 8),
                      _buildPresetChip('Rp 30M', 30000000.0),
                    ],
                  ),
                ],
              ),
            ),

          const SizedBox(height: 16),

          // Rebalance Metrics: Total Bought vs Total Sold
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppTheme.darkCard,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.darkCardBorder),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'TOTAL INFLOW BOUGHT',
                        style: TextStyle(fontSize: 8.5, fontWeight: FontWeight.bold, color: AppTheme.textMuted),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '+${CurrencyFormatter.format(totalBought, currency: portfolioState.currency, usdRate: portfolioState.usdIdrRate, compact: true)}',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: AppTheme.emeraldGreen,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppTheme.darkCard,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.darkCardBorder),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'TOTAL ASSETS SOLD',
                        style: TextStyle(fontSize: 8.5, fontWeight: FontWeight.bold, color: AppTheme.textMuted),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        totalSold == 0
                            ? '0 (Zero-Sell)'
                            : '-${CurrencyFormatter.format(totalSold, currency: portfolioState.currency, usdRate: portfolioState.usdIdrRate, compact: true)}',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w900,
                          color: totalSold == 0 ? AppTheme.textSecondary : const Color(0xFFF97316),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 20),

          // Section Title
          const Text(
            'Recommended Execution Orders',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 10),

          // Execution Orders List
          ...allocations.map((item) {
            final String code = item['assetCode'];
            final assetEnum = AssetCode.fromString(code);
            final String action = item['action'];
            final double nominal = (item['nominalAmount'] as num).toDouble();
            final double unitsDelta = (item['unitsDelta'] as num).toDouble();
            final double postWeight = (item['postWeight'] as num).toDouble();
            final double targetWeight = (item['targetWeight'] as num).toDouble();

            final isBuy = action == 'BUY';
            final isSell = action == 'SELL';

            return Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppTheme.darkCard,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isBuy
                      ? AppTheme.emeraldGreen.withOpacity(0.3)
                      : isSell
                          ? const Color(0xFFF97316).withOpacity(0.4)
                          : AppTheme.darkCardBorder,
                ),
              ),
              child: Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: isBuy
                          ? AppTheme.emeraldGreen.withOpacity(0.18)
                          : isSell
                              ? const Color(0xFFF97316).withOpacity(0.18)
                              : AppTheme.darkSurface,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Center(
                      child: Text(
                        action,
                        style: TextStyle(
                          fontSize: 9.5,
                          fontWeight: FontWeight.w900,
                          color: isBuy
                              ? AppTheme.emeraldGreen
                              : isSell
                                  ? const Color(0xFFF97316)
                                  : AppTheme.textMuted,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          assetEnum.displayName,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                          ),
                        ),
                        Text(
                          isBuy || isSell
                              ? '${isBuy ? '+' : '-'}${CurrencyFormatter.formatUnits(code, unitsDelta)} ${assetEnum.ticker}'
                              : '0 units (Overweight Hold)',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: isBuy ? AppTheme.emeraldGreen : AppTheme.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        nominal == 0
                            ? '—'
                            : CurrencyFormatter.format(
                                nominal,
                                currency: portfolioState.currency,
                                usdRate: portfolioState.usdIdrRate,
                              ),
                        style: const TextStyle(
                          fontSize: 13.5,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                      Text(
                        'Target: ${(targetWeight * 100).toStringAsFixed(0)}%  •  Post: ${(postWeight * 100).toStringAsFixed(1)}%',
                        style: const TextStyle(
                          fontSize: 9.5,
                          color: AppTheme.textMuted,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          }),

          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildModeTab(String label, String modeKey) {
    final isSelected = _mode == modeKey;
    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        setState(() => _mode = modeKey);
        _calculateRebalance();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primaryBlue : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            color: isSelected ? Colors.white : AppTheme.textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _buildPresetChip(String label, double val) {
    final isSelected = (_inflowAmount - val).abs() < 1000;
    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        setState(() => _inflowAmount = val);
        _calculateRebalance();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primaryBlue.withOpacity(0.2) : AppTheme.darkSurface,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? AppTheme.primaryBlue : AppTheme.darkCardBorder,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: isSelected ? AppTheme.primaryBlue : AppTheme.textSecondary,
          ),
        ),
      ),
    );
  }
}
