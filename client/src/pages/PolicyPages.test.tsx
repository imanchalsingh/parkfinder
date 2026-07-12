// @vitest-environment jsdom
import { describe, test, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "../context/ThemeContext";
import TermsPage from "./TermsPage";
import PrivacyPage from "./PrivacyPage";

// ─── Helpers ────────────────────────────────────────────────────────────────

const renderWithProviders = (ui: React.ReactElement) =>
  render(
    <BrowserRouter>
      <ThemeProvider>{ui}</ThemeProvider>
    </BrowserRouter>
  );

// ═══════════════════════════════════════════════════════════════════════════
// Terms of Service Page
// ═══════════════════════════════════════════════════════════════════════════

describe("TermsPage", () => {
  test("renders the main heading", () => {
    renderWithProviders(<TermsPage />);
    expect(screen.getByRole("heading", { name: /terms of service/i, level: 1 })).toBeInTheDocument();
  });

  test("shows the last updated date", () => {
    renderWithProviders(<TermsPage />);
    expect(screen.getByText(/june 26, 2026/i)).toBeInTheDocument();
  });

  test("renders all required sections", () => {
    renderWithProviders(<TermsPage />);
    expect(screen.getByRole("heading", { name: /acceptance of terms/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /user eligibility/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /account responsibilities/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /parking & booking policy/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /prohibited activities/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /modifications to service/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /limitation of liability/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /governing law/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /contact us/i })).toBeInTheDocument();
  });

  test("has a 'Back to Sign Up' navigation link", () => {
    renderWithProviders(<TermsPage />);
    const backLinks = screen.getAllByRole("link", { name: /back to sign up/i });
    expect(backLinks.length).toBeGreaterThan(0);
    expect(backLinks[0]).toHaveAttribute("href", "/signup");
  });

  test("has a contact page link", () => {
    renderWithProviders(<TermsPage />);
    const contactLinks = screen.getAllByRole("link", { name: /visit our contact page/i });
    expect(contactLinks[0]).toHaveAttribute("href", "/contact");
  });

  test("renders table of contents navigation links", () => {
    renderWithProviders(<TermsPage />);
    const tocLinks = screen.getAllByRole("link", { name: /acceptance of terms/i });
    // One in ToC, one in main content headings (as link)
    expect(tocLinks.length).toBeGreaterThan(0);
  });

  test("contains keyword 'SmartPark' branding", () => {
    renderWithProviders(<TermsPage />);
    expect(screen.getAllByText(/smartpark/i).length).toBeGreaterThan(0);
  });

  test("eligibility list mentions age requirement", () => {
    renderWithProviders(<TermsPage />);
    expect(screen.getByText(/18 years of age/i)).toBeInTheDocument();
  });

  test("prohibited activities section mentions account suspension", () => {
    renderWithProviders(<TermsPage />);
    expect(screen.getByText(/account suspension or permanent termination/i)).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Privacy Policy Page
// ═══════════════════════════════════════════════════════════════════════════

describe("PrivacyPage", () => {
  test("renders the main heading", () => {
    renderWithProviders(<PrivacyPage />);
    expect(screen.getByRole("heading", { name: /privacy policy/i, level: 1 })).toBeInTheDocument();
  });

  test("shows the last updated date", () => {
    renderWithProviders(<PrivacyPage />);
    expect(screen.getByText(/june 26, 2026/i)).toBeInTheDocument();
  });

  test("renders all required sections", () => {
    renderWithProviders(<PrivacyPage />);
    expect(screen.getByRole("heading", { name: /information we collect/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /how we use your information/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /information sharing/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /data security/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /cookies & tracking/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /data retention/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /children's privacy/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /your rights/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /policy updates/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /contact us/i })).toBeInTheDocument();
  });

  test("has a 'Back to Sign Up' navigation link", () => {
    renderWithProviders(<PrivacyPage />);
    const backLinks = screen.getAllByRole("link", { name: /back to sign up/i });
    expect(backLinks.length).toBeGreaterThan(0);
    expect(backLinks[0]).toHaveAttribute("href", "/signup");
  });

  test("has a contact page link", () => {
    renderWithProviders(<PrivacyPage />);
    const contactLinks = screen.getAllByRole("link", { name: /visit our contact page/i });
    expect(contactLinks[0]).toHaveAttribute("href", "/contact");
  });

  test("contains keyword 'SmartPark' branding", () => {
    renderWithProviders(<PrivacyPage />);
    expect(screen.getAllByText(/smartpark/i).length).toBeGreaterThan(0);
  });

  test("data security section mentions encryption technologies", () => {
    renderWithProviders(<PrivacyPage />);
    expect(screen.getByText(/bcrypt hashing/i)).toBeInTheDocument();
  });

  test("children's privacy section mentions age of 18", () => {
    renderWithProviders(<PrivacyPage />);
    expect(screen.getByText(/under the age of 18/i)).toBeInTheDocument();
  });

  test("your rights section lists data access rights", () => {
    renderWithProviders(<PrivacyPage />);
    expect(screen.getByText(/right to be forgotten/i)).toBeInTheDocument();
  });

  test("renders data categories (Account Information, Vehicle Information, etc.)", () => {
    renderWithProviders(<PrivacyPage />);
    expect(screen.getByText(/account information/i)).toBeInTheDocument();
    expect(screen.getByText(/vehicle information/i)).toBeInTheDocument();
    expect(screen.getByText(/usage data/i)).toBeInTheDocument();
  });

  test("data retention section mentions 30-day deletion window", () => {
    renderWithProviders(<PrivacyPage />);
    // Phrase appears in both Data Retention and Your Rights sections
    const matches = screen.getAllByText(/within 30 days/i);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });
});
