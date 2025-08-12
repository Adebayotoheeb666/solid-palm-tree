import { RequestHandler } from "express";
import { AuthResponse, LoginRequest, RegisterRequest } from "@shared/api";
import { supabase } from "../lib/supabaseServer";
import { z } from "zod";

// Create default admin user in Supabase
const createSupabaseAdminUser = async () => {
  try {
    const adminEmail = "onboard@admin.com";
    const adminPassword = "onboardadmin";

    // Check if admin user already exists
    const { data: existingUsers } = await supabase
      .from("users")
      .select("email")
      .eq("email", adminEmail)
      .limit(1);

    if (existingUsers && existingUsers.length > 0) {
      console.log("✅ Supabase admin user already exists:", adminEmail);
      return;
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        user_metadata: {
          first_name: "Admin",
          last_name: "User",
          title: "Mr",
        },
        email_confirm: true, // Auto-confirm the email
      });

    if (authError || !authData.user) {
      console.log(
        "❌ Failed to create Supabase admin user:",
        authError?.message,
      );
      return;
    }

    // Create user profile in public.users table
    const { error: userError } = await supabase.from("users").insert({
      id: authData.user.id,
      email: adminEmail,
      first_name: "Admin",
      last_name: "User",
      title: "Mr",
    });

    if (userError) {
      console.log("❌ Failed to create admin user profile:", userError.message);
      // Cleanup auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return;
    }

    console.log(
      "✅ Supabase admin user created successfully:",
      adminEmail,
      "/ onboardadmin",
    );
  } catch (error) {
    console.log("❌ Error creating Supabase admin user:", error);
  }
};

// Create admin user on startup
createSupabaseAdminUser();

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

// Register new user
export const handleSupabaseRegister: RequestHandler = async (req, res) => {
  try {
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      const response: AuthResponse = {
        success: false,
        message: `Invalid registration data: ${validation.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
      };
      return res.status(400).json(response);
    }

    const { email, password, firstName, lastName, title } = validation.data;

    // Create user in Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          title: title,
        },
        email_confirm: false, // Set to true if you want email confirmation
      });

    if (authError || !authData.user) {
      const response: AuthResponse = {
        success: false,
        message: authError?.message || "Registration failed",
      };
      return res.status(400).json(response);
    }

    // Create user profile in public.users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        title: title,
      })
      .select()
      .single();

    if (userError) {
      // Cleanup auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);

      const response: AuthResponse = {
        success: false,
        message: "Failed to create user profile",
      };
      return res.status(500).json(response);
    }

    // Generate session token
    const { data: sessionData, error: sessionError } =
      await supabase.auth.admin.generateLink({
        type: "signup",
        email: email,
      });

    const response: AuthResponse = {
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        title: userData.title,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
      },
      token: sessionData?.properties?.access_token,
      message: "Registration successful",
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Registration error:", error);
    const response: AuthResponse = {
      success: false,
      message: "Internal server error",
    };
    res.status(500).json(response);
  }
};

// Login user
export const handleSupabaseLogin: RequestHandler = async (req, res) => {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      const response: AuthResponse = {
        success: false,
        message: "Invalid email or password",
      };
      return res.status(400).json(response);
    }

    const { email, password } = validation.data;

    console.log("🔍 Supabase login attempt for email:", email);
    console.log("🔐 Password provided:", password);

    // Authenticate with Supabase
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    console.log("🔑 Supabase auth result:");
    console.log("  Success:", !authError && !!authData.user);
    console.log("  User ID:", authData.user?.id);
    console.log("  Error:", authError?.message);

    if (authError || !authData.user) {
      console.log("❌ Supabase login failed:", authError?.message);
      const response: AuthResponse = {
        success: false,
        message: "Invalid email or password",
      };
      return res.status(401).json(response);
    }

    // Get user profile
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (userError || !userData) {
      const response: AuthResponse = {
        success: false,
        message: "User profile not found",
      };
      return res.status(404).json(response);
    }

    const response: AuthResponse = {
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        title: userData.title,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
      },
      token: authData.session?.access_token,
      message: "Login successful",
    };

    res.json(response);
  } catch (error) {
    console.error("Login error:", error);
    const response: AuthResponse = {
      success: false,
      message: "Internal server error",
    };
    res.status(500).json(response);
  }
};

// Validate token
export const handleSupabaseValidateToken: RequestHandler = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    // Verify token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    // Get user profile
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      return res
        .status(404)
        .json({ success: false, message: "User profile not found" });
    }

    const response: AuthResponse = {
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        title: userData.title,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Token validation error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Supabase middleware for authenticated routes
export const supabaseAuthMiddleware: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    // Verify token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" });
    }

    // Get user profile and attach to request
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      return res
        .status(404)
        .json({ success: false, message: "User profile not found" });
    }

    // Attach user to request object
    (req as any).user = {
      id: userData.id,
      email: userData.email,
      firstName: userData.first_name,
      lastName: userData.last_name,
      title: userData.title,
      createdAt: userData.created_at,
      updatedAt: userData.updated_at,
    };

    (req as any).supabaseUser = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ success: false, message: "Authentication error" });
  }
};
