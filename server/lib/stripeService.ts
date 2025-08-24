import Stripe from "stripe";

// Initialize Stripe only if API key is available
let stripe: Stripe | null = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-07-30.basil",
  });
}

export interface StripePaymentIntentData {
  amount: number;
  currency: string;
  bookingId: string;
  customerEmail: string;
  description: string;
}

export interface StripePaymentMethodData {
  paymentMethodId: string;
  paymentIntentId: string;
}

export class StripeService {
  /**
   * Check if Stripe is available
   */
  private static isStripeAvailable(): boolean {
    return stripe !== null;
  }

  /**
   * Create a Payment Intent for the booking
   */
  static async createPaymentIntent(
    data: StripePaymentIntentData,
  ): Promise<Stripe.PaymentIntent> {
    if (!this.isStripeAvailable()) {
      throw new Error(
        "Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.",
      );
    }

    try {
      const paymentIntent = await stripe!.paymentIntents.create({
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency.toLowerCase(),
        metadata: {
          bookingId: data.bookingId,
          customerEmail: data.customerEmail,
        },
        description: data.description,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent;
    } catch (error) {
      console.error("Stripe Payment Intent creation failed:", error);
      throw error;
    }
  }

  /**
   * Confirm a Payment Intent
   */
  static async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId?: string,
  ): Promise<Stripe.PaymentIntent> {
    if (!this.isStripeAvailable()) {
      throw new Error(
        "Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.",
      );
    }

    try {
      const confirmData: Stripe.PaymentIntentConfirmParams = {
        return_url: `${process.env.CLIENT_URL || "http://localhost:8080"}/payment/success`,
      };

      if (paymentMethodId) {
        confirmData.payment_method = paymentMethodId;
      }

      const paymentIntent = await stripe!.paymentIntents.confirm(
        paymentIntentId,
        confirmData,
      );

      return paymentIntent;
    } catch (error) {
      console.error("Stripe Payment Intent confirmation failed:", error);
      throw error;
    }
  }

  /**
   * Retrieve a Payment Intent
   */
  static async retrievePaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    if (!this.isStripeAvailable()) {
      throw new Error(
        "Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.",
      );
    }

    try {
      return await stripe!.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      console.error("Stripe Payment Intent retrieval failed:", error);
      throw error;
    }
  }

  /**
   * Create a Customer
   */
  static async createCustomer(
    email: string,
    name?: string,
  ): Promise<Stripe.Customer> {
    if (!this.isStripeAvailable()) {
      throw new Error(
        "Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.",
      );
    }

    try {
      return await stripe!.customers.create({
        email,
        name,
      });
    } catch (error) {
      console.error("Stripe Customer creation failed:", error);
      throw error;
    }
  }

  /**
   * Refund a Payment Intent
   */
  static async refundPayment(
    paymentIntentId: string,
    amount?: number,
  ): Promise<Stripe.Refund> {
    if (!this.isStripeAvailable()) {
      throw new Error(
        "Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.",
      );
    }

    try {
      const refundData: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to cents
      }

      return await stripe!.refunds.create(refundData);
    } catch (error) {
      console.error("Stripe refund failed:", error);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  static verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string,
  ): Stripe.Event {
    if (!this.isStripeAvailable()) {
      throw new Error(
        "Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.",
      );
    }

    try {
      return stripe!.webhooks.constructEvent(payload, signature, secret);
    } catch (error) {
      console.error("Stripe webhook signature verification failed:", error);
      throw error;
    }
  }

  /**
   * Get Stripe publishable key
   */
  static getPublishableKey(): string {
    return process.env.STRIPE_PUBLISHABLE_KEY || "";
  }

  /**
   * Check if Stripe is configured
   */
  static isConfigured(): boolean {
    return this.isStripeAvailable();
  }
}

export default StripeService;
