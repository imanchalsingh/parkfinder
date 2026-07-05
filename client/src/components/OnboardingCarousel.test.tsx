// @vitest-environment jsdom
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import OnboardingCarousel from './OnboardingCarousel';
import { OnboardingProvider, useOnboarding } from '../context/OnboardingContext';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../context/ThemeContext';

// Mock matchMedia for framer-motion if needed, though usually not strictly required unless using specific media queries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, onClick }: any) => (
      <div className={className} onClick={onClick}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Create a wrapper component with all required providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <OnboardingProvider>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </OnboardingProvider>
    </ThemeProvider>
  );
};

// Create a component that exposes the context to test relaunch functionality
const TestControls = () => {
  const { launchOnboarding } = useOnboarding();
  return (
    <button onClick={launchOnboarding}>Relaunch</button>
  );
};

describe('OnboardingCarousel Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders automatically if hasSeenOnboarding is not set', () => {
    render(<OnboardingCarousel />, { wrapper: AllTheProviders });
    
    // First slide should be visible
    expect(screen.getAllByText('Find the Perfect Spot')[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Search across multiple parking locations/)[0]).toBeInTheDocument();
  });

  it('does not render automatically if hasSeenOnboarding is set', () => {
    window.localStorage.setItem('hasSeenOnboarding', 'true');
    render(<OnboardingCarousel />, { wrapper: AllTheProviders });
    
    // Slide should not be present
    expect(screen.queryAllByText('Find the Perfect Spot').length).toBe(0);
  });

  it('navigates to next and previous slides correctly', async () => {
    render(<OnboardingCarousel />, { wrapper: AllTheProviders });
    
    // Click next
    const nextBtn = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextBtn);
    
    // Slide 2
    expect(await screen.findByText('Book in Advance')).toBeInTheDocument();
    
    // Click previous
    const backBtn = screen.getByRole('button', { name: /Back/i });
    fireEvent.click(backBtn);
    
    // Back to Slide 1
    expect(await screen.findByText('Find the Perfect Spot')).toBeInTheDocument();
  });

  it('dismisses the carousel and sets localStorage when X is clicked', () => {
    render(<OnboardingCarousel />, { wrapper: AllTheProviders });
    
    expect(screen.getAllByText('Find the Perfect Spot')[0]).toBeInTheDocument();
    
    const dismissBtn = screen.getByLabelText(/Skip onboarding/i);
    fireEvent.click(dismissBtn);
    
    // Component unmounts
    expect(screen.queryAllByText('Find the Perfect Spot').length).toBe(0);
    
    // LocalStorage updated
    expect(window.localStorage.getItem('hasSeenOnboarding')).toBe('true');
  });

  it('dismisses when finishing the last slide', async () => {
    render(<OnboardingCarousel />, { wrapper: AllTheProviders });
    
    const nextBtn = screen.getByRole('button', { name: /Next/i });
    
    // Click through to slide 4
    fireEvent.click(nextBtn); // 2
    fireEvent.click(nextBtn); // 3
    fireEvent.click(nextBtn); // 4
    
    // We should see "Get Started" now
    const finishBtn = await screen.findByRole('button', { name: /Get Started/i });
    expect(finishBtn).toBeInTheDocument();
    
    // Finish
    fireEvent.click(finishBtn);
    
    // Component unmounts
    expect(screen.queryAllByText('Seamless Checkout').length).toBe(0);
    expect(window.localStorage.getItem('hasSeenOnboarding')).toBe('true');
  });

  it('can be manually relaunched', () => {
    window.localStorage.setItem('hasSeenOnboarding', 'true');
    
    render(
      <AllTheProviders>
        <TestControls />
        <OnboardingCarousel />
      </AllTheProviders>
    );
    
    // Initially not present
    expect(screen.queryAllByText('Find the Perfect Spot').length).toBe(0);
    
    // Click manual trigger
    fireEvent.click(screen.getByText('Relaunch'));
    
    // Now present
    expect(screen.getAllByText('Find the Perfect Spot')[0]).toBeInTheDocument();
  });
});
