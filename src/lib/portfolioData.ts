import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

export interface AccountState {
  schemaVersion: number;
  asOf: string;
  status: string;
  baseCurrency: string;
  confirmedCash: number | null;
  settledCash: number | null;
  buyingPower: number | null;
  positionsCount: number;
  lastConfirmedLedgerEventId: string | null;
  lastReconciledWithBrokerAt: string | null;
}

export interface LedgerEvent {
  eventId: string;
  eventType: string;
  status: string;
  broker: string;
  accountAlias: string;
  confirmationId: string;
  tradeDate: string;
  settlementDate: string;
  symbol: string;
  side: string;
  quantity: number | null;
  averagePrice: number | null;
  fees: number | null;
  grossAmount: number | null;
  netCashEffect: number | null;
  currency: string;
  source: string;
  createdAt: string;
  notes: string;
}

export interface PositionRecord {
  symbol: string;
  assetType: string;
  exchange: string;
  quantity: number;
  averageCost: number | null;
  costBasis: number | null;
  currency: string;
  firstTradeDate: string;
  lastTradeDate: string;
  notes: string;
}

export interface EquityPoint {
  date: string;
  totalMarketValue: number | null;
  cash: number | null;
  totalEquity: number;
  cumulativeDeposits: number | null;
  totalReturnPct: number | null;
  periodReturnPct: number | null;
  notes: string;
}

export interface PriceSnapshot {
  symbol: string;
  price: number;
  currency: string;
  priceAsOf: string;
  source: string;
  retrievedAt: string;
  notes: string;
}

export type PriceHistoryPoint = [date: string, close: number];

interface RawPriceHistoryPoint {
  symbol: string;
  date: string;
  close: number;
}

export interface SecurityRecord {
  symbol: string;
  name: string;
  exchange: string;
  assetType: string;
  tradability: string;
  marketDataSymbol: string;
  secCik: string;
  tradingViewSymbol: string;
  tradingViewUrl: string;
  stockAnalysisUrl: string;
  notes: string;
}

export interface TechnicalSnapshot {
  symbol: string;
  asOf: string;
  close: number | null;
  oneDayReturnPct: number | null;
  oneMonthReturnPct: number | null;
  threeMonthReturnPct: number | null;
  ytdReturnPct: number | null;
  oneYearReturnPct: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  positionIn52WeekRangePct: number | null;
  sma50: number | null;
  sma200: number | null;
  rsi14: number | null;
  volume: number | null;
  averageVolume30d: number | null;
  source: string;
  retrievedAt: string;
  notes: string;
}

export interface CompanyMetrics {
  symbol: string;
  asOf: string;
  sourcePublishedAt: string;
  retrievedAt: string;
  currency: string;
  marketCap: number | null;
  enterpriseValue: number | null;
  ttmRevenue: number | null;
  revenueGrowthYoy: number | null;
  grossMarginTtm: number | null;
  operatingMarginTtm: number | null;
  netIncomeTtm: number | null;
  cashAndEquivalents: number | null;
  totalDebt: number | null;
  sharesOutstanding: number | null;
  priceToSales: number | null;
  enterpriseValueToSales: number | null;
  peRatio: number | null;
  source: string;
  notes: string;
}

export interface WatchlistSensitivity {
  symbol: string;
  asOf: string;
  rateSensitivity: number | null;
  creditSensitivity: number | null;
  aiCapexSensitivity: number | null;
  financingSensitivity: number | null;
  dilutionSensitivity: number | null;
  regulatorySensitivity: number | null;
  commodityOrEnergySensitivity: number | null;
  customerConcentrationSensitivity: number | null;
  primarySensitiveLanes: string;
  macroPriorityTrigger: string;
  notes: string;
}

export interface FinancingRunwayScore {
  symbol: string;
  asOf: string;
  cashRunwayScore: number | null;
  debtMaturityScore: number | null;
  variableRateExposureScore: number | null;
  atmOrEquityProgramScore: number | null;
  convertibleOrPreferredOverhangScore: number | null;
  projectFinanceComplexityScore: number | null;
  customerConcentrationScore: number | null;
  overallFinancingFragilityScore: number | null;
  reviewSourceIds: string;
  nextReviewTrigger: string;
  notes: string;
}

export interface MacroRegimeSnapshot {
  asOf: string;
  retrievedAt: string;
  policyVersion: string;
  sourceIds: string;
  regimeLabel: string;
  actionBias: string;
  twoYearYieldPct: number | null;
  tenYearYieldPct: number | null;
  tenTwoSpreadBp: number | null;
  real10yYieldPct: number | null;
  hyOasBp: number | null;
  igOasBp: number | null;
  vix: number | null;
  qqqClose: number | null;
  qqq63dReturnPct: number | null;
  smhClose: number | null;
  smh63dReturnPct: number | null;
  iwmClose: number | null;
  iwm63dReturnPct: number | null;
  aiCapexState: string;
  creditStressScore: number | null;
  bubbleScoreTotal: number | null;
  valuationExcessScore: number | null;
  capexOverheatingScore: number | null;
  financingFragilityScore: number | null;
  realDemandConversionScore: number | null;
  supplyGlutRiskScore: number | null;
  leaderEarningsQualityScore: number | null;
  secondTierFragilityScore: number | null;
  creditMarketStressScore: number | null;
  breadthDeteriorationScore: number | null;
  regulatoryGeopoliticalScore: number | null;
  megaIpoPrivateMarketDrainScore: number | null;
  unavailableIndicators: string;
  notes: string;
}

export interface MacroRiskMatrixRecord {
  riskFactor: string;
  asOf: string;
  highSymbols: string;
  mediumSymbols: string;
  monitorSource: string;
  portfolioHandling: string;
  notes: string;
}

export interface MacroEventRecord {
  eventId: string;
  eventDate: string;
  eventType: string;
  scope: string;
  symbolsOrLanes: string;
  sourceId: string;
  status: string;
  importance: string;
  decisionEffect: string;
  reviewRequiredBy: string;
  notes: string;
}

export interface MacroOverlayData {
  latestRegime: MacroRegimeSnapshot | null;
  riskMatrix: MacroRiskMatrixRecord[];
  eventCalendar: MacroEventRecord[];
}

export interface DecisionCoverageRow {
  symbol: string;
  publicRecord: string;
  reason: string;
}

export interface OperatingRunRecord {
  runId: string;
  runDate: string;
  runType: string;
  status: string;
  policyVersion: string;
  title: string;
  decisionSummary: string;
  analysisSummary: string;
  decisionResult: string;
  executionSummary: string;
  decisionCoverage: DecisionCoverageRow[];
  confirmedLedgerEventIds: string[];
  primarySymbols: string[];
  linkedDecisionPath: string;
  linkedRunArtifactPath: string;
  evidencePacketPath: string;
  validationSummary: string;
  publicationStatus: string;
  nextReviewTrigger: string;
  notes: string;
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  theme: string;
  priority: string;
  status: string;
  initialRole: string;
  latestBaselineDate: string;
  nextReviewTrigger: string;
  notes: string;
  price: number | null;
  priceAsOf: string | null;
  security: SecurityRecord | null;
  priceHistory: PriceHistoryPoint[];
  technical: TechnicalSnapshot | null;
  metrics: CompanyMetrics | null;
  macroSensitivity: WatchlistSensitivity | null;
  financingRunway: FinancingRunwayScore | null;
  analysisHistory: ResearchAnalysisEntry[];
}

export interface ResearchAnalysisEntry {
  id: string;
  symbol: string;
  analyzedAt: string;
  analysisType: string;
  policyVersion: string;
  title: string;
  stance: string;
  summary: string;
  upsidePath: string;
  riskWatch: string;
  nextCheck: string;
  sourcePath: string;
}

export interface PortfolioData {
  generatedAt: string;
  policyVersion: string;
  repositoryUrl: string;
  publicUrl: string;
  accountState: AccountState;
  ledger: LedgerEvent[];
  positions: PositionRecord[];
  equityCurve: EquityPoint[];
  macro: MacroOverlayData;
  operatingRuns: OperatingRunRecord[];
  watchlist: WatchlistItem[];
  prices: PriceSnapshot[];
}

const repositoryRoot = process.cwd();
const policyVersion = "v1.1";
const repositoryUrl = "https://github.com/WineChord/invest";
const publicUrl = "https://www.wineandchord.com/invest/";

function readRequiredFile(relativePath: string): string {
  const absolutePath = path.join(repositoryRoot, relativePath);
  if (!existsSync(absolutePath)) {
    throw new Error(`Missing required file: ${relativePath}`);
  }
  return readFileSync(absolutePath, "utf8");
}

function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];

    if (char === "\"") {
      if (quoted && next === "\"") {
        field += "\"";
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(field);
      if (row.some((value) => value.trim() !== "")) {
        rows.push(row);
      }
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    if (row.some((value) => value.trim() !== "")) {
      rows.push(row);
    }
  }

  return rows;
}

function readCsv(relativePath: string): Record<string, string>[] {
  const rows = parseCsv(readRequiredFile(relativePath));
  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1).map((row) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = row[index] ?? "";
    });
    return record;
  });
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed === "") {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function toStringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const text = String(value);
  return text === "" ? null : text;
}

function readAccountState(): AccountState {
  const state = parseYaml(readRequiredFile("data/account/state.yml")) as Record<string, unknown>;
  return {
    schemaVersion: Number(state.schema_version ?? 1),
    asOf: String(state.as_of ?? ""),
    status: String(state.status ?? ""),
    baseCurrency: String(state.base_currency ?? "USD"),
    confirmedCash: toNumber(state.confirmed_cash),
    settledCash: toNumber(state.settled_cash),
    buyingPower: toNumber(state.buying_power),
    positionsCount: Number(state.positions_count ?? 0),
    lastConfirmedLedgerEventId: toStringOrNull(state.last_confirmed_ledger_event_id),
    lastReconciledWithBrokerAt: toStringOrNull(state.last_reconciled_with_broker_at),
  };
}

function readLedger(): LedgerEvent[] {
  return readCsv("data/account/ledger.csv").map((row) => ({
    eventId: row.event_id,
    eventType: row.event_type,
    status: row.status,
    broker: row.broker,
    accountAlias: row.account_alias,
    confirmationId: row.confirmation_id,
    tradeDate: row.trade_date,
    settlementDate: row.settlement_date,
    symbol: row.symbol,
    side: row.side,
    quantity: toNumber(row.quantity),
    averagePrice: toNumber(row.average_price),
    fees: toNumber(row.fees),
    grossAmount: toNumber(row.gross_amount),
    netCashEffect: toNumber(row.net_cash_effect),
    currency: row.currency,
    source: row.source,
    createdAt: row.created_at,
    notes: row.notes,
  }));
}

function readPositions(): PositionRecord[] {
  return readCsv("data/account/positions.csv").map((row) => ({
    symbol: row.symbol,
    assetType: row.asset_type,
    exchange: row.exchange,
    quantity: toNumber(row.quantity) ?? 0,
    averageCost: toNumber(row.average_cost),
    costBasis: toNumber(row.cost_basis),
    currency: row.currency,
    firstTradeDate: row.first_trade_date,
    lastTradeDate: row.last_trade_date,
    notes: row.notes,
  }));
}

function readEquityCurve(): EquityPoint[] {
  return readCsv("data/account/equity_curve.csv").map((row) => ({
    date: row.date,
    totalMarketValue: toNumber(row.total_market_value),
    cash: toNumber(row.cash),
    totalEquity: toNumber(row.total_equity) ?? 0,
    cumulativeDeposits: toNumber(row.cumulative_deposits),
    totalReturnPct: toNumber(row.total_return_pct),
    periodReturnPct: toNumber(row.period_return_pct),
    notes: row.notes,
  }));
}

function readPrices(): PriceSnapshot[] {
  return readCsv("data/market/watchlist_prices.csv").map((row) => ({
    symbol: row.symbol,
    price: toNumber(row.price) ?? 0,
    currency: row.currency,
    priceAsOf: row.price_as_of,
    source: row.source,
    retrievedAt: row.retrieved_at,
    notes: row.notes,
  }));
}

function readPriceHistory(): RawPriceHistoryPoint[] {
  return readCsv("data/market/price_history.csv")
    .map((row) => ({
      symbol: row.symbol,
      date: row.date,
      close: toNumber(row.close) ?? 0,
    }))
    .sort((left, right) =>
      left.symbol === right.symbol
        ? left.date.localeCompare(right.date)
        : left.symbol.localeCompare(right.symbol),
    );
}

function readSecurityMaster(): SecurityRecord[] {
  return readCsv("data/market/security_master.csv").map((row) => ({
    symbol: row.symbol,
    name: row.name,
    exchange: row.exchange,
    assetType: row.asset_type,
    tradability: row.tradability,
    marketDataSymbol: row.market_data_symbol,
    secCik: row.sec_cik,
    tradingViewSymbol: row.tradingview_symbol,
    tradingViewUrl: row.tradingview_url,
    stockAnalysisUrl: row.stockanalysis_url,
    notes: row.notes,
  }));
}

function readTechnicalSnapshots(): TechnicalSnapshot[] {
  return readCsv("data/market/technical_snapshots.csv").map((row) => ({
    symbol: row.symbol,
    asOf: row.as_of,
    close: toNumber(row.close),
    oneDayReturnPct: toNumber(row.one_day_return_pct),
    oneMonthReturnPct: toNumber(row.one_month_return_pct),
    threeMonthReturnPct: toNumber(row.three_month_return_pct),
    ytdReturnPct: toNumber(row.ytd_return_pct),
    oneYearReturnPct: toNumber(row.one_year_return_pct),
    fiftyTwoWeekHigh: toNumber(row.fifty_two_week_high),
    fiftyTwoWeekLow: toNumber(row.fifty_two_week_low),
    positionIn52WeekRangePct: toNumber(row.position_in_52w_range_pct),
    sma50: toNumber(row.sma_50),
    sma200: toNumber(row.sma_200),
    rsi14: toNumber(row.rsi_14),
    volume: toNumber(row.volume),
    averageVolume30d: toNumber(row.average_volume_30d),
    source: row.source,
    retrievedAt: row.retrieved_at,
    notes: row.notes,
  }));
}

function readCompanyMetrics(): CompanyMetrics[] {
  return readCsv("data/market/company_metrics.csv").map((row) => ({
    symbol: row.symbol,
    asOf: row.as_of,
    sourcePublishedAt: row.source_published_at,
    retrievedAt: row.retrieved_at,
    currency: row.currency,
    marketCap: toNumber(row.market_cap),
    enterpriseValue: toNumber(row.enterprise_value),
    ttmRevenue: toNumber(row.ttm_revenue),
    revenueGrowthYoy: toNumber(row.revenue_growth_yoy),
    grossMarginTtm: toNumber(row.gross_margin_ttm),
    operatingMarginTtm: toNumber(row.operating_margin_ttm),
    netIncomeTtm: toNumber(row.net_income_ttm),
    cashAndEquivalents: toNumber(row.cash_and_equivalents),
    totalDebt: toNumber(row.total_debt),
    sharesOutstanding: toNumber(row.shares_outstanding),
    priceToSales: toNumber(row.price_to_sales),
    enterpriseValueToSales: toNumber(row.enterprise_value_to_sales),
    peRatio: toNumber(row.pe_ratio),
    source: row.source,
    notes: row.notes,
  }));
}

function readMacroSensitivity(): WatchlistSensitivity[] {
  return readCsv("research/macro/watchlist-sensitivity.csv").map((row) => ({
    symbol: row.symbol,
    asOf: row.as_of,
    rateSensitivity: toNumber(row.rate_sensitivity),
    creditSensitivity: toNumber(row.credit_sensitivity),
    aiCapexSensitivity: toNumber(row.ai_capex_sensitivity),
    financingSensitivity: toNumber(row.financing_sensitivity),
    dilutionSensitivity: toNumber(row.dilution_sensitivity),
    regulatorySensitivity: toNumber(row.regulatory_sensitivity),
    commodityOrEnergySensitivity: toNumber(row.commodity_or_energy_sensitivity),
    customerConcentrationSensitivity: toNumber(row.customer_concentration_sensitivity),
    primarySensitiveLanes: row.primary_sensitive_lanes,
    macroPriorityTrigger: row.macro_priority_trigger,
    notes: row.notes,
  }));
}

function readFinancingRunwayScores(): FinancingRunwayScore[] {
  return readCsv("research/macro/financing-runway-scores.csv").map((row) => ({
    symbol: row.symbol,
    asOf: row.as_of,
    cashRunwayScore: toNumber(row.cash_runway_score),
    debtMaturityScore: toNumber(row.debt_maturity_score),
    variableRateExposureScore: toNumber(row.variable_rate_exposure_score),
    atmOrEquityProgramScore: toNumber(row.atm_or_equity_program_score),
    convertibleOrPreferredOverhangScore: toNumber(row.convertible_or_preferred_overhang_score),
    projectFinanceComplexityScore: toNumber(row.project_finance_complexity_score),
    customerConcentrationScore: toNumber(row.customer_concentration_score),
    overallFinancingFragilityScore: toNumber(row.overall_financing_fragility_score),
    reviewSourceIds: row.review_source_ids,
    nextReviewTrigger: row.next_review_trigger,
    notes: row.notes,
  }));
}

function readMacroRegimeSnapshots(): MacroRegimeSnapshot[] {
  return readCsv("research/macro/regime-snapshots.csv").map((row) => ({
    asOf: row.as_of,
    retrievedAt: row.retrieved_at,
    policyVersion: row.policy_version,
    sourceIds: row.source_ids,
    regimeLabel: row.regime_label,
    actionBias: row.action_bias,
    twoYearYieldPct: toNumber(row.two_year_yield_pct),
    tenYearYieldPct: toNumber(row.ten_year_yield_pct),
    tenTwoSpreadBp: toNumber(row.ten_two_spread_bp),
    real10yYieldPct: toNumber(row.real_10y_yield_pct),
    hyOasBp: toNumber(row.hy_oas_bp),
    igOasBp: toNumber(row.ig_oas_bp),
    vix: toNumber(row.vix),
    qqqClose: toNumber(row.qqq_close),
    qqq63dReturnPct: toNumber(row.qqq_63d_return_pct),
    smhClose: toNumber(row.smh_close),
    smh63dReturnPct: toNumber(row.smh_63d_return_pct),
    iwmClose: toNumber(row.iwm_close),
    iwm63dReturnPct: toNumber(row.iwm_63d_return_pct),
    aiCapexState: row.ai_capex_state,
    creditStressScore: toNumber(row.credit_stress_score),
    bubbleScoreTotal: toNumber(row.bubble_score_total),
    valuationExcessScore: toNumber(row.valuation_excess_score),
    capexOverheatingScore: toNumber(row.capex_overheating_score),
    financingFragilityScore: toNumber(row.financing_fragility_score),
    realDemandConversionScore: toNumber(row.real_demand_conversion_score),
    supplyGlutRiskScore: toNumber(row.supply_glut_risk_score),
    leaderEarningsQualityScore: toNumber(row.leader_earnings_quality_score),
    secondTierFragilityScore: toNumber(row.second_tier_fragility_score),
    creditMarketStressScore: toNumber(row.credit_market_stress_score),
    breadthDeteriorationScore: toNumber(row.breadth_deterioration_score),
    regulatoryGeopoliticalScore: toNumber(row.regulatory_geopolitical_score),
    megaIpoPrivateMarketDrainScore: toNumber(row.mega_ipo_private_market_drain_score),
    unavailableIndicators: row.unavailable_indicators,
    notes: row.notes,
  })).sort((left, right) => left.asOf.localeCompare(right.asOf));
}

function readMacroRiskMatrix(): MacroRiskMatrixRecord[] {
  return readCsv("research/macro/watchlist-risk-matrix.csv").map((row) => ({
    riskFactor: row.risk_factor,
    asOf: row.as_of,
    highSymbols: row.high_symbols,
    mediumSymbols: row.medium_symbols,
    monitorSource: row.monitor_source,
    portfolioHandling: row.portfolio_handling,
    notes: row.notes,
  }));
}

function readMacroEventCalendar(): MacroEventRecord[] {
  return readCsv("research/macro/event-calendar.csv").map((row) => ({
    eventId: row.event_id,
    eventDate: row.event_date,
    eventType: row.event_type,
    scope: row.scope,
    symbolsOrLanes: row.symbols_or_lanes,
    sourceId: row.source_id,
    status: row.status,
    importance: row.importance,
    decisionEffect: row.decision_effect,
    reviewRequiredBy: row.review_required_by,
    notes: row.notes,
  })).sort((left, right) => left.reviewRequiredBy.localeCompare(right.reviewRequiredBy));
}

function readOperatingRuns(): OperatingRunRecord[] {
  return readCsv("research/operating-runs.csv").map((row) => ({
    runId: row.run_id,
    runDate: row.run_date,
    runType: row.run_type,
    status: row.status,
    policyVersion: row.policy_version,
    title: row.title,
    decisionSummary: row.decision_summary,
    analysisSummary: row.analysis_summary,
    decisionResult: row.decision_result,
    executionSummary: row.execution_summary,
    decisionCoverage: readDecisionCoverage(row.linked_decision_path),
    confirmedLedgerEventIds: splitList(row.confirmed_ledger_event_ids),
    primarySymbols: splitList(row.primary_symbols),
    linkedDecisionPath: row.linked_decision_path,
    linkedRunArtifactPath: row.linked_run_artifact_path,
    evidencePacketPath: row.evidence_packet_path,
    validationSummary: row.validation_summary,
    publicationStatus: row.publication_status,
    nextReviewTrigger: row.next_review_trigger,
    notes: row.notes,
  })).sort((left, right) => right.runDate.localeCompare(left.runDate));
}

function readDecisionCoverage(relativePath: string): DecisionCoverageRow[] {
  if (relativePath === "") {
    return [];
  }

  const absolutePath = path.join(repositoryRoot, relativePath);
  if (!existsSync(absolutePath)) {
    return [];
  }

  const lines = readFileSync(absolutePath, "utf8").split(/\r?\n/);
  const sectionStart = lines.findIndex((line) => line.trim() === "## Symbol Coverage");
  if (sectionStart < 0) {
    return [];
  }

  const sectionLines: string[] = [];
  for (let index = sectionStart + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.startsWith("## ")) {
      break;
    }
    sectionLines.push(line);
  }

  return sectionLines
    .map(parseMarkdownTableRow)
    .filter((cells) => cells.length >= 3)
    .filter((cells) => cells[0].toLowerCase() !== "symbol")
    .filter((cells) => !/^:?-{3,}:?$/.test(cells[0]))
    .map((cells) => ({
      symbol: cells[0],
      publicRecord: cells[1],
      reason: cells.slice(2).join(" | "),
    }))
    .filter((row) => row.symbol !== "" && row.publicRecord !== "" && row.reason !== "");
}

function parseMarkdownTableRow(line: string): string[] {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|")) {
    return [];
  }

  return trimmed
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim().replace(/\\\|/g, "|"));
}

function readResearchAnalysis(): ResearchAnalysisEntry[] {
  const parsed = parseYaml(readRequiredFile("research/company-analysis.yml")) as Record<string, unknown>;
  const entries = Array.isArray(parsed.entries) ? parsed.entries : [];
  return entries
    .map((entry) => {
      const row = entry as Record<string, unknown>;
      return {
        id: String(row.id ?? ""),
        symbol: String(row.symbol ?? ""),
        analyzedAt: String(row.analyzed_at ?? ""),
        analysisType: String(row.analysis_type ?? ""),
        policyVersion: String(row.policy_version ?? ""),
        title: String(row.title ?? ""),
        stance: String(row.stance ?? ""),
        summary: String(row.summary ?? ""),
        upsidePath: String(row.upside_path ?? ""),
        riskWatch: String(row.risk_watch ?? ""),
        nextCheck: String(row.next_check ?? ""),
        sourcePath: String(row.source_path ?? ""),
      };
    })
    .filter((entry) => entry.id !== "" && entry.symbol !== "");
}

function readWatchlist(
  prices: PriceSnapshot[],
  researchAnalysis: ResearchAnalysisEntry[],
  securityMaster: SecurityRecord[],
  priceHistory: RawPriceHistoryPoint[],
  technicalSnapshots: TechnicalSnapshot[],
  companyMetrics: CompanyMetrics[],
  macroSensitivity: WatchlistSensitivity[],
  financingRunwayScores: FinancingRunwayScore[],
): WatchlistItem[] {
  const priceBySymbol = new Map(prices.map((price) => [price.symbol, price]));
  const securityBySymbol = new Map(securityMaster.map((row) => [row.symbol, row]));
  const technicalBySymbol = new Map(
    technicalSnapshots.map((row) => [row.symbol, row]),
  );
  const metricsBySymbol = new Map(companyMetrics.map((row) => [row.symbol, row]));
  const macroSensitivityBySymbol = latestBySymbol(macroSensitivity);
  const financingBySymbol = latestBySymbol(financingRunwayScores);
  const historyBySymbol = new Map<string, RawPriceHistoryPoint[]>();
  priceHistory.forEach((point) => {
    const history = historyBySymbol.get(point.symbol) ?? [];
    history.push(point);
    historyBySymbol.set(point.symbol, history);
  });
  const analysisBySymbol = new Map<string, ResearchAnalysisEntry[]>();
  researchAnalysis.forEach((entry) => {
    const history = analysisBySymbol.get(entry.symbol) ?? [];
    history.push(entry);
    analysisBySymbol.set(entry.symbol, history);
  });

  analysisBySymbol.forEach((history) => {
    history.sort((left, right) => right.analyzedAt.localeCompare(left.analyzedAt));
  });

  return readCsv("research/watchlist.csv").map((row) => {
    const price = priceBySymbol.get(row.symbol);
    const priceHistoryPoints = (historyBySymbol.get(row.symbol) ?? []).map(
      (point): PriceHistoryPoint => [point.date, point.close],
    );
    return {
      symbol: row.symbol,
      name: row.name,
      theme: row.theme,
      priority: row.priority,
      status: row.status,
      initialRole: row.initial_role,
      latestBaselineDate: row.latest_baseline_date,
      nextReviewTrigger: row.next_review_trigger,
      notes: row.notes,
      price: price?.price ?? null,
      priceAsOf: price?.priceAsOf ?? null,
      security: securityBySymbol.get(row.symbol) ?? null,
      priceHistory: priceHistoryPoints,
      technical: technicalBySymbol.get(row.symbol) ?? null,
      metrics: metricsBySymbol.get(row.symbol) ?? null,
      macroSensitivity: macroSensitivityBySymbol.get(row.symbol) ?? null,
      financingRunway: financingBySymbol.get(row.symbol) ?? null,
      analysisHistory: analysisBySymbol.get(row.symbol) ?? [],
    };
  });
}

function latestBySymbol<T extends { asOf: string; symbol: string }>(rows: T[]): Map<string, T> {
  const latest = new Map<string, T>();
  rows.forEach((row) => {
    const current = latest.get(row.symbol);
    if (current === undefined || row.asOf >= current.asOf) {
      latest.set(row.symbol, row);
    }
  });
  return latest;
}

function splitList(value: string): string[] {
  return value
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function loadPortfolioData(): PortfolioData {
  const prices = readPrices();
  const priceHistory = readPriceHistory();
  const securityMaster = readSecurityMaster();
  const technicalSnapshots = readTechnicalSnapshots();
  const companyMetrics = readCompanyMetrics();
  const macroSensitivity = readMacroSensitivity();
  const financingRunwayScores = readFinancingRunwayScores();
  const macroRegimeSnapshots = readMacroRegimeSnapshots();
  const researchAnalysis = readResearchAnalysis();
  return {
    generatedAt: new Date().toISOString(),
    policyVersion,
    repositoryUrl,
    publicUrl,
    accountState: readAccountState(),
    ledger: readLedger(),
    positions: readPositions(),
    equityCurve: readEquityCurve(),
    macro: {
      latestRegime: macroRegimeSnapshots.at(-1) ?? null,
      riskMatrix: readMacroRiskMatrix(),
      eventCalendar: readMacroEventCalendar(),
    },
    operatingRuns: readOperatingRuns(),
    watchlist: readWatchlist(
      prices,
      researchAnalysis,
      securityMaster,
      priceHistory,
      technicalSnapshots,
      companyMetrics,
      macroSensitivity,
      financingRunwayScores,
    ),
    prices,
  };
}
