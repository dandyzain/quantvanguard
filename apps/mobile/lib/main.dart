import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/app_theme.dart';
import 'core/providers/portfolio_provider.dart';
import 'features/auth/presentation/demo_auth_screen.dart';
import 'features/portfolio/presentation/portfolio_dashboard_screen.dart';
import 'features/risk_profiler/presentation/risk_profiler_screen.dart';
import 'features/rebalancer/presentation/rebalancer_screen.dart';
import 'features/macro_simulator/presentation/macro_simulator_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: AppTheme.darkBackground,
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  runApp(
    const ProviderScope(
      child: QuantVanguardMobileApp(),
    ),
  );
}

class QuantVanguardMobileApp extends ConsumerStatefulWidget {
  const QuantVanguardMobileApp({super.key});

  @override
  ConsumerState<QuantVanguardMobileApp> createState() =>
      _QuantVanguardMobileAppState();
}

class _QuantVanguardMobileAppState extends ConsumerState<QuantVanguardMobileApp> {
  bool _isAuthenticated = false;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'QuantVanguard',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: _isAuthenticated
          ? const MainNavigationShell()
          : DemoAuthScreen(
              onAuthenticated: () {
                setState(() => _isAuthenticated = true);
              },
            ),
    );
  }
}

class MainNavigationShell extends ConsumerStatefulWidget {
  const MainNavigationShell({super.key});

  @override
  ConsumerState<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends ConsumerState<MainNavigationShell> {
  int _currentIndex = 0;

  void _navigateToTab(int index) {
    HapticFeedback.selectionClick();
    setState(() => _currentIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    final portfolioState = ref.watch(portfolioProvider);

    final screens = [
      PortfolioDashboardScreen(
        onNavigateToRebalance: () => _navigateToTab(2),
      ),
      const RiskProfilerScreen(),
      const RebalancerScreen(),
      const MacroSimulatorScreen(),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: AppTheme.darkSurface,
          border: Border(
            top: BorderSide(color: AppTheme.darkCardBorder, width: 1),
          ),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: _navigateToTab,
          backgroundColor: AppTheme.darkSurface,
          selectedItemColor: AppTheme.primaryBlue,
          unselectedItemColor: AppTheme.textMuted,
          selectedFontSize: 11,
          unselectedFontSize: 11,
          type: BottomNavigationBarType.fixed,
          elevation: 0,
          items: [
            const BottomNavigationBarItem(
              icon: Icon(Icons.dashboard_rounded, size: 22),
              activeIcon: Icon(Icons.dashboard_rounded, size: 24),
              label: 'Portfolio',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.psychology_outlined, size: 22),
              activeIcon: Icon(Icons.psychology_rounded, size: 24),
              label: 'AI Profiler',
            ),
            BottomNavigationBarItem(
              icon: Stack(
                clipBehavior: Clip.none,
                children: [
                  const Icon(Icons.scale_outlined, size: 22),
                  if (portfolioState.hasActiveDriftAlert)
                    Positioned(
                      top: -2,
                      right: -3,
                      child: Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: Color(0xFFF97316),
                          shape: BoxBoxShape.circle,
                        ),
                      ),
                    ),
                ],
              ),
              activeIcon: const Icon(Icons.scale_rounded, size: 24),
              label: 'Rebalancer',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.shield_outlined, size: 22),
              activeIcon: Icon(Icons.shield_rounded, size: 24),
              label: 'Crisis Lab',
            ),
          ],
        ),
      ),
    );
  }
}
