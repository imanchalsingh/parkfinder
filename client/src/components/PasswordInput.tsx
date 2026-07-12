import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const THEME_CLASSES = {
  light: {
    text: "text-gray-900",
    textMuted: "text-gray-500",
    inputBg: "bg-white",
    inputBorder: "border-gray-300",
    placeholder: "placeholder-gray-400",
    iconColor: "text-blue-600",
  },
  dark: {
    text: "text-[#EEECF6]",
    textMuted: "text-[#EEECF6]/40",
    inputBg: "bg-[#191919]/50",
    inputBorder: "border-[#1B42CB]/30",
    placeholder: "placeholder-[#EEECF6]/40",
    iconColor: "text-[#1B42CB]",
  },
} as const;

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string | boolean;
  icon?: React.ReactNode;
  toggleLabel?: string;
}

export default function PasswordInput({
  error,
  icon,
  toggleLabel = "password",
  className = "",
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useTheme();
  const themeClasses = THEME_CLASSES[theme as keyof typeof THEME_CLASSES] || THEME_CLASSES.light;

  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
        {icon ? (
          icon
        ) : (
          <Lock className={`w-5 h-5 ${themeClasses.iconColor}`} />
        )}
      </div>
      <input
        type={showPassword ? "text" : "password"}
        className={`w-full pl-12 pr-12 py-3 ${themeClasses.inputBg} border ${
          error ? "border-red-500/50" : themeClasses.inputBorder
        } rounded-xl ${themeClasses.text} ${themeClasses.placeholder} focus:outline-none focus:border-[#1B42CB] focus:ring-2 focus:ring-[#1B42CB]/20 transition-all duration-300 ${className}`}
        {...props}
      />
      <button
        type="button"
        aria-label={showPassword ? `Hide ${toggleLabel}` : `Show ${toggleLabel}`}
        onClick={() => setShowPassword(!showPassword)}
        className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${themeClasses.textMuted} hover:${themeClasses.text} transition-colors`}
      >
        {showPassword ? (
          <EyeOff className="w-5 h-5" />
        ) : (
          <Eye className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
