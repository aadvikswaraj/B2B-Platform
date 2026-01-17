// test-examples.js
// Test cases and examples for payment module

/**
 * This file contains:
 * 1. Unit test examples
 * 2. Integration test examples
 * 3. Manual test scripts
 * 4. Postman/curl examples
 */

// ============================================================================
// 1. UNIT TESTS (using Jest)
// ============================================================================

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import * as paymentService from './service.js';
import { verifyPaymentSignature, verifyWebhookSignature } from './razorpay.client.js';

describe('Payment Service', () => {
  describe('createPaymentForOrder', () => {
    test('should create payment for valid order', async () => {
      // Mock data
      const orderId = '64abc123456789';
      const buyerId = '64def456789012';
      
      // Test
      const result = await paymentService.createPaymentForOrder(orderId, buyerId);
      
      // Assertions
      expect(result).toBeDefined();
      expect(result.paymentId).toBeDefined();
      expect(result.razorpayOrderId).toBeDefined();
      expect(result.amount).toBeGreaterThan(0);
      expect(result.currency).toBe('INR');
    });

    test('should reject payment for cancelled order', async () => {
      const orderId = 'cancelled_order_id';
      const buyerId = '64def456789012';
      
      await expect(
        paymentService.createPaymentForOrder(orderId, buyerId)
      ).rejects.toThrow('Cannot create payment for cancelled order');
    });

    test('should reject payment for already paid order', async () => {
      const orderId = 'paid_order_id';
      const buyerId = '64def456789012';
      
      await expect(
        paymentService.createPaymentForOrder(orderId, buyerId)
      ).rejects.toThrow('Order is already paid');
    });

    test('should reject unauthorized access', async () => {
      const orderId = '64abc123456789';
      const wrongBuyerId = 'wrong_buyer_id';
      
      await expect(
        paymentService.createPaymentForOrder(orderId, wrongBuyerId)
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('verifyPayment', () => {
    test('should verify valid payment signature', async () => {
      const razorpayOrderId = 'order_test123';
      const razorpayPaymentId = 'pay_test123';
      const razorpaySignature = 'valid_signature_here';
      
      const result = await paymentService.verifyPayment(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );
      
      expect(result.success).toBe(true);
      expect(result.paymentId).toBeDefined();
      expect(result.orderId).toBeDefined();
    });

    test('should reject invalid signature', async () => {
      const razorpayOrderId = 'order_test123';
      const razorpayPaymentId = 'pay_test123';
      const razorpaySignature = 'invalid_signature';
      
      await expect(
        paymentService.verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature)
      ).rejects.toThrow('Invalid payment signature');
    });

    test('should be idempotent - multiple calls same result', async () => {
      const razorpayOrderId = 'order_test123';
      const razorpayPaymentId = 'pay_test123';
      const razorpaySignature = 'valid_signature_here';
      
      // First call
      const result1 = await paymentService.verifyPayment(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );
      
      // Second call (should return immediately without updating)
      const result2 = await paymentService.verifyPayment(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );
      
      expect(result1.paymentId).toBe(result2.paymentId);
      expect(result2.message).toContain('already');
    });
  });

  describe('Signature Verification', () => {
    test('should verify valid HMAC signature', () => {
      const orderId = 'order_test123';
      const paymentId = 'pay_test123';
      const secret = 'test_secret_key';
      
      // Generate signature
      const crypto = require('crypto');
      const message = `${orderId}|${paymentId}`;
      const signature = crypto
        .createHmac('sha256', secret)
        .update(message)
        .digest('hex');
      
      // Verify
      const isValid = verifyPaymentSignature(orderId, paymentId, signature);
      expect(isValid).toBe(true);
    });

    test('should reject tampered signature', () => {
      const orderId = 'order_test123';
      const paymentId = 'pay_test123';
      const tamperedSignature = 'tampered_signature_123';
      
      const isValid = verifyPaymentSignature(orderId, paymentId, tamperedSignature);
      expect(isValid).toBe(false);
    });
  });
});

// ============================================================================
// 2. INTEGRATION TESTS
// ============================================================================

describe('Payment API Integration', () => {
  let authToken;
  let orderId;
  
  beforeEach(async () => {
    // Setup: Login and get auth token
    authToken = await loginTestUser();
    // Create test order
    orderId = await createTestOrder();
  });

  test('Complete payment flow', async () => {
    // Step 1: Create payment
    const createResponse = await fetch('http://localhost:5000/api/user/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ orderId }),
    });
    
    expect(createResponse.status).toBe(200);
    const createData = await createResponse.json();
    expect(createData.success).toBe(true);
    expect(createData.data.razorpayOrderId).toBeDefined();
    
    // Step 2: Simulate Razorpay payment
    const { razorpayOrderId } = createData.data;
    const simulatedPayment = simulateRazorpayPayment(razorpayOrderId);
    
    // Step 3: Verify payment
    const verifyResponse = await fetch('http://localhost:5000/api/user/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        razorpay_order_id: simulatedPayment.razorpay_order_id,
        razorpay_payment_id: simulatedPayment.razorpay_payment_id,
        razorpay_signature: simulatedPayment.razorpay_signature,
      }),
    });
    
    expect(verifyResponse.status).toBe(200);
    const verifyData = await verifyResponse.json();
    expect(verifyData.success).toBe(true);
    
    // Step 4: Verify order payment status updated
    const order = await fetchOrder(orderId);
    expect(order.paymentStatus).toBe('paid');
  });

  test('Webhook delivery', async () => {
    // Create payment
    const payment = await createTestPayment(orderId);
    
    // Simulate webhook
    const webhookPayload = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_test123',
            order_id: payment.razorpayOrderId,
            status: 'captured',
            method: 'upi',
            amount: 150000,
          },
        },
      },
    };
    
    // Generate signature
    const webhookSignature = generateWebhookSignature(webhookPayload);
    
    // Send webhook
    const response = await fetch('http://localhost:5000/api/user/payments/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Razorpay-Signature': webhookSignature,
      },
      body: JSON.stringify(webhookPayload),
    });
    
    expect(response.status).toBe(200);
    
    // Verify payment updated
    const updatedPayment = await fetchPayment(payment._id);
    expect(updatedPayment.status).toBe('paid');
  });
});

// ============================================================================
// 3. MANUAL TEST SCRIPTS
// ============================================================================

/**
 * Test Script 1: Create Payment
 * Run this in Node.js or browser console
 */
async function testCreatePayment() {
  const response = await fetch('http://localhost:5000/api/user/payments/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TOKEN_HERE',
    },
    body: JSON.stringify({
      orderId: '64abc123456789', // Replace with real order ID
    }),
  });
  
  const data = await response.json();
  console.log('Create Payment Response:', data);
  
  if (data.success) {
    console.log('✓ Payment created successfully');
    console.log('Razorpay Order ID:', data.data.razorpayOrderId);
    console.log('Amount:', data.data.amount);
  } else {
    console.error('✗ Failed to create payment:', data.message);
  }
}

/**
 * Test Script 2: Verify Payment
 * Run after completing payment via Razorpay checkout
 */
async function testVerifyPayment() {
  const response = await fetch('http://localhost:5000/api/user/payments/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TOKEN_HERE',
    },
    body: JSON.stringify({
      razorpay_order_id: 'order_Nxxx...',  // From Razorpay callback
      razorpay_payment_id: 'pay_Nxxx...',  // From Razorpay callback
      razorpay_signature: 'abc123...',     // From Razorpay callback
    }),
  });
  
  const data = await response.json();
  console.log('Verify Payment Response:', data);
  
  if (data.success) {
    console.log('✓ Payment verified successfully');
    console.log('Payment ID:', data.data.paymentId);
  } else {
    console.error('✗ Verification failed:', data.message);
  }
}

/**
 * Test Script 3: List Payments
 */
async function testListPayments() {
  const response = await fetch('http://localhost:5000/api/user/payments?page=1&limit=10', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN_HERE',
    },
  });
  
  const data = await response.json();
  console.log('List Payments Response:', data);
  
  if (data.success) {
    console.log('✓ Payments fetched successfully');
    console.log('Total:', data.data.totalCount);
    console.log('Payments:', data.data.payments);
  }
}

// ============================================================================
// 4. CURL EXAMPLES
// ============================================================================

/**
 * CURL Example 1: Create Payment
 */
const curlCreatePayment = `
curl -X POST http://localhost:5000/api/user/payments/create \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \\
  -d '{
    "orderId": "64abc123456789"
  }'
`;

/**
 * CURL Example 2: Verify Payment
 */
const curlVerifyPayment = `
curl -X POST http://localhost:5000/api/user/payments/verify \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \\
  -d '{
    "razorpay_order_id": "order_Nxxx...",
    "razorpay_payment_id": "pay_Nxxx...",
    "razorpay_signature": "abc123..."
  }'
`;

/**
 * CURL Example 3: Webhook
 */
const curlWebhook = `
curl -X POST http://localhost:5000/api/user/payments/webhook \\
  -H "Content-Type: application/json" \\
  -H "X-Razorpay-Signature: YOUR_WEBHOOK_SIGNATURE" \\
  -d '{
    "event": "payment.captured",
    "payload": {
      "payment": {
        "entity": {
          "id": "pay_test123",
          "order_id": "order_test123",
          "status": "captured",
          "method": "upi",
          "amount": 150000
        }
      }
    }
  }'
`;

/**
 * CURL Example 4: Get Payment
 */
const curlGetPayment = `
curl -X GET http://localhost:5000/api/user/payments/64xyz789 \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
`;

/**
 * CURL Example 5: List Payments
 */
const curlListPayments = `
curl -X GET "http://localhost:5000/api/user/payments?page=1&limit=10&status=paid" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
`;

// ============================================================================
// 5. POSTMAN COLLECTION
// ============================================================================

const postmanCollection = {
  "info": {
    "name": "Payment Module API",
    "description": "Test collection for payment endpoints",
  },
  "item": [
    {
      "name": "Create Payment",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/user/payments/create",
        "header": [
          { "key": "Content-Type", "value": "application/json" },
          { "key": "Authorization", "value": "Bearer {{authToken}}" },
        ],
        "body": {
          "mode": "raw",
          "raw": JSON.stringify({ orderId: "{{orderId}}" }),
        },
      },
    },
    {
      "name": "Verify Payment",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/user/payments/verify",
        "header": [
          { "key": "Content-Type", "value": "application/json" },
          { "key": "Authorization", "value": "Bearer {{authToken}}" },
        ],
        "body": {
          "mode": "raw",
          "raw": JSON.stringify({
            razorpay_order_id: "{{razorpayOrderId}}",
            razorpay_payment_id: "{{razorpayPaymentId}}",
            razorpay_signature: "{{razorpaySignature}}",
          }),
        },
      },
    },
    {
      "name": "List Payments",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/user/payments?page=1&limit=10",
        "header": [
          { "key": "Authorization", "value": "Bearer {{authToken}}" },
        ],
      },
    },
  ],
};

// ============================================================================
// 6. HELPER FUNCTIONS FOR TESTING
// ============================================================================

/**
 * Generate test Razorpay signature
 */
function generateTestSignature(orderId, paymentId, secret) {
  const crypto = require('crypto');
  const message = `${orderId}|${paymentId}`;
  return crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');
}

/**
 * Generate webhook signature
 */
function generateWebhookSignature(payload, secret) {
  const crypto = require('crypto');
  const body = JSON.stringify(payload);
  return crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
}

/**
 * Create test order
 */
async function createTestOrder() {
  // Implementation depends on your order creation endpoint
  const response = await fetch('http://localhost:5000/api/orders/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TOKEN',
    },
    body: JSON.stringify({
      items: [
        {
          productId: '64prod123',
          quantity: 1,
          price: 1500.00,
        },
      ],
      shippingAddressId: '64addr123',
    }),
  });
  
  const data = await response.json();
  return data.data._id;
}

/**
 * Login test user
 */
async function loginTestUser() {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'test123',
    }),
  });
  
  const data = await response.json();
  return data.data.token;
}

// ============================================================================
// 7. TEST DATA
// ============================================================================

const testData = {
  // Test cards (Razorpay test mode)
  cards: {
    success: {
      number: '4111111111111111',
      cvv: '123',
      expiry: '12/25',
    },
    failure: {
      number: '4000000000000002',
      cvv: '123',
      expiry: '12/25',
    },
  },
  
  // Test order
  order: {
    buyerId: '64buyer123',
    sellerId: '64seller456',
    items: [
      {
        productId: '64prod789',
        title: 'Test Product',
        quantity: 2,
        price: 750.00,
        subtotal: 1500.00,
      },
    ],
    subtotal: 1500.00,
    tax: 270.00,
    totalAmount: 1770.00,
    currency: 'INR',
  },
  
  // Test payment
  payment: {
    orderId: '64order123',
    buyerId: '64buyer123',
    razorpayOrderId: 'order_test123',
    amount: 1770.00,
    currency: 'INR',
    status: 'created',
  },
};

// ============================================================================
// EXPORT FOR USE IN TESTS
// ============================================================================

export {
  testCreatePayment,
  testVerifyPayment,
  testListPayments,
  generateTestSignature,
  generateWebhookSignature,
  createTestOrder,
  loginTestUser,
  testData,
  postmanCollection,
};

console.log('Test Examples Loaded');
console.log('Available test functions:');
console.log('- testCreatePayment()');
console.log('- testVerifyPayment()');
console.log('- testListPayments()');
console.log('- generateTestSignature(orderId, paymentId, secret)');
console.log('- generateWebhookSignature(payload, secret)');
