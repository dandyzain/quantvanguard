import Decimal from 'decimal.js';
import { AssetCode, TargetAllocations } from '../types';

// Configure Decimal for financial precision
Decimal.set({ precision: 30, rounding: Decimal.ROUND_HALF_UP });

export interface HoldingInput {
  assetCode: AssetCode;
  units: number | string | Decimal;
  currentPrice: number | string | Decimal;
  costBasisPrice?: number | string | Decimal;
}

export interface RebalanceItemResult {
  assetCode: AssetCode;
  action: 'BUY' | 'SELL' | 'HOLD';
  nominalAmount: number;
  unitsDelta: number;
  unitPrice: number;
  currentUnits: number;
  postUnits: number;
  currentValue: number;
  postValue: number;
  preWeight: number;
  postWeight: number;
  targetWeight: number;
  drift: number;
  postDrift: number;
}

export interface RebalancePlan {
  mode: 'FULL' | 'ZERO_SELL_INFLOW';
  currentTotalValue: number;
  inflowAmount: number;
  projectedTotalValue: number;
  hasActiveDriftAlert: boolean;
  driftThreshold: number;
  allocations: RebalanceItemResult[];
  taxDragAvoided?: number;
  summary: {
    totalBought: number;
    totalSold: number;
    driftReduction: {
      preTotalAbsoluteDrift: number;
      postTotalAbsoluteDrift: number;
      improvementPercentage: number;
    };
  };
}

/**
 * Calculates current valuation, weights, and drift for a set of holdings.
 */
export function calculateCurrentPortfolio(
  holdings: HoldingInput[],
  targets: TargetAllocations,
  driftThreshold = 0.05
) {
  const defaultCodes: AssetCode[] = ['MMF_IDR', 'ETF_VOO', 'GOLD_XAU', 'CRYPTO_BTC'];
  const assetCodes: AssetCode[] = Array.from(
    new Set([
      ...(holdings.length === 0 ? defaultCodes : []),
      ...holdings.map((h) => h.assetCode),
      ...Object.keys(targets),
    ])
  );

  const valuations: Record<string, { units: Decimal; price: Decimal; value: Decimal }> = {};
  for (const code of assetCodes) {
    valuations[code] = { units: new Decimal(0), price: new Decimal(0), value: new Decimal(0) };
  }

  let totalValue = new Decimal(0);

  for (const h of holdings) {
    const units = new Decimal(h.units || 0);
    const price = new Decimal(h.currentPrice || 0);
    const val = units.mul(price);
    valuations[h.assetCode] = { units, price, value: val };
    totalValue = totalValue.add(val);
  }

  let hasActiveDriftAlert = false;
  let totalAbsoluteDrift = new Decimal(0);

  const breakdown = assetCodes.map((code) => {
    const assetVal = valuations[code].value;
    const currentWeight = totalValue.isZero() ? new Decimal(0) : assetVal.div(totalValue);
    const targetWeight = new Decimal(targets[code] || 0);
    const drift = currentWeight.sub(targetWeight);
    const absDrift = drift.abs();
    totalAbsoluteDrift = totalAbsoluteDrift.add(absDrift);

    const isAlertTriggered = absDrift.gte(new Decimal(driftThreshold));
    if (isAlertTriggered) {
      hasActiveDriftAlert = true;
    }

    return {
      assetCode: code,
      units: valuations[code].units.toNumber(),
      price: valuations[code].price.toNumber(),
      value: assetVal.toNumber(),
      currentWeight: currentWeight.toNumber(),
      targetWeight: targetWeight.toNumber(),
      drift: drift.toNumber(),
      absDrift: absDrift.toNumber(),
      isAlertTriggered,
    };
  });

  return {
    totalValue: totalValue.toNumber(),
    breakdown,
    hasActiveDriftAlert,
    totalAbsoluteDrift: totalAbsoluteDrift.toNumber(),
    rawValuations: valuations,
    rawTotalValue: totalValue,
  };
}

/**
 * Full Rebalancing Algorithm:
 * Calculates required buys and sells to strictly align all assets to target weights.
 * Self-financing invariance: sum(buys) == sum(sells).
 */
export function calculateFullRebalance(
  holdings: HoldingInput[],
  targets: TargetAllocations,
  driftThreshold = 0.05
): RebalancePlan {
  const { rawValuations, rawTotalValue, breakdown, totalAbsoluteDrift, hasActiveDriftAlert } =
    calculateCurrentPortfolio(holdings, targets, driftThreshold);

  const assetCodes: AssetCode[] = breakdown.map((b) => b.assetCode);
  let totalBought = new Decimal(0);
  let totalSold = new Decimal(0);

  const allocations: RebalanceItemResult[] = assetCodes.map((code) => {
    const current = rawValuations[code];
    const targetWeight = new Decimal(targets[code] || 0);
    const targetValue = rawTotalValue.mul(targetWeight);
    const diff = targetValue.sub(current.value);

    let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let nominalAmount = new Decimal(0);
    let unitsDelta = new Decimal(0);
    let postUnits = current.units;
    let postValue = current.value;

    if (diff.gt(new Decimal(0.01))) {
      action = 'BUY';
      nominalAmount = diff;
      unitsDelta = current.price.isZero() ? new Decimal(0) : nominalAmount.div(current.price);
      postUnits = current.units.add(unitsDelta);
      postValue = current.value.add(nominalAmount);
      totalBought = totalBought.add(nominalAmount);
    } else if (diff.lt(new Decimal(-0.01))) {
      action = 'SELL';
      nominalAmount = diff.abs();
      unitsDelta = current.price.isZero() ? new Decimal(0) : nominalAmount.div(current.price);
      postUnits = Decimal.max(0, current.units.sub(unitsDelta));
      postValue = Decimal.max(0, current.value.sub(nominalAmount));
      totalSold = totalSold.add(nominalAmount);
    }

    const preItem = breakdown.find((b) => b.assetCode === code);
    const postWeight = rawTotalValue.isZero() ? new Decimal(0) : postValue.div(rawTotalValue);
    const postDrift = postWeight.sub(targetWeight);
    const isCrypto = code === 'CRYPTO_BTC' || code.startsWith('CRYPTO_') || ['BTC', 'ETH', 'SOL'].includes(code);

    return {
      assetCode: code,
      action,
      nominalAmount: nominalAmount.toDecimalPlaces(2).toNumber(),
      unitsDelta: isCrypto
        ? unitsDelta.toDecimalPlaces(8).toNumber()
        : unitsDelta.toDecimalPlaces(4).toNumber(),
      unitPrice: current.price.toNumber(),
      currentUnits: current.units.toNumber(),
      postUnits: isCrypto
        ? postUnits.toDecimalPlaces(8).toNumber()
        : postUnits.toDecimalPlaces(4).toNumber(),
      currentValue: current.value.toDecimalPlaces(2).toNumber(),
      postValue: postValue.toDecimalPlaces(2).toNumber(),
      preWeight: preItem ? preItem.currentWeight : 0,
      postWeight: postWeight.toNumber(),
      targetWeight: targetWeight.toNumber(),
      drift: preItem ? preItem.drift : 0,
      postDrift: postDrift.toNumber(),
    };
  });

  return {
    mode: 'FULL',
    currentTotalValue: rawTotalValue.toNumber(),
    inflowAmount: 0,
    projectedTotalValue: rawTotalValue.toNumber(),
    hasActiveDriftAlert,
    driftThreshold,
    allocations,
    summary: {
      totalBought: totalBought.toDecimalPlaces(2).toNumber(),
      totalSold: totalSold.toDecimalPlaces(2).toNumber(),
      driftReduction: {
        preTotalAbsoluteDrift: totalAbsoluteDrift,
        postTotalAbsoluteDrift: 0,
        improvementPercentage: 100.0,
      },
    },
  };
}

/**
 * "Zero-Sell" Smart Cash-Flow Rebalance Algorithm:
 * Takes new capital C_new and strictly routes it into underweight assets.
 * Guarantees:
 * 1. For all overweight assets, SELL = 0 and BUY = 0 (HOLD).
 * 2. Zero capital gains tax and zero transaction fees from liquidating assets.
 * 3. Total absolute portfolio drift monotonically decreases.
 */
export function calculateZeroSellInflowRebalance(
  holdings: HoldingInput[],
  targets: TargetAllocations,
  inflowAmount: number | string | Decimal,
  driftThreshold = 0.05
): RebalancePlan {
  const inflow = new Decimal(inflowAmount || 0);
  const { rawValuations, rawTotalValue, breakdown, totalAbsoluteDrift, hasActiveDriftAlert } =
    calculateCurrentPortfolio(holdings, targets, driftThreshold);

  const projectedTotalValue = rawTotalValue.add(inflow);
  const assetCodes: AssetCode[] = breakdown.map((b) => b.assetCode);

  // Step 1: Calculate ideal post-inflow value and deficit for each asset
  const deficits: Record<string, Decimal> = {};
  for (const code of assetCodes) {
    deficits[code] = new Decimal(0);
  }
  let totalDeficit = new Decimal(0);

  for (const code of assetCodes) {
    const targetWeight = new Decimal(targets[code] || 0);
    const idealValue = projectedTotalValue.mul(targetWeight);
    const currentVal = rawValuations[code].value;
    const deficit = Decimal.max(0, idealValue.sub(currentVal));
    deficits[code] = deficit;
    totalDeficit = totalDeficit.add(deficit);
  }

  // Step 2: Route inflow strictly to underweight assets
  const allocationsByAsset: Record<string, Decimal> = {};
  for (const code of assetCodes) {
    allocationsByAsset[code] = new Decimal(0);
  }

  let totalAllocated = new Decimal(0);

  if (totalDeficit.isZero() || inflow.isZero()) {
    // Already perfectly balanced or no inflow: distribute proportionally to targets
    for (const code of assetCodes) {
      const targetWeight = new Decimal(targets[code] || 0);
      allocationsByAsset[code] = inflow.mul(targetWeight);
      totalAllocated = totalAllocated.add(allocationsByAsset[code]);
    }
  } else if (inflow.gte(totalDeficit)) {
    // Case A: Inflow is large enough to bridge all deficits completely
    const surplus = inflow.sub(totalDeficit);
    for (const code of assetCodes) {
      const targetWeight = new Decimal(targets[code] || 0);
      const alloc = deficits[code].add(surplus.mul(targetWeight));
      allocationsByAsset[code] = alloc;
      totalAllocated = totalAllocated.add(alloc);
    }
  } else {
    // Case B: Constrained inflow. Route strictly proportionally to deficits.
    for (const code of assetCodes) {
      if (deficits[code].gt(0)) {
        const alloc = inflow.mul(deficits[code]).div(totalDeficit);
        allocationsByAsset[code] = alloc;
        totalAllocated = totalAllocated.add(alloc);
      } else {
        allocationsByAsset[code] = new Decimal(0);
      }
    }
  }

  // Step 3: Format results
  let postTotalAbsoluteDrift = new Decimal(0);

  const allocations: RebalanceItemResult[] = assetCodes.map((code) => {
    const current = rawValuations[code];
    const targetWeight = new Decimal(targets[code] || 0);
    const allocAmount = allocationsByAsset[code];
    const isBuy = allocAmount.gt(new Decimal(0.01));

    const nominalAmount = allocAmount.toDecimalPlaces(2);
    const unitsDelta = current.price.isZero() ? new Decimal(0) : allocAmount.div(current.price);
    const postUnits = current.units.add(unitsDelta);
    const postValue = current.value.add(allocAmount);

    const postWeight = projectedTotalValue.isZero()
      ? new Decimal(0)
      : postValue.div(projectedTotalValue);
    const postDrift = postWeight.sub(targetWeight);
    postTotalAbsoluteDrift = postTotalAbsoluteDrift.add(postDrift.abs());

    const preItem = breakdown.find((b) => b.assetCode === code);
    const isCrypto = code === 'CRYPTO_BTC' || code.startsWith('CRYPTO_') || ['BTC', 'ETH', 'SOL'].includes(code);

    return {
      assetCode: code,
      action: isBuy ? 'BUY' : 'HOLD',
      nominalAmount: nominalAmount.toNumber(),
      unitsDelta: isCrypto
        ? unitsDelta.toDecimalPlaces(8).toNumber()
        : unitsDelta.toDecimalPlaces(4).toNumber(),
      unitPrice: current.price.toNumber(),
      currentUnits: current.units.toNumber(),
      postUnits: isCrypto
        ? postUnits.toDecimalPlaces(8).toNumber()
        : postUnits.toDecimalPlaces(4).toNumber(),
      currentValue: current.value.toDecimalPlaces(2).toNumber(),
      postValue: postValue.toDecimalPlaces(2).toNumber(),
      preWeight: preItem ? preItem.currentWeight : 0,
      postWeight: postWeight.toNumber(),
      targetWeight: targetWeight.toNumber(),
      drift: preItem ? preItem.drift : 0,
      postDrift: postDrift.toNumber(),
    };
  });

  // Calculate tax & fee drag saved:
  // If the user had executed a full rebalance, they would have had to liquidate overweight assets.
  // We estimate capital gains tax + transaction spread drag at ~1.5% of would-be liquidated amount.
  const fullRebalanceEquivalent = calculateFullRebalance(holdings, targets, driftThreshold);
  const wouldBeSold = fullRebalanceEquivalent.summary.totalSold;
  const estimatedTaxDragSaved = new Decimal(wouldBeSold).mul(0.015).toDecimalPlaces(2).toNumber();

  const preDrift = totalAbsoluteDrift;
  const postDrift = postTotalAbsoluteDrift.toNumber();
  const improvement = preDrift > 0
    ? Math.max(0, Math.min(100, ((preDrift - postDrift) / preDrift) * 100))
    : 100.0;

  return {
    mode: 'ZERO_SELL_INFLOW',
    currentTotalValue: rawTotalValue.toNumber(),
    inflowAmount: inflow.toNumber(),
    projectedTotalValue: projectedTotalValue.toNumber(),
    hasActiveDriftAlert,
    driftThreshold,
    allocations,
    taxDragAvoided: estimatedTaxDragSaved,
    summary: {
      totalBought: totalAllocated.toDecimalPlaces(2).toNumber(),
      totalSold: 0, // STRICTLY ZERO
      driftReduction: {
        preTotalAbsoluteDrift: preDrift,
        postTotalAbsoluteDrift: postDrift,
        improvementPercentage: Math.round(improvement * 10) / 10,
      },
    },
  };
}
