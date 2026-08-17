import React from "react";
import { alertNavigationTarget } from "@shared/alertHistory";

type Props = {
  search: string;
  onSearch: (value: string) => void;
  noMatches: boolean;
  details: string[];
  rowId: number;
  onOpenSymbol: (symbol: string) => void;
};

export function AlertHistoryControls({ search, onSearch, noMatches, details, rowId, onOpenSymbol }: Props) {
  return <>
    <input aria-label="Search alert history" value={search} onChange={e => onSearch(e.target.value)} placeholder="Search symbol or price range" className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-slate-200 placeholder:text-slate-600 sm:w-80" />
    {noMatches && <p className="mt-2 text-xs text-slate-500">No matching alert records for “{search}”. Search uses only persisted symbols and recorded price ranges.</p>}
    {details.length > 0 && <div className="flex flex-wrap gap-2">{details.map((detail, index) => { const symbol = detail.split(" ")[0]; return <button key={`${rowId}-${index}`} type="button" onClick={() => onOpenSymbol(alertNavigationTarget(symbol))} className="rounded-md border border-cyan-300/15 bg-cyan-300/[0.05] px-2 py-1 text-left text-cyan-200 transition-colors hover:border-cyan-300/40 hover:bg-cyan-300/10">{detail}</button>; })}</div>}
  </>;
}
