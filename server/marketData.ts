import axios from "axios";
import type { OhlcvPoint, IntervalSummary } from "@shared/analysis";
import { scoreAccumulationZones, type AccumulationZone } from "@shared/analysis";

type YahooChartResponse = {
  chart?: {
    result?: Array<{
      timestamp?: number[];
      indicators?: { quote?: Array<{ open?: number[]; high?: number[]; low?: number[]; close?: number[]; volume?: number[] }> };
    }>;
    error?: { description?: string };
  };
};

function yahooSymbol(symbol: string) {
  const normalized = symbol.trim().toUpperCase();
  return normalized.endsWith(".EGX") ? `${normalized.replace(/\.EGX$/, "")}.CA` : normalized;
}

export async function fetchFreeDaily(symbol: string, from: string, to: string): Promise<OhlcvPoint[]> {
  const period1 = Math.floor(new Date(`${from}T00:00:00Z`).getTime() / 1000);
  const period2 = Math.floor(new Date(`${to}T23:59:59Z`).getTime() / 1000);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol(symbol))}?period1=${period1}&period2=${period2}&interval=1d&events=history`;
  const response = await axios.get<YahooChartResponse>(url, { timeout: 20_000, headers: { "User-Agent": "Mozilla/5.0" } });
  const result = response.data.chart?.result?.[0];
  const quote = result?.indicators?.quote?.[0];
  const timestamps = result?.timestamp ?? [];
  if (!quote || !timestamps.length) throw new Error(`Free Yahoo source returned no daily data for ${symbol}`);
  const rows = timestamps.map((timestamp, index) => ({
    timestamp: timestamp * 1000,
    open: Number(quote.open?.[index]),
    high: Number(quote.high?.[index]),
    low: Number(quote.low?.[index]),
    close: Number(quote.close?.[index]),
    volume: Number(quote.volume?.[index]),
  })).filter(row => [row.open, row.high, row.low, row.close, row.volume].every(Number.isFinite) && row.open > 0 && row.high > 0 && row.low > 0 && row.close > 0 && row.volume >= 0);
  if (!rows.length) throw new Error(`Free Yahoo source returned no valid daily OHLCV for ${symbol}`);
  return rows;
}

export function analyzeDaily(points: OhlcvPoint[]): { intervals: IntervalSummary[]; zones: AccumulationZone[] } {
  const sorted = [...points].sort((a, b) => a.timestamp - b.timestamp);
  const baseline = sorted.reduce((sum, point) => sum + point.volume, 0) / Math.max(sorted.length, 1);
  const intervals: IntervalSummary[] = sorted.map(point => ({
    ...point,
    intervalStart: point.timestamp,
    intervalEnd: point.timestamp + 24 * 60 * 60 * 1000,
    volumeRatio: baseline ? point.volume / baseline : 0,
    priceRangePct: point.close ? ((point.high - point.low) / point.close) * 100 : 0,
  }));
  return { intervals, zones: scoreAccumulationZones(intervals) };
}

// Free mode intentionally has no intraday adapter. It returns no two-hour bars rather than inventing them.
export async function fetchFreeIntraday(): Promise<OhlcvPoint[]> {
  return [];
}
