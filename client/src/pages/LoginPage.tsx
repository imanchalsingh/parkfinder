import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Mail, Lock, Car, AlertCircle, LogIn, ShieldCheck } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
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
    buttonGradient: "from-blue-600 to-pink-600",
    hoverBg: "hover:bg-blue-600/10",
    shadow: "shadow-blue-600/10",
    overlay: "bg-black/5",
    errorBg: "bg-red-50",
    errorBorder: "border-red-300",
    errorText: "text-red-600",
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
    buttonGradient: "from-[#1B42CB] to-[#FF2F6C]",
    hoverBg: "hover:bg-[#1B42CB]/10",
    shadow: "shadow-[#1B42CB]/10",
    overlay: "bg-black/40",
    errorBg: "bg-red-500/10",
    errorBorder: "border-red-500/30",
    errorText: "text-red-400",
  },
} as const;

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // 2FA states
  const [requires2FA, setRequires2FA] = useState(false);
  const [requiresEmail2FA, setRequiresEmail2FA] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [deviceId, setDeviceId] = useState("");

  useEffect(() => {
    let storedDeviceId = localStorage.getItem("deviceId");
    if (!storedDeviceId) {
      storedDeviceId = uuidv4();
      localStorage.setItem("deviceId", storedDeviceId);
    }
    setDeviceId(storedDeviceId);
  }, []);
  
  // const [theme, setTheme] = useState<"light" | "dark">("dark");
  const { login } = useAuth();
  const navigate = useNavigate();

  // Detect system theme
  const { theme } = useTheme();

  // Theme-based classes
  const themeClasses =
    THEME_CLASSES[theme as keyof typeof THEME_CLASSES] || THEME_CLASSES.light;

  const validateForm = () => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!form.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMsg("");

    try {
      const payload = { ...form, deviceId };
      const res = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        if (data.requiresEmail2FA) {
          setRequiresEmail2FA(true);
          setTempToken(data.tempToken);
        } else if (data.requires2FA) {
          setRequires2FA(true);
          setTempToken(data.tempToken);
        } else {
          login(data.user, data.token);
          navigate("/");
        }
      } else {
        setMsg(data.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      setMsg("Network error. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!twoFactorToken) return;

    setIsLoading(true);
    setMsg("");

    try {
      // Determine endpoint based on which 2FA is active
      const endpoint = requiresEmail2FA ? `/api/auth/login/verify-email-2fa` : `/api/auth/login/verify-2fa`;
      const payload = requiresEmail2FA 
        ? { tempToken, otp: twoFactorToken, deviceId } 
        : { tempToken, token: twoFactorToken };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        if (data.requires2FA && requiresEmail2FA) {
          // If we just passed email 2FA but still need app 2FA
          setRequiresEmail2FA(false);
          setRequires2FA(true);
          setTempToken(data.tempToken);
          setTwoFactorToken("");
        } else {
          login(data.user, data.token);
          navigate("/");
        }
      } else {
        setMsg(data.message || "Invalid verification code.");
      }
    } catch (err) {
      setMsg("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (msg) setMsg("");
  };

  return (
    <div
      className={`${themeClasses.bg} transition-colors duration-300 flex items-center justify-center p-4`}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#1B42CB]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#FF2F6C]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#1B42CB]/5 rounded-full blur-3xl"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div
          className={`backdrop-blur-xl ${themeClasses.cardBg} border ${themeClasses.border} rounded-3xl p-8 shadow-2xl ${themeClasses.shadow}`}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6">
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${themeClasses.buttonGradient} flex items-center justify-center mx-auto hover:scale-105 transition-transform duration-300`}
              >
                <Car className="w-8 h-8 text-white" />
              </div>
            </Link>
            <h1
              className={`text-3xl font-bold bg-gradient-to-r ${themeClasses.buttonGradient} bg-clip-text text-transparent mb-2`}
            >
              Welcome Back
            </h1>
            <p className={themeClasses.textSecondary}>
              Sign in to your SmartPark account
            </p>
          </div>

          {/* Error Message */}
          {msg && (
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
          )}

          {/* Form */}
          {!requires2FA && !requiresEmail2FA ? (
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  onBlur={() => validateForm()}
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
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="password"
                  className={`block text-sm font-medium ${themeClasses.text}`}
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className={`text-sm font-medium ${themeClasses.iconColor} hover:${themeClasses.iconSecondary} transition-colors`}
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                required
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                onBlur={() => validateForm()}
                error={!!errors.password}
              />
              {errors.password && (
                <p
                  className={`mt-2 text-sm ${themeClasses.errorText} flex items-center gap-1`}
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className={`w-4 h-4 rounded ${themeClasses.inputBg} border ${themeClasses.inputBorder} text-[#1B42CB] focus:ring-[#1B42CB]/20 focus:ring-2`}
              />
              <label
                htmlFor="remember"
                className={`ml-2 text-sm ${themeClasses.textSecondary}`}
              >
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 bg-gradient-to-r ${themeClasses.buttonGradient} text-white font-bold rounded-xl hover:shadow-xl hover:shadow-[#FF2F6C]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <LogIn className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${themeClasses.border}`}></div>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center pt-4">
              <p className={themeClasses.textSecondary}>
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className={`font-medium ${themeClasses.iconColor} hover:${themeClasses.iconSecondary} transition-colors`}
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </form>
          ) : (
          <form onSubmit={handle2FASubmit} className="space-y-6">
            <div className="text-center mb-6">
              <ShieldCheck className={`w-12 h-12 mx-auto mb-2 ${themeClasses.iconColor}`} />
              <p className={`text-sm ${themeClasses.textSecondary}`}>
                {requiresEmail2FA 
                  ? "We've sent a 6-digit verification code to your email." 
                  : "Enter the code from your authenticator app."}
              </p>
            </div>
            <div>
              <label htmlFor="twoFactorToken" className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                {requiresEmail2FA ? "Email Verification Code" : "Authenticator Code"}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Lock className={`w-5 h-5 ${themeClasses.iconColor}`} />
                </div>
                <input
                  id="twoFactorToken"
                  type="text"
                  required
                  className={`w-full pl-12 pr-4 py-3 ${themeClasses.inputBg} border ${themeClasses.inputBorder} rounded-xl ${themeClasses.text} focus:outline-none focus:border-[#1B42CB] focus:ring-2 focus:ring-[#1B42CB]/20 transition-all duration-300`}
                  placeholder="Enter 6-digit code"
                  value={twoFactorToken}
                  onChange={(e) => {
                    setTwoFactorToken(e.target.value);
                    if (msg) setMsg("");
                  }}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 bg-gradient-to-r ${themeClasses.buttonGradient} text-white font-bold rounded-xl hover:shadow-xl hover:shadow-[#FF2F6C]/20 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2`}
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </button>
            <button
              type="button"
              onClick={() => { setRequires2FA(false); setRequiresEmail2FA(false); setTempToken(""); setTwoFactorToken(""); setMsg(""); }}
              className={`w-full py-3 text-center block text-sm ${themeClasses.textMuted} hover:${themeClasses.text} transition-colors`}
            >
              Back to Login
            </button>
          </form>
          )}
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
