import React, { useCallback, memo } from "react";
import { User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import MobileNav from "./MobileNav";

interface HeaderProps {
  handleBookNow?: () => void;
}

const Header: React.FC<HeaderProps> = memo(({ handleBookNow }) => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const defaultHandleBookNow = useCallback(() => {
    if (isAuthenticated) {
      navigate("/userform");
    } else {
      navigate("/register");
    }
  }, [isAuthenticated, navigate]);

  const bookNowHandler = handleBookNow || defaultHandleBookNow;

  const handleLogoClick = useCallback(() => navigate("/"), [navigate]);
  const handleContactClick = useCallback(
    () => navigate("/contact"),
    [navigate],
  );
  const handleDashboardClick = useCallback(
    () => navigate("/dashboard"),
    [navigate],
  );
  const handleLoginClick = useCallback(() => navigate("/login"), [navigate]);
  const handleLogoutClick = useCallback(() => {
    logout();
    navigate("/");
  }, [logout, navigate]);

  return (
    <header className="container mx-auto px-4 md:px-12 py-2 md:py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center cursor-pointer"
          onClick={handleLogoClick}
        >
          <img
            src="/onboard/result.png"
            alt="OnboardTicket Logo"
            className="h-14 md:h-24 w-auto max-w-[220px] md:max-w-[320px] object-contain cursor-pointer"
            loading="eager"
            onClick={handleLogoClick}
          />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4 md:gap-8">
          <button
            className="px-8 py-2 text-brand-text-primary font-bold text-base md:text-lg hover:bg-gray-100 rounded-lg transition-colors shadow-none"
            onClick={handleContactClick}
          >
            Get Support
          </button>
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <button
                className="px-8 py-2 bg-[#3839C9] text-white font-bold text-base md:text-lg rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2"
                onClick={handleDashboardClick}
              >
                <User className="w-4 h-4" />
                Dashboard
              </button>
              <button
                className="px-8 py-2 text-brand-text-primary font-bold text-base md:text-lg hover:bg-gray-100 rounded-lg transition-colors shadow-none flex items-center gap-2"
                onClick={handleLogoutClick}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button
                className="px-8 py-2 text-brand-text-primary font-bold text-base md:text-lg hover:bg-gray-100 rounded-lg transition-colors shadow-none"
                onClick={handleLoginClick}
              >
                Sign In
              </button>
              <button
                className="px-8 py-2 bg-white text-brand-text-primary font-bold text-base md:text-lg rounded-lg hover:bg-gray-50 transition-colors shadow-md"
                onClick={bookNowHandler}
              >
                Book now
              </button>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <MobileNav handleBookNow={bookNowHandler} />
      </div>
    </header>
  );
});

Header.displayName = "Header";

export default Header;
