import fs from "node:fs";
const lines = fs.readFileSync("/tmp/egx30-real-data.sql", "utf8").trim().split("\n").slice(1, -1);
const instrumentLines = lines.filter((line) => line.startsWith("INSERT INTO instruments"));
const barLines = lines.filter((line) => line.startsWith("INSERT INTO daily_bars"));
const dir = "/tmp/egx30-sql-chunks";
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });
const size = 25;
let chunk = 0;
for (let i = 0; i < barLines.length; i += size) {
  chunk += 1;
  const body = [...instrumentLines, ...barLines.slice(i, i + size)].join("\n") + "\n";
  fs.writeFileSync(`${dir}/chunk-${String(chunk).padStart(2, "0")}.sql`, body);
}
console.log(JSON.stringify({ chunks: chunk, bars: barLines.length, instruments: instrumentLines.length, dir }, null, 2));
