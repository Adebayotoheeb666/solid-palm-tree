import { RequestHandler } from "express";
import { AuthResponse, LoginRequest, RegisterRequest, User } from "@shared/api";
import { z } from "zod";
import crypto from "crypto";
import { supabase } from "./supabaseServer";

// Hybrid system that tries Supabase first, falls back to in-memory
class HybridAuthSystem {
  private static inMemoryUsers: User[] = [];
  private static userPasswords = new Map<string, string>();
  private static tokenStorage = new Map<string, { userId: string; expiresAt: number }>();
  private static userIdCounter = 1;
  private static isSupabaseAvailable = true;

  // Initialize with default admin user
  static initialize() {
    const adminUser: User = {
      id: "1",
      email: "onboard@admin.com",
      firstName: "Admin",
      lastName: "User",
      title: "Mr",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.inMemoryUsers.push(adminUser);
    this.userPasswords.set(adminUser.id, this.hashPassword("onboardadmin"));
    this.userIdCounter = 2;

    console.log("✅ Hybrid auth system initialized with admin user");
  }

  // Password hashing
  private static hashPassword(password: string): string {
    return crypto
      .createHash("sha256")
      .update(password + "salt")
      .digest("hex");
  }

  private static verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  // Token management
  private static generateToken(userId: string): string {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    this.tokenStorage.set(token, { userId, expiresAt });
    return token;
  }

  static verifyToken(token: string): { userId: string } | null {
    const tokenData = this.tokenStorage.get(token);
    if (!tokenData || tokenData.expiresAt < Date.now()) {
      if (tokenData) this.tokenStorage.delete(token);
      return null;
    }
    return { userId: tokenData.userId };
  }

  // Test Supabase availability
  private static async testSupabaseConnection(): Promise<boolean> {
    if (!this.isSupabaseAvailable) return false;

    try {
      const { error } = await supabase
        .from('users')
        .select('id', { count: 'exact' })
        .limit(1);
      
      const available = !error;
      this.isSupabaseAvailable = available;
      return available;
    } catch (error) {
      this.isSupabaseAvailable = false;
      return false;
    }
  }

  // Register user
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const { email, password, firstName, lastName, title } = userData;

      // Check if Supabase is available
      const supabaseAvailable = await this.testSupabaseConnection();

      if (supabaseAvailable) {
        // Try Supabase first
        try {
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                first_name: firstName,
                last_name: lastName,
                title: title
              }
            }
          });

          if (!authError && authData.user) {
            // Create user profile
            const { error: userError } = await supabase
              .from('users')
              .insert({
                id: authData.user.id,
                email,
                first_name: firstName,
                last_name: lastName,
                title
              });

            if (!userError) {
              const user: User = {
                id: authData.user.id,
                email,
                firstName,
                lastName,
                title,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };

              return {
                success: true,
                user,
                token: authData.session?.access_token || this.generateToken(user.id),
                message: "Registration successful"
              };
            }
          }
        } catch (error) {
          console.log("Supabase registration failed, falling back to in-memory");
        }
      }

      // Fall back to in-memory system
      const existingUser = this.inMemoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return {
          success: false,
          message: "User with this email already exists"
        };
      }

      const newUser: User = {
        id: this.userIdCounter.toString(),
        email,
        firstName,
        lastName,
        title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.inMemoryUsers.push(newUser);
      this.userPasswords.set(newUser.id, this.hashPassword(password));
      this.userIdCounter++;

      const token = this.generateToken(newUser.id);

      return {
        success: true,
        user: newUser,
        token,
        message: "Registration successful (using fallback system)"
      };

    } catch (error) {
      return {
        success: false,
        message: "Registration failed"
      };
    }
  }

  // Login user
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const { email, password } = credentials;

      // Check if Supabase is available
      const supabaseAvailable = await this.testSupabaseConnection();

      if (supabaseAvailable) {
        // Try Supabase first
        try {
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (!authError && authData.user) {
            // Get user profile
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', authData.user.id)
              .single();

            if (!userError && userData) {
              const user: User = {
                id: userData.id,
                email: userData.email,
                firstName: userData.first_name,
                lastName: userData.last_name,
                title: userData.title,
                createdAt: userData.created_at,
                updatedAt: userData.updated_at
              };

              return {
                success: true,
                user,
                token: authData.session?.access_token || this.generateToken(user.id),
                message: "Login successful"
              };
            }
          }
        } catch (error) {
          console.log("Supabase login failed, falling back to in-memory");
        }
      }

      // Fall back to in-memory system
      const user = this.inMemoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return {
          success: false,
          message: "Invalid email or password"
        };
      }

      const hashedPassword = this.userPasswords.get(user.id);
      if (!hashedPassword || !this.verifyPassword(password, hashedPassword)) {
        return {
          success: false,
          message: "Invalid email or password"
        };
      }

      const token = this.generateToken(user.id);

      return {
        success: true,
        user,
        token,
        message: "Login successful (using fallback system)"
      };

    } catch (error) {
      return {
        success: false,
        message: "Login failed"
      };
    }
  }

  // Find user by ID
  static async findUserById(id: string): Promise<User | null> {
    // Check if Supabase is available
    const supabaseAvailable = await this.testSupabaseConnection();

    if (supabaseAvailable) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) {
          return {
            id: data.id,
            email: data.email,
            firstName: data.first_name,
            lastName: data.last_name,
            title: data.title,
            createdAt: data.created_at,
            updatedAt: data.updated_at
          };
        }
      } catch (error) {
        console.log("Supabase user lookup failed, falling back to in-memory");
      }
    }

    // Fall back to in-memory system
    return this.inMemoryUsers.find(u => u.id === id) || null;
  }
}

// Initialize the hybrid system
HybridAuthSystem.initialize();

export { HybridAuthSystem };
