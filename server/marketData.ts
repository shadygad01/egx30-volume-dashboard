import axios from "axios";
import type { OhlcvPoint } from "@shared/analysis";
import { aggregateTwoHourIntervals, scoreAccumulationZones } from "@shared/analysis";

export type EodhdCandle = { date: string; datetime?: string; open: number; high: number; low: number; close: number; adjusted_close?: number; volume: number };

function mapCandle(row: EodhdCandle): OhlcvPoint {
  return { timestamp: new Date(row.datetime ?? `${row.date}T14:30:00.000Z`).getTime(), open: Number(row.open), high: Number(row.high), low: Number(row.low), close: Number(row.close), volume: Number(row.volume) };
}

export async function fetchEodhdDaily(symbol: string, apiToken: string, from: string, to: string): Promise<OhlcvPoint[]> {
  const url = `https://eodhd.com/api/eod/${encodeURIComponent(symbol)}?from=${from}&to=${to}&api_token=${encodeURIComponent(apiToken)}&fmt=json`;
  const response = await axios.get<EodhdCandle[]>(url, { timeout: 20_000 });
  if (!Array.isArray(response.data)) throw new Error(`Unexpected EODHD daily response for ${symbol}`);
  return response.data.map(mapCandle).filter(row => Number.isFinite(row.close) && Number.isFinite(row.volume));
}

export async function fetchEodhdIntraday(symbol: string, apiToken: string, from: string, to: string): Promise<OhlcvPoint[]> {
  const url = `https://eodhd.com/api/intraday/${encodeURIComponent(symbol)}?interval=1h&from=${from}&to=${to}&api_token=${encodeURIComponent(apiToken)}&fmt=json`;
  const response = await axios.get<EodhdCandle[]>(url, { timeout: 20_000 });
  if (!Array.isArray(response.data)) throw new Error(`Unexpected EODHD intraday response for ${symbol}`);
  return response.data.map(mapCandle).filter(row => Number.isFinite(row.close) && Number.isFinite(row.volume));
}

export function analyzeDaily(intradayPoints: OhlcvPoint[]) {
  const intervals = aggregateTwoHourIntervals(intradayPoints);
  const zones = scoreAccumulationZones(intervals);
  return { intervals, zones };
}
