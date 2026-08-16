import fs from "node:fs";
import mysql from "mysql2/promise";

const payload = JSON.parse(fs.readFileSync("/home/ubuntu/Downloads/egx30-yahoo-ohlcv-30d.json", "utf8"));
const rows = payload.rows.filter((r) => r && typeof r.symbol === "string" && Number.isFinite(r.timestamp) && [r.open, r.high, r.low, r.close, r.volume].every(Number.isFinite) && r.open > 0 && r.high >= r.low && r.close > 0 && r.volume >= 0);
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not available");
const connection = await mysql.createConnection(process.env.DATABASE_URL);
try {
  await connection.beginTransaction();
  const symbols = [...new Set(rows.map((r) => r.symbol))];
  for (const symbol of symbols) {
    await connection.execute("INSERT INTO instruments (symbol,name,exchange,isTracked) VALUES (?,?,?,1) ON DUPLICATE KEY UPDATE name=VALUES(name),exchange='EGX',isTracked=1", [symbol, symbol, "EGX"]);
  }
  const [instrumentRows] = await connection.query("SELECT id,symbol FROM instruments WHERE symbol IN (?)", [symbols]);
  const instrumentIds = new Map(instrumentRows.map((r) => [r.symbol, r.id]));
  let inserted = 0;
  for (const r of rows) {
    const instrumentId = instrumentIds.get(r.symbol);
    if (!instrumentId) throw new Error(`Instrument missing after upsert: ${r.symbol}`);
    const [result] = await connection.execute("INSERT INTO daily_bars (instrumentId,tradingDate,open,high,low,close,adjustedClose,volume,turnover,provider) SELECT ?,FROM_UNIXTIME(?),?,?,?,?,?, ?,NULL,'yahoo-free' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM daily_bars WHERE instrumentId=? AND tradingDate=FROM_UNIXTIME(?))", [instrumentId, Math.floor(r.timestamp / 1000), r.open, r.high, r.low, r.close, r.close, r.volume, instrumentId, Math.floor(r.timestamp / 1000)]);
    inserted += result.affectedRows;
  }
  await connection.commit();
  console.log(JSON.stringify({ source: payload.source, from: payload.from, to: payload.to, rowsRead: rows.length, symbols: symbols.length, inserted }, null, 2));
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.end();
}
