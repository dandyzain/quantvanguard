import { PrismaClient, AssetCode, StrategyName, RebalanceMode } from '@prisma/client';
import Decimal from 'decimal.js';

const prisma = new PrismaClient();

export const DEMO_USER_ID = 'demo-user-recruiter-uuid';
export const DEMO_PORTFOLIO_ID = 'demo-portfolio-uuid';

export async function seedDemoPortfolio() {
  console.log('[QuantVanguard] Seeding Recruiter Guest Demo Portfolio...');

  // 1. Clean existing demo data if any
  try {
    await prisma.user.deleteMany({
      where: { email: 'recruiter-demo@quantvanguard.internal' },
    });
  } catch (e) {
    // ignore if table empty or doesn't exist
  }

  // 2. Create Demo User
  const demoUser = await prisma.user.create({
    data: {
      id: DEMO_USER_ID,
      email: 'recruiter-demo@quantvanguard.internal',
      name: 'Recruiter Guest Portfolio',
      isDemoUser: true,
    },
  });

  // 3. Create Balanced Liquid-Core Risk Profile
  await prisma.riskProfile.create({
    data: {
      userId: demoUser.id,
      capacityScore: new Decimal('68.75'),
      toleranceScore: new Decimal('69.75'),
      strategyName: StrategyName.BALANCED_LIQUID_CORE,
      emergencyFundMonths: new Decimal('8.00'),
      monthlySavingsRatio: new Decimal('0.3500'),
      investmentHorizonYears: 12,
      incomeStabilityScore: 80,
      crashReactionScore: 75,
      volatilityComfortScore: 70,
      experienceYears: 6,
      targetAllocations: {
        MMF_IDR: 0.4,
        ETF_VOO: 0.2,
        GOLD_XAU: 0.2,
        CRYPTO_BTC: 0.2,
      },
      geminiDiagnosis: {
        dominant_bias: 'Pragmatic Opportunism with Calculated Risk Acceptance',
        stress_resilience: 'High psychological stamina. Treats -25% market drops as buying opportunities.',
        capacity_vs_tolerance_delta: 'Harmonious Equilibrium (+1.0): Financial runway and psychological nerve are balanced.',
        blindspots: [
          'Unchecked crypto drift during sustained bull market cycles',
          'Cash drag in MMF if equity valuations rebound faster than planned',
        ],
        execution_rules: [
          'Enforce Zero-Sell Inflow Rebalancing every month using salary savings',
          'Trigger full rebalance liquidation only when Bitcoin drift exceeds +7.0%',
          'Maintain minimum 6-9 months non-discretionary expenses in MMF_IDR at all times',
        ],
      },
    },
  });

  // 4. Create Primary Demo Portfolio (Rp 150,000,000 total)
  const portfolio = await prisma.portfolio.create({
    data: {
      id: DEMO_PORTFOLIO_ID,
      userId: demoUser.id,
      name: 'Primary Wealth Portfolio (Recruiter Demo)',
      baseCurrency: 'IDR',
      monthlyExpenses: new Decimal('12500000.00'),
    },
  });

  // 5. Create 4 Asset Holdings with +7.33% BTC drift alert active
  // MMF: 52.5M (35%)
  // VOO: 29.5M (19.67%)
  // Gold: 27.0M (18%)
  // BTC: 41.0M (27.33% -> +7.33% drift alert)
  await prisma.assetHolding.createMany({
    data: [
      {
        portfolioId: portfolio.id,
        assetCode: AssetCode.MMF_IDR,
        units: new Decimal('52500000.0000'),
        currentPrice: new Decimal('1.0000'),
        costBasisPrice: new Decimal('1.0000'),
        currency: 'IDR',
      },
      {
        portfolioId: portfolio.id,
        assetCode: AssetCode.ETF_VOO,
        units: new Decimal('3.7383'),
        currentPrice: new Decimal('7891250.0000'), // ~ $497.87 * 15,850
        costBasisPrice: new Decimal('6900000.0000'),
        currency: 'IDR',
      },
      {
        portfolioId: portfolio.id,
        assetCode: AssetCode.GOLD_XAU,
        units: new Decimal('18.0682'),
        currentPrice: new Decimal('1494338.0000'), // ~ Rp 1.494M/gram
        costBasisPrice: new Decimal('1320000.0000'),
        currency: 'IDR',
      },
      {
        portfolioId: portfolio.id,
        assetCode: AssetCode.CRYPTO_BTC,
        units: new Decimal('0.02758124'), // 8 decimal places
        currentPrice: new Decimal('1486518000.0000'), // ~ $93,786 * 15,850
        costBasisPrice: new Decimal('980000000.0000'),
        currency: 'IDR',
      },
    ],
  });

  // 6. Create 12 Months of Historical Snapshots
  const months = [
    { date: '2025-12-01', val: '120000000.00', cost: '115000000.00' },
    { date: '2026-01-01', val: '122500000.00', cost: '117000000.00' },
    { date: '2026-02-01', val: '124800000.00', cost: '118500000.00' },
    { date: '2026-03-01', val: '127200000.00', cost: '120000000.00' },
    { date: '2026-04-01', val: '129500000.00', cost: '121500000.00' },
    { date: '2026-05-01', val: '133000000.00', cost: '123000000.00' },
    { date: '2026-06-01', val: '135500000.00', cost: '124000000.00' },
    { date: '2026-07-01', val: '138200000.00', cost: '125000000.00' },
    { date: '2026-08-01', val: '141000000.00', cost: '126000000.00' },
    { date: '2026-09-01', val: '143800000.00', cost: '127000000.00' },
    { date: '2026-10-01', val: '146500000.00', cost: '128000000.00' },
    { date: '2026-11-01', val: '150000000.00', cost: '128500000.00' },
  ];

  for (const m of months) {
    await prisma.historicalSnapshot.create({
      data: {
        portfolioId: portfolio.id,
        snapshotDate: new Date(m.date),
        totalValueIdr: new Decimal(m.val),
        totalCostBasis: new Decimal(m.cost),
        usdIdrRate: new Decimal('15850.00'),
        breakdown: {
          note: 'Systematic monthly snapshot',
        },
      },
    });
  }

  console.log('[QuantVanguard] Seed completed successfully!');
}

seedDemoPortfolio()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
