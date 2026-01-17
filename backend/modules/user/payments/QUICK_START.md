# Quick Start Guide - Payment Module

Get the payment module up and running in 5 minutes.

## 🚀 Setup (5 steps)

### 1. Environment Variables
Copy to your `.env` file:
```bash
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

Get keys from: https://dashboard.razorpay.com/app/keys

### 2. Add Webhook Middleware to app.js
Add BEFORE `app.use(express.json())`:

```javascript
// Capture raw body for webhook signature verification
app.use('/api/user/payments/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  req.rawBody = req.body.toString('utf8');
  req.body = JSON.parse(req.rawBody);
  next();
});

// NOW add your regular body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

### 3. Configure Razorpay Webhook
1. Go to: https://dashboard.razorpay.com/app/webhooks
2. Click "Add New Webhook"
3. URL: `https://yourdomain.com/api/user/payments/webhook` (use ngrok for local testing)
4. Events: Select `payment.captured` and `payment.failed`
5. Copy webhook secret and add to `.env`

### 4. Test Payment Flow
```bash
# Start backend
cd backend
npm start

# Test endpoints
curl -X POST http://localhost:5000/api/user/payments/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"orderId": "64abc123..."}'
```

### 5. Frontend Integration
Copy `frontend-integration.example.jsx` to your components folder and use:

```jsx
import PaymentButton from '@/components/PaymentButton';

<PaymentButton orderId={order._id} orderAmount={order.totalAmount} />
```

## 📝 API Endpoints

### Create Payment
```javascript
POST /api/user/payments/create
Body: { orderId: "64abc123..." }
Response: { razorpayOrderId, amount, currency }
```

### Verify Payment
```javascript
POST /api/user/payments/verify
Body: {
  razorpay_order_id: "order_xxx",
  razorpay_payment_id: "pay_xxx",
  razorpay_signature: "abc123..."
}
```

### Get Payment
```javascript
GET /api/user/payments/:paymentId
```

### List Payments
```javascript
GET /api/user/payments?page=1&limit=10&status=paid
```

## 🧪 Testing

### Test Cards (Razorpay Test Mode)
- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date

### Test Webhook Locally
```bash
# 1. Install ngrok
npm install -g ngrok

# 2. Expose localhost
ngrok http 5000

# 3. Configure ngrok URL in Razorpay dashboard
https://abc123.ngrok.io/api/user/payments/webhook

# 4. Make a test payment and check logs
```

## ⚠️ Common Issues

### Issue: "Invalid signature"
**Solution**: Check RAZORPAY_KEY_SECRET is correct in .env

### Issue: "Webhook not received"
**Solution**: 
1. Verify webhook URL in Razorpay dashboard
2. Check RAZORPAY_WEBHOOK_SECRET in .env
3. Ensure raw body middleware is before express.json()

### Issue: "Order not found"
**Solution**: Create an order first before creating payment

### Issue: "Payment already processed"
**Solution**: This is normal - idempotency is working correctly

## 📚 File Structure

```
backend/modules/user/payments/
├── routes.js                  # Start here - see all endpoints
├── service.js                 # Business logic
├── validator.js               # Request validation
├── razorpay.client.js         # Razorpay SDK wrapper
├── README.md                  # Full documentation
├── QUICK_START.md            # This file
└── frontend-integration.example.jsx  # React example
```

## 🔗 Resources

- **Full Documentation**: See `README.md`
- **Implementation Summary**: See `IMPLEMENTATION_SUMMARY.md`
- **Frontend Example**: See `frontend-integration.example.jsx`
- **Webhook Setup**: See `webhook-setup.example.js`

## ✅ Production Checklist

Before going live:
- [ ] Switch to live Razorpay keys (not test keys)
- [ ] Configure production webhook URL (with HTTPS)
- [ ] Test end-to-end payment flow
- [ ] Test webhook delivery
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure payment retry logic
- [ ] Test refund flow
- [ ] Document manual reconciliation process

## 🎯 Next Steps

1. Read `README.md` for complete documentation
2. Test payment flow with test cards
3. Integrate frontend using example component
4. Configure webhooks for production
5. Set up monitoring and alerts

## 💡 Pro Tips

- Always use backend-calculated amounts (never trust frontend)
- Verify every payment with signature check
- Monitor webhook failures
- Test idempotency thoroughly
- Log all payment events for debugging

## 🆘 Need Help?

- Check `README.md` for detailed explanations
- Review inline comments in code files
- Test with Razorpay test mode first
- Use ngrok for local webhook testing
- Check Razorpay docs: https://razorpay.com/docs/

---

**Ready to accept payments? Let's go! 🚀**
