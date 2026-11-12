import { GoogleGenAI, Type, Schema } from '@google/genai';
import {
  CustomPortfolioAuditInput,
  CustomPortfolioAuditOutput,
} from '../types';
import { MARKET_CATALOG } from '../services/market-data';

/**
 * Historical estimated stress drawdowns per asset category (e.g. 2008 GFC / 2020 COVID)
 */
const ASSET_STRESS_DRAWDOWN: Record<string, number> = {
  MONEY_MARKET: 0.0,
  FIXED_INCOME: -0.06,
  COMMODITY: -0.15,
  INDONESIAN_EQUITY: -0.38,
  US_EQUITY: -0.42,
  CRYPTO: -0.68,
  CASH: 0.0,
};

/**
 * Quantitative metrics calculator for custom portfolio allocations
 */
export function calculateCustomPortfolioMetrics(input: CustomPortfolioAuditInput) {
  const capital = Math.max(1_000_000, Number(input.portfolioCapital || 50_000_000));
  const income = Math.max(0, Number(input.monthlyIncome || 10_000_000));
  const expenses = Math.max(1_000_000, Number(input.monthlyExpenses || 5_000_000));
  const horizon = Math.max(1, Number(input.horizonYears || 5));

  // Filter valid holdings and normalize weights to 1.0 (100%)
  const validHoldings = (input.holdings || []).filter((h) => h && h.weight > 0);
  const rawSum = validHoldings.reduce((sum, h) => sum + Number(h.weight), 0);

  const normalizedHoldings = validHoldings.map((h) => {
    const code = h.assetCode;
    const meta = MARKET_CATALOG[code] || {
      assetCode: code,
      name: code,
      ticker: code,
      category: 'CASH' as const,
      categoryLabel: 'Multi-Asset',
      expectedCagr: 0.08,
      annualVolatility: 0.16,
      annualYield: 0,
      color: '#3B82F6',
    };

    const normWeight = rawSum > 0 ? Number(h.weight) / rawSum : 0;
    return {
      assetCode: code,
      ticker: meta.ticker,
      name: meta.name,
      weight: Math.round(normWeight * 1000) / 1000,
      category: meta.category,
      categoryLabel: meta.categoryLabel,
      color: meta.color,
      annualYield: meta.annualYield || 0,
      expectedCagr: meta.expectedCagr,
      annualVolatility: meta.annualVolatility,
    };
  });

  // Calculate weighted CAGR, Volatility, and Yield
  let weightedCagr = 0;
  let varianceSum = 0;
  let weightedYield = 0;
  let weightedDrawdown = 0;
  let cashAllocationWeight = 0;
  let cryptoWeight = 0;
  let equityWeight = 0;
  let fixedIncomeWeight = 0;

  for (const h of normalizedHoldings) {
    weightedCagr += h.weight * h.expectedCagr;
    varianceSum += Math.pow(h.weight * h.annualVolatility, 2);
    weightedYield += h.weight * (h.annualYield || 0);

    const stressDd = ASSET_STRESS_DRAWDOWN[h.category] ?? -0.30;
    weightedDrawdown += h.weight * stressDd;

    if (h.category === 'MONEY_MARKET' || h.category === 'CASH') {
      cashAllocationWeight += h.weight;
    } else if (h.category === 'CRYPTO') {
      cryptoWeight += h.weight;
    } else if (h.category === 'US_EQUITY' || h.category === 'INDONESIAN_EQUITY') {
      equityWeight += h.weight;
    } else if (h.category === 'FIXED_INCOME') {
      fixedIncomeWeight += h.weight;
    }
  }

  // Cross-asset diversification benefit (simple institutional cross-correlation approximation)
  const approxVol = Math.sqrt(varianceSum * 1.25);
  const estimatedAnnualPassiveIncome = capital * (weightedYield / 100);
  const estimatedMonthlyPassiveIncome = estimatedAnnualPassiveIncome / 12;
  const liquidCashCapital = capital * cashAllocationWeight;
  const liquidityBufferMonths = expenses > 0 ? Math.round((liquidCashCapital / expenses) * 10) / 10 : 0;
  const riskFreeRate = 0.05; // 5% risk-free rate
  const sharpeRatio = approxVol > 0 ? Math.round(((weightedCagr - riskFreeRate) / approxVol) * 100) / 100 : 0;

  return {
    capital,
    income,
    expenses,
    horizon,
    normalizedHoldings,
    weightedCagr: Math.round(weightedCagr * 1000) / 1000,
    approxVol: Math.round(approxVol * 1000) / 1000,
    weightedYield: Math.round(weightedYield * 100) / 100,
    estimatedMonthlyPassiveIncome: Math.round(estimatedMonthlyPassiveIncome),
    estimatedAnnualPassiveIncome: Math.round(estimatedAnnualPassiveIncome),
    liquidityBufferMonths,
    maxDrawdownStressEstimate: Math.round(weightedDrawdown * 1000) / 10, // e.g. -22.5%
    sharpeRatio,
    cashAllocationWeight,
    cryptoWeight,
    equityWeight,
    fixedIncomeWeight,
  };
}

/**
 * Deterministic fallback audit engine when Gemini API is unavailable.
 * Delivers comprehensive, institutional-grade portfolio audit & behavioral finance diagnosis.
 */
export function generateDeterministicCustomAudit(
  input: CustomPortfolioAuditInput,
  metrics: ReturnType<typeof calculateCustomPortfolioMetrics>
): CustomPortfolioAuditOutput {
  const {
    horizon,
    income,
    expenses,
    capital,
    normalizedHoldings,
    weightedCagr,
    approxVol,
    estimatedMonthlyPassiveIncome,
    estimatedAnnualPassiveIncome,
    liquidityBufferMonths,
    maxDrawdownStressEstimate,
    sharpeRatio,
    cashAllocationWeight,
    cryptoWeight,
    equityWeight,
    fixedIncomeWeight,
  } = metrics;

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];
  let score = 88;

  // 1. Analyze Strengths
  if (normalizedHoldings.length >= 3) {
    strengths.push(
      `Diversifikasi Multi-Aset Baik: Portofolio Anda tersebar di ${normalizedHoldings.length} instrumen dari berbagai kelas aset, mengurangi risiko kegagalan satu emiten tunggal.`
    );
  }
  if (estimatedMonthlyPassiveIncome >= expenses * 0.2) {
    strengths.push(
      `Aliran Arus Kas Pasif Nyata: Estimasi dividen dan kupon rutin mencapai Rp ${estimatedMonthlyPassiveIncome.toLocaleString('id-ID')}/bulan (~${Math.round((estimatedMonthlyPassiveIncome / expenses) * 100)}% dari biaya hidup bulanan Anda).`
    );
  }
  if (equityWeight >= 0.25 && horizon >= 5) {
    strengths.push(
      `Mesin Compounding Saham Sehat: Porsi ekuitas (${Math.round(equityWeight * 100)}%) memberikan daya dorong pertumbuhan modal untuk mengalahkan inflasi jangka panjang.`
    );
  }
  if (liquidityBufferMonths >= 6) {
    strengths.push(
      `Bantalan Dana Darurat Aman: Alokasi kas/MMF Anda cukup menopang ${liquidityBufferMonths} bulan pengeluaran tanpa perlu menjual aset investasi saat kondisi mendesak.`
    );
  }
  if (sharpeRatio >= 0.4) {
    strengths.push(
      `Efisiensi Risiko Optimal (Sharpe Ratio: ${sharpeRatio}): Imbal hasil yang dihasilkan sepadan dengan fluktuasi risiko yang diambil.`
    );
  }
  if (strengths.length < 2) {
    strengths.push(
      `Inisiatif Alokasi Mandiri: Anda telah menyusun alokasi personal terarah dengan estimasi return tahunan +${(weightedCagr * 100).toFixed(1)}% per tahun.`
    );
  }

  // 2. Analyze Weaknesses & Risks
  let horizonVerdict = '';
  if (horizon <= 3 && (equityWeight + cryptoWeight) > 0.45) {
    score -= 18;
    weaknesses.push(
      `Mismatch Horison Waktu Ekstrem: Target investasi hanya ${horizon} tahun, namun alokasi aset berfluktuasi tinggi (Saham + Kripto: ${Math.round((equityWeight + cryptoWeight) * 100)}%) sangat besar. Risiko terpaksa mencairkan dana saat pasar koreksi sangat tinggi.`
    );
    horizonVerdict = `PERINGATAN HORISON: Jangka waktu investasi ${horizon} tahun terlalu singkat untuk menahan volatilitas aset pertumbuhan (~${(approxVol * 100).toFixed(1)}%). Portofolio rentan membukukan kerugian modal jika dibutuhkan dalam waktu dekat.`;
    recommendations.push(
      `Untuk horison ${horizon} tahun, naikkan porsi SBN Obligasi Ritel (ORI/SR) dan RDPU menjadi minimal 60% guna mengunci pokok modal dan kepastian kupon.`
    );
  } else if (horizon >= 10 && cashAllocationWeight > 0.5) {
    score -= 12;
    weaknesses.push(
      `Erosi Inflasi / Cash Drag: Target investasi jangka panjang (${horizon} tahun), namun alokasi kas/MMF (${Math.round(cashAllocationWeight * 100)}%) terlalu dominan. Hal ini membatasi akumulasi kekayaan akibat nilai riil tergerus inflasi.`
    );
    horizonVerdict = `KETIDAKSESUAIAN PELUANG: Horison panjang ${horizon} tahun memberi Anda privilese waktu untuk menikmati compounding saham global. Porsi kas terlalu besar menahan potensi kekayaan Anda.`;
    recommendations.push(
      `Salurkan sebagian kelebihan kas (di atas dana darurat 6 bulan) secara bertahap (DCA) ke indeks S&P 500 (VOO) atau Blue-Chip BEI (BBCA/BMRI).`
    );
  } else {
    horizonVerdict = `SELARAS DENGAN HORISON: Target waktu investasi ${horizon} tahun memiliki keseimbangan yang proporsional dengan profil volatilitas portofolio Anda (~${(approxVol * 100).toFixed(1)}%).`;
  }

  if (cryptoWeight > 0.25) {
    score -= 14;
    weaknesses.push(
      `Konsentrasi Volatilitas Kripto Tinggi: Porsi aset digital (${Math.round(cryptoWeight * 100)}%) melampaui batas kehati-hatian institusional (maksimal 20%), meningkatkan estimasi max drawdown krisis hingga ${maxDrawdownStressEstimate}%.`
    );
    recommendations.push(
      `Batasi eksposur kripto maksimal 10-15% dari total portofolio dan terapkan aturan *take profit* berkala ke Emas atau Saham Dividen.`
    );
  }

  // Concentration Check: Any single asset > 40%
  const highestAsset = [...normalizedHoldings].sort((a, b) => b.weight - a.weight)[0];
  if (highestAsset && highestAsset.weight > 0.40 && highestAsset.category !== 'MONEY_MARKET') {
    score -= 8;
    weaknesses.push(
      `Risiko Konsentrasi Aset Tunggal: Aset ${highestAsset.name} (${highestAsset.ticker}) memakan porsi ${Math.round(highestAsset.weight * 100)}% portofolio. Kejatuhan pada emiten/aset ini akan memukul kinerja portofolio secara signifikan.`
    );
    recommendations.push(
      `Pangkas konsentrasi ${highestAsset.ticker} menjadi maksimal 25% dan sebar ke instrumen komplementer.`
    );
  }

  if (liquidityBufferMonths < 3) {
    score -= 10;
    weaknesses.push(
      `Bantalan Likuiditas Darurat Tipis: Cadangan likuid kas Anda hanya mencukupi ${liquidityBufferMonths} bulan pengeluaran (di bawah batas minimum sehat 3-6 bulan biaya hidup Rp ${expenses.toLocaleString('id-ID')}).`
    );
    recommendations.push(
      `Prioritaskan menyisihkan tabungan bulanan ke RDPU hingga mencapai minimal 3-6 bulan pengeluaran sebelum menambah porsi aset berisiko.`
    );
  }

  // Cashflow Verdict
  let incomeVerdict = '';
  const monthlySavings = Math.max(0, income - expenses);
  const savingsRate = income > 0 ? (monthlySavings / income) * 100 : 0;
  if (savingsRate >= 30) {
    incomeVerdict = `Kapasitas Tabungan Kuat: Penghasilan bulanan Rp ${income.toLocaleString('id-ID')} dengan rasio tabungan ${Math.round(savingsRate)}% (Rp ${monthlySavings.toLocaleString('id-ID')}/bulan) memberikan amunisi arus kas yang sangat sehat untuk melakukan DCA Zero-Sell secara disiplin.`;
  } else {
    incomeVerdict = `Manajemen Arus Kas Ketat: Rasio tabungan Anda saat ini ~${Math.round(savingsRate)}%. Disarankan menjaga disiplin anggaran pengeluaran agar portofolio tidak terganggu penarikan darurat.`;
  }

  if (recommendations.length < 2) {
    recommendations.push(
      `Terapkan strategi Zero-Sell Inflow Rebalancing setiap bulan dengan menyalurkan tabungan bulanan hanya ke aset yang sedang underweight tanpa menjual pemenang.`
    );
  }

  // Clamp score
  score = Math.max(25, Math.min(98, score));
  let healthStatus: CustomPortfolioAuditOutput['healthStatus'] = 'GOOD';
  if (score >= 85) healthStatus = 'EXCELLENT';
  else if (score >= 70) healthStatus = 'GOOD';
  else if (score >= 55) healthStatus = 'NEEDS_ATTENTION';
  else healthStatus = 'CRITICAL_RISK';

  let summaryVerdict = '';
  if (healthStatus === 'EXCELLENT') {
    summaryVerdict = `Portofolio kustom Anda tersusun sangat sehat dan terkalibrasi baik dengan target waktu ${horizon} tahun serta profil arus kas Anda.`;
  } else if (healthStatus === 'GOOD') {
    summaryVerdict = `Portofolio kustom Anda memiliki fundamental yang kokoh, dengan beberapa penyesuaian minor pada bantalan likuiditas dan diversifikasi.`;
  } else if (healthStatus === 'NEEDS_ATTENTION') {
    summaryVerdict = `Portofolio memiliki ketidakseimbangan antara horison waktu dan volatilitas aset yang memerlukan re-kalibrasi agar terhindar dari risiko jual rugi.`;
  } else {
    summaryVerdict = `Portofolio berada pada zona risiko tinggi dengan kerentanan drawdown ekstrem terhadap ketahanan finansial Anda saat ini.`;
  }

  return {
    healthScore: score,
    healthStatus,
    summaryVerdict,
    strengths,
    weaknesses,
    horizonAlignmentVerdict: horizonVerdict,
    incomeCashflowVerdict: incomeVerdict,
    recommendations,
    metrics: {
      expectedCagr: weightedCagr,
      annualVolatility: approxVol,
      estimatedMonthlyPassiveIncome,
      estimatedAnnualPassiveIncome,
      maxDrawdownStressEstimate,
      liquidityBufferMonths,
      sharpeRatioEstimate: sharpeRatio,
    },
    normalizedHoldings,
  };
}

/**
 * AI Portfolio Doctor Service
 * Audits customized user portfolios with Gemini 2.5 Flash,
 * pairing quantitative metrics with behavioral finance insights.
 */
export async function auditCustomPortfolio(
  input: CustomPortfolioAuditInput
): Promise<CustomPortfolioAuditOutput> {
  const metrics = calculateCustomPortfolioMetrics(input);
  const deterministicFallback = generateDeterministicCustomAudit(input, metrics);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('placeholder')) {
    return deterministicFallback;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
Anda adalah Chief Investment Strategist & Senior Quantitative Portfolio Doctor QuantVanguard.
Lakukan audit mendalam dan berikan feedback objektif terhadap portofolio investasi kustom yang diracik oleh pengguna berikut:

PROFIL KEUANGAN PENGGUNA:
- Target Waktu Investasi: ${metrics.horizon} Tahun
- Penghasilan Bulanan: Rp ${metrics.income.toLocaleString('id-ID')}
- Pengeluaran Rutin Bulanan: Rp ${metrics.expenses.toLocaleString('id-ID')}
- Estimasi Modal Portofolio: Rp ${metrics.capital.toLocaleString('id-ID')}
- Tujuan Finansial Utama: ${input.primaryGoal || 'BALANCED_GROWTH'}
${input.userNotes ? `- Catatan Khusus Pengguna: "${input.userNotes}"` : ''}

ALOKASI PORTOFOLIO KUSTOM PILIHAN PENGGUNA:
${metrics.normalizedHoldings.map((h) => `- ${h.ticker} (${h.name}): ${Math.round(h.weight * 100)}% [${h.categoryLabel}] (CAGR: +${(h.expectedCagr * 100).toFixed(1)}%, Volatilitas: ~${(h.annualVolatility * 100).toFixed(0)}%, Yield: ${h.annualYield}%)`).join('\n')}

HASIL PERHITUNGAN KUANTITATIF MESIN:
- Estimasi Return Portofolio (CAGR): +${(metrics.weightedCagr * 100).toFixed(1)}% / tahun
- Estimasi Volatilitas Portofolio: ~${(metrics.approxVol * 100).toFixed(1)}%
- Estimasi Arus Kas Pasif / Dividen: Rp ${metrics.estimatedMonthlyPassiveIncome.toLocaleString('id-ID')}/bulan (Rp ${metrics.estimatedAnnualPassiveIncome.toLocaleString('id-ID')}/tahun)
- Bantalan Likuiditas Kas: ${metrics.liquidityBufferMonths} bulan pengeluaran
- Estimasi Max Drawdown Krisis: ${metrics.maxDrawdownStressEstimate}%
- Rasio Sharpe: ${metrics.sharpeRatio}

Berikan audit jujur, tajam, dan edukatif dalam Bahasa Indonesia:
1. healthScore: Nilai kesehatan portofolio dari 0 hingga 100.
2. healthStatus: Salah satu dari "EXCELLENT", "GOOD", "NEEDS_ATTENTION", "CRITICAL_RISK".
3. summaryVerdict: Kesimpulan ringkas 1-2 kalimat tentang kelayakan portofolio.
4. strengths: 3-4 poin kelebihan utama portofolio yang dipilih pengguna.
5. weaknesses: 2-3 poin kekurangan, blindspot, atau risiko kritis (misal konsentrasi, mismatch horison waktu, dll).
6. horizonAlignmentVerdict: Penilaian khusus kesesuaian target tahun investasi vs risiko aset.
7. incomeCashflowVerdict: Penilaian khusus kesesuaian dengan penghasilan, pengeluaran, dan dividen pasif bulanan.
8. recommendations: 3-4 rekomendasi tindakan perbaikan konkret tanpa menghapus seluruh preferensi pengguna.
`;

    const auditSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        healthScore: { type: Type.INTEGER },
        healthStatus: {
          type: Type.STRING,
          enum: ['EXCELLENT', 'GOOD', 'NEEDS_ATTENTION', 'CRITICAL_RISK'],
        },
        summaryVerdict: { type: Type.STRING },
        strengths: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        weaknesses: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        horizonAlignmentVerdict: { type: Type.STRING },
        incomeCashflowVerdict: { type: Type.STRING },
        recommendations: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: [
        'healthScore',
        'healthStatus',
        'summaryVerdict',
        'strengths',
        'weaknesses',
        'horizonAlignmentVerdict',
        'incomeCashflowVerdict',
        'recommendations',
      ],
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: auditSchema,
        temperature: 0.2,
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      return {
        healthScore: Number(parsed.healthScore || deterministicFallback.healthScore),
        healthStatus: parsed.healthStatus || deterministicFallback.healthStatus,
        summaryVerdict: parsed.summaryVerdict || deterministicFallback.summaryVerdict,
        strengths: Array.isArray(parsed.strengths) && parsed.strengths.length > 0 ? parsed.strengths : deterministicFallback.strengths,
        weaknesses: Array.isArray(parsed.weaknesses) && parsed.weaknesses.length > 0 ? parsed.weaknesses : deterministicFallback.weaknesses,
        horizonAlignmentVerdict: parsed.horizonAlignmentVerdict || deterministicFallback.horizonAlignmentVerdict,
        incomeCashflowVerdict: parsed.incomeCashflowVerdict || deterministicFallback.incomeCashflowVerdict,
        recommendations: Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0 ? parsed.recommendations : deterministicFallback.recommendations,
        metrics: deterministicFallback.metrics,
        normalizedHoldings: deterministicFallback.normalizedHoldings,
      };
    }

    return deterministicFallback;
  } catch (error) {
    console.warn('[QuantVanguard Portfolio Doctor] Gemini API call failed, using robust deterministic fallback:', error);
    return deterministicFallback;
  }
}
