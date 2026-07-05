import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import { ThemeProvider } from '../context/ThemeContext';

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe('PasswordStrengthMeter', () => {
  it('renders nothing when no password is provided', () => {
    const { container } = renderWithTheme(<PasswordStrengthMeter password="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows Very Weak for very short passwords', () => {
    renderWithTheme(<PasswordStrengthMeter password="123" />);
    expect(screen.getByText('Very Weak')).toBeInTheDocument();
  });

  it('shows Strong for a strong password', () => {
    renderWithTheme(<PasswordStrengthMeter password="CorrectHorseBatteryStaple!123" />);
    expect(screen.getByText('Strong')).toBeInTheDocument();
  });

  it('displays suggestions when the password is weak', () => {
    renderWithTheme(<PasswordStrengthMeter password="password123" />);
    // zxcvbn typically gives a warning for common passwords
    expect(screen.getByText(/This is a very common password/i)).toBeInTheDocument();
    // And usually suggests adding words
    expect(screen.getByText(/Add another word or two/i)).toBeInTheDocument();
  });

  it('updates dynamically when props change', () => {
    const { rerender } = renderWithTheme(<PasswordStrengthMeter password="123" />);
    expect(screen.getByText('Very Weak')).toBeInTheDocument();

    rerender(
      <ThemeProvider>
        <PasswordStrengthMeter password="CorrectHorseBatteryStaple!123" />
      </ThemeProvider>
    );
    expect(screen.getByText('Strong')).toBeInTheDocument();
  });
});
