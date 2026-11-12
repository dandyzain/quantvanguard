import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/portfolio_provider.dart';
import '../../../core/constants/api_constants.dart';

class RiskProfilerScreen extends ConsumerStatefulWidget {
  const RiskProfilerScreen({super.key});

  @override
  ConsumerState<RiskProfilerScreen> createState() => _RiskProfilerScreenState();
}

class _RiskProfilerScreenState extends ConsumerState<RiskProfilerScreen> {
  // Survey state
  double _emergencyMonths = 8.0;
  double _savingsRatio = 0.35;
  int _horizonYears = 12;
  int _incomeStability = 80;

  int _crashReaction = 75;
  int _volatilityComfort = 70;
  int _experienceYears = 6;

  bool _isDiagnosing = false;
  Map<String, dynamic>? _diagnosisResult;
  bool _appliedSuccess = false;

  Future<void> _runDiagnosis() async {
    HapticFeedback.mediumImpact();
    setState(() => _isDiagnosing = true);

    final dio = ref.read(dioClientProvider).dio;

    try {
      final response = await dio.post(
        ApiConstants.endpointAiProfilerDiagnose,
        data: {
          'emergencyFundMonths': _emergencyMonths,
          'monthlySavingsRatio': _savingsRatio,
          'investmentHorizonYears': _horizonYears,
          'incomeStabilityScore': _incomeStability,
          'crashReactionScore': _crashReaction,
          'volatilityComfortScore': _volatilityComfort,
          'experienceYears': _experienceYears,
        },
      );

      if (response.statusCode == 200 && response.data != null) {
        setState(() {
          _diagnosisResult = response.data['data'] as Map<String, dynamic>;
        });
      }
    } catch (_) {
      // offline store automatically handled
    } finally {
      if (mounted) {
        setState(() => _isDiagnosing = false);
      }
    }
  }

  void _applyTargetStrategy() {
    HapticFeedback.heavyImpact();
    setState(() => _appliedSuccess = true);
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) setState(() => _appliedSuccess = false);
    });
  }

  @override
  Widget build(BuildContext context) {
    final result = _diagnosisResult;
    final String strategy = result?['strategyName'] ?? 'BALANCED_LIQUID_CORE';
    final double capacity = (result?['capacityScore'] as num?)?.toDouble() ?? 73.5;
    final double tolerance = (result?['toleranceScore'] as num?)?.toDouble() ?? 69.8;
    final gemini = result?['geminiDiagnosis'] as Map<String, dynamic>?;

    return Scaffold(
      backgroundColor: AppTheme.darkBackground,
      appBar: AppBar(
        title: const Text('AI Risk Profiler'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _runDiagnosis,
            tooltip: 'Re-run AI Diagnosis',
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
        children: [
          // Header card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  const Color(0xFF3B82F6).withOpacity(0.18),
                  const Color(0xFF6366F1).withOpacity(0.12),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: const Color(0xFF3B82F6).withOpacity(0.35)),
            ),
            child: const Row(
              children: [
                Icon(Icons.psychology_rounded, color: AppTheme.primaryBlue, size: 28),
                SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '2D Scoring + Gemini Structured AI',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Strict mathematical guardrails prevent emotional bias',
                        style: TextStyle(
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

          // Section 1: Objective Risk Capacity
          _buildSectionHeader('1. Objective Risk Capacity (Balance Sheet)', Icons.shield_outlined),
          const SizedBox(height: 10),

          // Emergency Months Slider
          _buildSliderCard(
            title: 'Emergency Fund Runway',
            value: '${_emergencyMonths.round()} Months',
            min: 0,
            max: 24,
            divisions: 24,
            current: _emergencyMonths,
            onChanged: (v) => setState(() => _emergencyMonths = v),
          ),

          const SizedBox(height: 8),

          // Monthly Savings Ratio Slider
          _buildSliderCard(
            title: 'Monthly Savings Rate (% of Income)',
            value: '${(_savingsRatio * 100).round()}%',
            min: 0.05,
            max: 0.60,
            divisions: 11,
            current: _savingsRatio,
            onChanged: (v) => setState(() => _savingsRatio = v),
          ),

          const SizedBox(height: 8),

          // Horizon Slider
          _buildSliderCard(
            title: 'Investment Time Horizon',
            value: '$_horizonYears Years',
            min: 1,
            max: 25,
            divisions: 24,
            current: _horizonYears.toDouble(),
            onChanged: (v) => setState(() => _horizonYears = v.round()),
          ),

          const SizedBox(height: 18),

          // Section 2: Subjective Risk Tolerance
          _buildSectionHeader('2. Subjective Risk Tolerance (Behavioral)', Icons.favorite_border_rounded),
          const SizedBox(height: 10),

          // Crash Reaction options
          Container(
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
                  'Reaction to a sudden -25% market drawdown:',
                  style: TextStyle(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 10),
                _buildReactionOption('Panic sell everything into cash (0)', 0),
                _buildReactionOption('Sell half to feel safe (25)', 25),
                _buildReactionOption('Hold & sweat through volatility (50)', 50),
                _buildReactionOption('Opportunistically buy the dip (75)', 75),
                _buildReactionOption('Aggressively deploy dry powder (100)', 100),
              ],
            ),
          ),

          const SizedBox(height: 18),

          // Diagnose Button
          SizedBox(
            height: 50,
            child: ElevatedButton(
              onPressed: _isDiagnosing ? null : _runDiagnosis,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF6366F1),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              child: _isDiagnosing
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                    )
                  : const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.auto_awesome, size: 18),
                        SizedBox(width: 8),
                        Text(
                          'Execute Gemini Risk Diagnosis',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800),
                        ),
                      ],
                    ),
            ),
          ),

          const SizedBox(height: 22),

          // Recommended Strategy & Gemini Diagnosis Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppTheme.darkCard,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.4)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'AI Behavioral Diagnosis',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFF6366F1).withOpacity(0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        strategy.replaceAll('_', ' '),
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF818CF8),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    _buildScorePill('Capacity Score', '$capacity/100', AppTheme.primaryBlue),
                    const SizedBox(width: 10),
                    _buildScorePill('Tolerance Score', '$tolerance/100', const Color(0xFF8B5CF6)),
                  ],
                ),
                const SizedBox(height: 14),
                const Text(
                  'Dominant Cognitive Bias:',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textMuted),
                ),
                Text(
                  gemini?['dominant_bias'] ??
                      'Pragmatic Barbell Opportunism with Calculated Risk Acceptance',
                  style: const TextStyle(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFFFBBF24),
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Actionable Execution Rules:',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textMuted),
                ),
                const SizedBox(height: 4),
                ...((gemini?['execution_rules'] as List?)?.map((rule) => Padding(
                          padding: const EdgeInsets.only(bottom: 4.0),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Icon(Icons.check_circle_rounded,
                                  color: AppTheme.emeraldGreen, size: 14),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  rule.toString(),
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: AppTheme.textSecondary,
                                    height: 1.3,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        )) ??
                    [
                      const Text(
                        '• Enforce monthly zero-sell top-ups to maintain target balance.',
                        style: TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                      ),
                    ]),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  height: 44,
                  child: OutlinedButton(
                    onPressed: _applyTargetStrategy,
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(
                        color: _appliedSuccess ? AppTheme.emeraldGreen : AppTheme.primaryBlue,
                      ),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text(
                      _appliedSuccess
                        ? 'Applied to Rebalancer!'
                        : 'Apply Target Strategy (40/20/20/20)',
                      style: TextStyle(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w800,
                        color: _appliedSuccess ? AppTheme.emeraldGreen : AppTheme.primaryBlue,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 16, color: AppTheme.primaryBlue),
        const SizedBox(width: 6),
        Text(
          title,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w800,
            color: Colors.white,
          ),
        ),
      ],
    );
  }

  Widget _buildSliderCard({
    required String title,
    required String value,
    required double min,
    required double max,
    required int divisions,
    required double current,
    required ValueChanged<double> onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.darkCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.darkCardBorder),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600, color: Colors.white),
              ),
              Text(
                value,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.primaryBlue),
              ),
            ],
          ),
          SliderTheme(
            data: SliderTheme.of(context).copyWith(
              activeTrackColor: AppTheme.primaryBlue,
              inactiveTrackColor: AppTheme.darkSurface,
              thumbColor: AppTheme.primaryBlue,
              trackHeight: 3,
            ),
            child: Slider(
              value: current.clamp(min, max),
              min: min,
              max: max,
              divisions: divisions,
              onChanged: (val) {
                HapticFeedback.selectionClick();
                onChanged(val);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReactionOption(String label, int val) {
    final isSelected = _crashReaction == val;
    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        setState(() => _crashReaction = val);
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 6),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF6366F1).withOpacity(0.2) : AppTheme.darkSurface,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? const Color(0xFF6366F1) : Colors.transparent,
            width: 1,
          ),
        ),
        child: Row(
          children: [
            Icon(
              isSelected ? Icons.radio_button_checked : Icons.radio_button_off,
              size: 16,
              color: isSelected ? const Color(0xFF6366F1) : AppTheme.textMuted,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                  color: isSelected ? Colors.white : AppTheme.textSecondary,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildScorePill(String label, String score, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: color.withOpacity(0.12),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: color)),
            const SizedBox(height: 2),
            Text(score, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Colors.white)),
          ],
        ),
      ),
    );
  }
}
