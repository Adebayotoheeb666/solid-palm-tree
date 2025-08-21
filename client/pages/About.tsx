import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F4F4FF] font-plus-jakarta">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-36 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate("/")}
        >
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
            onClick={() => navigate("/register")}
          >
            Book now
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-36 py-12 lg:py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
          {/* Left Content */}
          <div className="flex-1 max-w-2xl">
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ob-primary mb-8 leading-tight">
                About us
              </h1>
              <p className="text-lg text-[#3150DA] font-bold mb-4">
                Onboardticket
              </p>
            </div>

            <div className="mb-12">
              <p className="text-base lg:text-lg text-[#23235B] font-semibold leading-relaxed mb-8">
                We are a collective of digital nomads dedicated to helping
                fellow travelers gain the flexibility they need for any journey
                — whether it's adapting your dream vacation plans or meeting the
                requirements of international visa applications. At
                OnboardTicket, our goal is to support a borderless lifestyle
                with smart, reliable travel solutions tailored for the modern
                explorer.
              </p>
            </div>

            {/* CTA Section */}
            <div className="mb-8">
              <button
                className="w-full max-w-md px-12 py-4 bg-[#3150DA] text-white font-black text-xl lg:text-2xl rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                onClick={() => navigate("/register")}
              >
                BOOK NOW
              </button>
              <p className="text-sm text-[#637996] font-bold mt-4 text-center max-w-md">
                instant & secure Booking from Just $15
              </p>
            </div>
          </div>

          {/* Right Content - Illustrations */}
          <div className="flex-1 relative max-w-lg">
            <div className="relative">
              {/* Background decorative elements */}
              <div className="absolute top-8 right-12 w-32 h-32 bg-[#EFFFE6]/78 rounded-3xl transform rotate-12"></div>
              <div className="absolute bottom-16 right-8 w-32 h-32 bg-[#EFFFE6]/78 rounded-full"></div>

              {/* Main illustration elements */}
              <div className="relative z-10">
                {/* Watermelon */}
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/ce5a2c74f47721ac230ddfc9a9c4fe42c76c37dc?width=348"
                  alt="Travel illustration"
                  className="w-44 h-44 object-contain absolute top-0 right-0 transform rotate-17"
                />

                {/* Apple illustrations */}
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/3d565ee3e06efddfda08c5040fb5cd9db5966e95?width=550"
                  alt="Travel accessories"
                  className="w-64 h-64 object-contain absolute top-16 left-8 transform rotate-12 opacity-81"
                />

                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/2058fc28ff689ef8ea67b3ef9284551368f190d0?width=350"
                  alt="Travel gear"
                  className="w-44 h-44 object-contain absolute bottom-0 right-4"
                />

                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/d246d5ab8beaf35796779c9b050b8f07d5fcd710?width=300"
                  alt="Travel items"
                  className="w-32 h-32 object-contain absolute bottom-8 left-16 transform rotate-27 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
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
                <div className="text-base font-semibold text-[#3150DA]">
                  Onboardticket.com
                </div>
                <div className="text-xs opacity-80 mt-2 text-black">
                  © 2025 — Copyright
                </div>
              </div>
              <p className="text-xs opacity-80 leading-relaxed text-black">
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
            <div className="space-y-2 md:space-y-4 flex flex-col items-center justify-center ">
              <h4 className="text-base md:text-lg font-bold text-[#3150DA]">
                About
              </h4>
              <ul className="space-y-1 md:space-y-2 text-xs sm:text-sm font-semibold text-black">
                <li
                  className="cursor-pointer hover:text-[#3839C9]"
                  onClick={() => navigate("/about")}
                >
                  Who We are ?
                </li>
                <li
                  className="cursor-pointer hover:text-[#3839C9]"
                  onClick={() => navigate("/privacy-policy")}
                >
                  Privacy Policy
                </li>
                <li
                  className="cursor-pointer hover:text-[#3839C9]"
                  onClick={() => navigate("/terms-conditions")}
                >
                  Terms & Conditions
                </li>
              </ul>
            </div>
            {/* Get Help */}
            <div className="space-y-2 md:space-y-4 flex flex-col items-center justify-center ">
              <h4 className="text-base md:text-lg font-bold text-[#3150DA]">
                Get Help
              </h4>
              <ul className="space-y-1 md:space-y-2 text-xs sm:text-sm font-semibold text-black">
                <li
                  className="cursor-pointer hover:text-[#3839C9]"
                  onClick={() => navigate("/faq")}
                >
                  FAQs
                </li>
                <li
                  className="cursor-pointer hover:text-[#3839C9]"
                  onClick={() => navigate("/payment")}
                >
                  Payment
                </li>
                <li
                  className="cursor-pointer hover:text-[#3839C9]"
                  onClick={() => navigate("/contact")}
                >
                  Contact Support 24/7
                </li>
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
