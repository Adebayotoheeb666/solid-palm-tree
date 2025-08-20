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
    <footer className="mt-24 px-4 sm:px-8 lg:px-36">
      <div className="bg-ticket-footer rounded-t-lg p-8 lg:p-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
          {/* Logo and Copyright - Always left aligned */}
          <div className="space-y-2 md:space-y-4 flex flex-col items-start">
            <img
              src="/onboard/logos-01.png"
              alt="OnboardTicket Footer Logo"
              className="h-10 sm:h-12 md:h-16 lg:h-20 w-auto max-w-[160px] sm:max-w-[200px] md:max-w-[240px] lg:max-w-[280px] object-contain cursor-pointer"
              loading="lazy"
              onClick={handleLogoClick}
            />
            <hr className="border-black w-24 sm:w-32 md:w-40 lg:w-48" />
            <h4 className="font-semibold text-black text-xs sm:text-sm md:text-base">
              Onboardticket.com
            </h4>
            <p className="text-[10px] sm:text-xs font-semibold text-[#303850] opacity-50">
              © 2025 — Copyright
            </p>
            <p className="text-[10px] sm:text-xs font-semibold text-[#303850] opacity-50 leading-relaxed max-w-xs md:max-w-sm">
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

          {/* About - Left aligned on mobile, centered on larger screens */}
          <div className="space-y-2 md:space-y-4 flex flex-col items-start md:items-center md:justify-center">
            <h4 className="text-base md:text-lg font-bold text-[#0D69F2]">
              About
            </h4>
            <ul className="space-y-1 md:space-y-2 text-xs sm:text-sm font-semibold text-[#A2A2A2]">
              <li
                className="cursor-pointer hover:text-[#3839C9]"
                onClick={handleAboutClick}
              >
                Who We are ?
              </li>
              <li
                className="cursor-pointer hover:text-[#3839C9]"
                onClick={handlePrivacyClick}
              >
                Privacy Policy
              </li>
              <li
                className="cursor-pointer hover:text-[#3839C9]"
                onClick={handleTermsClick}
              >
                Terms & Conditions
              </li>
            </ul>
          </div>

          {/* Get Help - Left aligned on mobile, centered on larger screens */}
          <div className="space-y-2 md:space-y-4 flex flex-col items-start md:items-center md:justify-center">
            <h4 className="text-base md:text-lg font-bold text-[#0D69F2]">
              Get Help
            </h4>
            <ul className="space-y-1 md:space-y-2 text-xs sm:text-sm font-semibold text-[#A2A2A2]">
              <li
                className="cursor-pointer hover:text-[#3839C9]"
                onClick={handleFaqClick}
              >
                FAQs
              </li>
              <li
                className="cursor-pointer hover:text-[#3839C9]"
                onClick={handlePaymentClick}
              >
                Payment
              </li>
              <li
                className="cursor-pointer hover:text-[#3839C9]"
                onClick={handleContactClick}
              >
                Contact Support 24/7
              </li>
            </ul>
          </div>

          {/* Follow Us - Left aligned on mobile, centered on larger screens */}
          <div className="space-y-2 md:space-y-4 flex flex-col items-start md:items-center md:justify-center">
            <h4 className="text-base md:text-lg font-bold text-[#0D69F2]">
              Follow US
            </h4>
            <Instagram className="w-5 h-5 md:w-7 md:h-7 text-[#A2A2A2]" />

            <div className="space-y-1 md:space-y-2">
              <h5 className="text-base md:text-lg font-bold text-[#0D69F2]">
                Stay in touch
              </h5>
              <p className="text-xs sm:text-sm font-semibold text-[#A2A2A2]">
                Blog
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;
