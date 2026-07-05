// @vitest-environment jsdom
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import PullToRefresh from "../components/PullToRefresh";

// Mock the ThemeProvider context since PullToRefresh uses it
vi.mock("../context/ThemeContext", () => ({
  useTheme: () => ({ theme: "light" }),
}));

describe("PullToRefresh Component", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders its children", () => {
    render(
      <PullToRefresh onRefresh={async () => {}}>
        <div data-testid="child-content">Content</div>
      </PullToRefresh>
    );
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });

  it("does not trigger onRefresh if pull distance is below threshold", async () => {
    const mockOnRefresh = vi.fn().mockResolvedValue(undefined);
    render(
      <PullToRefresh onRefresh={mockOnRefresh} pullDownThreshold={80}>
        <div data-testid="child-content">Content</div>
      </PullToRefresh>
    );

    const container = screen.getByTestId("child-content").parentElement!;

    // Force window.scrollY to 0 for tests
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });

    // Simulate touch start
    fireEvent.touchStart(container, { touches: [{ clientY: 100 }] });
    // Simulate touch move with small distance
    fireEvent.touchMove(container, { touches: [{ clientY: 140 }] }); // distance = 40 (pull distance = 20)
    // Simulate touch end
    fireEvent.touchEnd(container);

    await waitFor(() => {
      expect(mockOnRefresh).not.toHaveBeenCalled();
    });
  });

  it("triggers onRefresh if pull distance is above threshold", async () => {
    const mockOnRefresh = vi.fn().mockResolvedValue(undefined);
    render(
      <PullToRefresh onRefresh={mockOnRefresh} pullDownThreshold={80}>
        <div data-testid="child-content">Content</div>
      </PullToRefresh>
    );

    const container = screen.getByTestId("child-content").parentElement!;

    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });

    // Simulate touch start
    fireEvent.touchStart(container, { touches: [{ clientY: 100 }] });
    
    // Simulate touch move with large distance
    // pull = Math.min(distance * 0.5, maxPullDown)
    // to get pull >= 80, distance needs to be >= 160
    fireEvent.touchMove(container, { touches: [{ clientY: 300 }] }); // distance = 200, pull = 100
    
    // Simulate touch end
    fireEvent.touchEnd(container);

    await waitFor(() => {
      expect(mockOnRefresh).toHaveBeenCalledTimes(1);
    });
  });
});
