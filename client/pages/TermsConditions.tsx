import { useNavigate } from "react-router-dom";

export default function TermsConditions() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-ob-background font-plus-jakarta">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-36 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}> 
          <img 
            src="/onboard/result.png" 
            alt="OnboardTicket Logo" 
            className="h-12 sm:h-16 md:h-20 lg:h-24 w-auto max-w-[220px] sm:max-w-[280px] md:max-w-[320px] lg:max-w-[360px] object-contain drop-shadow-sm cursor-pointer"
            loading="eager"
            onClick={() => navigate("/")}
          />
        </div>
        <nav className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <button
            className="px-4 sm:px-8 py-2 sm:py-3 text-ob-dark font-bold text-base sm:text-lg hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => navigate("/contact")}
          >
            Get Support
          </button>
          <button
            className="px-4 sm:px-8 py-2 sm:py-3 text-ob-dark font-semibold text-base sm:text-lg hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => navigate("/userform")}
          >
            Book now
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-36 py-8">
        <section className="bg-white/90 rounded-3xl p-8 lg:p-12 shadow-lg">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ob-primary mb-8 leading-tight text-center">
            Terms & conditions
          </h1>
          <div className="text-[#23235B] text-lg lg:text-xl font-semibold leading-relaxed space-y-6">
            <div>
              <h2 className="font-semibold text-[#637996] underline decoration-auto mb-4">Terms and Conditions</h2>
              <p>
                These Terms and Conditions constitute a legally binding agreement made between you, whether individually or on behalf of any entity ("you", the "User"), and FGRМ Tech Pte. Ltd., a company incorporated in Singapore and located at 160 Robinson Road #14-04, Singapore 068914 ("Onboardticket.com", "we", "us", "our"), regarding your access to and use of the Onboardticket.com website (<a href="https://Onboardticket.com" className="underline text-[#637996]">https://Onboardticket.com</a>) and related services (collectively, the "Site").
              </p>
              <p>
                The Site provides a service involving the direct or indirect sale, resale, and facilitation of airline ticket reservations (the "Service"). By using our Site and/or Service, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree, you must not use the Site or Service.
              </p>
              <p>
                We may revise these Terms and Conditions at any time. Your continued use of the Site and Service constitutes your acceptance of any changes.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-[#637996] mb-3">1. General Conditions</h3>
              <div className="space-y-2 ml-4">
                <p>1.1. You agree to use the Site and Services legally and in compliance with these Terms and Conditions.</p>
                <p>1.2. If you do not agree to these Terms, you must cease use immediately.</p>
                <p>1.3. The Site operates in English. We are not responsible for misunderstandings due to language.</p>
                <p>1.4. Additional policies include: Privacy Policy</p>
                <p>1.5. Onboardticket.com operates under Singapore law. We do not guarantee our Service or Site is appropriate outside Singapore.</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-[#637996] mb-3">2. Payment Methods</h3>
              <p>We accept:</p>
              <ul className="ml-4 space-y-1">
                <li>• Credit Cards</li>
                <li>• Debit Cards</li>
                <li>• PayPal</li>
              </ul>
              <p>All payments are processed securely.</p>
            </div>

            <div>
              <h3 className="font-semibold text-[#637996] mb-3">3. User Obligations</h3>
              <div className="space-y-2">
                <p>3.1. You agree not to:</p>
                <ul className="ml-4 space-y-1">
                  <li>• Use the Site for unlawful purposes;</li>
                  <li>• Use automated systems to access the Site;</li>
                  <li>• Attempt to hack or test vulnerabilities;</li>
                  <li>• Introduce viruses or malware.</li>
                </ul>
                <p>3.2. Prohibited usage includes but is not limited to:</p>
                <ul className="ml-4 space-y-1">
                  <li>• Violating any IATA or airline fare rules;</li>
                  <li>• Making bookings without genuine travel intent;</li>
                  <li>• Using the Service to support visa applications without travel plans;</li>
                  <li>• Creating speculative or fraudulent reservations.</li>
                </ul>
                <p>3.3. You must be at least 16 years old to use our Site and Services.</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-[#637996] mb-3">4. Our Rights</h3>
              <p>We reserve the right to:</p>
              <ul className="ml-4 space-y-1">
                <li>• Suspend or block access without notice;</li>
                <li>• Conduct maintenance without notice;</li>
                <li>• Request identity verification;</li>
                <li>• Monitor user activity;</li>
                <li>• Cancel suspicious or fraudulent bookings;</li>
                <li>• Deny service at our sole discretion.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-[#637996] mb-3">5. Legal Disclaimer</h3>
              <div className="space-y-2 ml-4">
                <p>5.1. The Site and Service are provided "as is" without warranties.</p>
                <p>5.2. We do not guarantee uninterrupted or error-free access.</p>
                <p>5.3. We are not liable for third-party behavior or site links.</p>
                <p>5.4. No e-ticket numbers are issued unless explicitly stated and paid for within 48 hours.</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-[#637996] mb-3">6. Intellectual Property</h3>
              <p>We or our licensors own all intellectual property on the Site. No part of the Site may be copied, distributed, or modified without our prior written consent.</p>
            </div>

            <div>
              <h3 className="font-semibold text-[#637996] mb-3">7. Service Terms</h3>
              <div className="space-y-2 ml-4">
                <p>7.1. Information on the Site may be outdated or incorrect.</p>
                <p>7.2. We do not guarantee ticket issuance without proper payment and confirmation.</p>
                <p>7.3. "Receive Later" option requires activation at least 6 days before the itinerary start.</p>
                <p>7.4. Prices may change without notice. We may suspend or discontinue any Service.</p>
                <p>7.5. Availability is not guaranteed and we reserve the right to limit or deny service at our discretion.</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-[#637996] mb-3">8. Limitation of Liability</h3>
              <div className="space-y-2 ml-4">
                <p>8.1. Nothing in these Terms excludes liability for death, personal injury, or fraud.</p>
                <p>8.2. We are not liable for any damages including indirect or consequential losses from use of the Site or Service.</p>
                <p>8.3. Use of a PNR code does not guarantee visa or travel approval. Use at your own risk.</p>
                <p>8.4. Maximum liability shall not exceed the amount paid by you for the Service.</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-[#637996] mb-3">9. Indemnity</h3>
              <p>You agree to indemnify Onboardticket.com from any claim, liability, or legal fee arising from your use of the Site or violation of these Terms.</p>
            </div>

            <div>
              <h3 className="font-semibold text-[#637996] mb-3">10. Termination</h3>
              <p>We may terminate your access at any time without notice. Upon termination, you must cease use and destroy any downloaded material.</p>
            </div>

            <div>
              <h3 className="font-semibold text-[#637996] mb-3">11. Dispute Resolution</h3>
              <div className="space-y-2 ml-4">
                <p>11.1. Any complaints must be submitted via email and will be reviewed within 30 days.</p>
                <p>11.2. False claims will result in full indemnification of Onboardticket.com.</p>
                <p>11.3. Communications will be made via the email address you provided.</p>
                <p>11.4. These Terms are governed by the laws of Singapore.</p>
                <p>11.5. This document constitutes the entire agreement between you and us.</p>
                <p>11.6. If any provision is found invalid, the rest remain enforceable.</p>
                <p>11.7. No failure to enforce rights constitutes a waiver.</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-[#637996] mb-3">12. Refund Policy</h3>
              <div className="space-y-2">
                <p>Refunds are only granted if:</p>
                <ul className="ml-4 space-y-1">
                  <li>• Duplicate payment was made due to technical error; or</li>
                  <li>• Onboardticket.com failed to deliver the Service.</li>
                </ul>
                <p>Refunds are issued within 30 days of a successful request.</p>
                <p>Submit refund requests to: support@onboardticket.com</p>
                <p>Refund approval is solely at our discretion.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-24 px-4 sm:px-8 lg:px-36">
        <div className="bg-ticket-footer rounded-t-lg p-8 lg:p-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
            {/* Logo and Copyright */}
            <div className="space-y-4">
              <div>
                <img 
                  src="/onboard/result.png" 
                  alt="OnboardTicket Logo" 
                  className="h-12 sm:h-14 md:h-16 w-auto max-w-[200px] sm:max-w-[240px] md:max-w-[280px] object-contain mb-4 cursor-pointer"
                  onClick={() => navigate("/")}
                />
                <hr className="border-white mb-4" />
                <div className="text-base font-semibold text-[#3150DA]">Onboardticket.com</div>
                <div className="text-xs opacity-80 mt-2 text-black">© 2025 — Copyright</div>
              </div>
              <p className="text-xs opacity-80 leading-relaxed text-black">
                OnboardTicket is committed to upholding the highest standards in compliance with international civil aviation regulations and ethical booking practices. This includes, but is not limited to, strict avoidance of misuse of booking classes, fraudulent activities, duplicate, speculative, or fictitious reservations. Users who engage in repeated cancellations without legitimate intent will be subject to monitoring, and may face usage restrictions or permanent bans from our platform.
              </p>
            </div>
            {/* About */}
            <div className="space-y-2 md:space-y-4 flex flex-col items-center justify-center ">
              <h4 className="text-base md:text-lg font-bold text-[#3150DA]">
                About
              </h4>
              <ul className="space-y-1 md:space-y-2 text-xs sm:text-sm font-semibold text-black">
                <li className="cursor-pointer hover:text-[#3839C9]" onClick={() => navigate("/about")}>Who We are ?</li>
                <li className="cursor-pointer hover:text-[#3839C9]" onClick={() => navigate("/privacy-policy")}>Privacy Policy</li>
                <li className="cursor-pointer hover:text-[#3839C9]" onClick={() => navigate("/terms-conditions")}>Terms & Conditions</li>
              </ul>
            </div>
            {/* Get Help */}
            <div className="space-y-2 md:space-y-4 flex flex-col items-center justify-center ">
              <h4 className="text-base md:text-lg font-bold text-[#3150DA]">
                Get Help
              </h4>
              <ul className="space-y-1 md:space-y-2 text-xs sm:text-sm font-semibold text-black">
                <li className="cursor-pointer hover:text-[#3839C9]" onClick={() => navigate("/faq")}>FAQs</li>
                <li className="cursor-pointer hover:text-[#3839C9]" onClick={() => navigate("/payment")}>Payment</li>
                <li className="cursor-pointer hover:text-[#3839C9]" onClick={() => navigate("/contact")}>Contact Support 24/7</li>
              </ul>
            </div>
            {/* Follow Us */}
            <div className="space-y-2 md:space-y-4 flex flex-col items-center justify-center ">
              <h4 className="text-base md:text-lg font-bold text-[#3150DA]">
                Follow US
              </h4>
              <div className="space-y-1 md:space-y-2">
                <h5 className="text-base md:text-lg font-bold text-[#3150DA]">
                  Stay in touch
                </h5>
                <p className="text-xs sm:text-sm font-semibold text-black">
                  Blog
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
