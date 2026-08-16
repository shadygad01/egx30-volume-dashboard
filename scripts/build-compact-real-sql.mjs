import fs from "node:fs";
const payload = JSON.parse(fs.readFileSync("/home/ubuntu/Downloads/egx30-yahoo-ohlcv-30d.json", "utf8"));
const rows = payload.rows.filter((r) => r && Number.isFinite(r.timestamp) && [r.open,r.high,r.low,r.close,r.volume].every(Number.isFinite) && r.open > 0 && r.high >= r.low && r.close > 0 && r.volume >= 0);
const symbols = [...new Set(rows.map((r) => r.symbol))];
const q = (v) => `'${String(v).replaceAll("'", "''")}'`;
const instruments = `INSERT INTO instruments (symbol,name,exchange,isTracked) VALUES ${symbols.map((s) => `(${q(s)},${q(s)},'EGX',1)`).join(",")};`;
const dir = "/tmp/egx30-compact-sql";
fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
const size = 80; let n = 0;
for (let i = 0; i < rows.length; i += size) {
  n++;
  const values = rows.slice(i, i + size).map((r) => `( (SELECT id FROM instruments WHERE symbol=${q(r.symbol)}),FROM_UNIXTIME(${Math.floor(r.timestamp/1000)}),${r.open},${r.high},${r.low},${r.close},${r.close},${r.volume},NULL,'yahoo-free')`).join(",\n");
  fs.writeFileSync(`${dir}/chunk-${String(n).padStart(2,"0")}.sql`, `${instruments}\nINSERT INTO daily_bars (instrumentId,tradingDate,open,high,low,close,adjustedClose,volume,turnover,provider) VALUES\n${values};\n`);
}
console.log(JSON.stringify({dir,chunks:n,rows:rows.length,symbols:symbols.length,from:payload.from,to:payload.to,unavailable:payload.unavailable},null,2));
