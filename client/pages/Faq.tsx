import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// FAQ Card Component (Single Card, Multiple Questions)
const FaqCard = ({ faqs }: { faqs: { q: string; a: string }[] }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div
      className="rounded-2xl shadow-md mb-4 transition-all duration-300 overflow-hidden"
      style={{
        background:
          "linear-gradient(270deg, rgb(223,195,210) 0%, rgb(175,174,220) 100%)",
      }}
    >
      {faqs.map((item, idx) => (
        <div key={idx} className="border-b last:border-b-0 border-[#bdb6d1]">
          <button
            className="w-full flex items-center justify-between px-6 py-5 md:px-8 md:py-6 text-left focus:outline-none"
            onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
            aria-expanded={openIdx === idx}
          >
            <span className="text-lg md:text-2xl font-bold text-[#191A78] font-jakarta">
              {item.q}
            </span>
            <span className="text-2xl md:text-3xl text-[#3839C9] font-bold select-none">
              {openIdx === idx ? "-" : "+"}
            </span>
          </button>
          <div
            className={`px-6 md:px-8 pb-4 md:pb-6 text-[#3839C9] text-base md:text-lg font-medium font-jakarta transition-all duration-300 ${openIdx === idx ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
            style={{ overflow: "hidden" }}
          >
            {openIdx === idx && <div>{item.a}</div>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default function Faq() {
  const navigate = useNavigate();

  // FAQ content as array of objects for collapsible cards
  const faqs = [
    // General Service Questions
    {
      q: "What is this service?",
      a: "This service provides a cost-effective alternative to buying a full-price airline ticket just to show proof of a return flight. We generate a valid flight reservation with a real, verifiable PNR.",
    },
    {
      q: "Why would I need this service?",
      a: "Many countries and airlines require travelers, especially those on one-way or flexible itineraries, to show proof of onward travel as a condition of entry. This service helps you meet that requirement without the expense of a fully refundable ticket.",
    },
    {
      q: "Is the flight reservation a real ticket?",
      a: "No, it is a legitimate reservation, not a purchased ticket. It includes a real PNR that can be verified with the airline, but it's typically only valid for a limited time.",
    },
    {
      q: "What is a PNR?",
      a: "PNR stands for Passenger Name Record. It's a unique code used by airlines to identify and manage your flight reservation.",
    },
    // Reservation Details & Process
    {
      q: "How do I make a reservation?",
      a: "You'll search for a flight using your desired departure/arrival cities, dates, and number of passengers. Then, you'll enter your personal information and complete the payment.",
    },
    {
      q: "What passenger information do I need to provide?",
      a: "You will need to provide your full name and email address. Other details like passport information may be required depending on the type of reservation.",
    },
    {
      q: "Can I book a reservation for multiple people?",
      a: "Yes, the service supports reservations for multiple passengers. An additional fee is charged per person.",
    },
    {
      q: "How long does it take to get my reservation?",
      a: "Reservations are typically delivered very quickly, often within 60 seconds to 10 minutes of a successful payment.",
    },
    {
      q: "How will I receive the reservation?",
      a: "Your flight reservation will be generated as a PDF document that you can instantly download. A copy will also be sent to your email.",
    },
    {
      q: "Can I choose a specific airline or flight time?",
      a: "Yes, the system allows you to select from available flight options and may offer control over details like preferred airlines or flight times.",
    },
    // Validity and Verification
    {
      q: "How long is the reservation valid for?",
      a: "Each reservation has a clearly stated validity period, such as 48 hours, 7 days, or 14 days.",
    },
    {
      q: "Can I extend the validity of my reservation?",
      a: "Yes, you can extend the validity period for an additional fee.",
    },
    {
      q: "How do I verify the PNR?",
      a: "You can use the PNR code provided on your reservation to check the status of your booking directly on the respective airline's official website.",
    },
    {
      q: "What happens if the reservation expires?",
      a: "After the specified validity period, the reservation will no longer be active in the airline's system and cannot be verified.",
    },
    // Pricing & Payments
    {
      q: "How much does the service cost?",
      a: "The service costs $15 per passenger. The final price may vary depending on additional options or the number of passengers. The price will be clearly displayed before you pay.",
    },
    {
      q: "What payment methods are accepted?",
      a: "The platform integrates with secure payment gateways like Stripe and PayPal to process your payment.",
    },
    {
      q: "Is my payment information safe?",
      a: "Yes, the service uses strong security measures to protect your personal and payment data.",
    },
    {
      q: "What is your refund policy?",
      a: "Refunds are available in specific circumstances, such as if a ticket delivery is delayed, if there's a duplicate order, or if the reservation is not compatible with visa requirements.",
    },
    // Support and Technical Questions
    {
      q: "What if I have an issue with my reservation?",
      a: "You can contact customer support via email or a contact form for assistance.",
    },
    {
      q: "Is there live support available?",
      a: "While the content mentions customer support, it also notes the possibility of live chat, depending on the system's features.",
    },
    {
      q: "How is the system able to generate real PNRs?",
      a: "The backend of the application is designed to interact with real flight reservation systems, likely through APIs or partnerships with travel agencies, to create legitimate and verifiable PNRs.",
    },
    {
      q: "Will my personal data be secure?",
      a: "Yes, the platform is built with strong security measures to protect user data.",
    },
    {
      q: "Can I use this service on my phone?",
      a: "Yes, the website features a responsive design for seamless use on both desktop and mobile devices.",
    },
    {
      q: "What happens in the backend after I pay?",
      a: "Upon successful payment, the backend system immediately interacts with the flight reservation APIs to generate the PNR and then a PDF document, which is then delivered to you.",
    },
    {
      q: "Does this service keep a history of my reservations?",
      a: "The system uses a database to store user orders and reservation details for your records.",
    },
    {
      q: "Will the platform be able to handle many users?",
      a: "The technical design of the platform emphasizes scalability to handle a growing number of users and reservation requests.",
    },
  ];

  return (
    <div className="min-h-screen bg-ob-background font-plus-jakarta">
      {/* Header */}
      <header className="text-left">
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
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-36 py-12 lg:py-20">
        {/* FAQ Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 md:px-8 text-center">
            <h2 className="text-3xl text-left md:text-5xl font-extrabold text-[#191A78] mb-2 md:mb-4 tracking-tight font-jakarta">
              Need Help ?
            </h2>
            <p className="text-lg text-left md:text-2xl text-[#8A8A8F] mb-8 md:mb-4 font-light font-jakarta">
              Get support within 30 min, on average
            </p>
            <p className="text-lg text-left md:text-2xl text-[#8A8A8F] mb-8 md:mb-12 font-light font-jakarta">
              Check out our frequently asked questions below or reach out to our
              team for fast, friendly support
            </p>

            <div className="w-full text-left">
              {/* FAQ Card Component (Single Card, Multiple Questions) */}
              <FaqCard faqs={faqs} />
            </div>

            <div className="flex gap-2 md:gap-4 mt-8 justify-start">
              <button
                className="bg-[#3839C9] text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg hover:bg-blue-700 transition-colors shadow-md"
                onClick={() => navigate("/contact")}
              >
                Contact Support
              </button>
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
            <div className="space-y-2 md:space-y-4 flex flex-col items-start md:items-center justify-start md:justify-center">
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
            <div className="space-y-2 md:space-y-4 flex flex-col items-start md:items-center justify-start md:justify-center">
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
            <div className="space-y-2 md:space-y-4 flex flex-col items-start md:items-center justify-start md:justify-center">
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
