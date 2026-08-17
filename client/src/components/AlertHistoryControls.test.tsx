// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AlertHistoryControls } from "./AlertHistoryControls";

describe("AlertHistoryControls", () => {
  it("opens the normalized stock-detail symbol when a persisted token is clicked", () => {
    const onOpenSymbol = vi.fn();
    render(<AlertHistoryControls search="" onSearch={vi.fn()} noMatches={false} details={["FWRY 18.85–19.19 (score 91)"]} rowId={1} onOpenSymbol={onOpenSymbol} />);
    fireEvent.click(screen.getByRole("button", { name: /FWRY 18\.85/ }));
    expect(onOpenSymbol).toHaveBeenCalledWith("FWRY.EGX");
  });

  it("renders the explicit no-match message", () => {
    render(<AlertHistoryControls search="UNKNOWN" onSearch={vi.fn()} noMatches details={[]} rowId={1} onOpenSymbol={vi.fn()} />);
    expect(screen.getByText(/No matching alert records for/)).toBeTruthy();
  });
});
