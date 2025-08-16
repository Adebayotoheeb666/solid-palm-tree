import { RequestHandler } from "express";
import { PaymentRequest, PaymentResponse } from "@shared/api";
import { supabaseServerHelpers } from "../lib/supabaseServer";
import { z } from 'zod';
import StripeService from '../lib/stripeService';

// Payment validation schema
const paymentSchema = z.object({
  bookingId: z.string(),
  paymentMethod: z.enum(['card', 'paypal', 'stripe']),
  paymentDetails: z.object({
    cardNumber: z.string().optional(),
    expiryDate: z.string().optional(),
    cvv: z.string().optional(),
    cardholderName: z.string().optional(),
    country: z.string().optional(),
    paypalOrderId: z.string().optional(),
    paypalPayerId: z.string().optional(),
    stripePaymentIntentId: z.string().optional(),
    stripePaymentMethodId: z.string().optional()
  })
});

// Generate transaction ID
const generateTransactionId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `txn_${timestamp}_${random}`;
};

// PayPal configuration
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'AeA1QIZXlsOl6reI7QjVAXt3CxbgZMOKe-6xB6RHWyYPUtE9JYOk0-l-uSQnf8BL2S1IZKqHNk1TCO5T';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || 'demo-client-secret';
const PAYPAL_SIGNATURE = process.env.PAYPAL_SIGNATURE || '';
const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// Get PayPal access token
const getPayPalAccessToken = async (): Promise<string> => {
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

    console.log('Getting PayPal access token...');
    const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PayPal token request failed:', response.status, errorText);
      throw new Error(`Failed to get PayPal access token: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('PayPal access token obtained successfully');
    return data.access_token;
  } catch (error) {
    console.error('Error getting PayPal access token:', error);
    throw error;
  }
};

// Verify PayPal payment
const verifyPayPalPayment = async (orderId: string, payerId: string): Promise<boolean> => {
  try {
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return false;
    }

    const order = await response.json();

    // Check if order is approved and payer matches
    return order.status === 'APPROVED' && order.payer?.payer_id === payerId;
  } catch (error) {
    console.error('PayPal verification error:', error);
    return false;
  }
};

// Simulate card validation
const validateCard = (cardNumber: string, expiryDate: string, cvv: string): boolean => {
  // Basic validation - in production, use proper payment processor
  if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) return false;
  if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) return false;
  if (!cvv || !/^\d{3,4}$/.test(cvv)) return false;
  
  // Check if card is expired
  const [month, year] = expiryDate.split('/');
  const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
  if (expiry <= new Date()) return false;
  
  return true;
};

// Process payment using Supabase
export const handleProcessPayment: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const validation = paymentSchema.safeParse(req.body);
    
    if (!validation.success) {
      const response: PaymentResponse = {
        success: false,
        message: 'Invalid payment data'
      };
      return res.status(400).json(response);
    }

    const { bookingId, paymentMethod, paymentDetails } = validation.data;

    try {
      // Find booking in Supabase
      const { data: booking, error: bookingError } = await supabaseServerHelpers.getBookingById(bookingId);
      
      if (bookingError || !booking) {
        const response: PaymentResponse = {
          success: false,
          message: 'Booking not found'
        };
        return res.status(404).json(response);
      }

      // Check if booking belongs to user
      if (booking.user_id !== user.id) {
        const response: PaymentResponse = {
          success: false,
          message: 'Booking not found'
        };
        return res.status(404).json(response);
      }

      if (booking.status !== 'pending') {
        const response: PaymentResponse = {
          success: false,
          message: 'Booking is not eligible for payment'
        };
        return res.status(400).json(response);
      }

      // Validate payment method specific details
      if (paymentMethod === 'card') {
        const { cardNumber, expiryDate, cvv, cardholderName, country } = paymentDetails;

        if (!cardNumber || !expiryDate || !cvv || !cardholderName || !country) {
          const response: PaymentResponse = {
            success: false,
            message: 'Missing required card details'
          };
          return res.status(400).json(response);
        }

        if (!validateCard(cardNumber, expiryDate, cvv)) {
          const response: PaymentResponse = {
            success: false,
            message: 'Invalid card details'
          };
          return res.status(400).json(response);
        }
      } else if (paymentMethod === 'stripe') {
        const { stripePaymentIntentId, stripePaymentMethodId } = paymentDetails;

        if (!stripePaymentIntentId) {
          const response: PaymentResponse = {
            success: false,
            message: 'Missing Stripe payment intent ID'
          };
          return res.status(400).json(response);
        }

        // Verify Stripe payment intent
        try {
          const paymentIntent = await StripeService.retrievePaymentIntent(stripePaymentIntentId);

          if (paymentIntent.status !== 'succeeded' && paymentIntent.status !== 'requires_action') {
            const response: PaymentResponse = {
              success: false,
              message: 'Stripe payment not completed'
            };
            return res.status(400).json(response);
          }

          // If payment requires confirmation
          if (paymentIntent.status === 'requires_confirmation') {
            await StripeService.confirmPaymentIntent(stripePaymentIntentId, stripePaymentMethodId);
          }
        } catch (error) {
          console.error('Stripe payment verification failed:', error);
          const response: PaymentResponse = {
            success: false,
            message: 'Stripe payment verification failed'
          };
          return res.status(400).json(response);
        }
      } else if (paymentMethod === 'paypal') {
        const { paypalOrderId, paypalPayerId } = paymentDetails;

        if (!paypalOrderId || !paypalPayerId) {
          const response: PaymentResponse = {
            success: false,
            message: 'Missing PayPal payment details'
          };
          return res.status(400).json(response);
        }

        // Verify PayPal payment with PayPal API
        const paypalVerified = await verifyPayPalPayment(paypalOrderId, paypalPayerId);
        if (!paypalVerified) {
          const response: PaymentResponse = {
            success: false,
            message: 'PayPal payment verification failed'
          };
          return res.status(400).json(response);
        }
      }

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate payment success/failure (95% success rate for demo)
      const paymentSuccess = Math.random() > 0.05;

      const transactionId = generateTransactionId();

      if (!paymentSuccess) {
        // Create failed transaction record in Supabase
        const { data: failedTransaction, error: transactionError } = await supabaseServerHelpers.createTransaction({
          booking_id: bookingId,
          user_id: user.id,
          amount: booking.total_amount,
          currency: booking.currency,
          payment_method: paymentMethod,
          status: 'failed',
          stripe_payment_id: paymentMethod === 'stripe' ? paymentDetails.stripePaymentIntentId : null,
          paypal_order_id: paymentMethod === 'paypal' ? paymentDetails.paypalOrderId : null,
          paypal_payer_id: paymentMethod === 'paypal' ? paymentDetails.paypalPayerId : null,
          payment_details: paymentDetails
        });

        if (transactionError) {
          console.error('Error creating failed transaction:', transactionError);
        }

        const response: PaymentResponse = {
          success: false,
          message: 'Payment failed. Please check your payment details and try again.'
        };
        return res.status(400).json(response);
      }

      // Create successful transaction record in Supabase
      const { data: transaction, error: transactionError } = await supabaseServerHelpers.createTransaction({
        booking_id: bookingId,
        user_id: user.id,
        amount: booking.total_amount,
        currency: booking.currency,
        payment_method: paymentMethod,
        status: 'completed',
        stripe_payment_id: paymentMethod === 'stripe' ? paymentDetails.stripePaymentIntentId : null,
        paypal_order_id: paymentMethod === 'paypal' ? paymentDetails.paypalOrderId : null,
        paypal_payer_id: paymentMethod === 'paypal' ? paymentDetails.paypalPayerId : null,
        payment_details: paymentDetails
      });

      if (transactionError || !transaction) {
        console.error('Error creating transaction:', transactionError);
        const response: PaymentResponse = {
          success: false,
          message: 'Failed to record payment'
        };
        return res.status(500).json(response);
      }

      // Update booking status to confirmed in Supabase
      const { error: updateError } = await supabaseServerHelpers.updateBookingStatus(bookingId, 'confirmed');
      
      if (updateError) {
        console.error('Error updating booking status:', updateError);
        // Payment succeeded but booking update failed - this would need manual intervention
      }

      const response: PaymentResponse = {
        success: true,
        transactionId: transaction.id,
        message: 'Payment processed successfully'
      };

      res.json(response);
    } catch (supabaseError) {
      console.error('Supabase payment processing error:', supabaseError);
      const response: PaymentResponse = {
        success: false,
        message: 'Payment processing failed'
      };
      res.status(500).json(response);
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    const response: PaymentResponse = {
      success: false,
      message: 'Internal server error'
    };
    res.status(500).json(response);
  }
};

// Get payment history from Supabase
export const handleGetPaymentHistory: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    
    try {
      const { data: transactions, error } = await supabaseServerHelpers.getUserTransactions(user.id);

      if (error) {
        console.error('Error fetching payment history:', error);
        return res.json([]); // Return empty array as fallback
      }

      // Transform to expected format
      const userTransactions = transactions.map(transaction => ({
        id: transaction.id,
        bookingId: transaction.booking_id,
        userId: transaction.user_id,
        amount: transaction.amount,
        currency: transaction.currency,
        method: transaction.payment_method,
        status: transaction.status,
        transactionId: transaction.id,
        createdAt: transaction.created_at,
        updatedAt: transaction.updated_at
      }));

      res.json(userTransactions);
    } catch (supabaseError) {
      console.error('Supabase payment history error:', supabaseError);
      res.json([]); // Return empty array as fallback
    }
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get specific transaction from Supabase
export const handleGetTransaction: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const { transactionId } = req.params;
    
    try {
      const { data: transactions, error } = await supabaseServerHelpers.getUserTransactions(user.id);

      if (error) {
        console.error('Error fetching transaction:', error);
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }

      const transaction = transactions.find(t => t.id === transactionId);
      
      if (!transaction) {
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }

      // Transform to expected format
      const transactionData = {
        id: transaction.id,
        bookingId: transaction.booking_id,
        userId: transaction.user_id,
        amount: transaction.amount,
        currency: transaction.currency,
        method: transaction.payment_method,
        status: transaction.status,
        transactionId: transaction.id,
        createdAt: transaction.created_at,
        updatedAt: transaction.updated_at
      };

      res.json(transactionData);
    } catch (supabaseError) {
      console.error('Supabase get transaction error:', supabaseError);
      res.status(404).json({ success: false, message: 'Transaction not found' });
    }
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Refund payment in Supabase (admin only)
export const handleRefundPayment: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    
    // Check if user is admin
    const isAdmin = await supabaseServerHelpers.isUserAdmin(user.id);
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { transactionId } = req.params;
    const { reason } = req.body;
    
    try {
      // Get transaction details
      const { data: allTransactions, error: fetchError } = await supabaseServerHelpers.getAllTransactionsAdmin();
      
      if (fetchError) {
        console.error('Error fetching transactions:', fetchError);
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }

      const transaction = allTransactions.find(t => t.id === transactionId);
      
      if (!transaction) {
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }
      
      if (transaction.status !== 'completed') {
        return res.status(400).json({ 
          success: false, 
          message: 'Only completed transactions can be refunded' 
        });
      }

      // Simulate refund processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update transaction status to refunded
      const { data: updatedTransaction, error: updateError } = await supabaseServerHelpers.updateTransactionStatus(
        transactionId,
        'refunded',
        { refund_reason: reason }
      );

      if (updateError || !updatedTransaction) {
        console.error('Error updating transaction status:', updateError);
        return res.status(500).json({ success: false, message: 'Failed to process refund' });
      }

      // Update booking status to cancelled
      const { error: bookingUpdateError } = await supabaseServerHelpers.updateBookingStatus(
        transaction.booking_id,
        'cancelled'
      );

      if (bookingUpdateError) {
        console.error('Error updating booking status after refund:', bookingUpdateError);
        // Refund succeeded but booking update failed - would need manual intervention
      }

      res.json({ 
        success: true, 
        message: 'Refund processed successfully',
        transaction: {
          id: updatedTransaction.id,
          bookingId: updatedTransaction.booking_id,
          userId: updatedTransaction.user_id,
          amount: updatedTransaction.amount,
          currency: updatedTransaction.currency,
          method: updatedTransaction.payment_method,
          status: updatedTransaction.status,
          transactionId: updatedTransaction.id,
          createdAt: updatedTransaction.created_at,
          updatedAt: updatedTransaction.updated_at
        }
      });
    } catch (supabaseError) {
      console.error('Supabase refund error:', supabaseError);
      res.status(500).json({ success: false, message: 'Failed to process refund' });
    }
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Create PayPal order
export const handleCreatePayPalOrder: RequestHandler = async (req, res) => {
  try {
    const { bookingId, amount, currency = 'USD' } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    console.log('Creating PayPal order for booking:', bookingId, 'amount:', amount);

    // For development/demo mode, return a mock response if PayPal credentials are not configured
    if (!PAYPAL_CLIENT_ID || PAYPAL_CLIENT_ID === 'demo-client-id') {
      console.log('PayPal demo mode - returning mock approval URL');
      return res.json({
        success: true,
        orderID: `mock_order_${Date.now()}`,
        approvalUrl: `${req.headers.origin}/payment/success?token=mock_order_${Date.now()}&PayerID=mock_payer`,
        demoMode: true
      });
    }

    let accessToken;
    try {
      accessToken = await getPayPalAccessToken();
    } catch (authError) {
      console.log('PayPal authentication failed, falling back to demo mode');
      return res.json({
        success: true,
        orderID: `demo_order_${Date.now()}`,
        approvalUrl: `${req.headers.origin}/payment/success?token=demo_order_${Date.now()}&PayerID=demo_payer`,
        demoMode: true,
        message: 'PayPal demo mode - credentials not configured'
      });
    }

    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: bookingId,
        amount: {
          currency_code: currency,
          value: amount.toString()
        },
        description: `OnboardTicket Flight Reservation - ${bookingId}`
      }],
      application_context: {
        brand_name: 'OnboardTicket',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${req.headers.origin}/payment/success`,
        cancel_url: `${req.headers.origin}/payment/cancel`
      }
    };

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error('Failed to create PayPal order');
    }

    const order = await response.json();
    const approvalUrl = order.links.find((link: any) => link.rel === 'approve')?.href;

    res.json({
      success: true,
      orderID: order.id,
      approvalUrl
    });
  } catch (error) {
    console.error('PayPal order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create PayPal order'
    });
  }
};

// Capture PayPal payment
export const handleCapturePayPalPayment: RequestHandler = async (req, res) => {
  try {
    const { orderId, payerId } = req.body;

    if (!orderId || !payerId) {
      return res.status(400).json({
        success: false,
        message: 'Missing order ID or payer ID'
      });
    }

    console.log('Capturing PayPal payment for order:', orderId, 'payer:', payerId);

    // Handle mock orders for development
    if (orderId.startsWith('mock_order_') || payerId === 'mock_payer') {
      console.log('PayPal demo mode - returning mock capture response');
      return res.json({
        success: true,
        captureId: `mock_capture_${Date.now()}`,
        status: 'COMPLETED'
      });
    }

    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to capture PayPal payment');
    }

    const capture = await response.json();

    res.json({
      success: true,
      captureId: capture.id,
      status: capture.status
    });
  } catch (error) {
    console.error('PayPal capture error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to capture PayPal payment'
    });
  }
};

// Create Stripe Payment Intent
export const handleCreateStripePaymentIntent: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const { bookingId, amount, currency = 'USD' } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    try {
      // Find booking in Supabase
      const { data: booking, error: bookingError } = await supabaseServerHelpers.getBookingById(bookingId);

      if (bookingError || !booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      // Check if booking belongs to user
      if (booking.user_id !== user.id) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      if (booking.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Booking is not eligible for payment'
        });
      }

      console.log('Creating Stripe payment intent for booking:', bookingId, 'amount:', amount);

      // Check if Stripe is configured
      if (!StripeService.isConfigured()) {
        return res.json({
          success: true,
          clientSecret: `pi_demo_${Date.now()}_secret`,
          paymentIntentId: `pi_demo_${Date.now()}`,
          demoMode: true,
          message: 'Stripe demo mode - payment will be simulated'
        });
      }

      const paymentIntent = await StripeService.createPaymentIntent({
        amount,
        currency,
        bookingId,
        customerEmail: user.email,
        description: `OnboardTicket Flight Reservation - ${booking.pnr}`
      });

      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        demoMode: false
      });
    } catch (supabaseError) {
      console.error('Supabase error in Stripe payment intent:', supabaseError);
      res.status(500).json({
        success: false,
        message: 'Failed to create Stripe payment intent'
      });
    }
  } catch (error) {
    console.error('Stripe payment intent creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create Stripe payment intent'
    });
  }
};

// Get Stripe publishable key
export const handleGetStripeConfig: RequestHandler = (req, res) => {
  try {
    const publishableKey = StripeService.getPublishableKey();

    if (!publishableKey || !StripeService.isConfigured()) {
      // Return demo mode configuration
      return res.json({
        publishableKey: null,
        demoMode: true,
        message: 'Stripe not configured - demo mode'
      });
    }

    res.json({
      publishableKey,
      demoMode: false
    });
  } catch (error) {
    console.error('Get Stripe config error:', error);
    res.json({
      publishableKey: null,
      demoMode: true,
      message: 'Stripe configuration error - demo mode'
    });
  }
};

// Get all transactions from Supabase (admin only)
export const handleGetAllTransactions: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    
    // Check if user is admin
    const isAdmin = await supabaseServerHelpers.isUserAdmin(user.id);
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;

    try {
      const { data: allTransactions, error } = await supabaseServerHelpers.getAllTransactionsAdmin();

      if (error) {
        console.error('Error fetching all transactions:', error);
        return res.json({
          transactions: [],
          total: 0,
          page,
          limit,
          totalPages: 0
        });
      }

      let filteredTransactions = allTransactions;

      if (status && status !== 'all') {
        filteredTransactions = allTransactions.filter(transaction => transaction.status === status);
      }

      // Sort by creation date
      filteredTransactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

      // Transform to expected format
      const transactions = paginatedTransactions.map(transaction => ({
        id: transaction.id,
        bookingId: transaction.booking_id,
        userId: transaction.user_id,
        amount: transaction.amount,
        currency: transaction.currency,
        method: transaction.payment_method,
        status: transaction.status,
        transactionId: transaction.id,
        createdAt: transaction.created_at,
        updatedAt: transaction.updated_at,
        // Include booking and user info if available
        booking: transaction.booking ? {
          pnr: transaction.booking.pnr,
          total_amount: transaction.booking.total_amount
        } : undefined,
        user: transaction.user ? {
          firstName: transaction.user.first_name,
          lastName: transaction.user.last_name,
          email: transaction.user.email
        } : undefined
      }));

      res.json({
        transactions,
        total: filteredTransactions.length,
        page,
        limit,
        totalPages: Math.ceil(filteredTransactions.length / limit)
      });
    } catch (supabaseError) {
      console.error('Supabase get all transactions error:', supabaseError);
      res.json({
        transactions: [],
        total: 0,
        page,
        limit,
        totalPages: 0
      });
    }
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
