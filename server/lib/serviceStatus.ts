
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
        error: Object.values(services).filter((s) => s.status === "error").length,
        not_configured: Object.values(services).filter((s) => s.status === "not_configured").length,
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

      if (error) {
        return {
          name: "Supabase Database",
          configured: true,
          status: "error",
          message: `Database error: ${error.message}`,
          features: ["Database", "Authentication", "Real-time data"],
        };
      }

      return {
        name: "Supabase Database",
        configured: true,
        status: "working",
        message: `Connected successfully. ${count || 0} users in database`,
        features: ["Database", "Authentication", "Real-time data"],
      };
    } catch (error: any) {
      return {
        name: "Supabase Database",
        configured: true,
        status: "error",
        message: `Connection failed: ${error.message}`,
        features: ["Database", "Authentication", "Real-time data"],
      };
    }
  }

  private static async checkStripe() {
    const configured = !!(
      process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_PUBLISHABLE_KEY &&
      !process.env.STRIPE_SECRET_KEY.includes("placeholder") &&
      !process.env.STRIPE_PUBLISHABLE_KEY.includes("placeholder")
    );

    if (!configured) {
      return {
        name: "Stripe Payment Processing",
        configured: false,
        status: "not_configured",
        message: "Stripe API keys not configured",
        features: ["Credit card payments", "Payment intents", "Webhooks"],
      };
    }

    try {
      const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
      const account = await stripe.accounts.retrieve();

      return {
        name: "Stripe Payment Processing",
        configured: true,
        status: "working",
        message: `Connected to account: ${account.display_name || account.id}`,
        features: ["Credit card payments", "Payment intents", "Webhooks"],
        details: {
          accountId: account.id,
          country: account.country,
          currency: account.default_currency,
        },
      };
    } catch (error: any) {
      return {
        name: "Stripe Payment Processing",
        configured: true,
        status: "error",
        message: `Stripe API error: ${error.message}`,
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
        name: "SendGrid Email Service",
        configured: false,
        status: "not_configured",
        message: "SendGrid API key not configured",
        features: ["Transactional emails", "Email verification", "Templates"],
      };
    }

    try {
      const sgMail = require("@sendgrid/mail");
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      // Test API key validity by checking user account
      const response = await sgMail.request({
        method: "GET",
        url: "/v3/user/account",
      });

      return {
        name: "SendGrid Email Service",
        configured: true,
        status: "working",
        message: `Connected successfully. Account type: ${response[1].type}`,
        features: ["Transactional emails", "Email verification", "Templates"],
        details: {
          accountType: response[1].type,
          reputation: response[1].reputation,
        },
      };
    } catch (error: any) {
      return {
        name: "SendGrid Email Service",
        configured: true,
        status: "error",
        message: `SendGrid API error: ${error.message}`,
        features: ["Transactional emails", "Email verification", "Templates"],
      };
    }
  }

  private static async checkAmadeus() {
    const configured = !!(
      process.env.AMADEUS_CLIENT_ID &&
      process.env.AMADEUS_CLIENT_SECRET &&
      !process.env.AMADEUS_CLIENT_ID.includes("placeholder") &&
      !process.env.AMADEUS_CLIENT_SECRET.includes("placeholder")
    );

    if (!configured) {
      return {
        name: "Amadeus Flight Data API",
        configured: false,
        status: "not_configured",
        message: "Amadeus API credentials not configured",
        features: ["Flight search", "Airport data", "Airline information"],
      };
    }

    try {
      const Amadeus = require("amadeus");
      const amadeus = new Amadeus({
        clientId: process.env.AMADEUS_CLIENT_ID,
        clientSecret: process.env.AMADEUS_CLIENT_SECRET,
        hostname: process.env.AMADEUS_HOSTNAME || "production",
      });

      // Test with a simple airport search
      const response = await amadeus.referenceData.airports.get({
        keyword: "NYC",
        max: 1,
      });

      return {
        name: "Amadeus Flight Data API",
        configured: true,
        status: "working",
        message: `API working. Test query returned ${response.data.length} results`,
        features: ["Flight search", "Airport data", "Airline information"],
        details: {
          hostname: process.env.AMADEUS_HOSTNAME || "production",
          testQuery: "NYC airports",
        },
      };
    } catch (error: any) {
      return {
        name: "Amadeus Flight Data API",
        configured: true,
        status: "error",
        message: `Amadeus API error: ${error.message}`,
        features: ["Flight search", "Airport data", "Airline information"],
      };
    }
  }

  private static async checkPayPal() {
    const configured = !!(
      process.env.PAYPAL_CLIENT_ID &&
      process.env.PAYPAL_CLIENT_SECRET &&
      !process.env.PAYPAL_CLIENT_ID.includes("placeholder") &&
      !process.env.PAYPAL_CLIENT_SECRET.includes("placeholder")
    );

    if (!configured) {
      return {
        name: "PayPal Payment Service",
        configured: false,
        status: "not_configured",
        message: "PayPal API credentials not configured",
        features: ["PayPal payments", "Express checkout", "Subscriptions"],
      };
    }

    try {
      // Test PayPal configuration by attempting to get access token
      const auth = Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
      ).toString("base64");

      const environment = process.env.PAYPAL_ENVIRONMENT || "sandbox";
      const baseURL = environment === "production" 
        ? "https://api.paypal.com" 
        : "https://api.sandbox.paypal.com";

      const response = await fetch(`${baseURL}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${auth}`,
        },
        body: "grant_type=client_credentials",
      });

      if (response.ok) {
        const data = await response.json();
        return {
          name: "PayPal Payment Service",
          configured: true,
          status: "working",
          message: `Connected successfully to ${environment} environment`,
          features: ["PayPal payments", "Express checkout", "Subscriptions"],
          details: {
            environment,
            tokenType: data.token_type,
          },
        };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      return {
        name: "PayPal Payment Service",
        configured: true,
        status: "error",
        message: `PayPal API error: ${error.message}`,
        features: ["PayPal payments", "Express checkout", "Subscriptions"],
      };
    }
  }
}
