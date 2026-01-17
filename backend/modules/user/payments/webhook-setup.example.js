// webhook-setup.example.js
// Add this code to your app.js BEFORE body parser middleware

/**
 * CRITICAL: Raw body capture for webhook signature verification
 * 
 * WHY: Razorpay webhook signature is computed on the RAW request body
 * - Express body parsers (express.json()) parse body into JavaScript objects
 * - Parsing changes the body, making signature verification fail
 * - We need to capture raw body before parsing
 * 
 * PLACEMENT: This middleware MUST come BEFORE express.json()
 */

// Capture raw body for webhook endpoint only
app.use('/api/user/payments/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  // Store raw body for signature verification
  req.rawBody = req.body.toString('utf8');
  
  // Parse body manually for downstream use
  try {
    req.body = JSON.parse(req.rawBody);
  } catch (error) {
    console.error('Failed to parse webhook body:', error);
    return res.status(400).json({ success: false, message: 'Invalid JSON' });
  }
  
  next();
});

// NOW add your regular body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rest of your middleware...

/**
 * ALTERNATIVE APPROACH (if above doesn't work):
 * 
 * Use a custom middleware that captures data chunks:
 */

/*
app.use('/api/user/payments/webhook', (req, res, next) => {
  let data = '';
  req.on('data', chunk => {
    data += chunk.toString();
  });
  req.on('end', () => {
    req.rawBody = data;
    try {
      req.body = JSON.parse(data);
    } catch (error) {
      return res.status(400).json({ success: false, message: 'Invalid JSON' });
    }
    next();
  });
});
*/

/**
 * TESTING WEBHOOK LOCALLY:
 * 
 * 1. Install ngrok: npm install -g ngrok
 * 2. Run: ngrok http 5000
 * 3. Copy ngrok URL (e.g., https://abc123.ngrok.io)
 * 4. Add to Razorpay dashboard: https://abc123.ngrok.io/api/user/payments/webhook
 * 5. Test payment and check logs
 */

/**
 * PRODUCTION DEPLOYMENT:
 * 
 * 1. Use your production domain: https://globomart.com/api/user/payments/webhook
 * 2. Ensure SSL is enabled (Razorpay requires HTTPS)
 * 3. Set webhook secret in production .env
 * 4. Test webhook delivery with Razorpay dashboard tool
 * 5. Monitor webhook logs for failures
 */
