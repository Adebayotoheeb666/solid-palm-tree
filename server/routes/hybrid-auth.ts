import { RequestHandler } from "express";
import { AuthResponse, LoginRequest, RegisterRequest } from "@shared/api";
import { z } from "zod";
import { HybridAuthSystem } from "../lib/hybridAuth";

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  title: z.enum(["Mr", "Ms", "Mrs"]),
});

// Register endpoint
export const handleHybridRegister: RequestHandler = async (req, res) => {
  try {
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      const response: AuthResponse = {
        success: false,
        message: "Invalid input data",
      };
      return res.status(400).json(response);
    }

    const result = await HybridAuthSystem.register(validation.data);
    const statusCode = result.success ? 201 : 409;
    res.status(statusCode).json(result);

  } catch (error) {
    console.error("Registration error:", error);
    const response: AuthResponse = {
      success: false,
      message: "Internal server error",
    };
    res.status(500).json(response);
  }
};

// Login endpoint
export const handleHybridLogin: RequestHandler = async (req, res) => {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      const response: AuthResponse = {
        success: false,
        message: "Invalid input data",
      };
      return res.status(400).json(response);
    }

    const result = await HybridAuthSystem.login(validation.data);
    const statusCode = result.success ? 200 : 401;
    res.status(statusCode).json(result);

  } catch (error) {
    console.error("Login error:", error);
    const response: AuthResponse = {
      success: false,
      message: "Internal server error",
    };
    res.status(500).json(response);
  }
};

// Validate token endpoint
export const handleHybridValidateToken: RequestHandler = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      const response: AuthResponse = {
        success: false,
        message: "No token provided",
      };
      return res.status(401).json(response);
    }

    const decoded = HybridAuthSystem.verifyToken(token);
    if (!decoded) {
      const response: AuthResponse = {
        success: false,
        message: "Invalid token",
      };
      return res.status(401).json(response);
    }

    const user = await HybridAuthSystem.findUserById(decoded.userId);
    if (!user) {
      const response: AuthResponse = {
        success: false,
        message: "User not found",
      };
      return res.status(404).json(response);
    }

    const response: AuthResponse = {
      success: true,
      user,
      message: "Token valid",
    };

    res.json(response);
  } catch (error) {
    console.error("Token validation error:", error);
    const response: AuthResponse = {
      success: false,
      message: "Internal server error",
    };
    res.status(500).json(response);
  }
};

// Middleware to authenticate requests
export const hybridAuthMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const decoded = HybridAuthSystem.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const user = await HybridAuthSystem.findUserById(decoded.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Add user to request object
    (req as any).user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
