import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/portfolio_provider.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../core/compute/monte_carlo_isolate.dart';
import '../../../shared/widgets/multi_line_projection_chart.dart';

class MacroSimulatorScreen extends ConsumerStatefulWidget {
  const MacroSimulatorScreen({super.key});

  @override
  ConsumerState<MacroSimulatorScreen> createState() => _MacroSimulatorScreenState();
}

class _MacroSimulatorScreenState extends ConsumerState<MacroSimulatorScreen> {
  String _selectedPreset = '2008_GFC';

  // Percentage shocks per asset class
  double _shockMmf = 0.04;
  double _shockVoo = -0.38;
  double _shockGold = 0.055;
  double _shockBtc = -0.50;

  bool _isComputingIsolate = false;
  MonteCarloOutput? _monteCarloOutput;

  @override
  void initState() {
    super.initState();
    _runIsolateSimulation();
  }

  void _applyPreset(String presetKey) {
    HapticFeedback.selectionClick();
    setState(() {
      _selectedPreset = presetKey;
      if (presetKey == '2008_GFC') {
        _shockMmf = 0.04;
        _shockVoo = -0.38;
        _shockGold = 0.055;
        _shockBtc = -0.50;
      } else if (presetKey == '2020_COVID') {
        _shockMmf = 0.045;
        _shockVoo = -0.34;
        _shockGold = 0.12;
        _shockBtc = -0.50;
      } else if (presetKey == '2022_BEAR') {
        _shockMmf = 0.035;
        _shockVoo = -0.19;
        _shockGold = -0.005;
        _shockBtc = -0.64;
      }
    });
    _runIsolateSimulation();
  }

  Future<void> _runIsolateSimulation() async {
    setState(() => _isComputingIsolate = true);

    final portfolio = ref.read(portfolioProvider);
    final params = MonteCarloParams(
      initialCapital: portfolio.totalValue,
      monthlyDca: 5000000.0,
      targetWeights: portfolio.targetAllocations,
      numSimulations: 1000,
      customCrashPercent: _shockVoo,
    );

    // Runs on background Dart Isolate without dropping 60/120 FPS
    final output = await MonteCarloIsolate.runSimulation(params);

    if (mounted) {
      setState(() {
        _monteCarloOutput = output;
        _isComputingIsolate = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final portfolio = ref.watch(portfolioProvider);

    // Calculate stressed values
    final mmfHolding = portfolio.holdings.firstWhere(
      (h) => h['assetCode'] == 'MMF_IDR',
      orElse: () => {'currentValue': 52500000.0},
    );
    final vooHolding = portfolio.holdings.firstWhere(
      (h) => h['assetCode'] == 'ETF_VOO',
      orElse: () => {'currentValue': 29500000.0},
    );
    final goldHolding = portfolio.holdings.firstWhere(
      (h) => h['assetCode'] == 'GOLD_XAU',
      orElse: () => {'currentValue': 27000000.0},
    );
    final btcHolding = portfolio.holdings.firstWhere(
      (h) => h['assetCode'] == 'CRYPTO_BTC',
      orElse: () => {'currentValue': 41000000.0},
    );

    final double postMmf = (mmfHolding['currentValue'] as double) * (1.0 + _shockMmf);
    final double postVoo = (vooHolding['currentValue'] as double) * (1.0 + _shockVoo);
    final double postGold = (goldHolding['currentValue'] as double) * (1.0 + _shockGold);
    final double postBtc = (btcHolding['currentValue'] as double) * (1.0 + _shockBtc);

    final double postTotal = postMmf + postVoo + postGold + postBtc;
    final double totalDrawdownPct =
        portfolio.totalValue > 0 ? ((postTotal - portfolio.totalValue) / portfolio.totalValue) * 100.0 : 0.0;

    // Liquid survival runway: MMF + (85% Gold)
    final double safeLiquidity = postMmf + (postGold * 0.85);
    final double runwayMonths = safeLiquidity / portfolio.monthlyExpenses;

    String runwayStatus = 'MODERATE_RESILIENCE';
    if (runwayMonths < 6) {
      runwayStatus = 'CRITICAL_RISK';
    } else if (runwayMonths >= 18) {
      runwayStatus = 'FORTRESS_BALANCE_SHEET';
    }

    return Scaffold(
      backgroundColor: AppTheme.darkBackground,
      appBar: AppBar(
        title: const Text('Crisis Lab & Simulator'),
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
        children: [
          // Tactical Presets Chips Row
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildPresetChip('2008 GFC', '2008_GFC'),
                const SizedBox(width: 8),
                _buildPresetChip('2020 COVID Crash', '2020_COVID'),
                const SizedBox(width: 8),
                _buildPresetChip('2022 Fed Rate-Hike', '2022_BEAR'),
                const SizedBox(width: 8),
                _buildPresetChip('Custom Sliders', 'CUSTOM'),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Liquid Survival Runway Hero Gauge Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  const Color(0xFF1E293B).withOpacity(0.9),
                  const Color(0xFF0F172A).withOpacity(0.95),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(22),
              border: Border.all(
                color: runwayStatus == 'CRITICAL_RISK'
                    ? AppTheme.alertRed.withOpacity(0.5)
                    : const Color(0xFFEAB308).withOpacity(0.4),
                width: 1.2,
              ),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'LIQUID SURVIVAL RUNWAY',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF94A3B8),
                        letterSpacing: 0.8,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEAB308).withOpacity(0.18),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        runwayStatus == 'FORTRESS_BALANCE_SHEET'
                            ? 'FORTRESS'
                            : runwayStatus == 'MODERATE_RESILIENCE'
                                ? 'SAFE BUFFER'
                                : 'CRITICAL',
                        style: const TextStyle(
                          fontSize: 9.5,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFFEAB308),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    Text(
                      runwayMonths.toStringAsFixed(1),
                      style: const TextStyle(
                        fontSize: 48,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFFFBBF24),
                        letterSpacing: -1,
                      ),
                    ),
                    const SizedBox(width: 6),
                    const Text(
                      'Months',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  'Covers ${CurrencyFormatter.format(safeLiquidity, currency: portfolio.currency, usdRate: portfolio.usdIdrRate, compact: true)} of living expenses (RDPU + 85% Gold) with zero forced liquidation of crashed stocks or crypto.',
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppTheme.textSecondary,
                    height: 1.3,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 14),
                // Drawdown metric pill
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppTheme.alertRed.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppTheme.alertRed.withOpacity(0.3)),
                  ),
                  child: Text(
                    'Portfolio Drawdown: ${totalDrawdownPct.toStringAsFixed(1)}% (${CurrencyFormatter.format(postTotal, currency: portfolio.currency, usdRate: portfolio.usdIdrRate, compact: true)})',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFFF87171),
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 18),

          // Real-time Shock Sliders
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
                  'Asset Stress Sliders',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Colors.white),
                ),
                const SizedBox(height: 10),
                _buildShockSlider('MMF (RDPU)', _shockMmf, (v) => setState(() => _shockMmf = v)),
                _buildShockSlider('S&P 500 (VOO)', _shockVoo, (v) => setState(() => _shockVoo = v)),
                _buildShockSlider('Gold (XAU)', _shockGold, (v) => setState(() => _shockGold = v)),
                _buildShockSlider('Bitcoin (BTC)', _shockBtc, (v) => setState(() => _shockBtc = v)),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // 10-Year Monte Carlo Projection Chart
          Container(
            padding: const EdgeInsets.all(16),
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
                    const Text(
                      '10-Year Monte Carlo Projections',
                      style: TextStyle(
                        fontSize: 14.5,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                    ),
                    if (_isComputingIsolate)
                      const SizedBox(
                        height: 14,
                        width: 14,
                        child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.primaryBlue),
                      )
                    else
                      const Text(
                        '1,000 Iterations',
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppTheme.emeraldGreen),
                      ),
                  ],
                ),
                const SizedBox(height: 14),
                if (_monteCarloOutput != null)
                  MultiLineProjectionChart(
                    milestones: _monteCarloOutput!.trajectories,
                    currency: portfolio.currency,
                    height: 200,
                  ),
              ],
            ),
          ),

          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildPresetChip(String label, String key) {
    final isSelected = _selectedPreset == key;
    return GestureDetector(
      onTap: () => _applyPreset(key),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primaryBlue : AppTheme.darkCard,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppTheme.primaryBlue : AppTheme.darkCardBorder,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11.5,
            fontWeight: FontWeight.w800,
            color: isSelected ? Colors.white : AppTheme.textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _buildShockSlider(String label, double val, ValueChanged<double> onChanged) {
    final pct = (val * 100).round();
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.white),
            ),
          ),
          Expanded(
            child: SliderTheme(
              data: SliderTheme.of(context).copyWith(
                activeTrackColor: pct >= 0 ? AppTheme.emeraldGreen : AppTheme.alertRed,
                inactiveTrackColor: AppTheme.darkSurface,
                thumbColor: Colors.white,
                trackHeight: 2.5,
              ),
              child: Slider(
                value: val.clamp(-0.80, 1.00),
                min: -0.80,
                max: 1.00,
                divisions: 36,
                onChanged: (newVal) {
                  HapticFeedback.selectionClick();
                  onChanged(newVal);
                  _runIsolateSimulation();
                },
              ),
            ),
          ),
          SizedBox(
            width: 44,
            child: Text(
              '${pct >= 0 ? '+' : ''}$pct%',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w800,
                color: pct >= 0 ? AppTheme.emeraldGreen : AppTheme.alertRed,
              ),
              textAlign: TextAlign.end,
            ),
          ),
        ],
      ),
    );
  }
}
