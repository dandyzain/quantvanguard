import 'package:drift/drift.dart';

// Drift SQLite local database definitions for offline-first caching
class CachedPortfolios extends Table {
  TextColumn get id => text()();
  TextColumn get name => text().withDefault(const Constant('Primary Wealth Portfolio'))();
  TextColumn get baseCurrency => text().withDefault(const Constant('IDR'))();
  RealColumn get totalValue => real()();
  RealColumn get totalCostBasis => real()();
  RealColumn get monthlyExpenses => real()();
  DateTimeColumn get lastUpdated => dateTime().withDefault(currentDateAndTime)();

  @override
  Set<Column> get primaryKey => {id};
}

class CachedHoldings extends Table {
  TextColumn get id => text()();
  TextColumn get portfolioId => text()();
  TextColumn get assetCode => text()();
  TextColumn get name => text()();
  RealColumn get units => real()(); // Supports 8 decimal places
  RealColumn get currentPrice => real()();
  RealColumn get costBasisPrice => real()();
  RealColumn get currentWeight => real()();
  RealColumn get targetWeight => real()();
  RealColumn get drift => real()();
  BoolColumn get isAlertTriggered => boolean().withDefault(const Constant(false))();

  @override
  Set<Column> get primaryKey => {id};
}
