import 'dart:math';
import 'package:flutter/material.dart';

class AssetWeightData {
  final String code;
  final String name;
  final double currentWeight;
  final double targetWeight;
  final Color color;

  AssetWeightData({
    required this.code,
    required this.name,
    required this.currentWeight,
    required this.targetWeight,
    required this.color,
  });

  double get drift => currentWeight - targetWeight;
}

class AllocationDriftDonutChart extends StatelessWidget {
  final List<AssetWeightData> assets;
  final double totalValue;
  final String formattedTotal;
  final double size;

  const AllocationDriftDonutChart({
    super.key,
    required this.assets,
    required this.totalValue,
    required this.formattedTotal,
    this.size = 220,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SizedBox(
        width: size,
        height: size,
        child: Stack(
          alignment: Alignment.center,
          children: [
            CustomPaint(
              size: Size(size, size),
              painter: _DualRingDonutPainter(assets: assets),
            ),
            // Center info pill
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'NET WORTH',
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF64748B),
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  formattedTotal,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 2),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF97316).withOpacity(0.15),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: const Color(0xFFF97316).withOpacity(0.4),
                      width: 0.8,
                    ),
                  ),
                  child: const Text(
                    '+7.3% BTC Drift',
                    style: TextStyle(
                      fontSize: 8.5,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFFF97316),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _DualRingDonutPainter extends CustomPainter {
  final List<AssetWeightData> assets;

  _DualRingDonutPainter({required this.assets});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final outerRadius = size.width / 2 - 8;
    final outerStroke = 14.0;
    final innerRadius = outerRadius - outerStroke - 6;
    final innerStroke = 7.0;

    // 1. Draw Background Track Rings
    final trackPaint = Paint()
      ..color = const Color(0xFF1E293B).withOpacity(0.4)
      ..style = PaintingStyle.stroke;

    canvas.drawCircle(center, outerRadius, trackPaint..strokeWidth = outerStroke);
    canvas.drawCircle(center, innerRadius, trackPaint..strokeWidth = innerStroke);

    // 2. Draw Outer Ring: Actual Allocation Weights
    double startAngleOuter = -pi / 2;
    for (final asset in assets) {
      final sweepAngle = (asset.currentWeight) * 2 * pi;
      final outerPaint = Paint()
        ..color = asset.color
        ..style = PaintingStyle.stroke
        ..strokeWidth = outerStroke
        ..strokeCap = StrokeCap.butt;

      // Small spacing gap
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: outerRadius),
        startAngleOuter + 0.02,
        max(0.01, sweepAngle - 0.04),
        false,
        outerPaint,
      );
      startAngleOuter += sweepAngle;
    }

    // 3. Draw Inner Ring: Target Guardrail Weights
    double startAngleInner = -pi / 2;
    for (final asset in assets) {
      final sweepAngle = (asset.targetWeight) * 2 * pi;
      final innerPaint = Paint()
        ..color = asset.color.withOpacity(0.55)
        ..style = PaintingStyle.stroke
        ..strokeWidth = innerStroke
        ..strokeCap = StrokeCap.butt;

      canvas.drawArc(
        Rect.fromCircle(center: center, radius: innerRadius),
        startAngleInner + 0.02,
        max(0.01, sweepAngle - 0.04),
        false,
        innerPaint,
      );
      startAngleInner += sweepAngle;
    }
  }

  @override
  bool shouldRepaint(covariant _DualRingDonutPainter oldDelegate) => true;
}
