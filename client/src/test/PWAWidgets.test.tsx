import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import PWAWidgets from '../components/PWAWidgets';
import { usePWA } from '../context/PWAContext';
import { useTheme } from '../context/ThemeContext';
import React from 'react';

vi.mock('../context/PWAContext', () => ({
  usePWA: vi.fn(),
}));

vi.mock('../context/ThemeContext', () => ({
  useTheme: vi.fn(),
}));

describe('PWAWidgets Edge Cases', () => {
  const defaultPwaContext = {
    isOffline: false,
    deferredPrompt: null,
    installApp: vi.fn(),
    needRefresh: false,
    updateApp: vi.fn(),
    closeUpdatePrompt: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useTheme as any).mockReturnValue({ theme: 'light' });
  });

  it('renders nothing when online, no update, and no install prompt', () => {
    (usePWA as any).mockReturnValue(defaultPwaContext);
    const { container } = render(<PWAWidgets />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders offline indicator when isOffline is true', () => {
    (usePWA as any).mockReturnValue({ ...defaultPwaContext, isOffline: true });
    render(<PWAWidgets />);
    expect(screen.getByText("You're offline")).toBeInTheDocument();
  });

  it('renders update prompt and calls updateApp', () => {
    const updateAppMock = vi.fn();
    (usePWA as any).mockReturnValue({ ...defaultPwaContext, needRefresh: true, updateApp: updateAppMock });
    render(<PWAWidgets />);
    
    expect(screen.getByText('Update Available!')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Update Now'));
    expect(updateAppMock).toHaveBeenCalledTimes(1);
  });

  it('renders install prompt if deferredPrompt is present and needRefresh is false', () => {
    const installAppMock = vi.fn();
    (usePWA as any).mockReturnValue({ 
      ...defaultPwaContext, 
      deferredPrompt: { prompt: vi.fn() },
      installApp: installAppMock,
      needRefresh: false
    });
    render(<PWAWidgets />);
    
    expect(screen.getByText('Install SmartPark')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Install App'));
    expect(installAppMock).toHaveBeenCalledTimes(1);
  });

  it('prioritizes update prompt over install prompt', () => {
    (usePWA as any).mockReturnValue({ 
      ...defaultPwaContext, 
      deferredPrompt: { prompt: vi.fn() },
      needRefresh: true
    });
    render(<PWAWidgets />);
    
    expect(screen.getByText('Update Available!')).toBeInTheDocument();
    expect(screen.queryByText('Install SmartPark')).not.toBeInTheDocument();
  });
});
