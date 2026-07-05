// @vitest-environment jsdom
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import DashboardPage from './Dashboard';
import { MemoryRouter } from 'react-router-dom';

// Mock recharts to prevent ResizeObserver errors in JSDOM
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  BarChart: ({ children, data }: any) => <div data-testid="barchart">{children}</div>,
  Bar: ({ dataKey }: any) => <div data-testid={`bar-${dataKey}`} />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />
}));

// Mock chart.js
vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn()
  },
  ArcElement: vi.fn(), Tooltip: vi.fn(), Legend: vi.fn(), 
  CategoryScale: vi.fn(), LinearScale: vi.fn(), BarElement: vi.fn(), 
  Title: vi.fn(), PointElement: vi.fn(), LineElement: vi.fn(), Filler: vi.fn()
}));

vi.mock('react-chartjs-2', () => ({
  Pie: () => <div data-testid="pie-chart" />,
  Bar: () => <div data-testid="chartjs-bar" />,
  Line: () => <div data-testid="line-chart" />
}));

// Mock hooks
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ token: 'fake-token' })
}));

vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light' })
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useNavigate: () => vi.fn()
  };
});

// Mock API calls
globalThis.fetch = vi.fn();

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe('Dashboard Booking & Spending Trends (Recharts)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders Recharts BarChart when bookingTrends data is available', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
      if (url.includes('/api/dashboard/user-stats')) {
        return Promise.resolve({
          ok: true,
          headers: { get: () => 'application/json' },
          json: () => Promise.resolve({
            success: true,
            data: {
              bookingTrends: [
                { month: "Jan 2026", bookings: 5, spent: 100 },
                { month: "Feb 2026", bookings: 3, spent: 60 }
              ]
            }
          })
        });
      }
      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ success: true, data: [] })
      });
    });

    renderWithRouter(<DashboardPage />);

    const barchart = await screen.findByTestId('barchart');
    expect(barchart).toBeInTheDocument();
    
    expect(screen.getByTestId('bar-spent')).toBeInTheDocument();
    expect(screen.getByTestId('bar-bookings')).toBeInTheDocument();
  });

  it('renders empty state when bookingTrends data is empty', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
      if (url.includes('/api/dashboard/user-stats')) {
        return Promise.resolve({
          ok: true,
          headers: { get: () => 'application/json' },
          json: () => Promise.resolve({
            success: true,
            data: {
              bookingTrends: []
            }
          })
        });
      }
      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ success: true, data: [] }) 
      });
    });

    renderWithRouter(<DashboardPage />);

    // Wait for the fetch to resolve so stats is updated
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/dashboard/user-stats'),
        expect.any(Object)
      );
    });

    const emptyState = await screen.findByText('No spending data available yet.');
    expect(emptyState).toBeInTheDocument();
    
    expect(screen.queryByTestId('barchart')).not.toBeInTheDocument();
  });
});
