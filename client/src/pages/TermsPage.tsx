import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import {
  Shield,
  ArrowLeft,
  FileText,
  AlertCircle,
  Users,
  Lock,
  CreditCard,
  Ban,
  RefreshCw,
  Mail,
  Scale,
} from "lucide-react";

const SECTIONS = [
  { id: "acceptance", icon: FileText, title: "1. Acceptance of Terms" },
  { id: "eligibility", icon: Users, title: "2. User Eligibility" },
  { id: "account", icon: Lock, title: "3. Account Responsibilities" },
  { id: "booking", icon: CreditCard, title: "4. Parking & Booking Policy" },
  { id: "prohibited", icon: Ban, title: "5. Prohibited Activities" },
  { id: "modifications", icon: RefreshCw, title: "6. Modifications to Service" },
  { id: "liability", icon: AlertCircle, title: "7. Limitation of Liability" },
  { id: "governing", icon: Scale, title: "8. Governing Law" },
  { id: "contact", icon: Mail, title: "9. Contact Us" },
];

export default function TermsPage() {
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
              ? "bg-gradient-to-br from-[#1B42CB]/20 via-[#191919] to-[#FF2F6C]/10"
              : "bg-gradient-to-br from-blue-600/10 via-white to-pink-500/10"
          }`}
        />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#1B42CB]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#FF2F6C]/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 py-14 sm:px-6 lg:px-8">
          {/* Back navigation */}
          <Link
            to="/signup"
            className={`inline-flex items-center gap-2 text-sm font-medium mb-8 group transition-colors duration-200 ${
              isDark
                ? "text-[#EEECF6]/60 hover:text-[#1B42CB]"
                : "text-gray-500 hover:text-blue-600"
            }`}
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Sign Up
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1B42CB] to-[#FF2F6C] flex items-center justify-center flex-shrink-0 shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-[#1B42CB] to-[#FF2F6C] bg-clip-text text-transparent">
                Terms of Service
              </h1>
              <p className={`mt-1 text-sm ${isDark ? "text-[#EEECF6]/50" : "text-gray-500"}`}>
                SmartPark · Last updated: June 26, 2026 · Version 1.0
              </p>
            </div>
          </div>

          <p className={`text-base leading-relaxed max-w-3xl ${isDark ? "text-[#EEECF6]/70" : "text-gray-600"}`}>
            Please read these Terms of Service carefully before using the SmartPark
            application. By accessing or using our service, you agree to be bound
            by these terms.
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
                  ? "bg-[#191919]/80 border-[#1B42CB]/20 backdrop-blur-xl"
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
                        ? "text-[#EEECF6]/60 hover:text-[#1B42CB] hover:bg-[#1B42CB]/10"
                        : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
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
            <section id="acceptance" className="scroll-mt-6">
              <SectionHeading icon={FileText} title="1. Acceptance of Terms" isDark={isDark} />
              <div className={`space-y-3 text-sm leading-relaxed ${isDark ? "text-[#EEECF6]/70" : "text-gray-600"}`}>
                <p>
                  By accessing and using the SmartPark application ("Service"), you acknowledge that you have
                  read, understood, and agree to be bound by these Terms of Service and all applicable laws
                  and regulations. If you do not agree with any part of these terms, you may not access the Service.
                </p>
                <p>
                  These Terms constitute a legally binding agreement between you ("User") and SmartPark
                  ("Company," "we," "our," or "us"). Your continued use of the Service after any changes to
                  these Terms constitutes your acceptance of the new Terms.
                </p>
              </div>
            </section>

            <Divider isDark={isDark} />

            {/* Section 2 */}
            <section id="eligibility" className="scroll-mt-6">
              <SectionHeading icon={Users} title="2. User Eligibility" isDark={isDark} />
              <div className={`space-y-3 text-sm leading-relaxed ${isDark ? "text-[#EEECF6]/70" : "text-gray-600"}`}>
                <p>To use SmartPark, you must:</p>
                <ul className="list-none space-y-2 mt-2">
                  {[
                    "Be at least 18 years of age or the legal age of majority in your jurisdiction.",
                    "Have the legal capacity to enter into a binding agreement.",
                    "Not be prohibited from using the Service under applicable law.",
                    "Provide accurate and complete registration information.",
                    "Maintain a valid email address associated with your account.",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-[#1B42CB]/15 text-[#1B42CB] text-xs flex items-center justify-center flex-shrink-0 font-bold">
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
            <section id="account" className="scroll-mt-6">
              <SectionHeading icon={Lock} title="3. Account Responsibilities" isDark={isDark} />
              <div className={`space-y-3 text-sm leading-relaxed ${isDark ? "text-[#EEECF6]/70" : "text-gray-600"}`}>
                <p>
                  You are responsible for maintaining the confidentiality of your account credentials, including
                  your password. You agree to accept responsibility for all activities that occur under your account.
                </p>
                <p>
                  You must notify us immediately upon becoming aware of any breach of security or unauthorized
                  use of your account. SmartPark cannot and will not be liable for any loss or damage arising
                  from your failure to comply with this obligation.
                </p>
                <p>
                  You may not use another user's account without permission. Each account is personal and
                  non-transferable. Account sharing is prohibited.
                </p>
              </div>
            </section>

            <Divider isDark={isDark} />

            {/* Section 4 */}
            <section id="booking" className="scroll-mt-6">
              <SectionHeading icon={CreditCard} title="4. Parking & Booking Policy" isDark={isDark} />
              <div className={`space-y-3 text-sm leading-relaxed ${isDark ? "text-[#EEECF6]/70" : "text-gray-600"}`}>
                <p>
                  SmartPark provides a platform to discover, reserve, and manage parking slots. All booking
                  transactions are subject to the following policies:
                </p>
                <ul className="list-none space-y-2 mt-2">
                  {[
                    "Reservations must be made in advance through the platform and are subject to availability.",
                    "Users must provide accurate vehicle registration details at the time of booking.",
                    "Cancellation and refund policies are determined by individual parking facility operators.",
                    "Late arrivals beyond the grace period may result in forfeiture of the reserved slot.",
                    "Users are responsible for any damage caused to the parking facility during their reservation.",
                    "SmartPark acts as an intermediary and is not liable for disputes between users and facility operators.",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-[#1B42CB]/15 text-[#1B42CB] text-xs flex items-center justify-center flex-shrink-0 font-bold">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <Divider isDark={isDark} />

            {/* Section 5 */}
            <section id="prohibited" className="scroll-mt-6">
              <SectionHeading icon={Ban} title="5. Prohibited Activities" isDark={isDark} />
              <div className={`space-y-3 text-sm leading-relaxed ${isDark ? "text-[#EEECF6]/70" : "text-gray-600"}`}>
                <p>You agree not to engage in any of the following activities:</p>
                <ul className="list-none space-y-2 mt-2">
                  {[
                    "Using the Service for any unlawful purpose or in violation of any regulations.",
                    "Attempting to gain unauthorized access to any part of the Service or its systems.",
                    "Submitting false, misleading, or fraudulent information.",
                    "Interfering with or disrupting the integrity or performance of the Service.",
                    "Scraping, crawling, or extracting data from the platform without written permission.",
                    "Creating multiple accounts to circumvent restrictions or policies.",
                    "Reselling, sublicensing, or commercially exploiting the Service without authorization.",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-[#FF2F6C]/15 text-[#FF2F6C] text-xs flex items-center justify-center flex-shrink-0">
                        ✗
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <InfoBox isDark={isDark}>
                  Violations may result in immediate account suspension or permanent termination without notice.
                </InfoBox>
              </div>
            </section>

            <Divider isDark={isDark} />

            {/* Section 6 */}
            <section id="modifications" className="scroll-mt-6">
              <SectionHeading icon={RefreshCw} title="6. Modifications to Service" isDark={isDark} />
              <div className={`space-y-3 text-sm leading-relaxed ${isDark ? "text-[#EEECF6]/70" : "text-gray-600"}`}>
                <p>
                  SmartPark reserves the right to modify, suspend, or discontinue any aspect of the Service at
                  any time, with or without notice. We may also update these Terms of Service periodically.
                </p>
                <p>
                  Material changes to these Terms will be communicated via email or a prominent notice within
                  the Service. Your continued use following the effective date of such changes constitutes your
                  acceptance of the revised Terms.
                </p>
              </div>
            </section>

            <Divider isDark={isDark} />

            {/* Section 7 */}
            <section id="liability" className="scroll-mt-6">
              <SectionHeading icon={AlertCircle} title="7. Limitation of Liability" isDark={isDark} />
              <div className={`space-y-3 text-sm leading-relaxed ${isDark ? "text-[#EEECF6]/70" : "text-gray-600"}`}>
                <p>
                  To the maximum extent permitted by applicable law, SmartPark and its affiliates, officers,
                  employees, agents, and licensors shall not be liable for any indirect, incidental, special,
                  consequential, or punitive damages, including but not limited to loss of profits, data, or
                  goodwill.
                </p>
                <p>
                  The Service is provided on an "as is" and "as available" basis without warranties of any
                  kind, either express or implied. SmartPark does not warrant that the Service will be
                  uninterrupted, error-free, or free of harmful components.
                </p>
              </div>
            </section>

            <Divider isDark={isDark} />

            {/* Section 8 */}
            <section id="governing" className="scroll-mt-6">
              <SectionHeading icon={Scale} title="8. Governing Law" isDark={isDark} />
              <div className={`space-y-3 text-sm leading-relaxed ${isDark ? "text-[#EEECF6]/70" : "text-gray-600"}`}>
                <p>
                  These Terms shall be governed by and construed in accordance with applicable laws, without
                  regard to its conflict of law provisions. Any disputes arising from or relating to these Terms
                  or the Service shall be subject to the exclusive jurisdiction of the competent courts.
                </p>
                <p>
                  If any provision of these Terms is held to be invalid or unenforceable, the remaining
                  provisions will remain in full force and effect.
                </p>
              </div>
            </section>

            <Divider isDark={isDark} />

            {/* Section 9 */}
            <section id="contact" className="scroll-mt-6">
              <SectionHeading icon={Mail} title="9. Contact Us" isDark={isDark} />
              <div className={`space-y-3 text-sm leading-relaxed ${isDark ? "text-[#EEECF6]/70" : "text-gray-600"}`}>
                <p>
                  If you have questions or concerns about these Terms of Service, please contact us:
                </p>
                <div
                  className={`mt-4 p-4 rounded-xl border ${
                    isDark
                      ? "bg-[#1B42CB]/10 border-[#1B42CB]/30"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <Link
                    to="/contact"
                    className={`inline-flex items-center gap-2 font-medium text-sm transition-opacity hover:opacity-80 ${
                      isDark ? "text-[#1B42CB]" : "text-blue-600"
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
                  ? "bg-[#1B42CB]/10 border-[#1B42CB]/20"
                  : "bg-gradient-to-r from-blue-50 to-pink-50 border-blue-200"
              }`}
            >
              <p className={`text-sm mb-4 ${isDark ? "text-[#EEECF6]/60" : "text-gray-500"}`}>
                Ready to get started? Create your account now.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#1B42CB] to-[#FF2F6C] hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                <Shield className="w-4 h-4" />
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
          isDark ? "bg-[#1B42CB]/20" : "bg-blue-100"
        }`}
      >
        <Icon className={`w-4 h-4 ${isDark ? "text-[#1B42CB]" : "text-blue-600"}`} />
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
        isDark ? "bg-[#1B42CB]/15" : "bg-gray-100"
      }`}
    />
  );
}

function InfoBox({
  children,
  isDark,
}: {
  children: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <div
      className={`mt-3 flex items-start gap-2 p-3 rounded-xl text-xs ${
        isDark
          ? "bg-[#FF2F6C]/10 border border-[#FF2F6C]/20 text-[#FF2F6C]"
          : "bg-red-50 border border-red-200 text-red-600"
      }`}
    >
      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}