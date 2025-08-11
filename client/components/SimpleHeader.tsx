import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

interface SimpleHeaderProps {
  showSignUp?: boolean;
  showSignIn?: boolean;
}

const SimpleHeader: React.FC<SimpleHeaderProps> = ({
  showSignUp = false,
  showSignIn = false,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const closeMenu = () => setIsMenuOpen(false);

  return (
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

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {showSignUp && (
            <Link
              to="/register"
              className="px-8 py-2 text-brand-text-primary font-bold text-lg hover:bg-gray-100 rounded-lg transition-colors"
            >
              Sign Up
            </Link>
          )}
          {showSignIn && (
            <Link
              to="/login"
              className="px-8 py-2 text-brand-text-primary font-bold text-lg hover:bg-gray-100 rounded-lg transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-brand-text-primary" />
            ) : (
              <Menu className="w-6 h-6 text-brand-text-primary" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <img
              src="/onboard/result.png"
              alt="OnboardTicket Logo"
              className="h-12 w-auto object-contain"
            />
            <button
              onClick={closeMenu}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-brand-text-primary" />
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 p-4 space-y-4">
            <button
              className="w-full text-left px-4 py-3 text-brand-text-primary font-bold text-lg hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => {
                navigate("/");
                closeMenu();
              }}
            >
              Home
            </button>

            {showSignUp && (
              <button
                className="w-full text-left px-4 py-3 text-brand-text-primary font-bold text-lg hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => {
                  navigate("/register");
                  closeMenu();
                }}
              >
                Sign Up
              </button>
            )}

            {showSignIn && (
              <button
                className="w-full text-left px-4 py-3 text-brand-text-primary font-bold text-lg hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => {
                  navigate("/login");
                  closeMenu();
                }}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default SimpleHeader;
