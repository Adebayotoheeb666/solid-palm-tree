// Service status checker for all API integrations

export class ServiceStatusChecker {
  static async checkAllServices() {
    const services = {
      supabase: await this.checkSupabase(),
      stripe: await this.checkStripe(),
      sendgrid: await this.checkSendGrid(),
      amadeus: await this.checkAmadeus(),
      paypal: await this.checkPayPal(),
    };

    return {
      services,
      summary: {
        total: Object.keys(services).length,
        working: Object.values(services).filter((s) => s.status === "working")
          .length,
        configured: Object.values(services).filter((s) => s.configured).length,
      },
    };
  }

  private static async checkSupabase() {
    const configured = !!(
      process.env.SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      !process.env.SUPABASE_URL.includes("placeholder") &&
      process.env.SUPABASE_SERVICE_ROLE_KEY !== "placeholder-service-role-key"
    );

    if (!configured) {
      return {
        name: "Supabase Database",
        configured: false,
        status: "not_configured",
        message: "Environment variables not set",
        features: ["Database", "Authentication", "Real-time data"],
      };
    }

    try {
      const { supabase } = await import("./supabaseServer");
      const { data, error, count } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      return {
        name: "Supabase Database",
        configured: true,
        status: error ? "error" : "working",
        message: error
          ? `Connection failed: ${error.message}`
          : "Connected successfully",
        features: ["Database", "Authentication", "Real-time data"],
        details: error ? null : { userCount: count || 0 },
      };
    } catch (error) {
      return {
        name: "Supabase Database",
        configured: true,
        status: "error",
        message: `Connection error: ${error}`,
        features: ["Database", "Authentication", "Real-time data"],
      };
    }
  }

  private static async checkStripe() {
    const configured = !!(
      process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_PUBLISHABLE_KEY &&
      !process.env.STRIPE_SECRET_KEY.includes("placeholder")
    );

    if (!configured) {
      return {
        name: "Stripe Payments",
        configured: false,
        status: "not_configured",
        message: "API keys not set",
        features: ["Credit card payments", "Payment intents", "Webhooks"],
      };
    }

    try {
      // Basic validation of key format
      const secretKey = process.env.STRIPE_SECRET_KEY;
      const isValidFormat = secretKey?.startsWith("sk_");

      if (!isValidFormat) {
        return {
          name: "Stripe Payments",
          configured: true,
          status: "error",
          message: "Invalid API key format",
          features: ["Credit card payments", "Payment intents", "Webhooks"],
        };
      }

      return {
        name: "Stripe Payments",
        configured: true,
        status: "working",
        message: "API keys configured correctly",
        features: ["Credit card payments", "Payment intents", "Webhooks"],
        details: {
          keyType: secretKey.startsWith("sk_test_") ? "test" : "live",
        },
      };
    } catch (error) {
      return {
        name: "Stripe Payments",
        configured: true,
        status: "error",
        message: `Configuration error: ${error}`,
        features: ["Credit card payments", "Payment intents", "Webhooks"],
      };
    }
  }

  private static async checkSendGrid() {
    const configured = !!(
      process.env.SENDGRID_API_KEY &&
      !process.env.SENDGRID_API_KEY.includes("placeholder")
    );

    if (!configured) {
      return {
        name: "SendGrid Email",
        configured: false,
        status: "not_configured",
        message: "API key not set",
        features: [
          "Email notifications",
          "Booking confirmations",
          "Password resets",
        ],
      };
    }

    try {
      const apiKey = process.env.SENDGRID_API_KEY;
      const isValidFormat = apiKey?.startsWith("SG.");

      if (!isValidFormat) {
        return {
          name: "SendGrid Email",
          configured: true,
          status: "error",
          message: 'Invalid API key format (should start with "SG.")',
          features: [
            "Email notifications",
            "Booking confirmations",
            "Password resets",
          ],
        };
      }

      return {
        name: "SendGrid Email",
        configured: true,
        status: "working",
        message: "API key configured correctly",
        features: [
          "Email notifications",
          "Booking confirmations",
          "Password resets",
        ],
      };
    } catch (error) {
      return {
        name: "SendGrid Email",
        configured: true,
        status: "error",
        message: `Configuration error: ${error}`,
        features: [
          "Email notifications",
          "Booking confirmations",
          "Password resets",
        ],
      };
    }
  }

  private static async checkAmadeus() {
    const configured = !!(
      process.env.AMADEUS_API_KEY &&
      process.env.AMADEUS_API_SECRET &&
      !process.env.AMADEUS_API_KEY.includes("placeholder")
    );

    if (!configured) {
      return {
        name: "Amadeus Flight API",
        configured: false,
        status: "not_configured",
        message: "API credentials not set",
        features: ["Flight search", "Airport data", "Flight prices"],
      };
    }

    try {
      return {
        name: "Amadeus Flight API",
        configured: true,
        status: "working",
        message: "API credentials configured",
        features: ["Flight search", "Airport data", "Flight prices"],
        details: {
          environment:
            process.env.NODE_ENV === "production" ? "production" : "test",
        },
      };
    } catch (error) {
      return {
        name: "Amadeus Flight API",
        configured: true,
        status: "error",
        message: `Configuration error: ${error}`,
        features: ["Flight search", "Airport data", "Flight prices"],
      };
    }
  }

  private static async checkPayPal() {
    const configured = !!(
      process.env.PAYPAL_CLIENT_ID &&
      process.env.PAYPAL_CLIENT_SECRET &&
      !process.env.PAYPAL_CLIENT_ID.includes("placeholder")
    );

    if (!configured) {
      return {
        name: "PayPal Payments",
        configured: false,
        status: "not_configured",
        message: "Client credentials not set",
        features: ["PayPal payments", "Express checkout"],
      };
    }

    try {
      return {
        name: "PayPal Payments",
        configured: true,
        status: "working",
        message: "Client credentials configured",
        features: ["PayPal payments", "Express checkout"],
        details: {
          environment: process.env.PAYPAL_ENVIRONMENT || "sandbox",
        },
      };
    } catch (error) {
      return {
        name: "PayPal Payments",
        configured: true,
        status: "error",
        message: `Configuration error: ${error}`,
        features: ["PayPal payments", "Express checkout"],
      };
    }
  }
}
