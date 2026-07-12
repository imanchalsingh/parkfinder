import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  Mail,
  Lock,
  User,
  Shield,
  Check,
  AlertCircle,
  Key,
  Crown,
  UserPlus,
  FileText,
} from "lucide-react";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import PasswordInput from "../components/PasswordInput";

const THEME_CLASSES = {
  light: {
    bg: "bg-gray-50",
    cardBg: "bg-white/90",
    text: "text-gray-900",
    textSecondary: "text-gray-600",
    textMuted: "text-gray-500",
    border: "border-gray-200",
    borderAccent: "border-blue-600/30",
    inputBg: "bg-white",
    inputBorder: "border-gray-300",
    placeholder: "placeholder-gray-400",
    iconColor: "text-blue-600",
    iconSecondary: "text-pink-600",
    buttonGradient: {
      primary: "from-blue-600 to-pink-600",
      admin: "from-pink-600 to-red-600",
    },
    hoverBg: "hover:bg-blue-600/10",
    shadow: "shadow-blue-600/10",
    overlay: "bg-black/5",
    errorBg: "bg-red-50",
    errorBorder: "border-red-300",
    errorText: "text-red-600",
    successBg: "bg-green-50",
    successBorder: "border-green-300",
    successText: "text-green-600",
    roleCard: {
      user: {
        active: "bg-blue-50 border-blue-500 text-blue-900",
        inactive:
          "bg-white border-gray-200 text-gray-600 hover:border-blue-400",
      },
      admin: {
        active: "bg-pink-50 border-pink-500 text-pink-900",
        inactive:
          "bg-white border-gray-200 text-gray-600 hover:border-pink-400",
      },
    },
    strength: {
      weak: "text-red-600",
      good: "text-yellow-600",
      strong: "text-green-600",
    },
  },
  dark: {
    bg: "bg-[#191919]",
    cardBg: "bg-[#191919]/70",
    text: "text-[#EEECF6]",
    textSecondary: "text-[#EEECF6]/70",
    textMuted: "text-[#EEECF6]/40",
    border: "border-[#1B42CB]/30",
    borderAccent: "border-[#1B42CB]/30",
    inputBg: "bg-[#191919]/50",
    inputBorder: "border-[#1B42CB]/30",
    placeholder: "placeholder-[#EEECF6]/40",
    iconColor: "text-[#1B42CB]",
    iconSecondary: "text-[#FF2F6C]",
    buttonGradient: {
      primary: "from-[#1B42CB] to-[#FF2F6C]",
      admin: "from-[#FF2F6C] to-red-600",
    },
    hoverBg: "hover:bg-[#1B42CB]/10",
    shadow: "shadow-[#1B42CB]/10",
    overlay: "bg-black/40",
    errorBg: "bg-red-500/10",
    errorBorder: "border-red-500/30",
    errorText: "text-red-400",
    successBg: "bg-green-500/10",
    successBorder: "border-green-500/30",
    successText: "text-green-400",
    roleCard: {
      user: {
        active: "bg-[#1B42CB]/20 border-[#1B42CB] text-[#EEECF6]",
        inactive:
          "bg-[#191919]/50 border-[#1B42CB]/30 text-[#EEECF6]/60 hover:border-[#1B42CB]",
      },
      admin: {
        active: "bg-[#FF2F6C]/20 border-[#FF2F6C] text-[#EEECF6]",
        inactive:
          "bg-[#191919]/50 border-[#FF2F6C]/30 text-[#EEECF6]/60 hover:border-[#FF2F6C]",
      },
    },
    strength: {
      weak: "text-red-400",
      good: "text-yellow-400",
      strong: "text-green-400",
    },
  },
} as const;

export default function SignupPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
    adminSecret: "",
  });

  const [consents, setConsents] = useState({
    terms: false,
    privacy: false,
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminSecret: "",
    terms: "",
    privacy: "",
  });

  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Detect system theme
  const { theme } = useTheme();

  // Theme-based classes
  const themeClasses =
    THEME_CLASSES[theme as keyof typeof THEME_CLASSES] || THEME_CLASSES.light;

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      adminSecret: "",
      terms: "",
      privacy: "",
    };
    let isValid = true;

    // Name validation
    if (!form.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
      isValid = false;
    }

    // Email validation
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Password validation
    if (!form.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      newErrors.password =
        "Password must include uppercase, lowercase, and numbers";
      isValid = false;
    }

    // Confirm password validation
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    // Admin secret validation
    if (form.role === "admin" && !form.adminSecret.trim()) {
      newErrors.adminSecret = "Admin secret key is required";
      isValid = false;
    }

    // Terms of Service consent validation
    if (!consents.terms) {
      newErrors.terms = "You must accept the Terms of Service to continue";
      isValid = false;
    }

    // Privacy Policy consent validation
    if (!consents.privacy) {
      newErrors.privacy = "You must accept the Privacy Policy to continue";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handlePasswordChange = (value: string) => {
    setForm((prev) => ({ ...prev, password: value }));
    if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
    if (msg) setMsg("");
  };

  const handleInputChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (msg) setMsg("");
  };

  const handleRoleChange = (role: string) => {
    setForm((prev) => ({ ...prev, role, adminSecret: "" }));
    setErrors((prev) => ({ ...prev, adminSecret: "" }));
  };

  const handleConsentChange = (field: keyof typeof consents, checked: boolean) => {
    setConsents((prev) => ({ ...prev, [field]: checked }));
    if (checked) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
          adminSecret: form.role === "admin" ? form.adminSecret : undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        login(data.user, data.token);

        setMsg("Account created successfully! Welcome!");

        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        setMsg(data.message || "Signup failed. Please try again.");
      }
    } catch (err) {
      setMsg("Network error. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen ${themeClasses.bg} transition-colors duration-300 flex items-center justify-center p-4`}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#1B42CB]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#FF2F6C]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-r from-[#1B42CB]/5 to-[#FF2F6C]/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Signup Card */}
      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div
          className={`backdrop-blur-xl ${themeClasses.cardBg} border ${themeClasses.border} rounded-3xl p-8 shadow-2xl ${themeClasses.shadow}`}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6">
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${themeClasses.buttonGradient.primary} flex items-center justify-center mx-auto hover:scale-105 transition-transform duration-300`}
              >
                <Shield className="w-8 h-8 text-white" />
              </div>
            </Link>
            <h1
              className={`text-3xl font-bold bg-gradient-to-r ${themeClasses.buttonGradient.primary} bg-clip-text text-transparent mb-2`}
            >
              Create Account
            </h1>
            <p className={themeClasses.textSecondary}>
              Join as {form.role === "admin" ? "Administrator" : "User"}
            </p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label
              className={`block text-sm font-medium ${themeClasses.text} mb-3`}
            >
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleChange("user")}
                className={`p-4 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
                  form.role === "user"
                    ? themeClasses.roleCard.user.active
                    : themeClasses.roleCard.user.inactive
                }`}
              >
                <User className="w-6 h-6" />
                <span className="font-medium">User</span>
                <span className={`text-xs ${themeClasses.textMuted}`}>
                  Regular Account
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange("admin")}
                className={`p-4 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
                  form.role === "admin"
                    ? themeClasses.roleCard.admin.active
                    : themeClasses.roleCard.admin.inactive
                }`}
              >
                <Crown className="w-6 h-6" />
                <span className="font-medium">Admin</span>
                <span className={`text-xs ${themeClasses.textMuted}`}>
                  Administrator
                </span>
              </button>
            </div>
          </div>

          {/* Success Message */}
          {msg && msg.includes("successfully") ? (
            <div
              className={`mb-6 p-4 ${themeClasses.successBg} border ${themeClasses.successBorder} rounded-xl`}
            >
              <div
                className={`flex items-center gap-2 ${themeClasses.successText}`}
              >
                <Check className="w-5 h-5" />
                <span className="font-medium">{msg}</span>
              </div>
            </div>
          ) : msg ? (
            <div
              className={`mb-6 p-4 ${themeClasses.errorBg} border ${themeClasses.errorBorder} rounded-xl`}
            >
              <div
                className={`flex items-center gap-2 ${themeClasses.errorText}`}
              >
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{msg}</span>
              </div>
            </div>
          ) : null}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className={`block text-sm font-medium ${themeClasses.text} mb-2`}
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <User className={`w-5 h-5 ${themeClasses.iconColor}`} />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  className={`w-full pl-12 pr-4 py-3 ${themeClasses.inputBg} border ${
                    errors.name ? "border-red-500/50" : themeClasses.inputBorder
                  } rounded-xl ${themeClasses.text} ${themeClasses.placeholder} focus:outline-none focus:border-[#1B42CB] focus:ring-2 focus:ring-[#1B42CB]/20 transition-all duration-300`}
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>
              {errors.name && (
                <p
                  className={`mt-2 text-sm ${themeClasses.errorText} flex items-center gap-1`}
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-medium ${themeClasses.text} mb-2`}
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Mail className={`w-5 h-5 ${themeClasses.iconColor}`} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  className={`w-full pl-12 pr-4 py-3 ${themeClasses.inputBg} border ${
                    errors.email
                      ? "border-red-500/50"
                      : themeClasses.inputBorder
                  } rounded-xl ${themeClasses.text} ${themeClasses.placeholder} focus:outline-none focus:border-[#1B42CB] focus:ring-2 focus:ring-[#1B42CB]/20 transition-all duration-300`}
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
              {errors.email && (
                <p
                  className={`mt-2 text-sm ${themeClasses.errorText} flex items-center gap-1`}
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className={`block text-sm font-medium ${themeClasses.text} mb-2`}
              >
                Password
              </label>
              <PasswordInput
                id="password"
                required
                placeholder="Create a strong password"
                value={form.password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                error={!!errors.password}
              />

              {/* Password Strength Meter */}
              <PasswordStrengthMeter password={form.password} />

              {errors.password && (
                <p
                  className={`mt-2 text-sm ${themeClasses.errorText} flex items-center gap-1`}
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className={`block text-sm font-medium ${themeClasses.text} mb-2`}
              >
                Confirm Password
              </label>
              <PasswordInput
                id="confirmPassword"
                required
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                error={!!errors.confirmPassword}
                toggleLabel="confirm password"
              />
              {errors.confirmPassword && (
                <p
                  className={`mt-2 text-sm ${themeClasses.errorText} flex items-center gap-1`}
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Admin Secret Field */}
            {form.role === "admin" && (
              <div>
                <label
                  htmlFor="adminSecret"
                  className={`block text-sm font-medium ${themeClasses.text} mb-2`}
                >
                  Admin Secret Key
                </label>
                <PasswordInput
                  id="adminSecret"
                  required={form.role === "admin"}
                  placeholder="Enter admin secret key"
                  value={form.adminSecret}
                  onChange={(e) => handleInputChange("adminSecret", e.target.value)}
                  error={!!errors.adminSecret}
                  icon={<Key className="w-5 h-5 text-[#FF2F6C]" />}
                  className="!border-[#FF2F6C]/30 focus:!border-[#FF2F6C] focus:!ring-[#FF2F6C]/20"
                  toggleLabel="admin secret key"
                />
                {errors.adminSecret && (
                  <p
                    className={`mt-2 text-sm ${themeClasses.errorText} flex items-center gap-1`}
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errors.adminSecret}
                  </p>
                )}
                <div className="mt-2 text-xs text-[#FF2F6C]/60">
                  Contact system administrator for the secret key
                </div>
              </div>
            )}

            {/* Policy Consent Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <FileText className={`w-4 h-4 ${themeClasses.iconColor}`} />
                <span className={`text-sm font-medium ${themeClasses.text}`}>
                  Policy Agreements
                </span>
              </div>

              {/* Terms of Service Checkbox */}
              <div
                className={`p-3 rounded-xl border transition-all duration-200 ${
                  errors.terms
                    ? "border-red-500/50 bg-red-500/5"
                    : consents.terms
                    ? "border-green-500/40 bg-green-500/5"
                    : themeClasses.inputBorder + " " + themeClasses.inputBg
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative mt-0.5 flex-shrink-0">
                    <input
                      type="checkbox"
                      id="terms-consent"
                      checked={consents.terms}
                      onChange={(e) =>
                        handleConsentChange("terms", e.target.checked)
                      }
                      aria-describedby={errors.terms ? "terms-error" : undefined}
                      aria-invalid={!!errors.terms}
                      className="sr-only"
                    />
                    <label
                      htmlFor="terms-consent"
                      className={`flex w-5 h-5 rounded-md border-2 cursor-pointer items-center justify-center transition-all duration-200 ${
                        consents.terms
                          ? "bg-[#1B42CB] border-[#1B42CB]"
                          : errors.terms
                          ? "border-red-500 bg-transparent"
                          : "border-gray-400 bg-transparent hover:border-[#1B42CB]"
                      }`}
                      aria-hidden="true"
                    >
                      {consents.terms && (
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      )}
                    </label>
                  </div>
                  <label
                    htmlFor="terms-consent"
                    className={`text-sm leading-relaxed cursor-pointer ${themeClasses.textSecondary}`}
                  >
                    I agree to the{" "}
                    <Link
                      to="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${themeClasses.iconColor} font-medium underline underline-offset-2 hover:opacity-80 transition-opacity`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Terms of Service
                    </Link>
                  </label>
                </div>
                {errors.terms && (
                  <p
                    id="terms-error"
                    role="alert"
                    className={`mt-2 text-xs ${themeClasses.errorText} flex items-center gap-1`}
                  >
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {errors.terms}
                  </p>
                )}
              </div>

              {/* Privacy Policy Checkbox */}
              <div
                className={`p-3 rounded-xl border transition-all duration-200 ${
                  errors.privacy
                    ? "border-red-500/50 bg-red-500/5"
                    : consents.privacy
                    ? "border-green-500/40 bg-green-500/5"
                    : themeClasses.inputBorder + " " + themeClasses.inputBg
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative mt-0.5 flex-shrink-0">
                    <input
                      type="checkbox"
                      id="privacy-consent"
                      checked={consents.privacy}
                      onChange={(e) =>
                        handleConsentChange("privacy", e.target.checked)
                      }
                      aria-describedby={errors.privacy ? "privacy-error" : undefined}
                      aria-invalid={!!errors.privacy}
                      className="sr-only"
                    />
                    <label
                      htmlFor="privacy-consent"
                      className={`flex w-5 h-5 rounded-md border-2 cursor-pointer items-center justify-center transition-all duration-200 ${
                        consents.privacy
                          ? "bg-[#1B42CB] border-[#1B42CB]"
                          : errors.privacy
                          ? "border-red-500 bg-transparent"
                          : "border-gray-400 bg-transparent hover:border-[#1B42CB]"
                      }`}
                      aria-hidden="true"
                    >
                      {consents.privacy && (
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      )}
                    </label>
                  </div>
                  <label
                    htmlFor="privacy-consent"
                    className={`text-sm leading-relaxed cursor-pointer ${themeClasses.textSecondary}`}
                  >
                    I agree to the{" "}
                    <Link
                      to="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${themeClasses.iconColor} font-medium underline underline-offset-2 hover:opacity-80 transition-opacity`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {errors.privacy && (
                  <p
                    id="privacy-error"
                    role="alert"
                    className={`mt-2 text-xs ${themeClasses.errorText} flex items-center gap-1`}
                  >
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {errors.privacy}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 text-white font-bold rounded-xl hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-gradient-to-r ${
                form.role === "admin"
                  ? themeClasses.buttonGradient.admin
                  : themeClasses.buttonGradient.primary
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create {form.role === "admin" ? "Admin" : "User"} Account
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${themeClasses.border}`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span
                  className={`px-2 ${themeClasses.cardBg} ${themeClasses.textMuted}`}
                >
                  Already have an account?
                </span>
              </div>
            </div>

            {/* Login Links */}
            <div className="grid grid-cols-1 gap-3">
              <Link
                to="/login"
                className={`px-4 py-3 ${themeClasses.inputBg} border ${themeClasses.border} ${themeClasses.text} font-medium rounded-xl hover:bg-[#1B42CB]/10 transition-all duration-300 text-center`}
              >
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Custom Animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
