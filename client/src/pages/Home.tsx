import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, ArrowUpRight, BarChart3, Database, RefreshCw, ShieldAlert, Sparkles, TrendingUp, Waves } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";

const navItems = ["Overview", "Stock detail", "Methodology"];

function confidenceClass(value: string) {
  return value === "High" ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : value === "Medium" ? "border-amber-400/20 bg-amber-400/10 text-amber-300" : "border-slate-400/20 bg-slate-400/10 text-slate-300";
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const snapshot = trpc.dashboard.snapshot.useQuery();
  const detail = trpc.dashboard.stock.useQuery({ symbol: selectedSymbol ?? "COMI.EGX" }, { enabled: Boolean(selectedSymbol) });
  const stocks = snapshot.data?.stocks ?? [];
  const zones = snapshot.data?.zones ?? [];
  const latestDate = snapshot.data?.latestDate ? new Date(snapshot.data.latestDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Awaiting first run";
  const heatmap = useMemo(() => stocks.map((item: any) => ({ symbol: item.instrument.symbol.replace(".EGX", ""), volume: item.bar.volume })), [stocks]);

  return <DashboardLayout>
    <div className="min-h-screen bg-[#071018] text-slate-100 -m-4 p-5 lg:p-8">
      <header className="mx-auto max-w-[1500px] flex flex-col gap-6 border-b border-white/10 pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-5 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.24em] text-cyan-300"><span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_#67e8f9]" /> Market intelligence workspace</div>
          <h1 className="text-3xl font-semibold tracking-tight text-white lg:text-5xl">EGX30 <span className="text-slate-500">/</span> Volume Zones</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">A daily, evidence-led view of price acceptance and unusual volume across the Egyptian Exchange.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-slate-400">Last close <span className="ml-2 font-medium text-slate-200">{latestDate}</span></div>
          <Button variant="outline" className="border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px]">
        <nav className="flex gap-7 border-b border-white/10 pt-5 text-sm text-slate-500">
          {navItems.map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`relative pb-4 transition-colors ${activeTab === tab ? "text-cyan-300" : "hover:text-slate-200"}`}>{tab}{activeTab === tab && <span className="absolute inset-x-0 -bottom-px h-px bg-cyan-300" />}</button>)}
          <Link href="/settings" className="ml-auto pb-4 text-slate-500 hover:text-slate-200">Configure source →</Link>
        </nav>

        {activeTab === "Overview" && <>
          {snapshot.isError && <div className="mb-5 rounded-xl border border-rose-300/20 bg-rose-300/[0.06] p-4 text-sm text-rose-200">Unable to load the latest market snapshot. Check the provider connection and try again.</div>}
          {snapshot.isLoading && <div className="mb-5 rounded-xl border border-cyan-300/15 bg-cyan-300/[0.05] p-4 text-sm text-cyan-100">Loading the latest close and analysis state…</div>}
          <section className="grid gap-4 py-7 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Tracked universe" value={stocks.length ? `${stocks.length}` : "30"} suffix="stocks" icon={<Database />} tone="cyan" />
            <MetricCard label="Potential zones" value={`${zones.length}`} suffix="identified" icon={<Waves />} tone="violet" />
            <MetricCard label="High confidence" value={`${zones.filter((z: any) => z.zone.confidence === "High").length}`} suffix="zones" icon={<Sparkles />} tone="emerald" />
            <MetricCard label="Run status" value={snapshot.isLoading ? "Syncing" : latestDate === "Awaiting first run" ? "Setup" : "Ready"} suffix="daily close" icon={<Activity />} tone="amber" />
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
            <Card className="border-white/10 bg-white/[0.035] text-white shadow-2xl shadow-black/20">
              <CardHeader className="flex flex-row items-start justify-between border-b border-white/10 pb-5"><div><CardTitle className="text-base font-medium">Volume activity map</CardTitle><p className="mt-1 text-xs text-slate-500">Relative daily volume across tracked instruments</p></div><BarChart3 className="h-5 w-5 text-cyan-300" /></CardHeader>
              <CardContent className="pt-5">{heatmap.length ? <Heatmap data={heatmap} /> : <div className="h-[280px]"><EmptyChart title="Your first market map is one close away" body="Add an EODHD API key in Settings, then the daily job will populate this view." /></div>}</CardContent>
            </Card>
            <Card className="border-white/10 bg-white/[0.035] text-white shadow-2xl shadow-black/20"><CardHeader className="border-b border-white/10 pb-5"><CardTitle className="text-base font-medium">Signal quality</CardTitle><p className="mt-1 text-xs text-slate-500">How zones are classified</p></CardHeader><CardContent className="space-y-5 pt-6"><SignalRow color="bg-emerald-300" label="High" text="Strong volume + tight acceptance" /><SignalRow color="bg-amber-300" label="Medium" text="Two of three conditions align" /><SignalRow color="bg-slate-400" label="Low" text="Early or weaker evidence" /><div className="rounded-xl border border-amber-300/15 bg-amber-300/[0.06] p-4 text-xs leading-5 text-amber-100/70"><ShieldAlert className="mb-2 h-4 w-4 text-amber-300" />All outputs are analytical observations, not an investment recommendation.</div></CardContent></Card>
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
            <Card className="border-white/10 bg-white/[0.035] text-white"><CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-5"><div><CardTitle className="text-base font-medium">Tracked stocks</CardTitle><p className="mt-1 text-xs text-slate-500">Daily range, activity and strongest zone</p></div><TrendingUp className="h-5 w-5 text-violet-300" /></CardHeader><CardContent className="p-0">{stocks.length ? <div className="divide-y divide-white/5">{stocks.map((item: any) => <button onClick={() => setSelectedSymbol(item.instrument.symbol)} key={item.instrument.symbol} className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-white/[0.04]"><div><p className="font-medium text-slate-100">{item.instrument.symbol.replace(".EGX", "")}</p><p className="mt-1 text-xs text-slate-500">{item.instrument.name}</p></div><div className="text-right"><p className="font-mono text-sm text-slate-200">{item.bar.low.toFixed(2)} — {item.bar.high.toFixed(2)}</p><p className="mt-1 text-xs text-cyan-300">{Number(item.bar.volume).toLocaleString()} volume</p></div><ArrowUpRight className="ml-4 h-4 w-4 text-slate-600" /></button>)}</div> : <EmptyState />}</CardContent></Card>
            <Card className="border-white/10 bg-white/[0.035] text-white"><CardHeader className="border-b border-white/10 pb-5"><CardTitle className="text-base font-medium">Notable zones</CardTitle><p className="mt-1 text-xs text-slate-500">Highest composite scores from the latest close</p></CardHeader><CardContent className="space-y-3 pt-5">{zones.length ? zones.slice(0, 5).map((entry: any) => <div key={entry.zone.id} className="rounded-xl border border-white/10 bg-black/10 p-4"><div className="flex items-center justify-between"><span className="font-medium">{entry.instrument.symbol.replace(".EGX", "")}</span><Badge className={confidenceClass(entry.zone.confidence)}>{entry.zone.confidence}</Badge></div><p className="mt-3 font-mono text-sm text-cyan-200">{entry.zone.lowerPrice.toFixed(2)} — {entry.zone.upperPrice.toFixed(2)}</p><p className="mt-2 text-xs leading-5 text-slate-500">{entry.zone.explanation}</p></div>) : <EmptyState compact />}</CardContent></Card>
          </section>
        </>}

        {activeTab === "Stock detail" && <StockDetail detail={detail.data} selectedSymbol={selectedSymbol} setSelectedSymbol={setSelectedSymbol} />}
        {activeTab === "Methodology" && <Methodology />}
      </main>
    </div>
  </DashboardLayout>;
}

function MetricCard({ label, value, suffix, icon, tone }: any) { const colors: any = { cyan: "text-cyan-300", violet: "text-violet-300", emerald: "text-emerald-300", amber: "text-amber-300" }; return <Card className="border-white/10 bg-white/[0.035] text-white"><CardContent className="p-5"><div className="flex items-center justify-between"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p><span className={colors[tone]}>{icon}</span></div><div className="mt-5 flex items-baseline gap-2"><span className="text-3xl font-semibold tracking-tight">{value}</span><span className="text-xs text-slate-500">{suffix}</span></div></CardContent></Card> }
function SignalRow({ color, label, text }: any) { return <div className="flex items-center gap-3"><span className={`h-2.5 w-2.5 rounded-full ${color}`} /><div><p className="text-sm text-slate-200">{label}</p><p className="text-xs text-slate-500">{text}</p></div></div> }
function EmptyChart({ title, body }: any) { return <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/10 text-center"><BarChart3 className="mb-4 h-8 w-8 text-slate-600" /><p className="text-sm text-slate-300">{title}</p><p className="mt-2 max-w-xs text-xs leading-5 text-slate-500">{body}</p></div> }
function EmptyState({ compact = false }: { compact?: boolean }) { return <div className={`flex flex-col items-center justify-center text-center ${compact ? "py-12" : "min-h-[230px] p-8"}`}><Database className="mb-3 h-7 w-7 text-slate-600" /><p className="text-sm text-slate-300">No market data yet</p><p className="mt-2 max-w-xs text-xs leading-5 text-slate-500">Connect a provider in Settings and run the first daily close.</p></div> }
function Heatmap({ data }: { data: { symbol: string; volume: number }[] }) { const max = Math.max(...data.map(item => item.volume), 1); return <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">{data.map(item => { const intensity = Math.max(0.12, item.volume / max); return <div key={item.symbol} className="rounded-xl border border-white/10 p-3" style={{ background: `rgba(103,232,249,${intensity * 0.55})` }}><p className="font-mono text-xs text-slate-100">{item.symbol}</p><p className="mt-3 text-[10px] text-slate-300">{Number(item.volume).toLocaleString()}</p></div> })}</div> }
function CandleChart({ bars }: { bars: any[] }) { const recent = bars.slice(-24); const max = Math.max(...recent.map(bar => Number(bar.high)), 1); const min = Math.min(...recent.map(bar => Number(bar.low)), 0); return <div className="grid grid-cols-12 items-end gap-2 rounded-xl border border-white/10 bg-black/10 p-5" style={{ height: 360 }}>{recent.length ? recent.map((bar, index) => { const open = Number(bar.open), close = Number(bar.close), high = Number(bar.high), low = Number(bar.low); const scale = (value: number) => ((value - min) / Math.max(max - min, 1)) * 270; const rising = close >= open; return <div key={index} className="relative flex h-full flex-col items-center justify-end"><div className="absolute bottom-0 w-full rounded-t bg-cyan-300/10" style={{ height: `${Math.max(8, Number(bar.volume) / Math.max(...recent.map((item: any) => Number(item.volume)), 1) * 70)}px` }} /><div className="absolute w-px bg-slate-300/60" style={{ bottom: scale(low), height: Math.max(8, scale(high) - scale(low)) }} /><div className={`absolute w-3 rounded-sm ${rising ? "bg-emerald-300" : "bg-rose-300"}`} style={{ bottom: scale(Math.min(open, close)), height: Math.max(4, Math.abs(scale(close) - scale(open))) }} /></div> }) : <div className="col-span-12 flex items-center justify-center text-sm text-slate-500">No candle data yet.</div>}</div> }
function StockDetail({ detail, selectedSymbol, setSelectedSymbol }: any) { return <section className="py-7"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Instrument detail</p><h2 className="mt-2 text-2xl font-semibold">{selectedSymbol ?? "Select a stock"}</h2></div><select value={selectedSymbol ?? ""} onChange={e => setSelectedSymbol(e.target.value || null)} className="rounded-lg border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-slate-200"><option value="">Choose tracked stock</option></select></div>{detail ? <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]"><Card className="border-white/10 bg-white/[0.035] text-white"><CardHeader><CardTitle className="text-base">Candlestick + volume profile</CardTitle></CardHeader><CardContent><CandleChart bars={detail.bars} /><div className="mt-4 flex gap-4 text-xs text-slate-500"><span><i className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-300" />Up close</span><span><i className="mr-2 inline-block h-2 w-2 rounded-full bg-rose-300" />Down close</span><span><i className="mr-2 inline-block h-2 w-2 rounded-sm bg-cyan-300/40" />Volume band</span></div></CardContent></Card><Card className="border-white/10 bg-white/[0.035] text-white"><CardHeader><CardTitle className="text-base">Potential zones</CardTitle></CardHeader><CardContent>{detail.zones?.length ? detail.zones.map((zone: any) => <div key={zone.id} className="mb-3 rounded-xl border border-white/10 p-4"><div className="flex justify-between"><span className="font-mono text-cyan-200">{zone.lowerPrice} — {zone.upperPrice}</span><Badge className={confidenceClass(zone.confidence)}>{zone.confidence}</Badge></div><p className="mt-2 text-xs text-slate-500">{zone.explanation}</p></div>) : <EmptyState compact />}</CardContent></Card></div> : <EmptyChart title="Select an instrument" body="Choose a tracked EGX30 stock to inspect its historical price behavior and detected zones." />}</section> }
function Methodology() { return <section className="grid gap-5 py-7 lg:grid-cols-3"><Card className="border-white/10 bg-white/[0.035] text-white lg:col-span-2"><CardHeader><CardTitle>How the signal is formed</CardTitle></CardHeader><CardContent className="space-y-5 text-sm leading-7 text-slate-400"><p>Each daily series is grouped into two-hour windows. The engine compares interval volume with the session baseline, measures whether price repeatedly accepts the same area, and checks whether the range stays relatively narrow.</p><p>The resulting composite score maps to exactly three confidence tiers: <strong className="text-emerald-300">High</strong>, <strong className="text-amber-300">Medium</strong>, or <strong className="text-slate-200">Low</strong>. These labels describe evidence strength, not expected returns.</p><blockquote className="border-l-2 border-cyan-300 pl-4 text-slate-300">Analytical results are not an investment recommendation. Always validate data quality and perform independent research.</blockquote></CardContent></Card><Card className="border-white/10 bg-white/[0.035] text-white"><CardHeader><CardTitle>Daily cadence</CardTitle></CardHeader><CardContent className="space-y-4 text-sm text-slate-400"><div className="rounded-xl bg-white/[0.04] p-4"><p className="text-xs uppercase tracking-wider text-slate-500">Trigger</p><p className="mt-2 text-lg text-slate-100">14:30 Cairo</p></div><div className="rounded-xl bg-white/[0.04] p-4"><p className="text-xs uppercase tracking-wider text-slate-500">Output</p><p className="mt-2 text-slate-200">New close, intervals, zones and heat map</p></div></CardContent></Card></section> }
