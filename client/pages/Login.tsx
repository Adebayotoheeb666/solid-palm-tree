import { useState, useEffect } from "react";
import {
  useNavigate,
  Link,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { LoginRequest } from "@shared/api";
import SimpleHeader from "../components/SimpleHeader";
import Footer from "../components/Footer";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAdminRequired, setIsAdminRequired] = useState(false);

  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: "",
  });

  const [showVerifiedMessage, setShowVerifiedMessage] = useState(false);

  // Check if admin access is required and if user is already authenticated
  useEffect(() => {
    const adminRequired = searchParams.get("admin") === "required";
    const verified = searchParams.get("verified") === "true";
    setIsAdminRequired(adminRequired);
    setShowVerifiedMessage(verified);

    // If user is already authenticated, redirect them
    if (isAuthenticated) {
      const redirectTo = location.state?.from || "/dashboard";
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state, searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await login(formData);

      if (response.success) {
        // Redirect to the page they were trying to access, or dashboard
        const redirectTo = location.state?.from || "/dashboard";
        navigate(redirectTo, { replace: true });
      } else {
        setError(response.message || "Login failed. Please try again.");
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
      <SimpleHeader showSignUp={true} />

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-12 py-8 md:py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-white/90 backdrop-blur-md rounded-[24px] p-8 md:p-12 shadow-xl border border-[#E7E9FF]">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#3839C9] mb-4">
                Welcome Back
              </h1>
              <p className="text-lg text-[#637996] mb-6">
                {isAdminRequired
                  ? "Admin access required. Please sign in with admin credentials."
                  : "Sign in to your account to manage your bookings"}
              </p>
            </div>

            {isAdminRequired && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-700 text-sm font-medium">
                  🔒 This page requires administrator privileges. Please sign in
                  with an admin account.
                </p>
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                  <strong>Admin Credentials:</strong><br />
                  Email: onboard@admin.com<br />
                  Password: onboardadmin
                </div>
              </div>
            )}

            {showVerifiedMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm font-medium">
                  ✅ Email verified successfully! You can now sign in to your
                  account.
                </p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
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
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-lg text-[#20242A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3839C9] focus:border-transparent"
                    required
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
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            {/* Forgot Password & Sign Up Links */}
            <div className="mt-8 text-center space-y-4">
              <Link
                to="/forgot-password"
                className="text-[#3839C9] hover:text-blue-700 font-medium"
              >
                Forgot your password?
              </Link>

              <div className="text-[#637996]">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-[#3839C9] hover:text-blue-700 font-semibold"
                >
                  Sign up here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
