export type CanonicalAssetCode = 'MMF_IDR' | 'ETF_VOO' | 'GOLD_XAU' | 'CRYPTO_BTC';
export type AssetCode = CanonicalAssetCode | (string & {});

export type StrategyName =
  | 'DEFENSIVE_LIQUIDITY_FIRST'
  | 'CONSERVATIVE_CAPITAL_PRESERVER'
  | 'BALANCED_LIQUID_CORE'
  | 'GROWTH_ACCUMULATOR'
  | 'AGGRESSIVE_ASYMMETRIC_ALPHA';

export type RebalanceMode = 'FULL' | 'ZERO_SELL_INFLOW';

export interface TargetAllocations {
  MMF_IDR: number;
  ETF_VOO: number;
  GOLD_XAU: number;
  CRYPTO_BTC: number;
  [key: string]: number;
}

export interface UserSessionDto {
  id: string;
  name: string;
  email: string;
  isDemoUser: boolean;
  createdAt?: string;
}

export interface AuthResponseData {
  user: UserSessionDto;
  token: string;
  portfolioId: string;
  activeDriftAlert?: boolean;
  driftSummary?: any;
  message?: string;
}

export interface RiskSurveyInput {
  userId?: string;
  // Core 7 baseline inputs
  emergencyFundMonths: number;
  monthlySavingsRatio: number;
  investmentHorizonYears: number;
  incomeStabilityScore: number;
  crashReactionScore: number;
  volatilityComfortScore: number;
  experienceYears: number;

  // Expanded multi-dimensional inputs (optional)
  dependentsCount?: number; // 0, 1, 2, 3, 4+
  debtToIncomeRatio?: number; // 0.0 to 0.70+
  liquidityNeedTiming?: 'LESS_THAN_1_YEAR' | '1_TO_3_YEARS' | '3_TO_5_YEARS' | 'MORE_THAN_5_YEARS';
  lossAversionSensitivity?: number; // 1 to 5 scale
  extremeDrawdownReaction?: 'PANIC_SELL_ALL' | 'PAUSE_CONTRIBUTIONS' | 'MAINTAIN_DCA' | 'AGGRESSIVE_DIP_BUY';
  financialKnowledgeLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'QUANT_EXPERT';

  // Customization & preferences
  primaryGoal?: 'CAPITAL_PRESERVATION' | 'BALANCED_GROWTH' | 'AGGRESSIVE_WEALTH_ACCUMULATION' | 'PASSIVE_DIVIDEND_INCOME';
  cryptoPreference?: 'NONE' | 'CONSERVATIVE_5' | 'MODERATE_10' | 'AGGRESSIVE_20';
  customTargetAllocations?: Partial<TargetAllocations>;
  userNotesOrGuidance?: string;
}

export interface GeminiDiagnosis {
  dominant_bias: string;
  stress_resilience: string;
  capacity_vs_tolerance_delta: string;
  blindspots: string[];
  execution_rules: string[];
  custom_guidance?: string;
  suitability_verdict?: string;
}

export interface RecommendedDynamicAsset {
  assetCode: string;
  name: string;
  ticker: string;
  weight: number; // e.g. 0.25 (25%)
  category: string;
  categoryLabel: string;
  role: string;
  color: string;
  expectedCagr: number;
  annualVolatility: number;
  annualYield?: number;
}

export interface CustomPortfolioHoldingInput {
  assetCode: string;
  weight: number; // e.g. 0.25 (25%) or 25
  ticker?: string;
  name?: string;
  category?: string;
  color?: string;
}

export interface CustomPortfolioAuditInput {
  horizonYears: number; // e.g. 5, 10, 15
  monthlyIncome: number; // in IDR
  monthlyExpenses: number; // in IDR
  portfolioCapital?: number; // initial/simulated capital in IDR
  primaryGoal:
    | 'CAPITAL_PRESERVATION'
    | 'BALANCED_GROWTH'
    | 'AGGRESSIVE_WEALTH_ACCUMULATION'
    | 'PASSIVE_DIVIDEND_INCOME';
  userNotes?: string;
  holdings: CustomPortfolioHoldingInput[];
}

export interface CustomPortfolioAuditOutput {
  healthScore: number; // 0-100
  healthStatus: 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION' | 'CRITICAL_RISK';
  summaryVerdict: string;
  strengths: string[];
  weaknesses: string[];
  horizonAlignmentVerdict: string;
  incomeCashflowVerdict: string;
  recommendations: string[];
  metrics: {
    expectedCagr: number;
    annualVolatility: number;
    estimatedMonthlyPassiveIncome: number;
    estimatedAnnualPassiveIncome: number;
    maxDrawdownStressEstimate: number;
    liquidityBufferMonths: number;
    sharpeRatioEstimate: number;
  };
  normalizedHoldings: Array<{
    assetCode: string;
    ticker: string;
    name: string;
    weight: number;
    category: string;
    categoryLabel: string;
    color: string;
    annualYield?: number;
    expectedCagr: number;
    annualVolatility: number;
  }>;
}

export interface RiskProfileOutput {
  capacityScore: number;
  toleranceScore: number;
  strategyName: StrategyName;
  targetAllocations: TargetAllocations;
  recommendedAllocations?: TargetAllocations;
  dynamicAssets?: RecommendedDynamicAsset[];
  geminiDiagnosis: GeminiDiagnosis;
  isCustomized?: boolean;
  guardrailViolations?: string[];
}

export interface AssetHoldingDto {
  assetCode: AssetCode;
  name: string;
  units: number;
  currentPrice: number;
  currentValue: number;
  costBasisPrice: number;
  currentWeight: number;
  targetWeight: number;
  drift: number;
  isAlertTriggered: boolean;
}

export interface PortfolioDto {
  portfolioId: string;
  baseCurrency: string;
  displayCurrency: string;
  usdIdrRate: number;
  totalValue: number;
  totalCostBasis: number;
  unrealizedGainNominal: number;
  unrealizedGainPercentage: number;
  monthlyExpenses: number;
  activeDriftAlert: boolean;
  holdings: AssetHoldingDto[];
  historicalSnapshots?: Array<{
    date: string;
    totalValue: number;
    totalCostBasis: number;
  }>;
}

export interface RebalanceAction {
  assetCode: AssetCode;
  action: 'BUY' | 'SELL' | 'HOLD';
  nominalAmount: number;
  unitsDelta: number;
  unitPrice: number;
  preWeight: number;
  postWeight: number;
  targetWeight: number;
}

export interface RebalanceCalculationResult {
  mode: RebalanceMode;
  currentTotalValue: number;
  inflowAmount: number;
  projectedTotalValue: number;
  allocations: RebalanceAction[];
  zeroSellSummary?: {
    totalSold: number;
    taxDragAvoided: number;
    driftReducedFrom: number;
    driftReducedTo: number;
  };
}

export interface MacroStressTestRequest {
  portfolioId: string;
  preset?: '2008_GFC' | '2020_COVID' | '2022_BEAR' | 'CUSTOM';
  customShocks?: Partial<Record<AssetCode, number>>;
  inflationRate?: number;
}

export interface MacroStressTestResult {
  scenarioName: string;
  preShockTotalValue: number;
  postShockTotalValue: number;
  totalDrawdownPercentage: number;
  monthlyExpenses: number;
  liquidRunway: {
    mmfPostShockValue: number;
    goldPostShockValue: number;
    goldHaircutPercent: number;
    goldNetLiquidValue: number;
    totalSafeLiquidity: number;
    runwayMonths: number;
    status: 'CRITICAL_RISK' | 'MODERATE_RESILIENCE' | 'FORTRESS_BALANCE_SHEET';
    verdict: string;
  };
  assetImpacts: Array<{
    assetCode: AssetCode;
    shockPercent: number;
    valueBefore: number;
    valueAfter: number;
  }>;
}

export interface MonteCarloSimulationRequest {
  initialCapital: number;
  monthlyDcaAmount: number;
  targetAllocations: TargetAllocations;
  simulationRuns?: number;
}

export interface MonteCarloSimulationResult {
  tenYearTrajectories: Array<{
    year: number;
    baselineMedian: number;
    rebalancedGrowth: number;
    crisisYear3Shock: number;
  }>;
  lumpSumVsDca: {
    lumpSum: {
      initialInvestment: number;
      projected10YearTerminal: number;
      maxHistoricalDrawdown: number;
      effectiveCAGR: number;
    };
    dca: {
      monthlyContribution: number;
      totalPrincipalContributed: number;
      projected10YearTerminal: number;
      maxHistoricalDrawdown: number;
      effectiveCAGR: number;
    };
  };
}
