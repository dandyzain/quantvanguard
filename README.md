# QuantVanguard

**Cross-Platform Wealthtech & Multi-Asset Portfolio Management Platform**
*Multi-Asset Portfolio Rebalancer, AI Risk Profiler & Macro Stress-Test Simulator*

---

## Workspace Structure
```
quantvanguard/
├── docs/
│   └── SPEC.md               # Definitive System Spec, Prisma Schema, Math Engine & REST API
├── apps/
│   ├── web/                  # Next.js 15 (App Router, Tailwind CSS, shadcn/ui, Recharts, Prisma, Gemini SDK)
│   │   ├── prisma/
│   │   │   └── schema.prisma # PostgreSQL Schema for Multi-Asset Holdings & Rebalances
│   │   └── src/
│   │       ├── app/api/v1/   # Shared REST API for Web & Mobile (/auth/demo, /risk, /rebalance, /simulator)
│   │       ├── components/   # Modular UI Components (Dashboard, Risk, Rebalancer, Simulator)
│   │       └── lib/          # Pure Calculation Engines & Types (Decimal.js)
│   └── mobile/               # Flutter 3.x (Clean Architecture, Riverpod, Drift SQLite, Dio, CustomPainter)
│       ├── pubspec.yaml
│       └── lib/
│           ├── core/         # Network, Offline DB (Drift), Theme, Utils (Decimal, Currency)
│           ├── features/     # Auth, Portfolio, Risk Profiler, Rebalancer, Macro Simulator, Monte Carlo
│           └── shared/       # Reusable Canvas Charts & UI Primitives
├── package.json              # Monorepo Workspace Config
└── README.md
```

## Quick Start
1. **Specification**: Review comprehensive architecture and formulas in `docs/SPEC.md`.
2. **Web App**:
   ```bash
   cd apps/web
   npm install
   npm run dev
   ```
3. **Mobile App**:
   ```bash
   cd apps/mobile
   flutter pub get
   flutter run
   ```
