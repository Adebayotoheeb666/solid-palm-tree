import React, { useState, useCallback, memo } from "react";
import { Menu, X, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface MobileNavProps {
  handleBookNow: () => void;
}

const MobileNav: React.FC<MobileNavProps> = memo(({ handleBookNow }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const closeMenu = useCallback(() => setIsOpen(false), []);

  const handleNavigation = useCallback(
    (path: string) => {
      navigate(path);
      closeMenu();
    },
    [navigate, closeMenu],
  );

  const handleLogout = useCallback(() => {
    logout();
    navigate("/");
    closeMenu();
  }, [logout, navigate, closeMenu]);

  const handleBookNowClick = useCallback(() => {
    handleBookNow();
    closeMenu();
  }, [handleBookNow, closeMenu]);

  const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-brand-text-primary" />
        ) : (
          <Menu className="w-6 h-6 text-brand-text-primary" />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={closeMenu} />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <img
              src="/onboard/logos.png"
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
              onClick={() => handleNavigation("/contact")}
            >
              Get Support
            </button>

            {isAuthenticated ? (
              <>
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 bg-[#3839C9] text-white font-bold text-lg rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => handleNavigation("/dashboard")}
                >
                  <User className="w-5 h-5" />
                  Dashboard
                </button>
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-brand-text-primary font-bold text-lg hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  className="w-full text-left px-4 py-3 text-brand-text-primary font-bold text-lg hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => handleNavigation("/login")}
                >
                  Sign In
                </button>
                <button
                  className="w-full text-left px-4 py-3 bg-white text-brand-text-primary font-bold text-lg rounded-lg hover:bg-gray-50 transition-colors border-2 border-gray-200"
                  onClick={handleBookNowClick}
                >
                  Book now
                </button>
              </>
            )}
          </div>

          {/* User Info (if authenticated) */}
          {isAuthenticated && user && (
            <div className="border-t p-4">
              <div className="text-sm text-gray-600">Logged in as:</div>
              <div className="font-medium text-brand-text-primary truncate">
                {user.email}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

MobileNav.displayName = "MobileNav";

export default MobileNav;
