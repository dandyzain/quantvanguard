import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/compute/monte_carlo_isolate.dart';
import '../../core/utils/currency_formatter.dart';

class MultiLineProjectionChart extends StatefulWidget {
  final List<YearlyMilestone> milestones;
  final String currency;
  final double height;

  const MultiLineProjectionChart({
    super.key,
    required this.milestones,
    this.currency = 'IDR',
    this.height = 220,
  });

  @override
  State<MultiLineProjectionChart> createState() => _MultiLineProjectionChartState();
}

class _MultiLineProjectionChartState extends State<MultiLineProjectionChart> {
  int? _scrubbedYear;

  @override
  Widget build(BuildContext context) {
    if (widget.milestones.isEmpty) {
      return const SizedBox(
        height: 200,
        child: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    final scrubbedData = _scrubbedYear != null
        ? widget.milestones.firstWhere(
            (m) => m.year == _scrubbedYear,
            orElse: () => widget.milestones.last,
          )
        : widget.milestones.last;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Scrubbed Inspector Floating Banner
        Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: const Color(0xFF161F30),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFF1E293B)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'YEAR ${scrubbedData.year} MILESTONE',
                    style: const TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF94A3B8),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    CurrencyFormatter.format(
                      scrubbedData.rebalancedGrowth,
                      currency: widget.currency,
                      compact: true,
                    ),
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF10B981),
                    ),
                  ),
                ],
              ),
              Row(
                children: [
                  _MetricPill(
                    label: 'Base',
                    color: const Color(0xFF3B82F6),
                    value: CurrencyFormatter.format(
                      scrubbedData.baselineMedian,
                      currency: widget.currency,
                      compact: true,
                    ),
                  ),
                  const SizedBox(width: 8),
                  _MetricPill(
                    label: 'Crisis',
                    color: const Color(0xFFF97316),
                    value: CurrencyFormatter.format(
                      scrubbedData.crisisYear3Shock,
                      currency: widget.currency,
                      compact: true,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        // Interactive Canvas with Scrub Gesture
        SizedBox(
          height: widget.height,
          child: GestureDetector(
            onHorizontalDragStart: (details) => _handleScrub(details.localPosition.dx),
            onHorizontalDragUpdate: (details) => _handleScrub(details.localPosition.dx),
            onHorizontalDragEnd: (_) {},
            onTapDown: (details) => _handleScrub(details.localPosition.dx),
            child: CustomPaint(
              size: Size(double.infinity, widget.height),
              painter: _MultiLinePainter(
                milestones: widget.milestones,
                scrubbedYear: _scrubbedYear,
              ),
            ),
          ),
        ),

        const SizedBox(height: 6),
        // Scrub instructions
        const Center(
          child: Text(
            'Touch & drag horizontally to inspect Year 0-10 milestones',
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: Color(0xFF64748B),
            ),
          ),
        ),
      ],
    );
  }

  void _handleScrub(double localX) {
    // Total milestones = 11 (0 to 10)
    final renderBox = context.findRenderObject() as RenderBox?;
    if (renderBox == null) return;
    final width = renderBox.size.width;

    final ratio = (localX / width).clamp(0.0, 1.0);
    final targetYear = (ratio * 10).round();

    if (targetYear != _scrubbedYear) {
      HapticFeedback.selectionClick();
      setState(() {
        _scrubbedYear = targetYear;
      });
    }
  }
}

class _MetricPill extends StatelessWidget {
  final String label;
  final Color color;
  final String value;

  const _MetricPill({
    required this.label,
    required this.color,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.3), width: 0.8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: color),
          ),
          Text(
            value,
            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Colors.white),
          ),
        ],
      ),
    );
  }
}

class _MultiLinePainter extends CustomPainter {
  final List<YearlyMilestone> milestones;
  final int? scrubbedYear;

  _MultiLinePainter({
    required this.milestones,
    required this.scrubbedYear,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (milestones.isEmpty) return;

    final padding = const EdgeInsets.fromLTRB(16, 12, 16, 24);
    final chartWidth = size.width - padding.left - padding.right;
    final chartHeight = size.height - padding.top - padding.bottom;

    // Find min and max values across all 3 curves
    double minVal = milestones.first.baselineMedian;
    double maxVal = milestones.last.rebalancedGrowth;

    for (final m in milestones) {
      if (m.crisisYear3Shock < minVal) minVal = m.crisisYear3Shock;
      if (m.rebalancedGrowth > maxVal) maxVal = m.rebalancedGrowth;
      if (m.baselineMedian > maxVal) maxVal = m.baselineMedian;
    }

    final valRange = (maxVal - minVal) > 0 ? (maxVal - minVal) : 1.0;

    double getX(int year) {
      return padding.left + (year / 10.0) * chartWidth;
    }

    double getY(double val) {
      final normalized = (val - minVal) / valRange;
      return padding.top + (1.0 - normalized) * chartHeight;
    }

    // Grid Lines (horizontal)
    final gridPaint = Paint()
      ..color = const Color(0xFF1E293B)
      ..strokeWidth = 1.0;

    for (int i = 0; i <= 3; i++) {
      final y = padding.top + (i / 3.0) * chartHeight;
      canvas.drawLine(Offset(padding.left, y), Offset(size.width - padding.right, y), gridPaint);
    }

    // Paths
    final rebalPath = Path();
    final basePath = Path();
    final crisisPath = Path();

    for (int i = 0; i < milestones.length; i++) {
      final m = milestones[i];
      final x = getX(m.year);
      final yRebal = getY(m.rebalancedGrowth);
      final yBase = getY(m.baselineMedian);
      final yCrisis = getY(m.crisisYear3Shock);

      if (i == 0) {
        rebalPath.moveTo(x, yRebal);
        basePath.moveTo(x, yBase);
        crisisPath.moveTo(x, yCrisis);
      } else {
        rebalPath.lineTo(x, yRebal);
        basePath.lineTo(x, yBase);
        crisisPath.lineTo(x, yCrisis);
      }
    }

    // Draw Crisis Path (Orange)
    final crisisPaint = Paint()
      ..color = const Color(0xFFF97316)
      ..strokeWidth = 2.0
      ..style = PaintingStyle.stroke;
    canvas.drawPath(crisisPath, crisisPaint);

    // Draw Baseline Path (Blue, semi-transparent)
    final basePaint = Paint()
      ..color = const Color(0xFF3B82F6).withOpacity(0.85)
      ..strokeWidth = 1.8
      ..style = PaintingStyle.stroke;
    canvas.drawPath(basePath, basePaint);

    // Draw Rebalanced Path (Emerald Green, hero thickness)
    final rebalPaint = Paint()
      ..color = const Color(0xFF10B981)
      ..strokeWidth = 2.8
      ..style = PaintingStyle.stroke;
    canvas.drawPath(rebalPath, rebalPaint);

    // X Axis Labels (Yr 0, Yr 3, Yr 5, Yr 10)
    final textStyle = const TextStyle(
      color: Color(0xFF64748B),
      fontSize: 9.5,
      fontWeight: FontWeight.bold,
    );

    for (final yr in [0, 3, 5, 10]) {
      final textSpan = TextSpan(text: 'Yr $yr', style: textStyle);
      final textPainter = TextPainter(
        text: textSpan,
        textDirection: TextDirection.ltr,
      )..layout();
      textPainter.paint(
        canvas,
        Offset(getX(yr) - textPainter.width / 2, size.height - 18),
      );
    }

    // Scrub Indicator Crosshair
    if (scrubbedYear != null) {
      final scrubX = getX(scrubbedYear!);
      final scrubLinePaint = Paint()
        ..color = Colors.white.withOpacity(0.6)
        ..strokeWidth = 1.2;

      canvas.drawLine(
        Offset(scrubX, padding.top),
        Offset(scrubX, padding.top + chartHeight),
        scrubLinePaint,
      );

      final scrubM = milestones.firstWhere((m) => m.year == scrubbedYear!);
      final yDot = getY(scrubM.rebalancedGrowth);

      final dotPaint = Paint()..color = const Color(0xFF10B981);
      final ringPaint = Paint()
        ..color = Colors.white
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.0;

      canvas.drawCircle(Offset(scrubX, yDot), 5.0, dotPaint);
      canvas.drawCircle(Offset(scrubX, yDot), 5.0, ringPaint);
    }
  }

  @override
  bool shouldRepaint(covariant _MultiLinePainter oldDelegate) =>
      oldDelegate.scrubbedYear != scrubbedYear || oldDelegate.milestones != milestones;
}
