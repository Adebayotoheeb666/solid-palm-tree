import React, { useCallback, memo } from "react";
import { Instagram } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Footer: React.FC = memo(() => {
  const navigate = useNavigate();

  const handleLogoClick = useCallback(() => navigate("/"), [navigate]);
  const handleAboutClick = useCallback(() => navigate("/about"), [navigate]);
  const handlePrivacyClick = useCallback(
    () => navigate("/privacy-policy"),
    [navigate],
  );
  const handleTermsClick = useCallback(
    () => navigate("/terms-conditions"),
    [navigate],
  );
  const handleFaqClick = useCallback(() => navigate("/faq"), [navigate]);
  const handlePaymentClick = useCallback(
    () => navigate("/payment"),
    [navigate],
  );
  const handleContactClick = useCallback(
    () => navigate("/contact"),
    [navigate],
  );

  return (
    <footer className="mt-8 sm:mt-12 md:mt-16 lg:mt-20">
      <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-12 xl:mx-16 bg-white/80 backdrop-blur-sm rounded-t-2xl shadow-lg border border-gray-200">
        <div className="p-6 sm:p-8 md:p-10 lg:p-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
            {/* Logo and Copyright */}
            <div className="sm:col-span-2 lg:col-span-1 space-y-4">
              <div className="flex items-center">
                <img
                  src="/onboard/logos-01.png"
                  alt="OnboardTicket Logo"
                  className="h-8 sm:h-10 md:h-12 w-auto object-contain cursor-pointer"
                  loading="lazy"
                  onClick={handleLogoClick}
                />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">
                  Onboardticket.com
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  © 2025 — Copyright
                </p>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-sm">
                OnboardTicket is committed to upholding the highest standards in
                compliance with international civil aviation regulations and
                ethical booking practices. This includes, but is not limited to,
                strict avoidance of misuse of booking classes, fraudulent
                activities, duplicate, speculative, or fictitious reservations.
                Users who engage in repeated cancellations without legitimate
                intent will be subject to monitoring, and may face usage
                restrictions or permanent bans from our platform.
              </p>
            </div>

            {/* About */}
            <div className="space-y-4">
              <h4 className="text-lg sm:text-xl font-bold text-blue-600">
                About
              </h4>
              <ul className="space-y-3 text-sm sm:text-base">
                <li
                  className="text-gray-700 cursor-pointer hover:text-blue-600 transition-colors duration-200 font-medium"
                  onClick={handleAboutClick}
                >
                  Who We are ?
                </li>
                <li
                  className="text-gray-700 cursor-pointer hover:text-blue-600 transition-colors duration-200 font-medium"
                  onClick={handlePrivacyClick}
                >
                  Privacy Policy
                </li>
                <li
                  className="text-gray-700 cursor-pointer hover:text-blue-600 transition-colors duration-200 font-medium"
                  onClick={handleTermsClick}
                >
                  Terms & Conditions
                </li>
              </ul>
            </div>

            {/* Get Help */}
            <div className="space-y-4">
              <h4 className="text-lg sm:text-xl font-bold text-blue-600">
                Get Help
              </h4>
              <ul className="space-y-3 text-sm sm:text-base">
                <li
                  className="text-gray-700 cursor-pointer hover:text-blue-600 transition-colors duration-200 font-medium"
                  onClick={handleFaqClick}
                >
                  FAQs
                </li>
                <li
                  className="text-gray-700 cursor-pointer hover:text-blue-600 transition-colors duration-200 font-medium"
                  onClick={handlePaymentClick}
                >
                  Payment
                </li>
                <li
                  className="text-gray-700 cursor-pointer hover:text-blue-600 transition-colors duration-200 font-medium"
                  onClick={handleContactClick}
                >
                  Contact Support 24/7
                </li>
              </ul>
            </div>

            {/* Follow Us */}
            <div className="space-y-4">
              <h4 className="text-lg sm:text-xl font-bold text-blue-600">
                Follow US
              </h4>
              <div className="flex items-center space-x-2">
                <Instagram className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600 hover:text-blue-600 cursor-pointer transition-colors duration-200" />
              </div>

              <div className="space-y-2">
                <h5 className="text-lg sm:text-xl font-bold text-blue-600">
                  Stay in touch
                </h5>
                <p className="text-sm sm:text-base text-gray-700 font-medium cursor-pointer hover:text-blue-600 transition-colors duration-200">
                  Blog
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;
