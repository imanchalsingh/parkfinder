import React, { useState } from "react";
import * as Icons from "lucide-react";
import { useThemeClasses } from "../hooks/useThemeClasses";

const ContactPage: React.FC = () => {
  const themeClasses = useThemeClasses();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
        setErrorMessage(data.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage("Network error. Please check your connection and try again.");
    }
  };

  return (
    <div className={`min-h-screen ${themeClasses.bg} transition-colors duration-300 p-4 md:p-6`}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#1B42CB]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#FF2F6C]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto mt-8 md:mt-16">
        <div className={`backdrop-blur-xl ${themeClasses.cardBg} ${themeClasses.cardBorder} border rounded-3xl p-8 shadow-2xl`}>
          <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${themeClasses.gradient.accent} flex items-center justify-center mx-auto mb-4`}>
              <Icons.Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className={`text-3xl font-bold ${themeClasses.text} mb-2`}>Contact Support</h1>
            <p className={themeClasses.textSecondary}>We're here to help! Send us your questions or feedback.</p>
          </div>

          {status === "success" && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3">
              <Icons.CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-500 mb-1">Message Sent!</h4>
                <p className="text-sm text-green-500/80">Thank you for reaching out. Our support team will get back to you shortly.</p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
              <Icons.AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-500 mb-1">Error</h4>
                <p className="text-sm text-red-500/80">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label htmlFor="contact-name" className={`text-sm font-medium ${themeClasses.textSecondary}`}>Your Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icons.User className={`w-5 h-5 ${themeClasses.textMuted}`} />
                  </div>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-transparent border ${themeClasses.border} ${themeClasses.text} focus:outline-none focus:border-[#1B42CB] focus:ring-1 focus:ring-[#1B42CB] transition-colors`}
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="contact-email" className={`text-sm font-medium ${themeClasses.textSecondary}`}>Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icons.Mail className={`w-5 h-5 ${themeClasses.textMuted}`} />
                  </div>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-transparent border ${themeClasses.border} ${themeClasses.text} focus:outline-none focus:border-[#1B42CB] focus:ring-1 focus:ring-[#1B42CB] transition-colors`}
                    placeholder="john@example.com"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="contact-subject" className={`text-sm font-medium ${themeClasses.textSecondary}`}>Subject</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icons.MessageSquare className={`w-5 h-5 ${themeClasses.textMuted}`} />
                </div>
                <input
                  id="contact-subject"
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-transparent border ${themeClasses.border} ${themeClasses.text} focus:outline-none focus:border-[#1B42CB] focus:ring-1 focus:ring-[#1B42CB] transition-colors`}
                  placeholder="How can we help you?"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="contact-message" className={`text-sm font-medium ${themeClasses.textSecondary}`}>Message</label>
              <textarea
                id="contact-message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className={`w-full p-4 rounded-xl bg-transparent border ${themeClasses.border} ${themeClasses.text} focus:outline-none focus:border-[#1B42CB] focus:ring-1 focus:ring-[#1B42CB] transition-colors resize-none`}
                placeholder="Describe your issue or share your feedback..."
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-3.5 mt-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#1B42CB] to-[#FF2F6C] hover:shadow-lg hover:shadow-[#FF2F6C]/20 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === "loading" ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Icons.Send className="w-5 h-5" />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
