import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Shield, ShieldAlert, ShieldCheck, QrCode } from "lucide-react";

export default function AdminSecurityTab() {
  const { user, token } = useAuth();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false); // In a real app, get this from user profile

  const generate2FA = async () => {
    try {
      const res = await fetch("/api/auth/2fa/setup", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setMessage("Scan the QR code with your authenticator app.");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to generate 2FA");
    }
  };

  const verify2FA = async () => {
    try {
      const res = await fetch("/api/auth/2fa/verify-setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token: tokenInput }),
      });
      const data = await res.json();
      if (data.success) {
        setIs2FAEnabled(true);
        setQrCode(null);
        setSecret(null);
        setMessage("2FA has been successfully enabled!");
        setError("");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to verify 2FA");
    }
  };

  const disable2FA = async () => {
    try {
      const res = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token: tokenInput }),
      });
      const data = await res.json();
      if (data.success) {
        setIs2FAEnabled(false);
        setMessage("2FA has been disabled.");
        setError("");
        setTokenInput("");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to disable 2FA");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#191919]/60 p-6 rounded-2xl border border-gray-200 dark:border-[#1B42CB]/20 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-[#1B42CB]" />
          <h2 className="text-2xl font-bold dark:text-white">Security Settings</h2>
        </div>

        {error && <div className="text-red-500 mb-4">{error}</div>}
        {message && <div className="text-green-500 mb-4">{message}</div>}

        {!is2FAEnabled ? (
          <div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Two-Factor Authentication (2FA) adds an extra layer of security to your account.
            </p>
            {!qrCode ? (
              <button
                onClick={generate2FA}
                className="px-6 py-2 bg-[#1B42CB] text-white rounded-xl hover:bg-[#1B42CB]/80 transition"
              >
                Enable 2FA
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-white p-4 inline-block rounded-xl border border-gray-200">
                  <img src={qrCode} alt="Scan this QR code with your authenticator app to enable 2FA" className="w-48 h-48" />
                </div>
                <p className="dark:text-white font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  Manual Entry Key: {secret}
                </p>
                <div className="flex items-center gap-3">
                  <input
                    aria-label="Enter 6-digit code to verify 2FA"
                    type="text"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="px-4 py-2 border rounded-xl dark:bg-[#191919] dark:border-[#1B42CB]/30 dark:text-white"
                  />
                  <button
                    onClick={verify2FA}
                    className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
                  >
                    Verify & Enable
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 text-green-500 mb-4">
              <ShieldCheck className="w-6 h-6" />
              <span className="font-semibold">2FA is currently enabled</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              To disable 2FA, please enter a code from your authenticator app.
            </p>
            <div className="flex items-center gap-3">
              <input
                aria-label="Enter 6-digit code to disable 2FA"
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Enter 6-digit code"
                className="px-4 py-2 border rounded-xl dark:bg-[#191919] dark:border-[#1B42CB]/30 dark:text-white"
              />
              <button
                onClick={disable2FA}
                className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
              >
                Disable 2FA
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
