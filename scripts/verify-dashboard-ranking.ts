import { writeFile } from "node:fs/promises";
import { rankStocks } from "../shared/ranking";

const response = await fetch("http://127.0.0.1:3000/api/trpc/dashboard.snapshot?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D");
if (!response.ok) throw new Error(`Dashboard snapshot request failed: ${response.status}`);
const envelope = await response.json() as Array<{ result: { data: { json: { latestDate: string; stocks: unknown[]; zones: unknown[] } } } }>;
const snapshot = envelope[0]?.result?.data?.json;
if (!snapshot?.stocks?.length) throw new Error("Persisted dashboard snapshot is empty");
const ranked = rankStocks(snapshot.stocks, snapshot.zones);
const evidence = {
  source: "local dashboard.snapshot tRPC payload backed by persisted database rows",
  latestDate: snapshot.latestDate,
  firstSix: ranked.slice(0, 6).map((item) => ({ symbol: item.instrument.symbol, strengthScore: item.strengthScore, volume: item.bar.volume })),
};
await writeFile("shared/ranking.snapshot.json", JSON.stringify(evidence, null, 2) + "\n");
console.log(JSON.stringify(evidence, null, 2));
