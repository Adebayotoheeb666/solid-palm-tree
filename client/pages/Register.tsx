import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { RegisterRequest } from "@shared/api";
import SimpleHeader from "../components/SimpleHeader";
import Footer from "../components/Footer";

export default function Register() {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const [formData, setFormData] = useState<RegisterRequest>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    title: "Mr",
  });

  // Redirect authenticated users to userform
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/userform");
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.email ||
      !formData.password ||
      !formData.firstName ||
      !formData.lastName
    ) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await register(formData);

      if (response.success) {
        setSuccess(true);

        // Send verification email
        try {
          const verificationResponse = await fetch(
            "/api/auth/send-verification",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: formData.email,
                userId: response.user?.id,
                userName: formData.firstName,
              }),
            },
          );

          const verificationData = await verificationResponse.json();

          if (verificationData.success) {
            setVerificationSent(true);
          } else {
            console.error(
              "Failed to send verification email:",
              verificationData.message,
            );
            // Still show success but mention email issue
            setError(
              "Account created successfully, but there was an issue sending the verification email. Please contact support.",
            );
          }
        } catch (verificationError) {
          console.error("Verification email error:", verificationError);
          setError(
            "Account created successfully, but there was an issue sending the verification email. Please contact support.",
          );
        }
      } else {
        setError(response.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E7E9FF] font-jakarta">
      {/* Header */}
      <header className="container mx-auto px-4 md:px-12 py-4">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src="/onboard/result.png"
              alt="OnboardTicket Logo"
              className="h-14 md:h-24 w-auto max-w-[220px] md:max-w-[320px] object-contain cursor-pointer"
              loading="eager"
            />
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="px-8 py-2 text-brand-text-primary font-bold text-lg hover:bg-gray-100 rounded-lg transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-12 py-8 md:py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-white/90 backdrop-blur-md rounded-[24px] p-8 md:p-12 shadow-xl border border-[#E7E9FF]">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#3839C9] mb-4">
                Create Account
              </h1>
              <p className="text-lg text-[#637996] mb-6">
                Join thousands of travelers worldwide
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {success && verificationSent && (
              <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-center">
                  <Mail className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-green-800 mb-2">
                    Account Created Successfully!
                  </h3>
                  <p className="text-green-700 text-sm mb-4">
                    We've sent a verification email to{" "}
                    <strong>{formData.email}</strong>. Please check your inbox
                    and click the verification link to activate your account.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors mb-2"
                  >
                    Continue to Sign In
                  </button>
                  <p className="text-xs text-green-600">
                    Didn't receive the email? Check your spam folder or contact
                    support.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title Selection */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-semibold text-[#637996] mb-2"
                >
                  Title
                </label>
                <select
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 border border-gray-300 rounded-lg text-[#20242A] focus:outline-none focus:ring-2 focus:ring-[#3839C9] focus:border-transparent"
                  required
                >
                  <option value="Mr">Mr</option>
                  <option value="Ms">Ms</option>
                  <option value="Mrs">Mrs</option>
                </select>
              </div>

              {/* First Name */}
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-semibold text-[#637996] mb-2"
                >
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#637996]" />
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg text-[#20242A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3839C9] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Last Name */}
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-semibold text-[#637996] mb-2"
                >
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#637996]" />
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg text-[#20242A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3839C9] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-[#637996] mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#637996]" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg text-[#20242A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3839C9] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-[#637996] mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#637996]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create a password (min. 6 characters)"
                    className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-lg text-[#20242A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3839C9] focus:border-transparent"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#637996] hover:text-[#3839C9]"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg ${
                  loading
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                    : "bg-[#3839C9] text-white hover:bg-blue-700"
                }`}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            {/* Sign In Link */}
            <div className="mt-8 text-center">
              <div className="text-[#637996]">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-[#3839C9] hover:text-blue-700 font-semibold"
                >
                  Sign in here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-24 px-4 sm:px-8 lg:px-36">
        <div className="bg-ticket-footer rounded-t-lg p-8 lg:p-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
            {/* Logo and Copyright */}
            <div className="space-y-2 md:space-y-4 flex flex-col items-start">
              <img
                src="/onboard/logos-01.png"
                alt="OnboardTicket Footer Logo"
                className="h-14 md:h-24 w-auto max-w-[220px] md:max-w-[320px] object-contain cursor-pointer"
                loading="lazy"
                onClick={() => navigate("/")}
              />
              <hr className="border-black w-32 sm:w-40 md:w-72" />
              <h4 className="font-semibold text-black text-xs sm:text-sm md:text-base">
                Onboardticket.com
              </h4>
              <p className="text-[10px] sm:text-xs font-semibold text-[#303850] opacity-50">
                © 2025 — Copyright
              </p>
            </div>
            {/* About */}
            <div className="space-y-2 md:space-y-4 flex flex-col items-center justify-center">
              <h4 className="text-base md:text-lg font-bold text-[#0D69F2]">
                About
              </h4>
              <ul className="space-y-1 md:space-y-2 text-xs sm:text-sm font-semibold text-[#A2A2A2]">
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
            <div className="space-y-2 md:space-y-4 flex flex-col items-center justify-center">
              <h4 className="text-base md:text-lg font-bold text-[#0D69F2]">
                Get Help
              </h4>
              <ul className="space-y-1 md:space-y-2 text-xs sm:text-sm font-semibold text-[#A2A2A2]">
                <li
                  className="cursor-pointer hover:text-[#3839C9]"
                  onClick={() => navigate("/faq")}
                >
                  FAQs
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
            <div className="space-y-2 md:space-y-4 flex flex-col items-center justify-center">
              <h4 className="text-base md:text-lg font-bold text-[#0D69F2]">
                Follow US
              </h4>
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
    </div>
  );
}
