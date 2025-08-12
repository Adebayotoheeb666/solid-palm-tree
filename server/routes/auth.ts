import { RequestHandler } from "express";
import { AuthResponse, LoginRequest, RegisterRequest, User } from "@shared/api";
import { z } from 'zod';
import crypto from 'crypto';

// Mock database - in production, this would be a real database
const users: User[] = [];
let userIdCounter = 1;

// Helper function to create default admin user
const createDefaultAdmin = () => {
  const adminUser: User = {
    id: '1',
    email: 'onboard@admin.com',
    firstName: 'Admin',
    lastName: 'User',
    title: 'Mr',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  users.push(adminUser);

  // Store admin password
  (global as any).userPasswords = (global as any).userPasswords || {};
  (global as any).userPasswords[adminUser.id] = hashPassword('onboardadmin');

  userIdCounter = 2; // Next user will be ID 2
  console.log('✅ Default admin user created: onboard@admin.com / onboardadmin');
};

// Create default admin on startup
createDefaultAdmin();

// Simple token storage for demo (use proper JWT in production)
const tokenStorage = new Map<string, { userId: string; expiresAt: number }>();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  title: z.enum(['Mr', 'Ms', 'Mrs'])
});

// Helper function to generate simple token
const generateToken = (userId: string): string => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
  tokenStorage.set(token, { userId, expiresAt });
  return token;
};

// Helper function to verify token
export const verifyToken = (token: string): { userId: string } | null => {
  const tokenData = tokenStorage.get(token);
  if (!tokenData || tokenData.expiresAt < Date.now()) {
    if (tokenData) tokenStorage.delete(token);
    return null;
  }
  return { userId: tokenData.userId };
};

// Simple password hashing for demo (use bcrypt in production)
const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password + 'salt').digest('hex');
};

const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

// Helper function to find user by email
const findUserByEmail = (email: string): User | undefined => {
  return users.find(user => user.email.toLowerCase() === email.toLowerCase());
};

// Helper function to find user by ID
export const findUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

// Register endpoint
export const handleRegister: RequestHandler = async (req, res) => {
  try {
    const validation = registerSchema.safeParse(req.body);
    
    if (!validation.success) {
      const response: AuthResponse = {
        success: false,
        message: 'Invalid input data'
      };
      return res.status(400).json(response);
    }

    const { email, password, firstName, lastName, title } = validation.data;

    // Check if user already exists
    if (findUserByEmail(email)) {
      const response: AuthResponse = {
        success: false,
        message: 'User with this email already exists'
      };
      return res.status(409).json(response);
    }

    // Hash password
    const hashedPassword = hashPassword(password);

    // Create new user
    const newUser: User = {
      id: userIdCounter.toString(),
      email,
      firstName,
      lastName,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store user with hashed password (in production, use proper database)
    users.push(newUser);
    // Store password separately (in production, this would be in the database)
    (global as any).userPasswords = (global as any).userPasswords || {};
    (global as any).userPasswords[newUser.id] = hashedPassword;
    
    userIdCounter++;

    // Generate token
    const token = generateToken(newUser.id);

    const response: AuthResponse = {
      success: true,
      user: newUser,
      token,
      message: 'Registration successful'
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Registration error:', error);
    const response: AuthResponse = {
      success: false,
      message: 'Internal server error'
    };
    res.status(500).json(response);
  }
};

// Login endpoint
export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    
    if (!validation.success) {
      const response: AuthResponse = {
        success: false,
        message: 'Invalid input data'
      };
      return res.status(400).json(response);
    }

    const { email, password } = validation.data;

    // Find user
    const user = findUserByEmail(email);
    if (!user) {
      const response: AuthResponse = {
        success: false,
        message: 'Invalid email or password'
      };
      return res.status(401).json(response);
    }

    // Check password
    const userPasswords = (global as any).userPasswords || {};
    const hashedPassword = userPasswords[user.id];

    if (!hashedPassword || !verifyPassword(password, hashedPassword)) {
      const response: AuthResponse = {
        success: false,
        message: 'Invalid email or password'
      };
      return res.status(401).json(response);
    }

    // Generate token
    const token = generateToken(user.id);

    const response: AuthResponse = {
      success: true,
      user,
      token,
      message: 'Login successful'
    };

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    const response: AuthResponse = {
      success: false,
      message: 'Internal server error'
    };
    res.status(500).json(response);
  }
};

// Validate token endpoint
export const handleValidateToken: RequestHandler = (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      const response: AuthResponse = {
        success: false,
        message: 'No token provided'
      };
      return res.status(401).json(response);
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      const response: AuthResponse = {
        success: false,
        message: 'Invalid token'
      };
      return res.status(401).json(response);
    }

    const user = findUserById(decoded.userId);
    if (!user) {
      const response: AuthResponse = {
        success: false,
        message: 'User not found'
      };
      return res.status(404).json(response);
    }

    const response: AuthResponse = {
      success: true,
      user,
      message: 'Token valid'
    };

    res.json(response);
  } catch (error) {
    console.error('Token validation error:', error);
    const response: AuthResponse = {
      success: false,
      message: 'Internal server error'
    };
    res.status(500).json(response);
  }
};

// Middleware to authenticate requests
export const authenticateUser: RequestHandler = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const user = findUserById(decoded.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Add user to request object
    (req as any).user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
