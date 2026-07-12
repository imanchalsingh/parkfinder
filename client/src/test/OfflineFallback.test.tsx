import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import OfflineFallback from '../components/OfflineFallback';
import { usePWA } from '../context/PWAContext';
import { useTheme } from '../context/ThemeContext';
import React from 'react';

vi.mock('../context/PWAContext', () => ({
  usePWA: vi.fn(),
}));

vi.mock('../context/ThemeContext', () => ({
  useTheme: vi.fn(),
}));

describe('OfflineFallback Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render nothing if isOffline is false', () => {
    (usePWA as any).mockReturnValue({ isOffline: false });
    (useTheme as any).mockReturnValue({ theme: 'light' });

    const { container } = render(<OfflineFallback />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render fallback UI if isOffline is true', () => {
    (usePWA as any).mockReturnValue({ isOffline: true });
    (useTheme as any).mockReturnValue({ theme: 'light' });

    render(<OfflineFallback title="Test Offline" message="Test Message" />);
    
    expect(screen.getByText('Test Offline')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('should call onRetry only if navigator.onLine is true', () => {
    (usePWA as any).mockReturnValue({ isOffline: true });
    (useTheme as any).mockReturnValue({ theme: 'light' });
    
    // Mock navigator.onLine to be false first
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      configurable: true,
    });

    const onRetryMock = vi.fn();
    render(<OfflineFallback onRetry={onRetryMock} />);

    const retryBtn = screen.getByRole('button', { name: /Try Again/i });
    fireEvent.click(retryBtn);
    expect(onRetryMock).not.toHaveBeenCalled();

    // Now mock to true
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      configurable: true,
    });

    fireEvent.click(retryBtn);
    expect(onRetryMock).toHaveBeenCalledTimes(1);
  });

  it('should show queue status when prop is true', () => {
    (usePWA as any).mockReturnValue({ isOffline: true });
    (useTheme as any).mockReturnValue({ theme: 'dark' });

    render(<OfflineFallback showQueueStatus={true} />);
    expect(screen.getByText('Background Sync Active')).toBeInTheDocument();
  });
});
