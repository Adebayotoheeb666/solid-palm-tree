import React from 'react';
import { User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const DashboardButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Don't show the button if user is not authenticated or already on dashboard
  if (!isAuthenticated || location.pathname === '/dashboard') {
    return null;
  }

  return (
    <button
      onClick={() => navigate('/dashboard')}
      className="fixed bottom-6 right-6 z-40 bg-[#3839C9] hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-2 group"
      aria-label="Go to Dashboard"
    >
      <User className="w-5 h-5" />
      <span className="hidden group-hover:inline-block whitespace-nowrap text-sm font-medium">
        Dashboard
      </span>
    </button>
  );
};

export default DashboardButton;
