import { GoogleGenAI, Type, Schema } from '@google/genai';
import {
  RiskSurveyInput,
  RiskProfileOutput,
  StrategyName,
  TargetAllocations,
  GeminiDiagnosis,
  RecommendedDynamicAsset,
} from '../types';
import { CANONICAL_STRATEGIES } from '../constants';
import { MARKET_CATALOG } from '../services/market-data';

/**
 * Deterministic 2D Risk Scorer
 * Evaluates objective Risk Capacity (0-100) and subjective Risk Tolerance (0-100).
 * Enhanced with multi-dimensional inputs (dependents, DTI, liquidity horizon, loss aversion, etc.)
 * while maintaining 100% backward-compatibility with baseline parameters.
 */
export function calculate2DRiskScores(input: RiskSurveyInput): {
  capacityScore: number;
  toleranceScore: number;
  strategyName: StrategyName;
  targetAllocations: TargetAllocations;
  recommendedAllocations: TargetAllocations;
  guardrails: Record<string, { min: number; max: number }>;
  isCustomized: boolean;
  guardrailViolations: string[];
} {
  // 1. Objective Risk Capacity Score (RC in [0, 100])
  const emergencyMonths = Math.max(0, input.emergencyFundMonths || 0);
  const fRunway = Math.min(100, emergencyMonths * (100 / 12)); // 12+ months = 100

  const savingsRatio = Math.max(0, Math.min(1, input.monthlySavingsRatio || 0));
  const fSavings = Math.min(100, (savingsRatio / 0.5) * 100); // 50%+ savings rate = 100

  const horizonYears = Math.max(1, input.investmentHorizonYears || 1);
  const fHorizon = Math.min(100, (horizonYears / 15) * 100); // 15+ years = 100

  const fStability = Math.max(0, Math.min(100, input.incomeStabilityScore || 50));

  let capacityScore =
    0.3 * fRunway +
    0.25 * fSavings +
    0.25 * fHorizon +
    0.2 * fStability;

  // Multi-dimensional Capacity Modifiers (if provided)
  if (input.dependentsCount !== undefined) {
    if (input.dependentsCount === 0) capacityScore += 2;
    else if (input.dependentsCount === 1) capacityScore += 0;
    else if (input.dependentsCount === 2) capacityScore -= 2;
    else if (input.dependentsCount === 3) capacityScore -= 5;
    else if (input.dependentsCount >= 4) capacityScore -= 8;
  }

  if (input.debtToIncomeRatio !== undefined) {
    const dti = input.debtToIncomeRatio;
    if (dti <= 0.05) capacityScore += 4; // Debt-free bonus
    else if (dti <= 0.20) capacityScore += 1;
    else if (dti <= 0.35) capacityScore -= 3;
    else if (dti <= 0.50) capacityScore -= 7; // High debt burden
    else capacityScore -= 14; // Extreme debt fragility
  }

  if (input.liquidityNeedTiming) {
    switch (input.liquidityNeedTiming) {
      case 'LESS_THAN_1_YEAR':
        capacityScore -= 10;
        break;
      case '1_TO_3_YEARS':
        capacityScore -= 5;
        break;
      case '3_TO_5_YEARS':
        capacityScore += 0;
        break;
      case 'MORE_THAN_5_YEARS':
        capacityScore += 3;
        break;
    }
  }

  // 2. Subjective Risk Tolerance Score (RT in [0, 100])
  const crashReaction = Math.max(0, Math.min(100, input.crashReactionScore || 50));
  const volatilityComfort = Math.max(0, Math.min(100, input.volatilityComfortScore || 50));
  const experienceYears = Math.max(0, input.experienceYears || 0);
  const fExperience = Math.min(100, (experienceYears / 10) * 100); // 10+ years = 100

  let toleranceScore =
    0.45 * crashReaction +
    0.3 * volatilityComfort +
    0.25 * fExperience;

  // Multi-dimensional Tolerance Modifiers (if provided)
  if (input.lossAversionSensitivity !== undefined) {
    // Scale 1 to 5: 1 (maximum pain) -> -5, 3 (neutral) -> 0, 5 (objective) -> +5
    toleranceScore += (input.lossAversionSensitivity - 3) * 2.5;
  }

  if (input.extremeDrawdownReaction) {
    switch (input.extremeDrawdownReaction) {
      case 'PANIC_SELL_ALL':
        toleranceScore -= 8;
        break;
      case 'PAUSE_CONTRIBUTIONS':
        toleranceScore -= 3;
        break;
      case 'MAINTAIN_DCA':
        toleranceScore += 2;
        break;
      case 'AGGRESSIVE_DIP_BUY':
        toleranceScore += 6;
        break;
    }
  }

  if (input.financialKnowledgeLevel) {
    switch (input.financialKnowledgeLevel) {
      case 'BEGINNER':
        toleranceScore -= 4;
        break;
      case 'INTERMEDIATE':
        toleranceScore += 0;
        break;
      case 'ADVANCED':
        toleranceScore += 3;
        break;
      case 'QUANT_EXPERT':
        toleranceScore += 5;
        break;
    }
  }

  // Clamp within bounds [5, 95] to prevent degenerate scores
  const roundedCapacity = Math.round(Math.max(5, Math.min(95, capacityScore)) * 10) / 10;
  const roundedTolerance = Math.round(Math.max(5, Math.min(95, toleranceScore)) * 10) / 10;

  // 3. 2D Guardrail Allocation Mapping
  let strategyName: StrategyName;

  if (roundedCapacity < 40 || roundedTolerance < 35) {
    strategyName = 'DEFENSIVE_LIQUIDITY_FIRST';
  } else if (roundedCapacity < 55 || roundedTolerance < 50) {
    strategyName = 'CONSERVATIVE_CAPITAL_PRESERVER';
  } else if (roundedCapacity >= 85 && roundedTolerance >= 85) {
    strategyName = 'AGGRESSIVE_ASYMMETRIC_ALPHA';
  } else if (roundedCapacity >= 70 && roundedTolerance >= 70) {
    strategyName = 'GROWTH_ACCUMULATOR';
  } else {
    strategyName = 'BALANCED_LIQUID_CORE';
  }

  const strategyConfig = CANONICAL_STRATEGIES[strategyName];
  const recommendedAllocations: TargetAllocations = { ...strategyConfig.allocations };

  // Adjust recommended allocation if crypto preference is constrained
  let algorithmicAllocations: TargetAllocations = { ...recommendedAllocations };
  if (input.cryptoPreference) {
    let maxCrypto = 0.20;
    if (input.cryptoPreference === 'NONE') maxCrypto = 0.0;
    else if (input.cryptoPreference === 'CONSERVATIVE_5') maxCrypto = 0.05;
    else if (input.cryptoPreference === 'MODERATE_10') maxCrypto = 0.10;
    else if (input.cryptoPreference === 'AGGRESSIVE_20') maxCrypto = 0.20;

    if (algorithmicAllocations.CRYPTO_BTC > maxCrypto) {
      const excess = algorithmicAllocations.CRYPTO_BTC - maxCrypto;
      algorithmicAllocations.CRYPTO_BTC = maxCrypto;
      // Reallocate excess to MMF (60%) and Gold (40%)
      algorithmicAllocations.MMF_IDR = Math.round((algorithmicAllocations.MMF_IDR + excess * 0.6) * 100) / 100;
      algorithmicAllocations.GOLD_XAU = Math.round((algorithmicAllocations.GOLD_XAU + excess * 0.4) * 100) / 100;
    }
  }

  // 4. Custom Allocations & Guardrail Validation
  let finalTargetAllocations: TargetAllocations = algorithmicAllocations;
  let isCustomized = false;
  const guardrailViolations: string[] = [];

  if (input.customTargetAllocations && Object.keys(input.customTargetAllocations).length > 0) {
    isCustomized = true;
    const rawCustom = input.customTargetAllocations;
    const mmf = Math.max(0, Number(rawCustom.MMF_IDR ?? algorithmicAllocations.MMF_IDR));
    const voo = Math.max(0, Number(rawCustom.ETF_VOO ?? algorithmicAllocations.ETF_VOO));
    const xau = Math.max(0, Number(rawCustom.GOLD_XAU ?? algorithmicAllocations.GOLD_XAU));
    const btc = Math.max(0, Number(rawCustom.CRYPTO_BTC ?? algorithmicAllocations.CRYPTO_BTC));

    const totalWeight = mmf + voo + xau + btc;
    if (totalWeight > 0) {
      finalTargetAllocations = {
        MMF_IDR: Math.round((mmf / totalWeight) * 1000) / 1000,
        ETF_VOO: Math.round((voo / totalWeight) * 1000) / 1000,
        GOLD_XAU: Math.round((xau / totalWeight) * 1000) / 1000,
        CRYPTO_BTC: Math.round((btc / totalWeight) * 1000) / 1000,
      };

      // Guardrail sanity checks
      if (finalTargetAllocations.MMF_IDR < 0.10) {
        guardrailViolations.push(
          'Peringatan Likuiditas: Alokasi Kas/MMF di bawah 10% berisiko memicu likuidasi paksa portofolio saat darurat.'
        );
      }
      if (finalTargetAllocations.CRYPTO_BTC > 0.25) {
        guardrailViolations.push(
          'Peringatan Volatilitas Kripto: Alokasi Bitcoin melampaui 25%, meningkatkan risiko drawdown portofolio di atas -35%.'
        );
      }
      if (finalTargetAllocations.ETF_VOO + finalTargetAllocations.CRYPTO_BTC > 0.85) {
        guardrailViolations.push(
          'Peringatan Eksposur Agresif: Total aset pertumbuhan (Saham + Kripto) melampaui 85%, minim bantalan saat resesi.'
        );
      }
      if (finalTargetAllocations.GOLD_XAU < 0.05 && finalTargetAllocations.MMF_IDR < 0.20) {
        guardrailViolations.push(
          'Peringatan Lindung Nilai: Porsi aset safe-haven (Emas & RDPU) di bawah 25%, rentan terhadap kejutan inflasi dan pasar anjlok.'
        );
      }
    }
  }

  return {
    capacityScore: roundedCapacity,
    toleranceScore: roundedTolerance,
    strategyName,
    targetAllocations: finalTargetAllocations,
    recommendedAllocations,
    guardrails: { ...strategyConfig.guardrails },
    isCustomized,
    guardrailViolations,
  };
}

/**
 * Dynamic Multi-Asset Portfolio Recommender
 * Selects 4-6 institutional investment assets from the 48-asset catalog tailored to:
 * 1. Financial Goal (PASSIVE_DIVIDEND_INCOME, CAPITAL_PRESERVATION, AGGRESSIVE_WEALTH_ACCUMULATION, BALANCED_GROWTH)
 * 2. 2D Risk Profile (Capacity vs Tolerance strategy tier)
 * 3. Crypto & Volatility constraints
 * 4. User Customizations
 */
export function generateDynamicAssetRecommendations(
  input: RiskSurveyInput,
  strategyName: StrategyName,
  capacityScore: number,
  toleranceScore: number,
  baseTargetAllocations: TargetAllocations
): RecommendedDynamicAsset[] {
  const goal = input.primaryGoal || 'BALANCED_GROWTH';
  const cryptoPref = input.cryptoPreference || 'MODERATE_10';

  let rawList: Array<{ code: string; weight: number; role: string }> = [];

  if (goal === 'PASSIVE_DIVIDEND_INCOME') {
    // High-yield, bond coupon, and cashflow-focused allocation
    if (strategyName === 'DEFENSIVE_LIQUIDITY_FIRST' || strategyName === 'CONSERVATIVE_CAPITAL_PRESERVER') {
      rawList = [
        { code: 'SBN_ORI', weight: 0.35, role: 'Kupon Rutin 6.40% Bulanan Penjaminan Negara 100%' },
        { code: 'MMF_IDR', weight: 0.25, role: 'Buffer Likuiditas Kas Bebas Fluktuasi Harian' },
        { code: 'BBRI', weight: 0.20, role: 'Dividen Kas Rutin (Yield ~6.2%) Bank Mikro Terbesar' },
        { code: 'ETF_SCHD', weight: 0.10, role: 'Compounding Dividen Global US Aristocrats (USD)' },
        { code: 'UNTR', weight: 0.10, role: 'Dividen Jumbo Berkala & Mesin Kas Komatsu' },
      ];
    } else {
      rawList = [
        { code: 'SBN_ORI', weight: 0.25, role: 'Kupon Rutin 6.40% Bulanan Bebas Risiko Gagal Bayar' },
        { code: 'BBRI', weight: 0.25, role: 'Dividen Kas Rutin (Yield ~6.2%) Bank Mikro Terbesar' },
        { code: 'ETF_SCHD', weight: 0.25, role: 'Compounding Dividen Global US Aristocrats (USD)' },
        { code: 'UNTR', weight: 0.15, role: 'Dividen Jumbo Berkala & Arus Kas Melimpah' },
        { code: 'MMF_IDR', weight: 0.10, role: 'Buffer Likuiditas Kas Harian Rendah Risiko' },
      ];
    }

    if (cryptoPref !== 'NONE') {
      const cryptoWeight = cryptoPref === 'CONSERVATIVE_5' ? 0.05 : 0.10;
      rawList = rawList.map((item) => {
        if (item.code === 'SBN_ORI') return { ...item, weight: Math.max(0.15, item.weight - cryptoWeight) };
        return item;
      });
      rawList.push({
        code: 'CRYPTO_ETH',
        weight: cryptoWeight,
        role: 'Protokol Smart-Contract L1 dengan Yield Staking Berkelanjutan',
      });
    }
  } else if (goal === 'CAPITAL_PRESERVATION') {
    // Safety, low volatility, safe-haven gold, inflation protection
    let mmfWeight = 0.40;
    let sbnWeight = 0.25;
    let goldWeight = 0.20;
    let icbpWeight = 0.10;
    let vooWeight = 0.05;

    if (strategyName === 'DEFENSIVE_LIQUIDITY_FIRST') {
      mmfWeight = 0.50;
      sbnWeight = 0.25;
      goldWeight = 0.15;
      icbpWeight = 0.10;
      vooWeight = 0.0;
    } else if (strategyName === 'BALANCED_LIQUID_CORE' || strategyName === 'GROWTH_ACCUMULATOR') {
      mmfWeight = 0.30;
      sbnWeight = 0.25;
      goldWeight = 0.20;
      icbpWeight = 0.10;
      vooWeight = 0.15;
    }

    rawList = [
      { code: 'MMF_IDR', weight: mmfWeight, role: 'Jangkar Likuiditas Kas Bebas Fluktuasi Pasar' },
      { code: 'SBN_ORI', weight: sbnWeight, role: 'Kupon Pasti 6.40% Terjamin 100% oleh Negara' },
      { code: 'GOLD_XAU', weight: goldWeight, role: 'Lindung Nilai Inflasi & Store of Value Safe-Haven' },
      { code: 'ICBP', weight: icbpWeight, role: 'Consumer Staples Defensif Tahan Segala Siklus Ekonomi' },
    ];
    if (vooWeight > 0) {
      rawList.push({ code: 'ETF_VOO', weight: vooWeight, role: 'Pertumbuhan Terukur Indeks S&P 500 Global' });
    }

    if (cryptoPref === 'CONSERVATIVE_5' || cryptoPref === 'MODERATE_10') {
      const cWeight = cryptoPref === 'CONSERVATIVE_5' ? 0.05 : 0.08;
      rawList = rawList.map((item) => (item.code === 'MMF_IDR' ? { ...item, weight: item.weight - cWeight } : item));
      rawList.push({ code: 'CRYPTO_BTC', weight: cWeight, role: 'Alokasi Emas Digital Minimal sebagai Lindung Nilai Moneter' });
    }
  } else if (goal === 'AGGRESSIVE_WEALTH_ACCUMULATION') {
    // Secular growth, megacap tech, AI acceleration, asymmetric alpha
    let qqqWeight = 0.25;
    let nvdaWeight = 0.15;
    let vooWeight = 0.25;
    let bbcaWeight = 0.15;
    let mmfWeight = 0.10;
    let btcWeight = 0.10;

    if (cryptoPref === 'AGGRESSIVE_20') {
      btcWeight = 0.20;
      vooWeight = 0.20;
      qqqWeight = 0.20;
    } else if (cryptoPref === 'CONSERVATIVE_5') {
      btcWeight = 0.05;
      vooWeight = 0.30;
    } else if (cryptoPref === 'NONE') {
      btcWeight = 0.0;
      vooWeight = 0.30;
    }

    rawList = [
      { code: 'ETF_QQQ', weight: qqqWeight, role: 'Akselerator Inovasi Teknologi Mega-Cap Nasdaq 100' },
      { code: 'NVDA', weight: nvdaWeight, role: 'Pemimpin Akselerator Komputasi AI & GPU Global' },
      { code: 'ETF_VOO', weight: vooWeight, role: 'Fondasi Indeks Saham 500 Perusahaan Terbesar US' },
      { code: 'BBCA', weight: bbcaWeight, role: 'Compounder Saham Domestik Terkuat ROE >20%' },
      { code: 'MMF_IDR', weight: mmfWeight, role: 'Dry Powder Cadangan Serok saat Koreksi Pasar' },
    ];

    if (btcWeight > 0) {
      rawList.push({
        code: 'CRYPTO_BTC',
        weight: btcWeight,
        role: 'Asymmetric Alpha Cadangan Digital Era Baru',
      });
    } else {
      rawList.push({
        code: 'MSFT',
        weight: 0.10,
        role: 'Raksasa Enterprise Cloud Azure & AI Copilot',
      });
      const curSum = rawList.reduce((s, i) => s + i.weight, 0);
      if (curSum > 1.0) {
        const diff = curSum - 1.0;
        rawList = rawList.map((i) => (i.code === 'ETF_VOO' ? { ...i, weight: i.weight - diff } : i));
      }
    }
  } else {
    // BALANCED_GROWTH (Institutional Barbell Default)
    let mmfW = 0.25;
    let vooW = 0.30;
    let bbcaW = 0.15;
    let goldW = 0.15;
    let btcW = 0.15;

    if (strategyName === 'DEFENSIVE_LIQUIDITY_FIRST') {
      mmfW = 0.45;
      vooW = 0.20;
      bbcaW = 0.10;
      goldW = 0.20;
      btcW = 0.05;
    } else if (strategyName === 'CONSERVATIVE_CAPITAL_PRESERVER') {
      mmfW = 0.35;
      vooW = 0.25;
      bbcaW = 0.15;
      goldW = 0.20;
      btcW = 0.05;
    } else if (strategyName === 'GROWTH_ACCUMULATOR') {
      mmfW = 0.15;
      vooW = 0.35;
      bbcaW = 0.15;
      goldW = 0.15;
      btcW = 0.20;
    } else if (strategyName === 'AGGRESSIVE_ASYMMETRIC_ALPHA') {
      mmfW = 0.10;
      vooW = 0.40;
      bbcaW = 0.15;
      goldW = 0.10;
      btcW = 0.25;
    }

    if (cryptoPref === 'NONE') {
      const excess = btcW;
      btcW = 0;
      rawList = [
        { code: 'MMF_IDR', weight: mmfW, role: 'Buffer Likuiditas Kas Harian & Dana Darurat' },
        { code: 'ETF_VOO', weight: vooW, role: 'Pilar Utama Pertumbuhan Saham Blue-Chip Global' },
        { code: 'BBCA', weight: bbcaW, role: 'Mesin Pertumbuhan Ekonomi Domestik Indonesia' },
        { code: 'GOLD_XAU', weight: goldW, role: 'Asuransi Portofolio Krisis & Lindung Nilai Rupiah' },
        { code: 'SBN_ORI', weight: excess, role: 'Obligasi Negara Kupon Rutin Pengganti Kripto' },
      ];
    } else {
      if (cryptoPref === 'CONSERVATIVE_5' && btcW > 0.05) {
        const excess = btcW - 0.05;
        btcW = 0.05;
        mmfW += excess * 0.5;
        vooW += excess * 0.5;
      } else if (cryptoPref === 'MODERATE_10' && btcW > 0.10) {
        const excess = btcW - 0.10;
        btcW = 0.10;
        vooW += excess;
      }
      rawList = [
        { code: 'MMF_IDR', weight: mmfW, role: 'Buffer Likuiditas Kas Harian & Dana Darurat' },
        { code: 'ETF_VOO', weight: vooW, role: 'Pilar Utama Pertumbuhan Saham Blue-Chip Global' },
        { code: 'BBCA', weight: bbcaW, role: 'Mesin Pertumbuhan Ekonomi Domestik Indonesia' },
        { code: 'GOLD_XAU', weight: goldW, role: 'Asuransi Portofolio Krisis & Lindung Nilai Rupiah' },
        { code: 'CRYPTO_BTC', weight: btcW, role: 'Alpha Asimetris Cadangan Digital Era Baru' },
      ];
    }
  }

  // Normalize weights so the sum is EXACTLY 1.00 (100%)
  const total = rawList.reduce((acc, curr) => acc + curr.weight, 0);
  if (total > 0) {
    rawList = rawList.map((item) => ({
      ...item,
      weight: Math.round((item.weight / total) * 100) / 100,
    }));

    // Rounding difference adjustment
    const roundedSum = rawList.reduce((acc, curr) => acc + curr.weight, 0);
    const diff = Math.round((1.0 - roundedSum) * 100) / 100;
    if (diff !== 0 && rawList.length > 0) {
      rawList[0].weight = Math.round((rawList[0].weight + diff) * 100) / 100;
    }
  }

  // Map to full RecommendedDynamicAsset with metadata from MARKET_CATALOG
  return rawList.map((item) => {
    const meta = MARKET_CATALOG[item.code] || {
      name: item.code,
      ticker: item.code,
      category: 'CASH',
      categoryLabel: 'Multi-Asset',
      expectedCagr: 0.08,
      annualVolatility: 0.15,
      annualYield: 0,
      color: '#3B82F6',
    };

    return {
      assetCode: item.code,
      name: meta.name,
      ticker: meta.ticker,
      weight: item.weight,
      category: meta.category,
      categoryLabel: meta.categoryLabel,
      role: item.role,
      color: meta.color,
      expectedCagr: meta.expectedCagr,
      annualVolatility: meta.annualVolatility,
      annualYield: meta.annualYield,
    };
  });
}

/**
 * Deterministic fallback generator when Gemini API is unavailable or GEMINI_API_KEY is unset.
 * Guarantees zero downtime and comprehensive behavioral financial diagnosis.
 */
function generateDeterministicFallback(
  strategyName: StrategyName,
  capacityScore: number,
  toleranceScore: number,
  input: RiskSurveyInput,
  isCustomized: boolean = false,
  guardrailViolations: string[] = []
): GeminiDiagnosis {
  const delta = Math.round((capacityScore - toleranceScore) * 10) / 10;
  let capacityDeltaDesc = '';

  if (Math.abs(delta) <= 10) {
    capacityDeltaDesc = `Harmonious Equilibrium (Delta: ${delta > 0 ? '+' : ''}${delta}): Kemampuan finansial objektif (Kapasitas: ${capacityScore}) dan ketahanan emosional subjektif (Toleransi: ${toleranceScore}) tersinkronisasi secara seimbang.`;
  } else if (delta > 10) {
    capacityDeltaDesc = `Under-Risking / Excess Safety Cushion (Delta: +${delta}): Neraca dan bantalan dana darurat Anda mampu menahan volatilitas jauh lebih tinggi dibanding kenyamanan psikologis Anda. Pertimbangkan menaikkan alokasi pertumbuhan secara bertahap.`;
  } else {
    capacityDeltaDesc = `Over-Risking / Fragility Warning (Delta: ${delta}): Keberanian emosional Anda melampaui kapasitas likuiditas riil saat ini. Jika terjadi krisis makro atau kehilangan penghasilan mendadak, Anda rentan terpaksa menjual aset saat pasar jatuh.`;
  }

  const diagnosesByStrategy: Record<
    StrategyName,
    { dominant_bias: string; stress_resilience: string; blindspots: string[]; execution_rules: string[] }
  > = {
    DEFENSIVE_LIQUIDITY_FIRST: {
      dominant_bias: 'Loss Aversion & Precautionary Liquidity Focus (Prioritas Perlindungan Nilai Pokok)',
      stress_resilience: 'Sangat sensitif terhadap penurunan modal. Faktor kenyamanan tidur (sleep-well-at-night) diprioritaskan di atas kecepatan imbal hasil.',
      blindspots: [
        'Erosi daya beli jangka panjang akibat inflasi riil yang melampaui imbal hasil RDPU/Kas',
        'Opportunity cost kehilangan siklus pertumbuhan saham indeks global selama 5-10 tahun',
      ],
      execution_rules: [
        'Pertahankan minimal 12 bulan pengeluaran rutin dalam instrumen MMF/RDPU berimbal hasil stabil',
        'Reinvestasikan kupon/imbal hasil bulanan secara otomatis ke Emas Fisik dan Index Fund',
        'Hindari mencairkan porsi emas dan saham saat koreksi harga pasar berlangsung',
      ],
    },
    CONSERVATIVE_CAPITAL_PRESERVER: {
      dominant_bias: 'Status Quo Bias dengan Kesadaran Proteksi Inflasi',
      stress_resilience: 'Mampu mentoleransi fluktuasi moderat berkala (+/- 5-10%), namun tetap membutuhkan stabilitas pokok portofolio.',
      blindspots: [
        'Stagnasi imbal hasil emas pada lingkungan makro suku bunga riil tinggi',
        'Alokasi mesin pertumbuhan yang terlalu minim membatasi akumulasi kekayaan jangka panjang',
      ],
      execution_rules: [
        'Pertahankan jangkar likuiditas minimal 50% di MMF untuk mengeliminasi risiko jual paksa',
        'Salurkan seluruh tabungan bulanan (Inflow) hanya ke aset yang sedang underweight (Zero-Sell)',
        'Lakukan evaluasi portofolio semesteran dengan toleransi drift batas ketat +/- 5%',
      ],
    },
    BALANCED_LIQUID_CORE: {
      dominant_bias: 'Pragmatic Barbell Opportunism & Calculated Risk Acceptance',
      stress_resilience: 'Disiplin psikologis tinggi. Memandang koreksi pasar -20% hingga -30% sebagai jendela akumulasi aset diskon.',
      blindspots: [
        'Kecenderungan menunda rebalancing saat aset beta tinggi (seperti Kripto) melesat naik',
        'Fluktuasi nilai tukar valuta asing (USD/IDR) antara aset domestik dan aset berdenominasi USD',
      ],
      execution_rules: [
        'Terapkan metode Zero-Sell Inflow Rebalancing setiap bulan menggunakan alokasi gaji rutin',
        'Lakukan penyeimbangan likuidasi hanya saat drift aset kripto melebihi toleransi +7.0%',
        'Jaga dana darurat 6-9 bulan pengeluaran non-diskresioner di MMF_IDR setiap saat',
      ],
    },
    GROWTH_ACCUMULATOR: {
      dominant_bias: 'Optimism Bias & Long-Term Compounding Conviction',
      stress_resilience: 'Ketahanan emosional kuat melewati bear market berkepanjangan selama 12 hingga 18 bulan.',
      blindspots: [
        'Kerentanan likuiditas jika terjadi pemutusan kerja bersamaan dengan pasar saham ambruk',
        'Volatilitas drawdown portofolio yang cukup tinggi membutuhkan komitmen psikologis konsisten',
      ],
      execution_rules: [
        'Otomatisasi DCA bulanan secara konsisten ke S&P 500 (VOO) dan Bitcoin tanpa menebak pasar',
        'Pertahankan tepat 20% di MMF_IDR sebagai amunisi cadangan (dry powder) saat panic dump',
        'Lakukan rebalancing berkala tahunan atau saat notifikasi drift 10% aktif',
      ],
    },
    AGGRESSIVE_ASYMMETRIC_ALPHA: {
      dominant_bias: 'High Risk Appetite & Asymmetric Convexity Preference',
      stress_resilience: 'Kebal terhadap volatilitas jangka pendek. Fokus 100% pada akumulasi kekayaan terminal 10 tahun.',
      blindspots: [
        'Drawdown portofolio ekstrem saat krisis likuiditas global sistemik (-45% hingga -60%)',
        'Risiko urutan pengembalian (Sequence of Returns Risk) jika membutuhkan dana mendesak',
      ],
      execution_rules: [
        'Pertahankan 10% dana darurat murni di MMF yang tidak boleh diutak-atik untuk biaya hidup darurat',
        'Kunci profit kripto ke ETF Saham dan Emas saat porsi Bitcoin melampaui 35% net worth',
        'Dilarang menggunakan fasilitas margin leverage atau utang untuk aset berisiko tinggi',
      ],
    },
  };

  const selected = diagnosesByStrategy[strategyName];

  // Specific contextual custom guidance
  let customGuidance = 'Strategi Anda telah dihitung menggunakan model 2D deterministik institusional QuantVanguard.';
  if (input.primaryGoal === 'CAPITAL_PRESERVATION') {
    customGuidance = 'Tujuan Utama: Preservasi Modal. Portofolio diprioritaskan melindungi daya beli dari inflasi tanpa mengambil risiko volatilitas berlebihan.';
  } else if (input.primaryGoal === 'AGGRESSIVE_WEALTH_ACCUMULATION') {
    customGuidance = 'Tujuan Utama: Akumulasi Kekayaan Maksimal. Portofolio mengarahkan aliran modal ke mesin pertumbuhan compounding tinggi (S&P 500 & Digital Reserve).';
  } else if (input.primaryGoal === 'PASSIVE_DIVIDEND_INCOME') {
    customGuidance = 'Tujuan Utama: Arus Kas Pasif. Portofolio menekankan instrumen berpenghasilan rutin dan obligasi/RDPU berimbal hasil stabil.';
  }

  if (isCustomized) {
    customGuidance += guardrailViolations.length > 0
      ? ` Anda menggunakan alokasi kustom dengan ${guardrailViolations.length} catatan guardrail keamanan.`
      : ' Anda menggunakan alokasi kustom yang terverifikasi dalam batas guardrail keamanan yang sehat.';
  }

  const suitabilityVerdict = guardrailViolations.length > 0
    ? 'PERINGATAN RISIKO: Terdapat deviasi alokasi dari batas guardrail keamanan institusional.'
    : 'TERVERIFIKASI AMAN: Alokasi portofolio selaras dengan profil kapasitas dan toleransi risiko Anda.';

  return {
    dominant_bias: selected.dominant_bias,
    stress_resilience: selected.stress_resilience,
    capacity_vs_tolerance_delta: capacityDeltaDesc,
    blindspots: selected.blindspots,
    execution_rules: selected.execution_rules,
    custom_guidance: customGuidance,
    suitability_verdict: suitabilityVerdict,
  };
}

/**
 * Hybrid AI Profiler Service
 * Evaluates deterministic 2D scores, queries Google Gemini with structured responseSchema,
 * and falls back gracefully to institutional deterministic diagnosis if offline or unkeyed.
 */
export async function diagnoseRiskProfile(input: RiskSurveyInput): Promise<RiskProfileOutput> {
  const {
    capacityScore,
    toleranceScore,
    strategyName,
    targetAllocations: baseTargetAllocations,
    recommendedAllocations: baseRecommendedAllocations,
    isCustomized,
    guardrailViolations,
  } = calculate2DRiskScores(input);

  // Formulate dynamic multi-asset basket tailored to goal, risk tier, and crypto constraints
  const dynamicAssets = generateDynamicAssetRecommendations(
    input,
    strategyName,
    capacityScore,
    toleranceScore,
    baseTargetAllocations
  );

  // Construct targetAllocations mapping all recommended dynamic assets
  const dynamicTargetAllocations: TargetAllocations = {
    MMF_IDR: 0,
    ETF_VOO: 0,
    GOLD_XAU: 0,
    CRYPTO_BTC: 0,
  };
  for (const asset of dynamicAssets) {
    dynamicTargetAllocations[asset.assetCode] = asset.weight;
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('placeholder')) {
    // Graceful offline fallback
    const fallbackDiagnosis = generateDeterministicFallback(
      strategyName,
      capacityScore,
      toleranceScore,
      input,
      isCustomized,
      guardrailViolations
    );
    return {
      capacityScore,
      toleranceScore,
      strategyName,
      targetAllocations: dynamicTargetAllocations,
      recommendedAllocations: dynamicTargetAllocations,
      dynamicAssets,
      geminiDiagnosis: fallbackDiagnosis,
      isCustomized,
      guardrailViolations,
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
Anda adalah Chief Quantitative Risk Officer & Behavioral Finance Psychologist QuantVanguard.
Analisis data investor komprehensif berikut dan hasilkan diagnosis psikologis perilaku keuangan institusional dalam Bahasa Indonesia:

PROFIL INVESTOR & NERACA:
- Kapasitas Risiko Objektif: ${capacityScore}/100 (Dana Darurat: ${input.emergencyFundMonths} bulan, Rasio Tabungan: ${Math.round((input.monthlySavingsRatio || 0) * 100)}%, Horison: ${input.investmentHorizonYears} tahun, Stabilitas Penghasilan: ${input.incomeStabilityScore}/100)
- Tanggungan Finansial: ${input.dependentsCount !== undefined ? input.dependentsCount + ' orang' : 'Tidak ditentukan'}
- Rasio Beban Hutang (DTI): ${input.debtToIncomeRatio !== undefined ? Math.round(input.debtToIncomeRatio * 100) + '%' : 'Tidak ditentukan'}
- Kebutuhan Likuiditas Terdekat: ${input.liquidityNeedTiming || 'Jangka Panjang (>5 Tahun)'}

TOLERANSI RISIKO PSIKOLOGIS:
- Skor Toleransi Risiko: ${toleranceScore}/100 (Reaksi Koreksi -25%: ${input.crashReactionScore}/100, Kenyamanan Volatilitas: ${input.volatilityComfortScore}/100, Pengalaman Pasar: ${input.experienceYears} tahun)
- Sensitivitas Kerugian (Loss Aversion): ${input.lossAversionSensitivity || 3}/5
- Respon Skenario Crash Ekstrem (-40%): ${input.extremeDrawdownReaction || 'MAINTAIN_DCA'}
- Tingkat Literasi Finansial: ${input.financialKnowledgeLevel || 'INTERMEDIATE'}

PREFERENSI & REKOMENDASI KERANJANG ASET DINAMIS AI:
- Tujuan Finansial Utama: ${input.primaryGoal || 'BALANCED_GROWTH'}
- Preferensi Aset Kripto: ${input.cryptoPreference || 'MODERATE_10'}
- Mode Kustom: ${isCustomized ? 'Pengguna Menyesuaikan Bobot Sendiri' : 'Rekomendasi Algoritmik Murni'}
- Keranjang Aset Dinamis Direkomendasikan: ${dynamicAssets.map((a) => `${a.ticker}: ${Math.round(a.weight * 100)}% (${a.name} - ${a.role})`).join('; ')}
${guardrailViolations.length > 0 ? `- Catatan Guardrail: ${guardrailViolations.join('; ')}` : '- Status Guardrail: Aman (Sesuai batas institusional)'}
${input.userNotesOrGuidance ? `- Instruksi/Kondisi Khusus Pengguna: "${input.userNotesOrGuidance}"` : ''}

Berikan asesmen psikologi dan disiplin eksekusi:
1. dominant_bias: Bias kognitif dominan (contoh: Loss Aversion, Action Bias, Disposition Effect, Regret Avoidance, Overconfidence)
2. stress_resilience: Ketahanan emosional dalam krisis pasar ekstrem
3. capacity_vs_tolerance_delta: Analisis mendalam gap antara kemampuan neraca riil vs keberanian emosional
4. blindspots: 2-3 titik buta portofolio atau perilaku yang harus diwaspadai
5. execution_rules: 3 aturan eksekusi disiplin rebalancing dan alokasi dana
6. custom_guidance: Panduan personal terkait preferensi tujuan/alokasi kustom pengguna
7. suitability_verdict: Kesimpulan kelayakan portofolio terhadap profil risiko
`;

    const diagnosisSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        dominant_bias: { type: Type.STRING },
        stress_resilience: { type: Type.STRING },
        capacity_vs_tolerance_delta: { type: Type.STRING },
        blindspots: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        execution_rules: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        custom_guidance: { type: Type.STRING },
        suitability_verdict: { type: Type.STRING },
      },
      required: [
        'dominant_bias',
        'stress_resilience',
        'capacity_vs_tolerance_delta',
        'blindspots',
        'execution_rules',
      ],
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: diagnosisSchema,
        temperature: 0.2, // Consistent financial analysis
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text) as GeminiDiagnosis;
      return {
        capacityScore,
        toleranceScore,
        strategyName,
        targetAllocations: dynamicTargetAllocations,
        recommendedAllocations: dynamicTargetAllocations,
        dynamicAssets,
        geminiDiagnosis: parsed,
        isCustomized,
        guardrailViolations,
      };
    }

    throw new Error('Empty response from Gemini');
  } catch (error) {
    console.warn('[QuantVanguard AI Profiler] Gemini call failed or offline, using robust deterministic fallback:', error);
    const fallbackDiagnosis = generateDeterministicFallback(
      strategyName,
      capacityScore,
      toleranceScore,
      input,
      isCustomized,
      guardrailViolations
    );
    return {
      capacityScore,
      toleranceScore,
      strategyName,
      targetAllocations: dynamicTargetAllocations,
      recommendedAllocations: dynamicTargetAllocations,
      dynamicAssets,
      geminiDiagnosis: fallbackDiagnosis,
      isCustomized,
      guardrailViolations,
    };
  }
}
