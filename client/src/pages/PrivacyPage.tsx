import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import {
  Lock,
  ArrowLeft,
  Eye,
  Database,
  Share2,
  Cookie,
  Mail,
  ShieldCheck,
  RefreshCw,
  Baby,
} from "lucide-react";

const SECTIONS = [
  { id: "collect", icon: Database, title: "1. Information We Collect" },
  { id: "use", icon: Eye, title: "2. How We Use Your Information" },
  { id: "sharing", icon: Share2, title: "3. Information Sharing" },
  { id: "security", icon: ShieldCheck, title: "4. Data Security" },
  { id: "cookies", icon: Cookie, title: "5. Cookies & Tracking" },
  { id: "retention", icon: Database, title: "6. Data Retention" },
  { id: "children", icon: Baby, title: "7. Children's Privacy" },
  { id: "rights", icon: Lock, title: "8. Your Rights" },
  { id: "updates", icon: RefreshCw, title: "9. Policy Updates" },
  { id: "contact", icon: Mail, title: "10. Contact Us" },
];

export default function PrivacyPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-[#191919] text-[#EEECF6]" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Animated gradient header */}
      <div className="relative overflow-hidden">
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-gradient-to-br from-[#FF2F6C]/15 via-[#191919] to-[#1B42CB]/10"
              : "bg-gradient-to-br from-pink-500/10 via-white to-blue-600/10"
          }`}
        />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#FF2F6C]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#1B42CB]/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 py-14 sm:px-6 lg:px-8">
          {/* Back navigation */}
          <Link
            to="/signup"
            className={`inline-flex items-center gap-2 text-sm font-medium mb-8 group transition-colors duration-200 ${
              isDark
                ? "text-[#EEECF6]/60 hover:text-[#FF2F6C]"
                : "text-gray-500 hover:text-pink-600"
            }`}
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Sign Up
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF2F6C] to-[#1B42CB] flex items-center justify-center flex-shrink-0 shadow-lg">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-[#FF2F6C] to-[#1B42CB] bg-clip-text text-transparent">
                Privacy Policy
              </h1>
              <p className={`mt-1 text-sm ${isDark ? "text-[#EEECF6]/50" : "text-gray-500"}`}>
                SmartPark · Last updated: June 26, 2026 · Version 1.0
              </p>
            </div>
          </div>

          <p className={`text-base leading-relaxed max-w-3xl ${isDark ? "text-[#EEECF6]/70" : "text-gray-600"}`}>
            At SmartPark, your privacy is our priority. This Policy explains how we collect, use,
            share, and safeguard your personal information when you use our parking management platform.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10">
          {/* Sticky Table of Contents */}
          <aside className="hidden lg:block">
            <div
              className={`sticky top-6 rounded-2xl border p-5 ${
                isDark
                  ? "bg-[#191919]/80 border-[#FF2F6C]/20 backdrop-blur-xl"
                  : "bg-white border-gray-200 shadow-sm"
              }`}
            >
              <p className={`text-xs font-semibold uppercase tracking-widest mb-4 ${isDark ? "text-[#EEECF6]/40" : "text-gray-400"}`}>
                Contents
              </p>
              <nav className="space-y-1">
                {SECTIONS.map(({ id, title }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className={`block text-sm py-1.5 px-2 rounded-lg transition-colors duration-150 ${
                      isDark
                        ? "text-[#EEECF6]/60 hover:text-[#FF2F6C] hover:bg-[#FF2F6C]/10"
                        : "text-gray-500 hover:text-pink-600 hover:bg-pink-50"
                    }`}
                  >
                    {title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="space-y-10 pt-10">
            {/* Section 1 */}
            <section id="collect" className="scroll-mt-6">
              <SectionHeading icon={Database} title="1. Information We Collect" isDark={isDark} />
              <div className={`space-y-3 text-sm leading-relaxed ${isDark ? "text-[#EEECF6]/70" : "text-gray-600"}`}>
                <p>
                  We collect information to provide, maintain, and improve our services. The types of
                  information we collect include:
                </p>
                <div className="space-y-3 mt-2">
                  <DataCategory isDark={isDark} label="Account Information">
                    Full name, email address, and password (stored encrypted) provided during registration.
                  </DataCategory>
                  <DataCategory isDark={isDark} label="Vehicle Information">
                    Vehicle registration numbers and type provided when making parking reservations.
                  </DataCategory>
                  <DataCategory isDark={isDark} label="Usage Data">
                    Booking history, preferred parking locations, session duration, and feature interactions.
                  </DataCategory>
                  <DataCategory isDark={isDark} label="Device & Technical Data">
                    Browser type, operating system, IP address, and device identifiers for security and analytics.
                  </DataCategory>
                </div>
              </div>
            </section>

            <Divider isDark={isDark} />

            {/* Section 2 */}
            <section id="use" className="scroll-mt-6">
              <SectionHeading icon={Eye} title="2. How We Use Your Information" isDark={isDark} />
              <div className={`space-y-3 text-sm leading-relaxed ${isDark ? "text-[#EEECF6]/70" : "text-gray-600"}`}>
                <p>We use the information collected for the following purposes:</p>
                <ul className="list-none space-y-2 mt-2">
                  {[
                    "To create and manage your account and provide access to the Service.",
                    "To process and confirm parking reservations and bookings.",
                    "To send booking confirmations, reminders, and real-time updates.",
                    "To improve and personalize your experience on the platform.",
                    "To analyze usage trends and optimize application performance.",
                    "To detect, prevent, and address technical issues and security threats.",
                    "To communicate important notices, policy updates, and service announcements.",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-[#FF2F6C]/15 text-[#FF2F6C] text-xs flex items-center justify-center flex-shrink-0 font-bold">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <Divider isDark={isDark} />

            {/* Section 3 */}
            <section id="sharing" className="scroll-mt-6">
              <SectionHeading icon={Share2} title="3. Information Sharing" isDark={isDark} />
              <div className={`space-y-3 text-sm leading-relaxed ${isDark ? "text-[#EEECF6]/70" : "text-gray-600"}`}>
                <p>
                  We do not sell, trade, or rent your personal information to third parties. We may share
                  your information only in the following limited circumstances:
                </p>
                <ul className="list-none space-y-2 mt-2">
                  {[
                    "With parking facility operators, solely for the purpose of fulfilling your reservation.",
                    "With service providers who assist us in operating our platform under strict confidentiality agreements.",
                    "When required by law, court order, or governmental authority.",
                    "In the event of a merger, acquisition, or sale of assets, with appropriate user notification.",
                    "With your explicit consent for any other purpose not stated here.",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-[#FF2F6C]/15 text-[#FF2F6C] text-xs flex items-center justify-center flex-shrink-0 font-bold">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <Divider isDark={isDark} />

            {/* Section 4 */}
            <section id="security" className="scroll-mt-6">
              <SectionHeading icon={ShieldCheck} title="4. Data Security" isDark={isDark} />
              <div className={`space-y-3 text-sm leading-relaxed ${isDark ? "text-[#EEECF6]/70" : "text-gray-600"}`}>
                <p>
                  We implement industry-standard technical, administrative, and physical security measures
                  to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {[
                    { label: "Encrypted passwords", desc: "bcrypt hashing with salting" },
                    { label: "HTTPS transmission", desc: "All traffic encrypted in transit" },
                    { label: "JWT authentication", desc: "Secure token-based sessions" },
                    { label: "HTTP security headers", desc: "Helmet.js protection layer" },
                  ].map(({ label, desc }) => (
                    <div
                      key={label}
                      className={`p-3 rounded-xl border text-xs ${
                        isDark
                          ? "bg-[#FF2F6C]/5 border-[#FF2F6C]/20"
                          : "bg-pink-50 border-pink-200"
                      }`}
                    >
                      <span className={`font-semibold block mb-0.5 ${isDark ? "text-[#FF2F6C]" : "text-pink-700"}`}>
                        {label}
                      </span>
                      <span className={isDark ? "text-[#EEECF6]/60" : "text-gray-500"}>{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <Divider isDark={isDark} />

            {/* Section 5 */}
            <section id="cookies" className="scroll-mt-6">
              <SectionHeading icon={Cookie} title="5. Cookies & Tracking" isDark={isDark} />
              <div className={`space-y-3 text-sm leading-relaxed ${isDark ? "text-[#EEECF6]/70" : "text-gray-600"}`}>
                <p>
                  SmartPark uses cookies and similar tracking technologies to enhance your experience,
                  maintain session state, and collect analytics data. We use:
                </p>
                <ul className="list-none space-y-2 mt-2">
                  {[
                    { label: "Essential Cookies:", desc: "Required for the platform to function. Cannot be disabled." },
                    { label: "Preference Cookies:", desc: "Remember your theme, language, and display settings." },
                    { label: "Analytics Cookies:", desc: "Help us understand how users interact with the platform." },
                  ].map(({ label, desc }) => (
                    <li key={label} className="flex items-start gap-2">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-[#FF2F6C]/15 text-[#FF2F6C] text-xs flex items-center justify-center flex-shrink-0 font-bold">
                        ✓
                      </span>
                      <span>
                        <strong className={isDark ? "text-[#EEECF6]" : "text-gray-800"}>{label}</strong>{" "}
                        {desc}
                      </span>
                    </li>
                  ))}
                </ul>
                <p>
                  You can control cookie preferences through the cookie consent banner displayed when you
                  first visit our site, or through your browser settings.
                </p>
              </div>
            </section>

            <Divider isDark={isDark} />

            {/* Section 6 */}
            <section id="retention" className="scroll-mt-6">
              <SectionHeading icon={Database} title="6. Data Retention" isDark={isDark} />
              <div className={`space-y-3 text-sm leading-relaxed ${isDark ? "text-[#EEECF6]/70" : "text-gray-600"}`}>
                <p>
                  We retain your personal information for as long as your account is active or as necessary
                  to provide the Service. We may retain certain information for longer periods to comply with
                  legal obligations, resolve disputes, and enforce agreements.
                </p>
                <p>
                  Upon account deletion, we will delete or anonymize your personal information within 30 days,
                  except where retention is required by law or legitimate business interests.
                </p>
              </div>
            </section>

            <Divider isDark={isDark} />

            {/* Section 7 */}
            <section id="children" className="scroll-mt-6">
              <SectionHeading icon={Baby} title="7. Children's Privacy" isDark={isDark} />
              <div className={`space-y-3 text-sm leading-relaxed ${isDark ? "text-[#EEECF6]/70" : "text-gray-600"}`}>
                <p>
                  SmartPark is not intended for children under the age of 18. We do not knowingly collect
                  personal information from minors. If you believe we have inadvertently collected information
                  from a child under 18, please contact us immediately and we will take steps to delete such
                  information.
                </p>
              </div>
            </section>

            <Divider isDark={isDark} />

            {/* Section 8 */}
            <section id="rights" className="scroll-mt-6">
              <SectionHeading icon={Lock} title="8. Your Rights" isDark={isDark} />
              <div className={`space-y-3 text-sm leading-relaxed ${isDark ? "text-[#EEECF6]/70" : "text-gray-600"}`}>
                <p>Depending on your jurisdiction, you may have the following rights regarding your data:</p>
                <ul className="list-none space-y-2 mt-2">
                  {[
                    "Access — Request a copy of the personal information we hold about you.",
                    "Rectification — Request correction of inaccurate or incomplete data.",
                    "Erasure — Request deletion of your personal data (right to be forgotten).",
                    "Portability — Receive your data in a structured, commonly used format.",
                    "Objection — Object to processing of your data for certain purposes.",
                    "Restriction — Request that we limit how we use your data.",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-[#FF2F6C]/15 text-[#FF2F6C] text-xs flex items-center justify-center flex-shrink-0 font-bold">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <p>
                  To exercise any of these rights, please contact us through our Contact page. We will respond
                  to your request within 30 days.
                </p>
              </div>
            </section>

            <Divider isDark={isDark} />

            {/* Section 9 */}
            <section id="updates" className="scroll-mt-6">
              <SectionHeading icon={RefreshCw} title="9. Policy Updates" isDark={isDark} />
              <div className={`space-y-3 text-sm leading-relaxed ${isDark ? "text-[#EEECF6]/70" : "text-gray-600"}`}>
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our practices or
                  for legal reasons. When we make material changes, we will notify you via email or a prominent
                  notice within the Service, and update the "Last updated" date at the top of this policy.
                </p>
                <p>
                  We encourage you to review this Privacy Policy periodically to stay informed about how we
                  protect your information.
                </p>
              </div>
            </section>

            <Divider isDark={isDark} />

            {/* Section 10 */}
            <section id="contact" className="scroll-mt-6">
              <SectionHeading icon={Mail} title="10. Contact Us" isDark={isDark} />
              <div className={`space-y-3 text-sm leading-relaxed ${isDark ? "text-[#EEECF6]/70" : "text-gray-600"}`}>
                <p>
                  If you have any questions, concerns, or requests regarding this Privacy Policy or our data
                  practices, please reach out to us:
                </p>
                <div
                  className={`mt-4 p-4 rounded-xl border ${
                    isDark
                      ? "bg-[#FF2F6C]/10 border-[#FF2F6C]/30"
                      : "bg-pink-50 border-pink-200"
                  }`}
                >
                  <Link
                    to="/contact"
                    className={`inline-flex items-center gap-2 font-medium text-sm transition-opacity hover:opacity-80 ${
                      isDark ? "text-[#FF2F6C]" : "text-pink-600"
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    Visit our Contact Page
                  </Link>
                </div>
              </div>
            </section>

            {/* Footer CTA */}
            <div
              className={`mt-8 p-6 rounded-2xl border text-center ${
                isDark
                  ? "bg-[#FF2F6C]/10 border-[#FF2F6C]/20"
                  : "bg-gradient-to-r from-pink-50 to-blue-50 border-pink-200"
              }`}
            >
              <p className={`text-sm mb-4 ${isDark ? "text-[#EEECF6]/60" : "text-gray-500"}`}>
                Ready to get started? Create your account now.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#FF2F6C] to-[#1B42CB] hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                <Lock className="w-4 h-4" />
                Back to Sign Up
              </Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  isDark,
}: {
  icon: React.ElementType;
  title: string;
  isDark: boolean;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isDark ? "bg-[#FF2F6C]/20" : "bg-pink-100"
        }`}
      >
        <Icon className={`w-4 h-4 ${isDark ? "text-[#FF2F6C]" : "text-pink-600"}`} />
      </div>
      <h2
        className={`text-lg font-bold ${
          isDark ? "text-[#EEECF6]" : "text-gray-900"
        }`}
      >
        {title}
      </h2>
    </div>
  );
}

function Divider({ isDark }: { isDark: boolean }) {
  return (
    <hr
      className={`border-0 h-px ${
        isDark ? "bg-[#FF2F6C]/15" : "bg-gray-100"
      }`}
    />
  );
}

function DataCategory({
  label,
  children,
  isDark,
}: {
  label: string;
  children: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <div
      className={`p-3 rounded-xl border ${
        isDark
          ? "bg-[#FF2F6C]/5 border-[#FF2F6C]/20"
          : "bg-pink-50 border-pink-200"
      }`}
    >
      <p className={`text-xs font-semibold mb-1 ${isDark ? "text-[#FF2F6C]" : "text-pink-700"}`}>
        {label}
      </p>
      <p className={`text-xs ${isDark ? "text-[#EEECF6]/60" : "text-gray-500"}`}>
        {children}
      </p>
    </div>
  );
}