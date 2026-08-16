import fs from "node:fs";

const input = "/home/ubuntu/Downloads/egx30-yahoo-ohlcv-30d.json";
const output = "/tmp/egx30-real-data.sql";
const payload = JSON.parse(fs.readFileSync(input, "utf8"));
const rows = payload.rows.filter((row) =>
  row && typeof row.symbol === "string" &&
  Number.isFinite(row.timestamp) &&
  [row.open, row.high, row.low, row.close, row.volume].every(Number.isFinite) &&
  row.open > 0 && row.high >= row.low && row.close > 0 && row.volume >= 0
);
const symbols = [...new Set(rows.map((row) => row.symbol))];
const q = (value) => `'${String(value).replaceAll("'", "''")}'`;
const dateSql = (timestamp) => `FROM_UNIXTIME(${Math.floor(timestamp / 1000)})`;
const statements = [
  "START TRANSACTION;",
  ...symbols.map((symbol) => {
    const name = symbol.replace(/\\.EGX$/, "");
    return `INSERT INTO instruments (symbol, name, exchange, isTracked) VALUES (${q(symbol)}, ${q(name)}, 'EGX', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), exchange='EGX', isTracked=1;`;
  }),
  ...rows.map((row) => `INSERT INTO daily_bars (instrumentId, tradingDate, open, high, low, close, adjustedClose, volume, turnover, provider) SELECT id, ${dateSql(row.timestamp)}, ${row.open}, ${row.high}, ${row.low}, ${row.close}, ${row.close}, ${row.volume}, NULL, 'yahoo-free' FROM instruments WHERE symbol=${q(row.symbol)} AND NOT EXISTS (SELECT 1 FROM daily_bars existing JOIN instruments existing_instrument ON existing.instrumentId=existing_instrument.id WHERE existing_instrument.symbol=${q(row.symbol)} AND existing.tradingDate=${dateSql(row.timestamp)});`),
  "COMMIT;",
];
fs.writeFileSync(output, `${statements.join("\n")}\n`, "utf8");
console.log(JSON.stringify({ input, output, source: payload.source, from: payload.from, to: payload.to, rows: rows.length, symbols: symbols.length, unavailable: payload.unavailable }, null, 2));
