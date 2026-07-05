import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Lock, ArrowLeft, ShieldCheck } from "lucide-react";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";

export default function ResetPasswordPage() {
  const { token = "" } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to reset your password.");
      }

      setMessage(
        data.message || "Your password has been updated successfully.",
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to reset your password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#191919] text-[#EEECF6] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-[#1B42CB]/30 bg-[#191919]/80 p-8 shadow-2xl shadow-[#1B42CB]/10 backdrop-blur-xl">
        <Link
          to="/login"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[#EEECF6]/70 hover:text-[#1B42CB] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1B42CB] to-[#FF2F6C] text-white shadow-lg shadow-[#FF2F6C]/20">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold text-[#EEECF6]">Reset Password</h1>
          <p className="mt-2 text-sm text-[#EEECF6]/70">
            Create a new password for your SmartPark account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label
            className="block text-sm font-medium text-[#EEECF6]"
            htmlFor="new-password"
          >
            New Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#1B42CB]" />
            <input
              id="new-password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-[#1B42CB]/30 bg-[#191919]/50 py-3 pl-12 pr-4 text-[#EEECF6] placeholder:text-[#EEECF6]/40 focus:border-[#1B42CB] focus:outline-none focus:ring-2 focus:ring-[#1B42CB]/20"
              placeholder="Enter a new password"
            />
          </div>
          <PasswordStrengthMeter password={password} />

          <label
            className="block text-sm font-medium text-[#EEECF6]"
            htmlFor="confirm-password"
          >
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#1B42CB]" />
            <input
              id="confirm-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-xl border border-[#1B42CB]/30 bg-[#191919]/50 py-3 pl-12 pr-4 text-[#EEECF6] placeholder:text-[#EEECF6]/40 focus:border-[#1B42CB] focus:outline-none focus:ring-2 focus:ring-[#1B42CB]/20"
              placeholder="Confirm your new password"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gradient-to-r from-[#1B42CB] to-[#FF2F6C] px-4 py-3 font-semibold text-white shadow-lg shadow-[#FF2F6C]/20 transition-transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#1B42CB]/20 focus:outline-none focus:ring-2 focus:ring-[#1B42CB]/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Updating..." : "Update Password"}
          </button>
        </form>

        {message && (
          <p className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
