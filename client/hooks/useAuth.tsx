import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, AuthResponse, LoginRequest, RegisterRequest } from "@shared/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  register: (userData: RegisterRequest) => Promise<AuthResponse>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth token on app load
    const token = localStorage.getItem("authToken");
    if (token) {
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      const response = await fetch("/api/auth/validate", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        try {
          const data: AuthResponse = await response.json();
          if (data.success && data.user) {
            setUser(data.user);
          } else {
            localStorage.removeItem("authToken");
          }
        } catch (parseError) {
          console.error(
            "Failed to parse token validation response:",
            parseError,
          );
          localStorage.removeItem("authToken");
        }
      } else {
        localStorage.removeItem("authToken");
      }
    } catch (error) {
      console.error("Token validation failed:", error);
      localStorage.removeItem("authToken");
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        // Try to get error message from response, but handle parsing errors
        try {
          const errorData = await response.json();
          return {
            success: false,
            message: errorData.message || "Login failed. Please try again.",
          };
        } catch (parseError) {
          return {
            success: false,
            message: `Login failed with status ${response.status}`,
          };
        }
      }

      const data: AuthResponse = await response.json();

      if (data.success && data.user && data.token) {
        setUser(data.user);
        localStorage.setItem("authToken", data.token);
      }

      return data;
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        message: "Login failed. Please try again.",
      };
    }
  };

  const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        // Try to get error message from response, but handle parsing errors
        try {
          const errorData = await response.json();
          return {
            success: false,
            message:
              errorData.message || "Registration failed. Please try again.",
          };
        } catch (parseError) {
          return {
            success: false,
            message: `Registration failed with status ${response.status}`,
          };
        }
      }

      const data: AuthResponse = await response.json();

      if (data.success && data.user && data.token) {
        setUser(data.user);
        localStorage.setItem("authToken", data.token);
      }

      return data;
    } catch (error) {
      console.error("Registration failed:", error);
      return {
        success: false,
        message: "Registration failed. Please try again.",
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authToken");
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook for making authenticated API requests
export const useAuthenticatedFetch = () => {
  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("authToken");

    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  };

  return authenticatedFetch;
};
