import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/portfolio_provider.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../core/constants/asset_constants.dart';
import '../../../shared/widgets/allocation_drift_donut_chart.dart';

class PortfolioDashboardScreen extends ConsumerWidget {
  final VoidCallback onNavigateToRebalance;

  const PortfolioDashboardScreen({
    super.key,
    required this.onNavigateToRebalance,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(portfolioProvider);
    final notifier = ref.read(portfolioProvider.notifier);

    final totalFormatted = CurrencyFormatter.format(
      state.totalValue,
      currency: state.currency,
      usdRate: state.usdIdrRate,
      inflationAdjusted: state.isInflationAdjusted,
    );

    final double unrealizedGainNominal = state.totalValue - state.totalCostBasis;
    final double unrealizedGainPct = state.totalCostBasis > 0
        ? (unrealizedGainNominal / state.totalCostBasis) * 100.0
        : 0.0;

    // Build Donut Asset Items
    final List<AssetWeightData> donutAssets = state.holdings.map((h) {
      final codeStr = h['assetCode'] as String;
      final assetEnum = AssetCode.fromString(codeStr);
      final currentWeight = (h['currentWeight'] as num).toDouble();
      final targetWeight = state.targetAllocations[codeStr] ?? 0.20;

      return AssetWeightData(
        code: codeStr,
        name: h['name'] as String,
        currentWeight: currentWeight,
        targetWeight: targetWeight,
        color: assetEnum.brandColor,
      );
    }).toList();

    return Scaffold(
      backgroundColor: AppTheme.darkBackground,
      appBar: AppBar(
        title: Row(
          children: [
            const Text('Portfolio Hub'),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: AppTheme.emeraldGreen.withOpacity(0.15),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: AppTheme.emeraldGreen.withOpacity(0.3)),
              ),
              child: const Text(
                'LIVE',
                style: TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.w900,
                  color: AppTheme.emeraldGreen,
                ),
              ),
            ),
          ],
        ),
        actions: [
          // Currency Toggle (IDR / USD)
          GestureDetector(
            onTap: () {
              HapticFeedback.selectionClick();
              notifier.setCurrency(state.currency == 'IDR' ? 'USD' : 'IDR');
            },
            child: Container(
              margin: const EdgeInsets.only(right: 8),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: AppTheme.darkSurface,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppTheme.darkCardBorder),
              ),
              child: Row(
                children: [
                  Icon(
                    state.currency == 'IDR' ? Icons.monetization_on_outlined : Icons.attach_money,
                    size: 14,
                    color: AppTheme.emeraldGreen,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    state.currency,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Inflation Real-Return Toggle
          GestureDetector(
            onTap: () {
              HapticFeedback.selectionClick();
              notifier.toggleInflationAdjusted();
            },
            child: Container(
              margin: const EdgeInsets.only(right: 14),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: state.isInflationAdjusted
                    ? const Color(0xFFEAB308).withOpacity(0.15)
                    : AppTheme.darkSurface,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: state.isInflationAdjusted
                      ? const Color(0xFFEAB308).withOpacity(0.4)
                      : AppTheme.darkCardBorder,
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.trending_down_rounded,
                    size: 14,
                    color: state.isInflationAdjusted
                        ? const Color(0xFFEAB308)
                        : AppTheme.textMuted,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    state.isInflationAdjusted ? 'Real CPI' : 'Nominal',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: state.isInflationAdjusted
                          ? const Color(0xFFEAB308)
                          : AppTheme.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          HapticFeedback.mediumImpact();
          await notifier.loadPortfolio();
        },
        color: AppTheme.primaryBlue,
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
          children: [
            // Active Drift Warning Banner (Only when BTC drift >= 5%)
            if (state.hasActiveDriftAlert)
              GestureDetector(
                onTap: onNavigateToRebalance,
                child: Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        const Color(0xFFF97316).withOpacity(0.2),
                        const Color(0xFF7C2D12).withOpacity(0.15),
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: const Color(0xFFF97316).withOpacity(0.45),
                      width: 1.2,
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF97316).withOpacity(0.25),
                          shape: BoxBoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.warning_amber_rounded,
                          color: Color(0xFFF97316),
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Active Drift Alert (+7.33% BTC)',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w800,
                                color: Color(0xFFF97316),
                              ),
                            ),
                            SizedBox(height: 2),
                            Text(
                              'Tap to launch Zero-Sell Smart Inflow Rebalancer',
                              style: TextStyle(
                                fontSize: 11,
                                color: AppTheme.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Icon(
                        Icons.chevron_right_rounded,
                        color: Color(0xFFF97316),
                        size: 20,
                      ),
                    ],
                  ),
                ),
              ),

            // Top Net Worth & Gain Cards
            Row(
              children: [
                Expanded(
                  child: _buildMetricCard(
                    title: 'TOTAL NET WORTH',
                    value: totalFormatted,
                    subtitle: state.isInflationAdjusted ? 'Inflation-discounted' : 'Nominal market value',
                    icon: Icons.account_balance_wallet_rounded,
                    accentColor: AppTheme.primaryBlue,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildMetricCard(
                    title: 'UNREALIZED PROFIT',
                    value: '+${CurrencyFormatter.format(
                      unrealizedGainNominal,
                      currency: state.currency,
                      usdRate: state.usdIdrRate,
                      inflationAdjusted: state.isInflationAdjusted,
                      compact: true,
                    )}',
                    subtitle: '+${unrealizedGainPct.toStringAsFixed(1)}% total ROI',
                    icon: Icons.trending_up_rounded,
                    accentColor: AppTheme.emeraldGreen,
                    valueColor: AppTheme.emeraldGreen,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 20),

            // Dual-Ring Donut Chart Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: AppTheme.darkCard,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.darkCardBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Multi-Asset Distribution',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                            ),
                          ),
                          SizedBox(height: 2),
                          Text(
                            'Outer Ring: Current  •  Inner Ring: Target',
                            style: TextStyle(
                              fontSize: 11,
                              color: AppTheme.textMuted,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryBlue.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppTheme.primaryBlue.withOpacity(0.3)),
                        ),
                        child: const Text(
                          'Tier 3 Balanced',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.primaryBlue,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  AllocationDriftDonutChart(
                    assets: donutAssets,
                    totalValue: state.totalValue,
                    formattedTotal: totalFormatted,
                    size: 210,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 22),

            // Section: Asset Holdings Cards
            const Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Core Multi-Asset Holdings',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                    letterSpacing: -0.3,
                  ),
                ),
                Text(
                  '4 Classes',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.textMuted,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            // Swipeable / Scrollable Asset Holdings Cards
            ...state.holdings.map((h) {
              final codeStr = h['assetCode'] as String;
              final assetEnum = AssetCode.fromString(codeStr);
              final units = (h['units'] as num).toDouble();
              final currentPrice = (h['currentPrice'] as num).toDouble();
              final currentVal = (h['currentValue'] as num).toDouble();
              final currentWeight = (h['currentWeight'] as num).toDouble();
              final targetWeight = state.targetAllocations[codeStr] ?? 0.20;
              final drift = currentWeight - targetWeight;
              final isDriftAlert = drift.abs() >= 0.05;

              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.darkCard,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(
                    color: isDriftAlert
                        ? const Color(0xFFF97316).withOpacity(0.5)
                        : AppTheme.darkCardBorder,
                  ),
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 38,
                          height: 38,
                          decoration: BoxDecoration(
                            color: assetEnum.brandColor.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: assetEnum.brandColor.withOpacity(0.35),
                            ),
                          ),
                          child: Center(
                            child: Text(
                              assetEnum.ticker,
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w900,
                                color: assetEnum.brandColor,
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
                                h['name'] as String,
                                style: const TextStyle(
                                  fontSize: 13.5,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                ),
                              ),
                              Text(
                                '${CurrencyFormatter.formatUnits(codeStr, units)} ${assetEnum.ticker}',
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: AppTheme.textMuted,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              CurrencyFormatter.format(
                                currentVal,
                                currency: state.currency,
                                usdRate: state.usdIdrRate,
                                inflationAdjusted: state.isInflationAdjusted,
                              ),
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                              ),
                            ),
                            Container(
                              margin: const EdgeInsets.only(top: 2),
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                              decoration: BoxDecoration(
                                color: isDriftAlert
                                    ? const Color(0xFFF97316).withOpacity(0.2)
                                    : AppTheme.darkSurface,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                '${(currentWeight * 100).toStringAsFixed(1)}% (tgt ${(targetWeight * 100).toStringAsFixed(0)}%)',
                                style: TextStyle(
                                  fontSize: 9.5,
                                  fontWeight: FontWeight.w700,
                                  color: isDriftAlert
                                      ? const Color(0xFFF97316)
                                      : AppTheme.textSecondary,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Progress bar showing current vs target
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: currentWeight.clamp(0.0, 1.0),
                        backgroundColor: AppTheme.darkSurface,
                        valueColor: AlwaysStoppedAnimation<Color>(assetEnum.brandColor),
                        minHeight: 5,
                      ),
                    ),
                  ],
                ),
              );
            }),

            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricCard({
    required String title,
    required String value,
    required String subtitle,
    required IconData icon,
    required Color accentColor,
    Color valueColor = Colors.white,
  }) {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: AppTheme.darkCard,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppTheme.darkCardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.textMuted,
                  letterSpacing: 0.5,
                ),
              ),
              Icon(icon, size: 14, color: accentColor),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w900,
              color: valueColor,
              letterSpacing: -0.4,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            subtitle,
            style: const TextStyle(
              fontSize: 10,
              color: AppTheme.textMuted,
            ),
          ),
        ],
      ),
    );
  }
}
