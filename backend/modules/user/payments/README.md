# Payments Module - Globomart B2B Marketplace

Production-grade payment integration using Razorpay Orders API.

## Architecture

```
routes.js (thin HTTP layer)
    ↓
service.js (business logic)
    ↓
model.js (Payment & Order models)
    ↓
razorpay.client.js (Razorpay SDK wrapper)
```

## Core Business Rules

1. **Orders are business truth**
   - All payments link to orders
   - Amount always comes from Order, never client
   - One order can have multiple payments (retries, refunds)

2. **Backend is source of truth**
   - Frontend never determines payment amount
   - Signature verification is mandatory
   - Webhooks are authoritative (frontend callbacks can fail)

3. **Payment status is separate from order status**
   - Payment: financial event (pending → paid → refunded)
   - Order: fulfillment lifecycle (placed → shipped → delivered)

## Folder Structure

```
backend/modules/user/payments/
├── routes.js              # Route definitions (thin layer)
├── service.js             # All business logic
├── validator.js           # Joi validation schemas
├── razorpay.client.js     # Razorpay SDK wrapper
├── .env.example           # Environment variables template
└── README.md              # This file

backend/models/model.js
├── Order schema           # Business truth
└── Payment schema         # Financial events
```

## Models

### Order Schema
```javascript
{
  buyerId: ObjectId,
  sellerId: ObjectId,
  items: [{ productId, title, quantity, price, subtotal }],
  subtotal: Number,
  tax: Number,
  shippingCharges: Number,
  totalAmount: Number,        // Source of truth for payment amount
  currency: String,
  status: "placed" | "confirmed" | "shipped" | "delivered" | "cancelled",
  paymentStatus: "pending" | "paid" | "failed" | "refunded",
  shippingAddress: ObjectId,
  timestamps
}
```

### Payment Schema
```javascript
{
  orderId: ObjectId,          // Required - link to order
  buyerId: ObjectId,
  razorpayOrderId: String,    // Unique Razorpay order ID
  razorpayPaymentId: String,  // Set after payment initiated
  amount: Number,             // From Order.totalAmount
  currency: String,
  status: "created" | "authorized" | "paid" | "failed" | "refunded",
  method: "upi" | "card" | "netbanking" | "wallet" | "emi",
  timestamps
}
```

## API Endpoints

### 1. Create Payment
**POST** `/api/user/payments/create`

**Request:**
```json
{
  "orderId": "64abc123..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment created successfully",
  "data": {
    "paymentId": "64xyz789...",
    "razorpayOrderId": "order_Nxxx...",
    "amount": 1500.00,
    "currency": "INR"
  }
}
```

**Frontend Flow:**
```javascript
// 1. Create payment
const response = await fetch('/api/user/payments/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ orderId })
});

const { razorpayOrderId, amount, currency } = await response.json();

// 2. Open Razorpay checkout
const options = {
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  amount: amount * 100, // Convert to paise
  currency: currency,
  order_id: razorpayOrderId,
  handler: async function(response) {
    // 3. Verify payment
    await verifyPayment(response);
  }
};

const razorpay = new Razorpay(options);
razorpay.open();
```

---

### 2. Verify Payment
**POST** `/api/user/payments/verify`

**Request:**
```json
{
  "razorpay_order_id": "order_Nxxx...",
  "razorpay_payment_id": "pay_Nxxx...",
  "razorpay_signature": "abc123..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "paymentId": "64xyz789...",
    "orderId": "64abc123..."
  }
}
```

**CRITICAL:** Always call this endpoint after Razorpay success callback

---

### 3. Get Payment Details
**GET** `/api/user/payments/:paymentId`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64xyz789...",
    "orderId": { ... },
    "amount": 1500.00,
    "status": "paid",
    "method": "upi",
    "createdAt": "2025-01-01T10:00:00.000Z"
  }
}
```

---

### 4. List Payments
**GET** `/api/user/payments?page=1&limit=10&status=paid`

**Query Params:**
- `page` (default: 1)
- `limit` (default: 10, max: 100)
- `status` (optional): created | paid | failed | refunded

**Response:**
```json
{
  "success": true,
  "data": {
    "payments": [...],
    "totalCount": 50,
    "page": 1,
    "totalPages": 5
  }
}
```

---

### 5. Webhook (Razorpay → Server)
**POST** `/api/user/payments/webhook`

**Headers:**
- `X-Razorpay-Signature`: HMAC signature

**Body:**
```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_Nxxx...",
        "order_id": "order_Nxxx...",
        "status": "captured",
        "method": "upi",
        "amount": 150000
      }
    }
  }
}
```

**Supported Events:**
- `payment.captured` - Payment successful
- `payment.failed` - Payment failed

---

## Security Implementation

### 1. Amount Integrity
```javascript
// ❌ NEVER trust frontend for amount
const payment = await createPayment(orderId, amount); // WRONG

// ✅ Always fetch from Order
const order = await Order.findById(orderId);
const amount = order.totalAmount; // Source of truth
```

### 2. Signature Verification
```javascript
// Verify payment signature (HMAC SHA256)
const message = `${razorpayOrderId}|${razorpayPaymentId}`;
const generatedSignature = crypto
  .createHmac('sha256', RAZORPAY_KEY_SECRET)
  .update(message)
  .digest('hex');

// Constant-time comparison (prevents timing attacks)
const isValid = crypto.timingSafeEqual(
  Buffer.from(generatedSignature),
  Buffer.from(razorpaySignature)
);
```

### 3. Webhook Verification
```javascript
// Verify webhook signature
const webhookSignature = crypto
  .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
  .update(webhookBody)
  .digest('hex');

if (webhookSignature !== receivedSignature) {
  // Reject webhook - potential attack
}
```

### 4. Idempotency
```javascript
// Check if payment already processed
if (payment.status === 'paid') {
  return { success: true, message: 'Already processed' };
}
// Prevents duplicate order confirmations
```

---

## Webhook Setup

### 1. Configure in Razorpay Dashboard
- Go to: https://dashboard.razorpay.com/app/webhooks
- Add webhook URL: `https://yourdomain.com/api/user/payments/webhook`
- Copy webhook secret
- Subscribe to events:
  - `payment.captured` (mandatory)
  - `payment.failed` (mandatory)

### 2. Add to .env
```bash
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### 3. Raw Body Middleware (CRITICAL)
Webhook signature verification requires raw request body.

Add to `app.js` BEFORE body parsers:
```javascript
// Capture raw body for webhook signature verification
app.use('/api/user/payments/webhook', (req, res, next) => {
  let data = '';
  req.on('data', chunk => { data += chunk; });
  req.on('end', () => {
    req.rawBody = data;
    next();
  });
});

// Then add body parsers
app.use(express.json());
```

### 4. Testing Locally
Use ngrok to expose localhost:
```bash
ngrok http 5000
# Configure ngrok URL in Razorpay dashboard
```

---

## Payment Flow Diagram

```
Frontend                Backend                 Razorpay
   |                       |                       |
   |--Create Payment------>|                       |
   |   (orderId)           |                       |
   |                       |--Create Order-------->|
   |                       |<--Order ID------------|
   |<--Order ID------------|                       |
   |   (razorpayOrderId)   |                       |
   |                       |                       |
   |--Open Razorpay------->|                       |
   |   Checkout            |                       |
   |                       |                       |
   User pays via Razorpay checkout interface      |
   |                       |                       |
   |<--Success Callback----|                       |
   |   (signature)         |                       |
   |                       |                       |
   |--Verify Payment------>|                       |
   |   (signature)         |--Verify Signature-----|
   |                       |   (HMAC SHA256)       |
   |                       |--Fetch Payment------->|
   |                       |<--Payment Details-----|
   |                       |   (double check)      |
   |                       |                       |
   |                       |--Update DB----------->|
   |                       |   Payment: paid       |
   |                       |   Order: paid         |
   |<--Success Response----|                       |
   |                       |                       |
   |                       |<--Webhook-------------|
   |                       |   payment.captured    |
   |                       |--Verify Signature-----|
   |                       |--Update DB (idempotent)
   |                       |--Return 200---------->|
```

---

## Error Handling

### Frontend Errors
```javascript
try {
  const payment = await createPayment(orderId);
} catch (error) {
  if (error.message.includes('Unauthorized')) {
    // Order doesn't belong to user
  } else if (error.message.includes('already paid')) {
    // Order already paid
  } else if (error.message.includes('cancelled')) {
    // Order cancelled
  }
}
```

### Verification Errors
```javascript
// Invalid signature
{
  "success": false,
  "message": "Invalid payment signature - verification failed"
}

// Payment not captured
{
  "success": false,
  "message": "Payment not captured on Razorpay"
}
```

### Webhook Errors
```javascript
// All webhook errors return 200 (prevents retries)
// Log errors for manual investigation

console.error('Webhook processing error:', error);
// Notify ops team via Slack/email
```

---

## Testing

### Test Payment
```bash
# Create test order (separate endpoint needed)
POST /api/orders/create
{
  "items": [...],
  "shippingAddressId": "..."
}

# Create payment
POST /api/user/payments/create
{
  "orderId": "64abc123..."
}

# Test payment with Razorpay test cards
# Card: 4111 1111 1111 1111
# CVV: Any 3 digits
# Expiry: Any future date
```

### Test Webhook
```bash
# Use Razorpay webhook testing tool
# Or use curl:
curl -X POST http://localhost:5000/api/user/payments/webhook \
  -H "X-Razorpay-Signature: test_signature" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "payment.captured",
    "payload": {
      "payment": {
        "entity": {
          "id": "pay_test123",
          "order_id": "order_test123",
          "status": "captured"
        }
      }
    }
  }'
```

---

## Monitoring & Alerts

### Key Metrics
- Payment success rate
- Average verification time
- Webhook processing time
- Failed payment reasons
- Duplicate webhook count

### Logging
```javascript
// Payment creation
console.log(`Payment created: ${paymentId} for order: ${orderId}`);

// Verification
console.log(`Payment verified: ${paymentId}`);

// Webhook
console.log(`Webhook processed: ${event} for payment: ${paymentId}`);

// Errors
console.error(`Payment verification failed:`, error);
```

### Alerts
- Webhook signature failures (potential attack)
- High payment failure rate
- Unprocessed webhooks
- Order-payment mismatches

---

## Common Issues

### 1. Amount Mismatch
**Problem:** Razorpay amount doesn't match order amount

**Solution:**
- Always use `Order.totalAmount` as source of truth
- Convert to paise: `amount * 100`
- Round to integer: `Math.round(amount * 100)`

### 2. Signature Verification Fails
**Problem:** Valid payment rejected

**Solution:**
- Check `RAZORPAY_KEY_SECRET` is correct
- Ensure message format: `order_id|payment_id`
- Use `crypto.timingSafeEqual` for comparison

### 3. Webhook Not Received
**Problem:** Payment verified but webhook missing

**Solution:**
- Check webhook URL in Razorpay dashboard
- Verify webhook secret in .env
- Check server logs for webhook errors
- Use Razorpay dashboard to manually trigger webhook

### 4. Duplicate Webhooks
**Problem:** Same webhook received multiple times

**Solution:**
- Service layer already handles idempotency
- Check logs for duplicate processing
- Always return 200 for processed webhooks

---

## Production Checklist

- [ ] Set Razorpay keys in production .env
- [ ] Configure webhook URL in Razorpay dashboard
- [ ] Set webhook secret in production .env
- [ ] Add raw body middleware for webhooks
- [ ] Test payment flow end-to-end
- [ ] Test webhook delivery
- [ ] Set up monitoring and alerts
- [ ] Configure error logging (Sentry, etc.)
- [ ] Test refund flow
- [ ] Document manual reconciliation process
- [ ] Set up database backups
- [ ] Enable Razorpay fraud detection
- [ ] Configure payment retry logic
- [ ] Test idempotency thoroughly

---

## Dependencies

```bash
npm install razorpay
```

Razorpay SDK is already installed based on terminal history.

---

## Support

For Razorpay API documentation:
- API Docs: https://razorpay.com/docs/api/
- Orders API: https://razorpay.com/docs/api/orders/
- Webhooks: https://razorpay.com/docs/webhooks/

---

## License

Part of Globomart B2B Marketplace - Private & Confidential
