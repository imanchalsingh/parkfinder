// @vitest-environment jsdom
import { describe, test, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import SignupPage from "./SignupPage";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";

// ─── Helpers ────────────────────────────────────────────────────────────────

const renderSignupPage = () =>
  render(
    <MemoryRouter initialEntries={["/signup"]}>
      <ThemeProvider>
        <AuthProvider>
          <SignupPage />
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  );

/** Fill the form with valid data but do NOT touch the consent checkboxes */
const fillValidForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText(/full name/i), "Jane Doe");
  await user.type(screen.getByLabelText(/email address/i), "jane@example.com");
  await user.type(screen.getByLabelText(/^password$/i), "Password1");
  await user.type(screen.getByLabelText(/^confirm password$/i), "Password1");
};

// ─── Mocks ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.restoreAllMocks();
  global.fetch = vi.fn().mockResolvedValue({
    json: async () => ({
      success: true,
      user: { _id: "1", name: "Jane Doe", email: "jane@example.com", role: "user" },
      token: "mock-token",
    }),
  }) as unknown as typeof fetch;
});

// ═══════════════════════════════════════════════════════════════════════════
// 1. Rendering
// ═══════════════════════════════════════════════════════════════════════════

describe("SignupPage – Rendering", () => {
  test("renders the page heading", () => {
    renderSignupPage();
    expect(screen.getByRole("heading", { name: /create account/i })).toBeInTheDocument();
  });

  test("renders the 'Policy Agreements' section heading", () => {
    renderSignupPage();
    expect(screen.getByText(/policy agreements/i)).toBeInTheDocument();
  });

  test("renders the Terms of Service checkbox (unchecked by default)", () => {
    renderSignupPage();
    const termsCheckbox = screen.getByRole("checkbox", { name: /i agree to the terms of service/i });
    expect(termsCheckbox).toBeInTheDocument();
    expect(termsCheckbox).not.toBeChecked();
  });

  test("renders the Privacy Policy checkbox (unchecked by default)", () => {
    renderSignupPage();
    const privacyCheckbox = screen.getByRole("checkbox", { name: /i agree to the privacy policy/i });
    expect(privacyCheckbox).toBeInTheDocument();
    expect(privacyCheckbox).not.toBeChecked();
  });

  test("renders Terms of Service link pointing to /terms", () => {
    renderSignupPage();
    const termsLinks = screen.getAllByRole("link", { name: /terms of service/i });
    expect(termsLinks.length).toBeGreaterThan(0);
    expect(termsLinks[0]).toHaveAttribute("href", "/terms");
  });

  test("renders Privacy Policy link pointing to /privacy", () => {
    renderSignupPage();
    const privacyLinks = screen.getAllByRole("link", { name: /privacy policy/i });
    expect(privacyLinks.length).toBeGreaterThan(0);
    expect(privacyLinks[0]).toHaveAttribute("href", "/privacy");
  });

  test("links open in a new tab", () => {
    renderSignupPage();
    const termsLinks = screen.getAllByRole("link", { name: /terms of service/i });
    expect(termsLinks[0]).toHaveAttribute("target", "_blank");
    expect(termsLinks[0]).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("checkboxes have correct accessible labels via htmlFor", () => {
    renderSignupPage();
    expect(screen.getByLabelText(/i agree to the terms of service/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/i agree to the privacy policy/i)).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. Checkbox interaction
// ═══════════════════════════════════════════════════════════════════════════

describe("SignupPage – Checkbox Interaction", () => {
  test("terms checkbox can be checked and unchecked", async () => {
    const user = userEvent.setup();
    renderSignupPage();
    const termsCheckbox = screen.getByRole("checkbox", { name: /i agree to the terms of service/i });

    expect(termsCheckbox).not.toBeChecked();
    await user.click(termsCheckbox);
    expect(termsCheckbox).toBeChecked();
    await user.click(termsCheckbox);
    expect(termsCheckbox).not.toBeChecked();
  });

  test("privacy checkbox can be checked and unchecked", async () => {
    const user = userEvent.setup();
    renderSignupPage();
    const privacyCheckbox = screen.getByRole("checkbox", { name: /i agree to the privacy policy/i });

    expect(privacyCheckbox).not.toBeChecked();
    await user.click(privacyCheckbox);
    expect(privacyCheckbox).toBeChecked();
    await user.click(privacyCheckbox);
    expect(privacyCheckbox).not.toBeChecked();
  });

  test("checking terms checkbox clears the terms error immediately", async () => {
    const user = userEvent.setup();
    renderSignupPage();

    await fillValidForm(user);
    // Trigger validation errors first
    await user.click(screen.getByRole("button", { name: /create .* account/i }));
    expect(await screen.findByText(/you must accept the terms of service/i)).toBeInTheDocument();

    // Now check the checkbox — error should vanish
    await user.click(screen.getByRole("checkbox", { name: /i agree to the terms of service/i }));
    expect(screen.queryByText(/you must accept the terms of service/i)).not.toBeInTheDocument();
  });

  test("checking privacy checkbox clears the privacy error immediately", async () => {
    const user = userEvent.setup();
    renderSignupPage();

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /create .* account/i }));
    expect(await screen.findByText(/you must accept the privacy policy/i)).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: /i agree to the privacy policy/i }));
    expect(screen.queryByText(/you must accept the privacy policy/i)).not.toBeInTheDocument();
  });

  test("checkboxes are independent — checking one does not affect the other", async () => {
    const user = userEvent.setup();
    renderSignupPage();

    const termsCheckbox = screen.getByRole("checkbox", { name: /i agree to the terms of service/i });
    const privacyCheckbox = screen.getByRole("checkbox", { name: /i agree to the privacy policy/i });

    await user.click(termsCheckbox);
    expect(termsCheckbox).toBeChecked();
    expect(privacyCheckbox).not.toBeChecked();
  });

  test("space key toggles a focused checkbox (keyboard accessibility)", async () => {
    const user = userEvent.setup();
    renderSignupPage();

    const termsCheckbox = screen.getByRole("checkbox", { name: /i agree to the terms of service/i });
    termsCheckbox.focus();
    await user.keyboard(" ");
    expect(termsCheckbox).toBeChecked();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. Validation — missing consent
// ═══════════════════════════════════════════════════════════════════════════

describe("SignupPage – Validation: missing consent", () => {
  test("shows both consent errors when form is submitted with neither checked", async () => {
    const user = userEvent.setup();
    renderSignupPage();

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /create .* account/i }));

    expect(await screen.findByText(/you must accept the terms of service to continue/i)).toBeInTheDocument();
    expect(await screen.findByText(/you must accept the privacy policy to continue/i)).toBeInTheDocument();
  });

  test("shows privacy error when only terms is checked", async () => {
    const user = userEvent.setup();
    renderSignupPage();

    await fillValidForm(user);
    await user.click(screen.getByRole("checkbox", { name: /i agree to the terms of service/i }));
    await user.click(screen.getByRole("button", { name: /create .* account/i }));

    expect(screen.queryByText(/you must accept the terms of service to continue/i)).not.toBeInTheDocument();
    expect(await screen.findByText(/you must accept the privacy policy to continue/i)).toBeInTheDocument();
  });

  test("shows terms error when only privacy is checked", async () => {
    const user = userEvent.setup();
    renderSignupPage();

    await fillValidForm(user);
    await user.click(screen.getByRole("checkbox", { name: /i agree to the privacy policy/i }));
    await user.click(screen.getByRole("button", { name: /create .* account/i }));

    expect(await screen.findByText(/you must accept the terms of service to continue/i)).toBeInTheDocument();
    expect(screen.queryByText(/you must accept the privacy policy to continue/i)).not.toBeInTheDocument();
  });

  test("prevents API call when consent checkboxes are not checked", async () => {
    const user = userEvent.setup();
    renderSignupPage();

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /create .* account/i }));

    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  test("consent error messages are displayed with role='alert' for screen readers", async () => {
    const user = userEvent.setup();
    renderSignupPage();

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /create .* account/i }));

    const alerts = await screen.findAllByRole("alert");
    const alertTexts = alerts.map((a) => a.textContent ?? "");

    expect(alertTexts.some((t) => /terms of service/i.test(t))).toBe(true);
    expect(alertTexts.some((t) => /privacy policy/i.test(t))).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. Successful registration gated by consent
// ═══════════════════════════════════════════════════════════════════════════

describe("SignupPage – Successful Registration Flow", () => {
  test("does NOT submit when only fields are valid but consent missing", async () => {
    const user = userEvent.setup();
    renderSignupPage();

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /create .* account/i }));

    await waitFor(() => expect(global.fetch).not.toHaveBeenCalled());
  });

  test("submits successfully when all fields valid AND both consents checked", async () => {
    const user = userEvent.setup();
    renderSignupPage();

    await fillValidForm(user);
    await user.click(screen.getByRole("checkbox", { name: /i agree to the terms of service/i }));
    await user.click(screen.getByRole("checkbox", { name: /i agree to the privacy policy/i }));
    await user.click(screen.getByRole("button", { name: /create .* account/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    expect(await screen.findByText(/account created successfully/i)).toBeInTheDocument();
  });

  test("API is called with correct payload (no consent fields sent)", async () => {
    const user = userEvent.setup();
    renderSignupPage();

    await fillValidForm(user);
    await user.click(screen.getByRole("checkbox", { name: /i agree to the terms of service/i }));
    await user.click(screen.getByRole("checkbox", { name: /i agree to the privacy policy/i }));
    await user.click(screen.getByRole("button", { name: /create .* account/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    const [, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const body = JSON.parse(init.body as string);

    expect(body).toMatchObject({
      name: "Jane Doe",
      email: "jane@example.com",
      role: "user",
    });
    // Consent flags should NOT be sent to the backend
    expect(body).not.toHaveProperty("terms");
    expect(body).not.toHaveProperty("privacy");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. Combined field + consent validation
// ═══════════════════════════════════════════════════════════════════════════

describe("SignupPage – Combined field + consent validation", () => {
  test("shows both field errors and consent errors simultaneously", async () => {
    renderSignupPage();

    // Use fireEvent.submit to bypass HTML5 validation block
    const button = screen.getByRole("button", { name: /create .* account/i });
    fireEvent.submit(button.closest("form")!);

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/you must accept the terms of service to continue/i)).toBeInTheDocument();
    expect(await screen.findByText(/you must accept the privacy policy to continue/i)).toBeInTheDocument();
  });

  test("submit button remains enabled even with validation errors (errors shown inline)", async () => {
    renderSignupPage();
    const submitBtn = screen.getByRole("button", { name: /create .* account/i });
    expect(submitBtn).not.toBeDisabled();
  });

  test("re-submitting with checkboxes unchecked re-shows consent errors", async () => {
    const user = userEvent.setup();
    renderSignupPage();

    await fillValidForm(user);
    await user.click(screen.getByRole("checkbox", { name: /i agree to the terms of service/i }));
    await user.click(screen.getByRole("checkbox", { name: /i agree to the privacy policy/i }));

    // Uncheck both
    await user.click(screen.getByRole("checkbox", { name: /i agree to the terms of service/i }));
    await user.click(screen.getByRole("checkbox", { name: /i agree to the privacy policy/i }));

    await user.click(screen.getByRole("button", { name: /create .* account/i }));

    expect(await screen.findByText(/you must accept the terms of service to continue/i)).toBeInTheDocument();
    expect(await screen.findByText(/you must accept the privacy policy to continue/i)).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. Accessibility
// ═══════════════════════════════════════════════════════════════════════════

describe("SignupPage – Accessibility", () => {
  test("terms checkbox has aria-invalid=true when error is present", async () => {
    const user = userEvent.setup();
    renderSignupPage();

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /create .* account/i }));
    await screen.findByText(/you must accept the terms of service/i);

    const termsCheckbox = screen.getByRole("checkbox", { name: /i agree to the terms of service/i });
    expect(termsCheckbox).toHaveAttribute("aria-invalid", "true");
  });

  test("privacy checkbox has aria-invalid=true when error is present", async () => {
    const user = userEvent.setup();
    renderSignupPage();

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /create .* account/i }));
    await screen.findByText(/you must accept the privacy policy/i);

    const privacyCheckbox = screen.getByRole("checkbox", { name: /i agree to the privacy policy/i });
    expect(privacyCheckbox).toHaveAttribute("aria-invalid", "true");
  });

  test("terms checkbox has aria-invalid=false when no error", () => {
    renderSignupPage();
    const termsCheckbox = screen.getByRole("checkbox", { name: /i agree to the terms of service/i });
    expect(termsCheckbox).toHaveAttribute("aria-invalid", "false");
  });

  test("terms error paragraph has id='terms-error' for aria-describedby linkage", async () => {
    const user = userEvent.setup();
    renderSignupPage();

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /create .* account/i }));
    const errorEl = await screen.findByText(/you must accept the terms of service/i);
    expect(errorEl.closest("p")).toHaveAttribute("id", "terms-error");
  });

  test("privacy error paragraph has id='privacy-error' for aria-describedby linkage", async () => {
    const user = userEvent.setup();
    renderSignupPage();

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /create .* account/i }));
    const errorEl = await screen.findByText(/you must accept the privacy policy/i);
    expect(errorEl.closest("p")).toHaveAttribute("id", "privacy-error");
  });

  test("terms checkbox references aria-describedby when error is shown", async () => {
    const user = userEvent.setup();
    renderSignupPage();

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /create .* account/i }));
    await screen.findByText(/you must accept the terms of service/i);

    const termsCheckbox = screen.getByRole("checkbox", { name: /i agree to the terms of service/i });
    expect(termsCheckbox).toHaveAttribute("aria-describedby", "terms-error");
  });

  test("terms checkbox does NOT have aria-describedby when no error", () => {
    renderSignupPage();
    const termsCheckbox = screen.getByRole("checkbox", { name: /i agree to the terms of service/i });
    expect(termsCheckbox).not.toHaveAttribute("aria-describedby");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. Admin role — consent still required
// ═══════════════════════════════════════════════════════════════════════════

describe("SignupPage – Admin role with consent", () => {
  test("consent errors still appear for admin role when checkboxes unchecked", async () => {
    const user = userEvent.setup();
    renderSignupPage();

    // Switch to admin role
    await user.click(screen.getByRole("button", { name: /admin/i }));

    await fillValidForm(user);
    await user.type(screen.getByLabelText(/^admin secret key$/i), "supersecret");
    await user.click(screen.getByRole("button", { name: /create admin account/i }));

    expect(await screen.findByText(/you must accept the terms of service to continue/i)).toBeInTheDocument();
    expect(await screen.findByText(/you must accept the privacy policy to continue/i)).toBeInTheDocument();
  });
});
