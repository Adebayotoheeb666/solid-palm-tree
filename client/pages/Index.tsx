import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  Navigation,
  Star,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import TestimonialCarousel from "../components/ui/TestimonialCarousel";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Header from "../components/Header";
import Footer from "../components/Footer";

const testimonials = [
  {
    name: "Daniel Ricciardo",
    role: "Businessman",
    text: "The experience of booking airfare through this website was amazing! The intuitive interface, wide selection of routes, and fast transaction process made my trip more enjoyable.",
    img: "https://api.builder.io/api/v1/image/assets/TEMP/f4f31fe52ad073d5757f8f9684b13989bf5401c7?width=112",
  },
  {
    name: "Sophia Lee",
    role: "Student",
    text: "Super fast and reliable! Got my reservation in minutes and it worked perfectly for my visa application.",
    img: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "John Smith",
    role: "Frequent Traveler",
    text: "Affordable and trustworthy. I use this service every time I need proof of onward travel.",
    img: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Maria Garcia",
    role: "Digital Nomad",
    text: "The support team is fantastic and the process is seamless. Highly recommended!",
    img: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    name: "Ahmed Hassan",
    role: "Entrepreneur",
    text: "I was skeptical at first, but the reservation was real and verifiable. Great value!",
    img: "https://randomuser.me/api/portraits/men/76.jpg",
  },
  {
    name: "Emily Chen",
    role: "Backpacker",
    text: "Perfect for last-minute travel needs. The process is quick and easy.",
    img: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    name: "Carlos Ruiz",
    role: "Tourist",
    text: "I got my ticket instantly and it was accepted at the embassy. Will use again!",
    img: "https://randomuser.me/api/portraits/men/41.jpg",
  },
  {
    name: "Priya Patel",
    role: "Consultant",
    text: "The best service for onward tickets. The customer support is responsive and helpful.",
    img: "https://randomuser.me/api/portraits/women/12.jpg",
  },
  {
    name: "Liam O'Connor",
    role: "Remote Worker",
    text: "Easy to use and very affordable. I recommend it to all my friends.",
    img: "https://randomuser.me/api/portraits/men/23.jpg",
  },
  {
    name: "Fatima Zahra",
    role: "Student",
    text: "Helped me get my visa without any hassle. Thank you!",
    img: "https://randomuser.me/api/portraits/women/50.jpg",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [testimonialIdxLeft, setTestimonialIdxLeft] = useState(0);
  const [testimonialIdxRight, setTestimonialIdxRight] = useState(1);
  const totalTestimonials = testimonials.length;

  // Auto-slide effect for testimonials
  // Auto-slide only the right testimonial
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIdxRight((prev) => (prev + 1) % totalTestimonials);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [totalTestimonials]);

  // Navigation functions for left testimonial
  const handleLeftPrev = () => {
    setTestimonialIdxLeft((prev) => (prev - 1 + totalTestimonials) % totalTestimonials);
  };

  const handleLeftNext = () => {
    setTestimonialIdxLeft((prev) => (prev + 1) % totalTestimonials);
  };

  // Helper function to handle Book Now navigation
  const handleBookNow = () => {
    if (isAuthenticated) {
      navigate("/userform");
    } else {
      navigate("/register");
    }
  };

  return (
    <div className="min-h-screen bg-[#E7E9FF] font-jakarta overflow-x-hidden px-4 md:px-16 py-4 md:py-16">
      {/* Header */}
      <Header handleBookNow={handleBookNow} />

      {/* Hero Section */}
      <section className="container mx-auto px-4 md:px-12 py-4 md:py-8">
        <div className="w-full">
          <div className="bg-white/60 backdrop-blur-md rounded-[24px] p-8 md:p-16 shadow-xl border border-[#E7E9FF] w-full flex flex-col-reverse sm:flex-col-reverse md:flex-col-reverse lg:flex-row items-center gap-8">
            {/* Content on the left (show first on mobile and up to lg) */}
            <div className="flex-1 w-full order-2 lg:order-1">
              <h1 className="text-[2.2rem] md:text-[2.8rem] font-extrabold text-[#3839C9] mb-4 md:mb-6 leading-tight tracking-tight">
                Get a verified Flight reservation
              </h1>
              <p className="text-lg md:text-2xl font-medium text-[#637996] mb-6 md:mb-10">
                the easiest way to get verified flight reservations
              </p>

              {/* CTA Button */}
              <button
                className="flex items-center gap-3 md:gap-4 bg-[#3839C9] text-white px-6 md:px-10 py-3 md:py-4 rounded-xl font-semibold text-lg md:text-xl hover:bg-blue-700 transition-colors shadow-lg"
                onClick={handleBookNow}
              >
                <Navigation className="w-5 h-5 md:w-6 md:h-6" />
                Book Now
              </button>

              <p className="text-xs md:text-sm font-bold text-[#637996] mt-4 md:mt-6">
                Instant & secure Booking from Just $15
              </p>
            </div>
            {/* Image on the right (show after content on mobile and up to lg) */}
            <div className="flex-1 w-full flex justify-center items-end order-1 lg:order-2">
              <img
                src="/hero.png"
                alt="Flight Hero Visual"
                className="w-full max-w-xs md:max-w-sm lg:max-w-md h-auto object-contain rounded-2xl border border-[#E7E9FF] bg-white shadow-xl z-20"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="w-full py-16 md:py-24 gradient-box rounded-2xl md:rounded-3xl">
        <div className="container mx-auto px-2 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0 text-center">
            <div className="flex flex-col items-center justify-center py-2 md:py-0">
              <h3 className="text-lg md:text-2xl font-extrabold font-jakarta text-white mb-1 md:mb-2 tracking-tight">
                100% Verified
              </h3>
              <p className="text-white font-semibold md:font-semibold text-sm md:text-base font-jakarta">
                Flight Reservations
              </p>
            </div>
            <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l md:border-r border-white/30 py-2 md:py-0">
              <h3 className="text-lg md:text-2xl font-extrabold font-jakarta text-white mb-1 md:mb-2 tracking-tight">
                60 Second
              </h3>
              <p className="text-white font-semibold md:font-semibold text-sm md:text-base text-center font-jakarta">
                Ticket Delivery
              </p>
            </div>
            <div className="flex flex-col items-center justify-center py-2 md:py-0">
              <h3 className="text-lg md:text-2xl font-extrabold font-jakarta text-white mb-1 md:mb-2 tracking-tight">
                24/7 Support
              </h3>
              <p className="text-white font-semibold md:font-semibold text-sm md:text-base font-jakarta">
                From Humans
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Flight Reservations Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#191A78] mb-2 md:mb-4 tracking-tight font-jakarta">
            Flight reservations
          </h2>
          <p className="text-lg md:text-2xl text-[#8A8A8F] mb-8 md:mb-16 font-light font-jakarta">
            That are fast, easy & verifiable
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Fast Reservation */}
            <div className="relative flex flex-col justify-center h-52 sm:h-52 md:h-56">
              <div className="gradient-box rounded-2xl p-6 md:p-8 w-full h-full flex flex-row items-center shadow-lg overflow-hidden">
                <div className="bg-transparent rounded-full w-32 h-32 md:w-56 md:h-56 flex items-center justify-center mr-4 md:mr-6 shrink-0">
                  <img
                    src="/onboard/fast.png"
                    alt="Fast Reservation Icon"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h3 className="text-xl md:text-3xl font-extrabold text-white mb-2 font-jakarta ">
                    Fast Reservation
                  </h3>
                  <p className="text-white text-sm md:text-lg font-semibold font-jakarta break-words">
                    Arrives instantly via email. No delay or stress (cue sigh of
                    relief!).
                  </p>
                </div>
              </div>
            </div>
            {/* Secure & Easy */}
            <div className="relative flex flex-col justify-center h-52 sm:h-52 md:h-56">
              <div className="gradient-box rounded-2xl p-6 md:p-8 w-full h-full flex flex-row items-center shadow-lg overflow-hidden">
                <div className="flex items-center justify-center mr-4 md:mr-6 shrink-0">
                  <img
                    src="/onboard/secure.png"
                    alt="Secure Icon"
                    className="w-32 h-32 md:w-56 md:h-56 object-contain"
                    style={{ background: "none" }}
                  />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h3 className="text-xl md:text-3xl font-extrabold text-white mb-2 font-jakarta ">
                    Secure & Easy
                  </h3>
                  <p className="text-white text-sm md:text-lg font-semibold font-jakarta break-words">
                    Arrives instantly via email. No delay or stress (cue sigh of
                    relief!).
                  </p>
                </div>
              </div>
            </div>
            {/* Verifiable */}
            <div className="relative flex flex-col justify-center h-52 sm:h-52 md:h-56">
              <div className="gradient-box rounded-2xl p-6 md:p-8 w-full h-full flex flex-row items-center shadow-lg overflow-hidden">
                <div className="flex items-center justify-center mr-4 md:mr-6 shrink-0">
                  <img
                    src="/onboard/verifiable.png"
                    alt="Verified Icon"
                    className="w-32 h-32 md:w-56 md:h-56 object-contain"
                    style={{ background: "none" }}
                  />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h3 className="text-xl md:text-3xl font-extrabold text-white mb-2 font-jakarta ">
                    Verifiable
                  </h3>
                  <p className="text-white text-sm md:text-lg font-semibold font-jakarta break-words">
                    Arrives instantly via email. No delay or stress (cue sigh of
                    relief!).
                  </p>
                </div>
              </div>
            </div>
            {/* Save Money */}
            <div className="relative flex flex-col justify-center h-52 sm:h-52 md:h-56">
              <div className="gradient-box-pink rounded-2xl p-6 md:p-8 w-full h-full flex flex-row items-center shadow-lg overflow-hidden">
                <div className="flex items-center justify-center mr-4 md:mr-6 shrink-0">
                  <img
                    src="/onboard/save.png"
                    alt="Wallet Icon"
                    className="w-32 h-32 md:w-56 md:h-56 object-contain"
                    style={{ background: "none" }}
                  />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h3 className="text-xl md:text-3xl font-extrabold text-white mb-2 font-jakarta ">
                    Save Money
                  </h3>
                  <p className="text-white text-sm md:text-lg font-semibold font-jakarta break-words">
                    Arrives instantly via email. No delay or stress (cue sigh of
                    relief!).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <button
            className="flex items-center gap-2 md:gap-4 bg-[#3839C9] text-white px-6 md:px-10 py-3 md:py-4 rounded-xl font-semibold text-lg md:text-xl mx-auto hover:bg-blue-700 transition-colors shadow-lg"
            onClick={handleBookNow}
          >
            <Navigation className="w-5 h-5 md:w-6 md:h-6" />
            Book Now
          </button>
          <p className="text-xs md:text-sm font-bold text-[#637996] mt-2 md:mt-4">
            instant & secure Booking from Just $15
          </p>
        </div>
      </section>

      {/* Trusted Section */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#191971] mb-4 md:mb-8 tracking-tight">
              Trusted by thousands
            </h2>
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/ff24681c313a3e4db5ec55bdd0ab20d507866bf0?width=276"
              alt="Trustpilot"
              className="w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 mx-auto object-contain"
              loading="lazy"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 md:space-y-8">
              <div className="text-center lg:text-left">
                <p className="text-[#A2A2A2] text-base md:text-lg mb-2 md:mb-4 font-semibold">
                  Testimonials
                </p>
                <h3 className="text-2xl md:text-4xl font-extrabold text-[#20242A] mb-4 md:mb-8 tracking-tight">
                  What They say About our Services
                </h3>
                <blockquote className="text-base md:text-xl font-semibold text-[#20242A] mb-4 md:mb-8 leading-relaxed">
                  "{testimonials[testimonialIdxLeft].text}"
                </blockquote>

                <div className="flex items-center gap-2 md:gap-4 justify-center lg:justify-start">
                  <div className="w-10 h-10 md:w-16 md:h-16 bg-[#9BF1D5] rounded-full flex items-center justify-center overflow-hidden">
                    <img
                      src={testimonials[testimonialIdxLeft].img}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#20242A] text-sm md:text-base">
                      {testimonials[testimonialIdxLeft].name}
                    </h4>
                    <p className="text-[#A2A2A2] text-xs md:text-sm">
                      {testimonials[testimonialIdxLeft].role}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation buttons and indicators */}
              <div className="flex items-center justify-center lg:justify-start gap-4 mt-4">
                <button
                  onClick={handleLeftPrev}
                  className="p-2 rounded-full bg-[#3839C9] text-white hover:bg-blue-700 transition-colors"
                  aria-label="Previous testimonial"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="flex gap-1">
                  {testimonials.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === testimonialIdxLeft ? "bg-[#878EFF]" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleLeftNext}
                  className="p-2 rounded-full bg-[#3839C9] text-white hover:bg-blue-700 transition-colors"
                  aria-label="Next testimonial"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Card - Independent Testimonial */}
            <div className="grid grid-cols-1 gap-8 md:gap-12 items-center">
              <div className="space-y-6 md:space-y-8">
                <div className="text-center lg:text-left bg-white/90 rounded-2xl shadow-lg p-8 md:p-12">
                  <blockquote className="text-base md:text-xl font-semibold text-[#20242A] mb-4 md:mb-8 leading-relaxed">
                    "{testimonials[testimonialIdxRight].text}"
                  </blockquote>
                  <div className="flex items-center gap-2 md:gap-4 justify-center lg:justify-start">
                    <div className="w-10 h-10 md:w-16 md:h-16 bg-[#9BF1D5] rounded-full flex items-center justify-center overflow-hidden">
                      <img
                        src={testimonials[testimonialIdxRight].img}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#20242A] text-sm md:text-base">
                        {testimonials[testimonialIdxRight].name}
                      </h4>
                      <p className="text-[#A2A2A2] text-xs md:text-sm">
                        {testimonials[testimonialIdxRight].role}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 justify-center lg:justify-start mt-4">
                    {testimonials.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === testimonialIdxRight ? "bg-[#878EFF]" : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Perfect For Section */}
      <section className="py-14 md:py-20 bg-gradient-to-r from-blue-100/40 to-purple-100/40">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h2 className="text-2xl md:text-5xl font-extrabold text-[#3839C9] mb-2 md:mb-4 tracking-tight">
            Onboardticket is perfect for...
          </h2>
          <p className="text-lg md:text-2xl font-bold text-[#3839C9] mb-8 md:mb-16">
            Many People including
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Digital Nomads*/}
            <div className="relative flex flex-col justify-center h-52 sm:h-52 md:h-56">
              <div className="gradient-box rounded-2xl p-6 md:p-8 w-full h-full flex flex-row items-center shadow-lg overflow-hidden">
                <div className="bg-transparent rounded-full w-32 h-32 md:w-56 md:h-56 flex items-center justify-center mr-4 md:mr-6 shrink-0">
                  <img
                    src="/onboard/normands.png"
                    alt="Normands Icon"
                    className="w-32 h-32 md:w-56 md:h-56 object-contain"
                  />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h3 className="text-xl md:text-3xl font-extrabold text-white mb-2 font-jakarta ">
                    Digital Nomads
                  </h3>
                  <p className="text-white text-sm md:text-lg font-semibold font-jakarta break-words">
                    Arrives instantly via email. No delay or stress (cue sigh of
                    relief!).
                  </p>
                </div>
              </div>
            </div>
            {/*  Frequent travelers*/}
            <div className="relative flex flex-col justify-center h-52 sm:h-52 md:h-56">
              <div className="gradient-box rounded-2xl p-6 md:p-8 w-full h-full flex flex-row items-center shadow-lg overflow-hidden">
                <div className="bg-transparent rounded-full w-32 h-32 md:w-56 md:h-56 flex items-center justify-center mr-4 md:mr-6 shrink-0">
                  <img
                    src="/onboard/frequent.png"
                    alt="Frequent Icon"
                    className="w-32 h-32 md:w-56 md:h-56 object-contain"
                  />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h3 className="text-xl md:text-3xl font-extrabold text-white mb-2 font-jakarta ">
                    Frequent travelers
                  </h3>
                  <p className="text-white text-sm md:text-lg font-semibold font-jakarta break-words">
                    Arrives instantly via email. No delay or stress (cue sigh of
                    relief!).
                  </p>
                </div>
              </div>
            </div>
            {/* Visa applicants */}
            <div className="relative flex flex-col justify-center h-52 sm:h-52 md:h-56">
              <div className="gradient-box rounded-2xl p-6 md:p-8 w-full h-full flex flex-row items-center shadow-lg overflow-hidden">
                <div className="bg-transparent rounded-full w-32 h-32 md:w-56 md:h-56 flex items-center justify-center mr-4 md:mr-6 shrink-0">
                  <img
                    src="/onboard/visa.png"
                    alt="Visa Icon"
                    className="w-32 h-32 md:w-56 md:h-56 object-contain"
                  />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h3 className="text-xl md:text-3xl font-extrabold text-white mb-2 font-jakarta ">
                    Visa applicants
                  </h3>
                  <p className="text-white text-sm md:text-lg font-semibold font-jakarta break-words">
                    Arrives instantly via email. No delay or stress (cue sigh of
                    relief!).
                  </p>
                </div>
              </div>
            </div>
            {/* Last minute trips */}
            <div className="relative flex flex-col justify-center h-52 sm:h-52 md:h-56">
              <div className="gradient-box-pink rounded-2xl p-6 md:p-8 w-full h-full flex flex-row items-center shadow-lg overflow-hidden">
                <div className="bg-transparent rounded-full w-32 h-32 md:w-56 md:h-56 flex items-center justify-center mr-4 md:mr-6 shrink-0">
                  <img
                    src="/onboard/trip.png"
                    alt="Trip Icon"
                    className="w-32 h-32 md:w-56 md:h-56 object-contain"
                  />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h3 className="text-xl md:text-3xl font-extrabold text-white mb-2 font-jakarta ">
                    Last minute trips
                  </h3>
                  <p className="text-white text-sm md:text-lg font-semibold font-jakarta break-words">
                    Arrives instantly via email. No delay or stress (cue sigh of
                    relief!).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <button
            className="flex items-center gap-2 md:gap-4 bg-[#3839C9] text-white px-6 md:px-10 py-3 md:py-4 rounded-xl font-semibold text-lg md:text-xl mx-auto hover:bg-blue-700 transition-colors shadow-lg"
            onClick={handleBookNow}
          >
            <Navigation className="w-5 h-5 md:w-6 md:h-6" />
            Book Now
          </button>
          <p className="text-xs md:text-sm font-bold text-[#637996] mt-2 md:mt-4">
            instant & secure Booking from Just $15
          </p>
        </div>
      </section>

      {/* flexibility Section */}
      <section className="py-10 sm:py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-2 sm:px-4 md:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#191A78] mb-2 sm:mb-3 md:mb-4 tracking-tight font-jakarta text-left break-words leading-tight">
            More flexibility while securing your visa
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-2xl text-[#8A8A8F] mb-4 sm:mb-6 md:mb-8 lg:mb-16 font-light font-jakarta text-left">
            Most embassies encourage travelers to wait for visa approval before
            purchasing a full priced plane ticket
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-12">
            {/* Card 1 */}
            <div className="relative flex flex-col justify-between h-56 sm:h-64 md:h-72 lg:h-80 rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 w-full shadow-lg text-left overflow-hidden bg-gradient-to-r from-[#e3e3f1] to-[#cacbef]">
              <div className="flex items-center mb-2 sm:mb-3 md:mb-4">
                <img
                  src="/onboard/image.png"
                  alt="British Embassy"
                  className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 object-contain mr-2 sm:mr-3 md:mr-4"
                />
                <h5 className="text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold text-[#191A78] tracking-tight font-jakarta text-left break-words leading-tight">
                  British Embassy
                </h5>
              </div>
              <div className="mb-2 sm:mb-3 md:mb-4 flex-1 flex items-center">
                <p className="text-black text-xs sm:text-sm md:text-sm lg:text-base font-medium break-words leading-snug">
                  Most embassies encourage travelers to wait for visa approval
                  before purchasing a full-priced plane ticket
                </p>
              </div>
              <button className="absolute left-3 sm:left-4 md:left-6 bottom-3 sm:bottom-4 md:bottom-6 font-bold text-[#233789] bg-transparent border-none text-xs sm:text-sm md:text-base">
                See More?
              </button>
            </div>
            {/* Card 2 */}
            <div className="relative flex flex-col justify-between h-56 sm:h-64 md:h-72 lg:h-80 rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 w-full shadow-lg text-left overflow-hidden bg-gradient-to-r from-[#e1d3bb] to-[#cacbef]">
              <div className="flex items-center mb-2 sm:mb-3 md:mb-4">
                <img
                  src="/onboard/spanish.png"
                  alt="Spanish Embassy"
                  className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 object-contain mr-2 sm:mr-3 md:mr-4"
                />
                <h5 className="text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold text-[#191A78] tracking-tight font-jakarta text-left break-words leading-tight">
                  Spanish Embassy
                </h5>
              </div>
              <div className="mb-2 sm:mb-3 md:mb-4 flex-1 flex items-center">
                <p className="text-black text-xs sm:text-sm md:text-sm lg:text-base font-medium break-words leading-snug">
                  Most embassies encourage travelers to wait for visa approval
                  before purchasing a full-priced plane ticket
                </p>
              </div>
              <button className="absolute left-3 sm:left-4 md:left-6 bottom-3 sm:bottom-4 md:bottom-6 font-bold text-[#233789] bg-transparent border-none text-xs sm:text-sm md:text-base">
                Spanish Embassy
              </button>
            </div>
            {/* Card 3 */}
            <div className="relative flex flex-col justify-between h-56 sm:h-64 md:h-72 lg:h-80 rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 w-full shadow-lg text-left overflow-hidden bg-gradient-to-r from-[#dfc3d2] to-[#9796e4]">
              <div className="flex items-center mb-2 sm:mb-3 md:mb-4">
                <img
                  src="/onboard/iceland.png"
                  alt="Iceland Embassy"
                  className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 object-contain mr-2 sm:mr-3 md:mr-4"
                />
                <h5 className="text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold text-[#191A78] tracking-tight font-jakarta text-left break-words leading-tight">
                  Iceland Embassy
                </h5>
              </div>
              <div className="mb-2 sm:mb-3 md:mb-4 flex-1 flex items-center">
                <p className="text-black text-xs sm:text-sm md:text-sm lg:text-base font-medium break-words leading-snug">
                  Most embassies encourage travelers to wait for visa approval
                  before purchasing a full-priced plane ticket
                </p>
              </div>
              <button className="absolute left-3 sm:left-4 md:left-6 bottom-3 sm:bottom-4 md:bottom-6 font-bold text-[#233789] bg-transparent border-none text-xs sm:text-sm md:text-base">
                Iceland Embassy
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <button
            className="flex items-center gap-2 md:gap-4 bg-[#3839C9] text-white px-6 md:px-10 py-3 md:py-4 rounded-xl font-semibold text-lg md:text-xl mx-auto hover:bg-blue-700 transition-colors shadow-lg"
            onClick={handleBookNow}
          >
            <Navigation className="w-5 h-5 md:w-6 md:h-6" />
            Book Now
          </button>
          <p className="text-xs md:text-sm font-bold text-[#637996] mt-2 md:mt-4">
            instant & secure Booking from Just $15
          </p>
        </div>
      </section>

      {/* Reasons Section (responsive cards) */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-3xl text-left md:text-5xl font-extrabold text-[#191A78] mb-4 tracking-tight font-jakarta">
            More reasons you'll love travelling with Us
          </h2>
          <p className="text-left text-lg md:text-2xl text-[#3839C9] mb-8 font-medium">
            Discover the added benefits that make every journey smoother, safer,
            and more convenient.
          </p>
          <div className="space-y-8">
            {/* Card 1 */}
            <div
              className="w-full flex flex-col sm:flex-row items-start sm:items-center rounded-2xl p-6 md:p-8 shadow-md gap-4 sm:gap-0"
              style={{
                background:
                  "linear-gradient(90deg, rgb(197,230,222) 0%, rgb(205,206,242) 100%)",
              }}
            >
              <img
                src="/onboard/cheap.png"
                alt="Cheaper"
                className="w-20 h-20 md:w-24 md:h-24 object-contain mb-2 sm:mb-0 sm:mr-6 bg-transparent"
              />
              <h3 className="text-lg md:text-2xl font-extrabold text-[#191A78] min-w-[140px] md:min-w-[180px] mr-0 sm:mr-6 mb-2 sm:mb-0 text-left flex items-center">
                Cheaper than a full <br className="hidden sm:block" /> priced
                ticket
              </h3>
              <div className="hidden sm:block border-l-4 border-black h-14 md:h-16 mx-0 sm:mx-4 self-center"></div>
              <p className="text-black font-medium flex-1 text-left text-sm md:text-base">
                Instead of wasting hundreds on throwaway or temporary flight
                tickets, you can meet your travel requirements starting at just
                $15.
              </p>
            </div>
            {/* Card 2 */}
            <div
              className="w-full flex flex-col sm:flex-row items-start sm:items-center rounded-2xl p-6 md:p-8 shadow-md gap-4 sm:gap-0"
              style={{
                background:
                  "linear-gradient(90deg, rgb(227,223,214) 0%, rgb(205,206,242) 100%)",
              }}
            >
              <img
                src="/onboard/real.png"
                alt="Real Reservations"
                className="w-20 h-20 md:w-24 md:h-24 object-contain mb-2 sm:mb-0 sm:mr-6 bg-transparent"
              />
              <h3 className="text-lg md:text-2xl font-extrabold text-[#191A78] min-w-[140px] md:min-w-[180px] mr-0 sm:mr-6 mb-2 sm:mb-0 text-left flex items-center">
                Real <br className="hidden sm:block" /> Reservations
              </h3>
              <div className="hidden sm:block border-l-4 border-black h-14 md:h-16 mx-0 sm:mx-4 self-center"></div>
              <p className="text-black font-medium flex-1 text-left text-sm md:text-base">
                A real reservation with PNR code is made by a registered travel
                agency. Pay via major credit cards or Paypal.
              </p>
            </div>
            {/* Card 3 */}
            <div
              className="w-full flex flex-col sm:flex-row items-start sm:items-center rounded-2xl p-6 md:p-8 shadow-md gap-4 sm:gap-0"
              style={{
                background:
                  "linear-gradient(90deg, rgb(223,227,211) 0%, rgb(205,206,242) 100%)",
              }}
            >
              <img
                src="/onboard/get.png"
                alt="Get your reservation within 60 seconds"
                className="w-20 h-20 md:w-24 md:h-24 object-contain mb-2 sm:mb-0 sm:mr-6 bg-transparent"
              />
              <h3 className="text-lg md:text-2xl font-extrabold text-[#191A78] min-w-[140px] md:min-w-[180px] mr-0 sm:mr-6 mb-2 sm:mb-0 text-left flex items-center">
                Get your reservation <br className="hidden sm:block" /> within
                60 seconds
              </h3>
              <div className="hidden sm:block border-l-4 border-black h-14 md:h-16 mx-0 sm:mx-4 self-center"></div>
              <p className="text-black font-medium flex-1 text-left text-sm md:text-base">
                We deliver your ticket within minutes. We are the best Onboard
                tickets. Flexible, fast, and stress-free.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Airlines Section */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left: Heading and Description */}
            <div className="flex flex-col justify-between h-full">
              <h2
                className="text-3xl text-left text-[#191A78] md:text-5xl font-extrabold font-jakarta mb-4 md:mb-8 leading-tight tracking-tight"
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 800,
                }}
              >
                OnboardTicket
                <br />
                works with 100+ airlines
              </h2>
              <p className="text-[#3839C9] text-lg md:text-2xl font-medium mb-6 md:mb-10">
                Book with confidence. We partner with major airlines to provide
                authentic, verifiable reservations for your travel needs.
              </p>
              <div className="flex gap-2 md:gap-4 mt-auto">
                <button
                  className="border-2 border-[#5225B8] bg-transparent text-[#233789] px-6 md:px-8 py-2 md:py-3 rounded-xl font-bold text-base md:text-lg hover:bg-purple-50 transition-colors shadow-none"
                  onClick={() => navigate("/ticket-sample")}
                >
                  See sample ticket
                </button>
                <button
                  className="flex items-center gap-2 md:gap-4 bg-[#3839C9] text-white px-6 md:px-8 py-2 md:py-3 rounded-xl font-semibold text-base md:text-lg hover:bg-blue-700 transition-colors"
                  onClick={handleBookNow}
                >
                  <Navigation className="w-4 h-4 md:w-5 md:h-5" />
                  Book Now
                </button>
              </div>
            </div>
            {/* Right: 2x2 grid of airline images */}
            <div className="grid grid-cols-2 grid-rows-2 gap-4 md:gap-8">
              <img
                src="/onboard/Lufthansa.png"
                alt="Lufthansa"
                className="w-full h-auto max-w-[180px] md:max-w-[220px] mx-auto object-contain"
                loading="lazy"
              />
              <img
                src="/onboard/alaska.png"
                alt="Alaska"
                className="w-full h-auto max-w-[180px] md:max-w-[220px] mx-auto object-contain"
                loading="lazy"
              />
              <img
                src="/onboard/klm.png"
                alt="KLM"
                className="w-full h-auto max-w-[180px] md:max-w-[220px] mx-auto object-contain"
                loading="lazy"
              />
              <img
                src="/onboard/emirate.png"
                alt="Emirates"
                className="w-full h-auto max-w-[180px] md:max-w-[220px] mx-auto object-contain"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

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
            <FaqCard
              faqs={[
                {
                  q: "About Onboard-ticket ticket ? ",
                  a: "Onboard-ticket tickets are real, verifiable flight reservations provided for visa applications and travel needs.",
                },
                {
                  q: "Why Onboard-ticket ? ",
                  a: "We offer instant, secure, and affordable reservations trusted by embassies and travelers worldwide.",
                },
                {
                  q: "How fast is your service? ",
                  a: "Our service is fast, reliable, and provides support within 30 minutes on average.",
                },
                {
                  q: "Tickets & Reservations ? ",
                  a: "You can book, view, and manage your reservations easily through our platform.",
                },
                {
                  q: "Issues With Your Order ? ",
                  a: "Contact our support team 24/7 for any issues or questions regarding your order.",
                },
              ]}
            />
          </div>

          <div className="flex gap-2 md:gap-4 mt-8 justify-start">
            <button
              className="bg-[#3839C9] text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg hover:bg-blue-700 transition-colors shadow-md"
              onClick={() => navigate("/faq")}
            >
              See More FAQ
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;

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
