import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
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
      <main className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-36 py-12 lg:py-20">
        <section className="bg-white/90 rounded-3xl p-8 lg:p-16 shadow-lg">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ob-primary mb-8 leading-tight text-center">Privacy Policy</h1>
          <div className="text-[#23235B] text-lg lg:text-xl font-semibold leading-relaxed mb-8">
            {/* Privacy Policy content here, ensure text is dark and readable */}
            <p>
              OnboardTicket Pte. Ltd. ("we", "our", or "us") is committed to safeguarding and respecting your privacy.
            </p>
            <br />
            <p>
              This Privacy Policy (together with our Terms and Conditions of Use ("Terms") and any other documents referred to therein) outlines the basis on which any personal data (as defined under the Personal Data Protection Act 2012 ("PDPA")) ("Data") that we collect from you, or that you provide to us on the onboardticket.com website or through any related platforms or applications (the "Platform"), will be collected, used, disclosed, stored, or otherwise processed by us. Please review this policy carefully to understand our practices regarding your Data and how it will be handled.
            </p>
          </div>

          <div className="text-[#637996] text-xl lg:text-2xl font-normal leading-relaxed space-y-6">
            <div>
              <h2 className="font-semibold text-[#637996] mb-4">INFORMATION WE MAY COLLECT</h2>
              <p className="mb-4">Depending on how you interact with us, we may collect and process the following categories of Data:</p>
              <ul className="ml-4 space-y-2">
                <li>• Information you provide by completing forms on the Platform, such as when registering, purchasing services, submitting support requests, or posting content;</li>
                <li>• Details of transactions made via the Platform;</li>
                <li>• Payment data needed to process your purchases;</li>
                <li>• Records of your interactions with us, including any correspondence;</li>
                <li>• Data about your use of the Platform, including traffic data, location data, device identifiers, and access logs.</li>
              </ul>
              <p className="mt-4">
                We may also collect information from third-party sources such as advertising and analytics partners, where applicable.
              </p>
              <p className="mt-4">
                Technical data may be collected automatically when you use the Platform, such as your IP address, browser type, and device information.
              </p>
              <p className="mt-4">
                The Platform uses cookies and similar technologies to enhance functionality and performance. Some cookies are necessary for basic operation, while others help us analyze usage and improve the user experience. For more details, please review our Cookie Policy.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-[#637996] mb-4">WHERE WE STORE YOUR DATA</h3>
              <ul className="ml-4 space-y-2">
                <li>• We implement appropriate security measures to prevent unauthorized access, misuse, or alteration of your Data.</li>
                <li>• Your Data may be stored or processed in countries outside Singapore. It may also be accessed by staff or service providers based in other jurisdictions for the purposes of providing services, platform maintenance, or support.</li>
                <li>• By submitting your Data, you consent to such international transfer, processing, and storage as described above. We will take all reasonable steps to ensure your Data is handled securely and in accordance with this Privacy Policy.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-[#637996] mb-4">USES OF YOUR DATA</h3>
              <p className="mb-3">We may use your Data for purposes including but not limited to:</p>
              <ul className="ml-4 space-y-2">
                <li>• Verifying your identity and managing your account;</li>
                <li>• Delivering products or services you've requested;</li>
                <li>• Processing transactions and payments;</li>
                <li>• Enhancing and personalizing your experience on the Platform;</li>
                <li>• Sending promotional or marketing communications (where consent has been given);</li>
                <li>• Responding to your inquiries or service requests;</li>
                <li>• Complying with legal obligations or law enforcement requirements;</li>
                <li>• Any other purposes reasonably related to the above or as otherwise described at the time of data collection.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-[#637996] mb-4">DISCLOSURE OF YOUR DATA</h3>
              <div className="space-y-3">
                <p>We may disclose your Data within our group of companies (subsidiaries, parent company, affiliates) for internal operations.</p>
                <p>Your Data may be disclosed to:</p>
                <ul className="ml-4 space-y-2">
                  <li>• Service providers, agents, or partners assisting with the purposes listed above;</li>
                  <li>• Third parties involved in business transfers or acquisitions;</li>
                  <li>• Legal, regulatory, or law enforcement agencies as required by law or court order;</li>
                  <li>• Any other parties with your consent or as disclosed at the time of collection.</li>
                </ul>
                <p>While we take steps to ensure third-party compliance, we are not responsible for unauthorized use or disclosure of your Data by such third parties.</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-[#637996] mb-4">CONSENT</h3>
              <ul className="ml-4 space-y-2">
                <li>• By providing your Data to us, you consent to its collection, use, and disclosure for the purposes outlined above.</li>
                <li>• If you provide us with Data relating to others, you confirm that you have obtained their consent and have informed them of our policies.</li>
                <li>• You may withdraw your consent at any time by contacting our Data Protection Officer. Please note that withdrawal may affect your ability to use our services.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-[#637996] mb-4">YOUR RIGHTS</h3>
              <p>The Platform may contain links to third-party websites. Please note that those websites are governed by their own privacy policies. We are not responsible for their content or privacy practices.</p>
            </div>

            <div>
              <h3 className="font-semibold text-[#637996] mb-4">ACCURACY</h3>
              <p>We rely on you to ensure your Data is complete, accurate, and up to date. Please inform us promptly of any changes.</p>
            </div>

            <div>
              <h3 className="font-semibold text-[#637996] mb-4">ACCESS & CORRECTION</h3>
              <ul className="ml-4 space-y-2">
                <li>• You have the right to request access to your Data in accordance with the PDPA. An administrative fee may apply.</li>
                <li>• You may also request corrections or updates to your Data by contacting us directly. Some updates may be made through your user account on the Platform.</li>
                <li>• We aim to respond to requests within thirty (30) days, or will notify you of any delays and their reasons.</li>
                <li>• Where applicable, updates to your Data will be shared with third parties or affiliates who continue to require it for the intended purpose.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-[#637996] mb-4">DATA RETENTION</h3>
              <ul className="ml-4 space-y-2">
                <li>• We retain your Data only for as long as necessary for the purposes it was collected or as required by law.</li>
                <li>• We are not responsible for unauthorized retention of your Data by third parties once it is no longer needed or required.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-[#637996] mb-4">CHANGES TO THIS POLICY</h3>
              <p>We may revise this Privacy Policy from time to time. Changes will be posted on this page and, if significant, communicated via email.</p>
            </div>

            <div>
              <h3 className="font-semibold text-[#637996] mb-4">CONTACT US</h3>
              <div className="space-y-2">
                <p>Our Data Protection Officer oversees our privacy compliance.</p>
                <p>For any questions or concerns regarding this policy, please contact us at:</p>
                <p>📧 support@onboardticket.com</p>
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
