import { PrismaClient } from '@prisma/client';
import { TargetAllocations, GeminiDiagnosis, AssetCode, StrategyName } from './types';
import { verifySessionToken } from './auth';

// Declare global Prisma instance to prevent multiple client instances in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Institutional In-Memory State Store & Multi-Tenant Registry
 * Guarantees zero-latency, reliable public multi-user operations,
 * and maintains seamless fallback for recruiter guest demo.
 */
export interface UserState {
  user: {
    id: string;
    email: string;
    name: string;
    isDemoUser: boolean;
  };
  portfolio: {
    id: string;
    name: string;
    baseCurrency: string;
    monthlyExpenses: number;
    usdIdrRate: number;
  };
  riskProfile: {
    capacityScore: number;
    toleranceScore: number;
    strategyName: StrategyName;
    targetAllocations: TargetAllocations;
    geminiDiagnosis: GeminiDiagnosis;
  };
  holdings: Array<{
    assetCode: AssetCode;
    name: string;
    units: number;
    currentPrice: number;
    costBasisPrice: number;
    currency: string;
  }>;
  historicalSnapshots: Array<{
    date: string;
    totalValue: number;
    totalCostBasis: number;
  }>;
}

export type DemoStoreState = UserState;

export function createInitialDemoState(): UserState {
  return {
    user: {
      id: 'demo-user-recruiter-uuid',
      email: 'recruiter-demo@quantvanguard.internal',
      name: 'Recruiter Guest Portfolio',
      isDemoUser: true,
    },
    portfolio: {
      id: 'demo-portfolio-uuid',
      name: 'Primary Wealth Portfolio (Recruiter Demo)',
      baseCurrency: 'IDR',
      monthlyExpenses: 12500000,
      usdIdrRate: 15850.0,
    },
    riskProfile: {
      capacityScore: 68.75,
      toleranceScore: 69.75,
      strategyName: 'BALANCED_LIQUID_CORE',
      targetAllocations: {
        MMF_IDR: 0.4,
        ETF_VOO: 0.2,
        GOLD_XAU: 0.2,
        CRYPTO_BTC: 0.2,
      },
      geminiDiagnosis: {
        dominant_bias: 'Pragmatic Barbell Opportunism with Calculated Risk Acceptance',
        stress_resilience: 'High psychological stamina. Views -20% to -30% market crashes as buying windows.',
        capacity_vs_tolerance_delta: 'Harmonious Equilibrium (+1.0): Financial runway and psychological nerve are balanced.',
        blindspots: [
          'Potential rebalancing procrastination when high-beta assets (BTC) expand rapidly',
          'Currency FX volatility fluctuations between USD (VOO) and IDR functional currency',
        ],
        execution_rules: [
          'Enforce Zero-Sell Inflow Rebalancing every month using salary savings',
          'Trigger full rebalance liquidation only when Bitcoin drift exceeds +7.0%',
          'Maintain minimum 6-9 months non-discretionary expenses in MMF_IDR at all times',
        ],
      },
    },
    holdings: [
      {
        assetCode: 'MMF_IDR',
        name: 'Money Market Fund (RDPU)',
        units: 52500000.0,
        currentPrice: 1.0,
        costBasisPrice: 1.0,
        currency: 'IDR',
      },
      {
        assetCode: 'ETF_VOO',
        name: 'Vanguard S&P 500 ETF',
        units: 3.7383,
        currentPrice: 7891250.0,
        costBasisPrice: 6900000.0,
        currency: 'IDR',
      },
      {
        assetCode: 'GOLD_XAU',
        name: 'Physical / Digital Gold',
        units: 18.0682,
        currentPrice: 1494338.0,
        costBasisPrice: 1320000.0,
        currency: 'IDR',
      },
      {
        assetCode: 'CRYPTO_BTC',
        name: 'Bitcoin Digital Reserve',
        units: 0.02758124,
        currentPrice: 1486518000.0,
        costBasisPrice: 980000000.0,
        currency: 'IDR',
      },
    ],
    historicalSnapshots: [
      { date: '2025-12-01', totalValue: 120000000, totalCostBasis: 115000000 },
      { date: '2026-01-01', totalValue: 122500000, totalCostBasis: 117000000 },
      { date: '2026-02-01', totalValue: 124800000, totalCostBasis: 118500000 },
      { date: '2026-03-01', totalValue: 127200000, totalCostBasis: 120000000 },
      { date: '2026-04-01', totalValue: 129500000, totalCostBasis: 121500000 },
      { date: '2026-05-01', totalValue: 133000000, totalCostBasis: 123000000 },
      { date: '2026-06-01', totalValue: 135500000, totalCostBasis: 124000000 },
      { date: '2026-07-01', totalValue: 138200000, totalCostBasis: 125000000 },
      { date: '2026-08-01', totalValue: 141000000, totalCostBasis: 126000000 },
      { date: '2026-09-01', totalValue: 143800000, totalCostBasis: 127000000 },
      { date: '2026-10-01', totalValue: 146500000, totalCostBasis: 128000000 },
      { date: '2026-11-01', totalValue: 150000000, totalCostBasis: 128500000 },
    ],
  };
}

export function createInitialUserState(userId: string, email: string, name: string): UserState {
  return {
    user: {
      id: userId,
      email,
      name,
      isDemoUser: false,
    },
    portfolio: {
      id: `port-${userId}`,
      name: `Portofolio ${name}`,
      baseCurrency: 'IDR',
      monthlyExpenses: 0,
      usdIdrRate: 15850.0,
    },
    riskProfile: {
      capacityScore: 0,
      toleranceScore: 0,
      strategyName: 'DEFENSIVE_LIQUIDITY_FIRST',
      targetAllocations: {
        MMF_IDR: 0.7,
        GOLD_XAU: 0.15,
        ETF_VOO: 0.15,
        CRYPTO_BTC: 0.0,
      },
      geminiDiagnosis: {
        dominant_bias: 'Akun Baru Siap Diisi (Fresh Portfolio)',
        stress_resilience: 'Silakan isi survei profil risiko AI atau tambahkan aset pertama Anda.',
        capacity_vs_tolerance_delta: 'Titik Awal (Baseline): Belum ada aset yang dialokasikan.',
        blindspots: [
          'Tambahkan aset pertama Anda di menu Overview Dashboard',
          'Tentukan dana darurat likuid di kuesioner AI Profiler',
        ],
        execution_rules: [
          'Mulai dengan alokasi kas/reksa dana pasar uang sebagai jangkar likuiditas',
          'Lakukan diversifikasi bertahap sesuai profil toleransi risiko Anda',
        ],
      },
    },
    holdings: [],
    historicalSnapshots: [
      {
        date: new Date().toISOString().split('T')[0],
        totalValue: 0,
        totalCostBasis: 0,
      },
    ],
  };
}

// Global multi-tenant store
interface GlobalMultiUserStore {
  demoState: UserState;
  userStates: Map<string, UserState>; // userId -> UserState
}

const globalMultiStore = globalThis as unknown as {
  quantvanguardMultiStore?: GlobalMultiUserStore;
};

if (!globalMultiStore.quantvanguardMultiStore) {
  globalMultiStore.quantvanguardMultiStore = {
    demoState: createInitialDemoState(),
    userStates: new Map(),
  };
}

const multiStore = globalMultiStore.quantvanguardMultiStore;

export function resetDemoStore(): UserState {
  multiStore.demoState = createInitialDemoState();
  return multiStore.demoState;
}

/**
 * Accessor for demo store to maintain 100% backward compatibility
 */
export const inMemoryStore: UserState = new Proxy({} as UserState, {
  get(_target, prop) {
    return (multiStore.demoState as any)[prop];
  },
  set(_target, prop, value) {
    (multiStore.demoState as any)[prop] = value;
    return true;
  },
});

/**
 * Get or create UserState for a specific user ID
 */
export function getUserState(userId: string, email = '', name = ''): UserState {
  if (!userId || userId === 'demo-user-recruiter-uuid') {
    return multiStore.demoState;
  }

  let state = multiStore.userStates.get(userId);
  if (!state) {
    state = createInitialUserState(userId, email, name || 'Investor');
    multiStore.userStates.set(userId, state);
  }
  return state;
}

/**
 * Extract active UserState from Request headers (Authorization: Bearer <token>)
 */
export function getUserStateFromRequest(request: Request): UserState {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token || token.startsWith('demo-session-token')) {
    return multiStore.demoState;
  }

  const sessionUser = verifySessionToken(token);
  if (!sessionUser || sessionUser.isDemoUser) {
    return multiStore.demoState;
  }

  return getUserState(sessionUser.id, sessionUser.email, sessionUser.name);
}

/**
 * Add an asset holding to a user's portfolio
 */
export function addHoldingToUserState(
  state: UserState,
  holding: {
    assetCode: string;
    name: string;
    units: number;
    currentPrice: number;
    costBasisPrice: number;
    currency?: string;
  }
): void {
  const existingIdx = state.holdings.findIndex((h) => h.assetCode === holding.assetCode);
  if (existingIdx >= 0) {
    const existing = state.holdings[existingIdx];
    const newUnits = existing.units + holding.units;
    const totalCost = (existing.units * existing.costBasisPrice) + (holding.units * holding.costBasisPrice);
    const newCostBasis = newUnits > 0 ? totalCost / newUnits : holding.costBasisPrice;

    state.holdings[existingIdx] = {
      ...existing,
      units: newUnits,
      currentPrice: holding.currentPrice || existing.currentPrice,
      costBasisPrice: newCostBasis,
    };
  } else {
    state.holdings.push({
      assetCode: holding.assetCode,
      name: holding.name,
      units: holding.units,
      currentPrice: holding.currentPrice,
      costBasisPrice: holding.costBasisPrice,
      currency: holding.currency || 'IDR',
    });

    if (state.riskProfile.targetAllocations[holding.assetCode] === undefined) {
      const currentKeys = Object.keys(state.riskProfile.targetAllocations);
      const newWeight = Math.round((1 / (currentKeys.length + 1)) * 100) / 100;
      state.riskProfile.targetAllocations[holding.assetCode] = newWeight;
    }
  }
}

/**
 * Remove an asset holding from a user's portfolio
 */
export function removeHoldingFromUserState(state: UserState, assetCode: string): boolean {
  const idx = state.holdings.findIndex((h) => h.assetCode === assetCode);
  if (idx >= 0) {
    state.holdings.splice(idx, 1);
    delete state.riskProfile.targetAllocations[assetCode];
    return true;
  }
  return false;
}
