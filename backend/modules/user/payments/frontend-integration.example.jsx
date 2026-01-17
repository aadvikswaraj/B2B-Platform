// frontend-integration.example.jsx
// Example React component showing complete payment flow

import { useState } from 'react';
import { useRouter } from 'next/router';

/**
 * Payment Component - Handles complete Razorpay integration
 * 
 * SECURITY NOTES:
 * - Amount is NEVER sent from frontend
 * - Backend calculates amount from Order
 * - Frontend only initiates and verifies payment
 */

export default function PaymentButton({ orderId, orderAmount }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  /**
   * Step 1: Create payment on backend
   * Backend returns Razorpay order ID and amount
   */
  const createPayment = async () => {
    const response = await fetch('/api/user/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ orderId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create payment');
    }

    return await response.json();
  };

  /**
   * Step 2: Verify payment on backend
   * Send Razorpay response for signature verification
   */
  const verifyPayment = async (razorpayResponse) => {
    const response = await fetch('/api/user/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_signature: razorpayResponse.razorpay_signature,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Payment verification failed');
    }

    return await response.json();
  };

  /**
   * Main payment handler
   * Orchestrates create → Razorpay checkout → verify flow
   */
  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Step 1: Create payment on backend
      const { data: paymentData } = await createPayment();

      // Step 2: Load Razorpay script (if not already loaded)
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Step 3: Configure Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Your Razorpay key ID
        amount: paymentData.amount * 100, // Amount in paise
        currency: paymentData.currency || 'INR',
        order_id: paymentData.razorpayOrderId, // Razorpay order ID
        name: 'Globomart',
        description: `Order #${orderId}`,
        image: '/logo/globomart-logo.png', // Your logo
        
        /**
         * Success handler - called when payment succeeds
         * CRITICAL: Must verify on backend (frontend callback can be spoofed)
         */
        handler: async function (response) {
          try {
            // Verify payment with backend
            const result = await verifyPayment(response);
            
            if (result.success) {
              // Payment verified - redirect to success page
              router.push(`/order/success?orderId=${orderId}`);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            setError(error.message);
            // Redirect to failure page
            router.push(`/order/failed?orderId=${orderId}&error=${error.message}`);
          }
        },

        /**
         * Payment dismissed handler
         * User closed Razorpay checkout without completing payment
         */
        modal: {
          ondismiss: function () {
            setLoading(false);
            setError('Payment cancelled by user');
          },
        },

        /**
         * Prefill customer details (optional but recommended)
         */
        prefill: {
          name: 'Customer Name',
          email: 'customer@example.com',
          contact: '9999999999',
        },

        /**
         * Theme customization (optional)
         */
        theme: {
          color: '#3399cc',
        },

        /**
         * Retry configuration
         * Allow user to retry if payment fails
         */
        retry: {
          enabled: true,
          max_count: 3,
        },
      };

      // Step 4: Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      
      // Handle payment failure
      razorpay.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        setError(response.error.description || 'Payment failed');
        setLoading(false);
        
        // Optionally redirect to failure page
        router.push(`/order/failed?orderId=${orderId}&error=${response.error.code}`);
      });

      razorpay.open();
      
    } catch (error) {
      console.error('Payment initiation error:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="payment-container">
      <button
        onClick={handlePayment}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
      >
        {loading ? 'Processing...' : `Pay ₹${orderAmount.toLocaleString('en-IN')}`}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-700">Processing payment...</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * USAGE EXAMPLE:
 * 
 * import PaymentButton from '@/components/PaymentButton';
 * 
 * function OrderPage({ order }) {
 *   return (
 *     <div>
 *       <h1>Order #{order._id}</h1>
 *       <p>Total: ₹{order.totalAmount}</p>
 *       
 *       {order.paymentStatus === 'pending' && (
 *         <PaymentButton 
 *           orderId={order._id} 
 *           orderAmount={order.totalAmount} 
 *         />
 *       )}
 *     </div>
 *   );
 * }
 */

/**
 * ALTERNATIVE: API Route Handler (Next.js API routes)
 * 
 * Useful if you want to add server-side logic before payment
 */

// pages/api/payments/initiate.js
/*
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');

    // Call backend API
    const response = await fetch(`${process.env.BACKEND_URL}/api/user/payments/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ orderId }),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Payment initiation error:', error);
    return res.status(500).json({ error: 'Failed to initiate payment' });
  }
}
*/

/**
 * TESTING IN DEVELOPMENT:
 * 
 * 1. Use Razorpay test mode keys
 * 2. Test cards:
 *    - Success: 4111 1111 1111 1111
 *    - Failure: 4000 0000 0000 0002
 * 3. Any CVV and future expiry date
 * 4. Check console logs for errors
 * 5. Verify payment status in backend
 */

/**
 * ERROR HANDLING CHECKLIST:
 * 
 * - Payment creation fails (order not found, already paid)
 * - Razorpay script fails to load
 * - User closes checkout modal
 * - Payment fails (insufficient funds, wrong PIN)
 * - Verification fails (invalid signature)
 * - Network errors during verification
 * - User navigates away during payment
 */

/**
 * SECURITY BEST PRACTICES:
 * 
 * ✅ Never send amount from frontend
 * ✅ Always verify payment on backend
 * ✅ Use HTTPS in production
 * ✅ Don't log sensitive data (card numbers, CVV)
 * ✅ Handle errors gracefully
 * ✅ Implement retry logic for network failures
 * ✅ Show clear error messages to users
 * ✅ Redirect to appropriate success/failure pages
 */
