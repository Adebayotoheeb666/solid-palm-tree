import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { CreditCard, Lock, AlertCircle, CheckCircle2 } from "lucide-react";

interface StripePaymentFormProps {
  amount: number;
  currency: string;
  bookingId: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export default function StripePaymentForm({
  amount,
  currency,
  bookingId,
  onSuccess,
  onError,
  loading,
  setLoading,
}: StripePaymentFormProps) {
  const [stripe, setStripe] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [stripeLoading, setStripeLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "manual">("card");

  // Manual card form state
  const [cardData, setCardData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    country: "",
  });

  useEffect(() => {
    initializeStripe();
  }, []);

  const initializeStripe = async () => {
    try {
      // Get Stripe publishable key
      const configResponse = await fetch("/api/payments/stripe/config");
      const configData = await configResponse.json();

      if (configData.demoMode) {
        console.warn("Stripe in demo mode - using simulated payment flow");
        // Create payment intent anyway (server returns demo clientSecret)
        try {
          const intentResponse = await fetch("/api/payments/stripe/create-intent", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              amount: Math.round(amount * 100),
              currency: currency.toLowerCase(),
              bookingId: bookingId,
            }),
          });

          const intentData = await intentResponse.json();
          if (intentData.success) {
            setClientSecret(intentData.clientSecret);
            setStripeLoading(false);
            // Keep stripe as null for demo mode
            return;
          } else {
            onError(intentData.message || "Failed to create demo payment intent");
            setLoading(false);
            return;
          }
        } catch (error) {
          onError("Failed to initialize demo payment");
          setLoading(false);
          return;
        }
      }

      if (!configData.publishableKey) {
        onError(
          "Stripe is not configured on this server. Please use PayPal or Credit Card payment options.",
        );
        setLoading(false);
        return;
      }

      // Initialize Stripe
      const stripeInstance = await loadStripe(configData.publishableKey);
      setStripe(stripeInstance);

      // Create payment intent
      const intentResponse = await fetch("/api/payments/stripe/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          bookingId,
          amount,
          currency,
        }),
      });

      const intentData = await intentResponse.json();

      if (intentData.success) {
        setClientSecret(intentData.clientSecret);
      } else {
        throw new Error(
          intentData.message || "Failed to create payment intent",
        );
      }
    } catch (error) {
      console.error("Stripe initialization error:", error);
      onError(
        error instanceof Error ? error.message : "Failed to initialize payment",
      );
    } finally {
      setStripeLoading(false);
    }
  };

  const handleCardPayment = async () => {
    if (!stripe || !clientSecret) {
      onError("Payment system not ready");
      return;
    }

    setLoading(true);

    try {
      // Create payment method from manual card data
      const { error: methodError, paymentMethod: createdMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: {
            number: cardData.cardNumber.replace(/\s/g, ""),
            exp_month: parseInt(cardData.expiryDate.split("/")[0]),
            exp_year: 2000 + parseInt(cardData.expiryDate.split("/")[1]),
            cvc: cardData.cvv,
          },
          billing_details: {
            name: cardData.cardholderName,
            address: {
              country: cardData.country,
            },
          },
        });

      if (methodError) {
        throw new Error(methodError.message || "Invalid card details");
      }

      // Confirm payment
      const { error: confirmError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: createdMethod.id,
          return_url: `${window.location.origin}/payment/success`,
        });

      if (confirmError) {
        throw new Error(confirmError.message || "Payment failed");
      }

      if (paymentIntent.status === "succeeded") {
        onSuccess(paymentIntent.id);
      } else {
        throw new Error("Payment not completed");
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoPayment = async () => {
    if (!clientSecret) {
      onError("Payment system not ready");
      return;
    }

    setLoading(true);

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Extract payment intent ID from demo client secret
      const paymentIntentId = clientSecret.split("_secret")[0];
      onSuccess(paymentIntentId);
    } catch (error) {
      onError("Demo payment failed");
    } finally {
      setLoading(false);
    }
  };

  const validateCard = () => {
    const { cardNumber, expiryDate, cvv, cardholderName, country } = cardData;

    if (!cardNumber || cardNumber.replace(/\s/g, "").length !== 16) {
      return "Please enter a valid 16-digit card number";
    }

    if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
      return "Please enter expiry date in MM/YY format";
    }

    const [month, year] = expiryDate.split("/");
    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
    if (expiry <= new Date()) {
      return "Card has expired";
    }

    if (!cvv || !/^\d{3,4}$/.test(cvv)) {
      return "Please enter a valid CVV";
    }

    if (!cardholderName.trim()) {
      return "Please enter cardholder name";
    }

    if (!country) {
      return "Please select your country";
    }

    return null;
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  if (stripeLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <span className="ml-2">Loading payment form...</span>
      </div>
    );
  }

  const validationError = validateCard();

  return (
    <div className="space-y-6">
      {/* Payment Method Selector */}
      <div className="flex items-center gap-4 mb-6">
        <CreditCard className="w-5 h-5 text-ticket-accent" />
        <span className="font-semibold">Credit or Debit Card</span>
        <Lock className="w-4 h-4 text-green-400" />
      </div>

      {/* Card Form */}
      <div className="space-y-4">
        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium mb-2">Card Number</label>
          <input
            type="text"
            placeholder="1234 5678 9012 3456"
            value={cardData.cardNumber}
            onChange={(e) =>
              setCardData({
                ...cardData,
                cardNumber: formatCardNumber(e.target.value),
              })
            }
            maxLength={19}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-ticket-accent"
          />
        </div>

        {/* Expiry and CVV */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Expiry Date
            </label>
            <input
              type="text"
              placeholder="MM/YY"
              value={cardData.expiryDate}
              onChange={(e) =>
                setCardData({
                  ...cardData,
                  expiryDate: formatExpiryDate(e.target.value),
                })
              }
              maxLength={5}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-ticket-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">CVV</label>
            <input
              type="text"
              placeholder="123"
              value={cardData.cvv}
              onChange={(e) =>
                setCardData({
                  ...cardData,
                  cvv: e.target.value.replace(/\D/g, ""),
                })
              }
              maxLength={4}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-ticket-accent"
            />
          </div>
        </div>

        {/* Cardholder Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Cardholder Name
          </label>
          <input
            type="text"
            placeholder="John Doe"
            value={cardData.cardholderName}
            onChange={(e) =>
              setCardData({
                ...cardData,
                cardholderName: e.target.value,
              })
            }
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-ticket-accent"
          />
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium mb-2">Country</label>
          <select
            value={cardData.country}
            onChange={(e) =>
              setCardData({
                ...cardData,
                country: e.target.value,
              })
            }
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-ticket-accent"
          >
            <option value="">Select Country</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="GB">United Kingdom</option>
            <option value="AU">Australia</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
            <option value="JP">Japan</option>
            <option value="BR">Brazil</option>
            <option value="IN">India</option>
            <option value="MX">Mexico</option>
          </select>
        </div>
      </div>

      {/* Security Notice */}
      <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
        <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-green-400">Secure Payment</p>
          <p className="text-green-300/80">
            Your payment information is encrypted and secure
          </p>
        </div>
      </div>

      {/* Pay Button */}
      <button
        onClick={stripe ? handleCardPayment : handleDemoPayment}
        disabled={loading || (stripe && !!validationError)}
        className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors ${
          loading || (stripe && validationError)
            ? "bg-gray-500 cursor-not-allowed"
            : stripe
              ? "bg-ticket-accent text-black hover:bg-opacity-80"
              : "bg-orange-500 text-white hover:bg-orange-600"
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
            {stripe ? "Processing Payment..." : "Simulating Payment..."}
          </div>
        ) : stripe ? (
          `Pay ${currency} ${amount.toLocaleString()}`
        ) : (
          `Simulate Payment ${currency} ${amount.toLocaleString()}`
        )}
      </button>

      {/* Validation Error - only show for real Stripe payments */}
      {stripe && validationError && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {validationError}
        </div>
      )}

      {/* Demo Mode Notice */}
      {!stripe && clientSecret && (
        <div className="flex items-center gap-2 text-orange-400 text-sm bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
          <AlertCircle className="w-4 h-4" />
          <div>
            <p className="font-medium">Demo Mode</p>
            <p className="text-xs text-orange-300">This is a simulated payment for testing purposes</p>
          </div>
        </div>
      )}
    </div>
  );
}
