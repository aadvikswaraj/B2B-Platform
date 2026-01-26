// Payout System Mock Data
// Simulates backend logic for Payouts, Ledger, and Seller Balances

// Constants
export const EARNING_STATUS = {
  LOCKED: "LOCKED", // Return window active
  ELIGIBLE: "ELIGIBLE", // Ready for payout
  HELD: "HELD", // Admin hold
  PAID: "PAID", // Payout released
};

export const PAYOUT_STATUS = {
  PROCESSING: "PROCESSING",
  PAID: "PAID",
  FAILED: "FAILED",
};

export const LEDGER_TYPE = {
  ORDER: "ORDER",
  REFUND: "REFUND",
  PAYOUT: "PAYOUT",
  ADJUSTMENT: "ADJUSTMENT",
};

// State (In-Memory for session)
// In a real app, this would be in a DB. Here we use a global variable to persist across page navs in dev.
let MOCK_DB = global.window?.__MOCK_PAYOUT_DB__ || null;

if (!MOCK_DB) {
  MOCK_DB = initializeMockData();
  if (typeof window !== "undefined") {
    window.__MOCK_PAYOUT_DB__ = MOCK_DB;
  }
}

function initializeMockData() {
  const sellers = [
    {
      id: "seller_1",
      name: "Tech Haven Ltd",
      status: "ACTIVE",
      balance: {
        available: 15400.5,
        pending: 4200.0,
        paid: 85000.0,
        onHold: false,
      },
    },
    {
      id: "seller_2",
      name: "Global Trade Supplies",
      status: "ACTIVE",
      balance: {
        available: 0.0,
        pending: 1200.0,
        paid: 125000.0,
        onHold: true, // Specific hold
      },
    },
    {
      id: "seller_3",
      name: "EcoCraft India",
      status: "ACTIVE",
      balance: {
        available: 3200.0,
        pending: 800.0,
        paid: 10500.0,
        onHold: false,
      },
    },
  ];

  const ledger = generateLedger(sellers);
  const earnings = generateEarnings(sellers);
  const payouts = generatePayouts(sellers);

  return { sellers, ledger, earnings, payouts };
}

function generateLedger(sellers) {
  const entries = [];
  sellers.forEach((seller) => {
    // Historic Payout
    entries.push({
      id: `led_${Math.random().toString(36).substr(2, 9)}`,
      sellerId: seller.id,
      type: LEDGER_TYPE.PAYOUT,
      amount: -5000,
      description: "Weekly Payout",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), // 2 weeks ago
      referenceId: `pay_${Math.random().toString(36).substr(2, 9)}`,
    });

    // Recent Order
    entries.push({
      id: `led_${Math.random().toString(36).substr(2, 9)}`,
      sellerId: seller.id,
      type: LEDGER_TYPE.ORDER,
      amount: 1200.5,
      description: "Order #ORD-2024-001 Earnings",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
      referenceId: "ORD-2024-001",
    });

    // Refund Adjustment (Negative)
    if (seller.id === "seller_1") {
      entries.push({
        id: `led_${Math.random().toString(36).substr(2, 9)}`,
        sellerId: seller.id,
        type: LEDGER_TYPE.REFUND,
        amount: -200.0,
        description: "Refund for Order #ORD-2024-005",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        referenceId: "ORD-2024-005",
      });
    }
  });
  return entries.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function generateEarnings(sellers) {
  const earnings = [];
  sellers.forEach((seller) => {
    // Locked
    earnings.push({
      id: `earn_${Math.random().toString(36).substr(2, 9)}`,
      sellerId: seller.id,
      orderId: "ORD-2025-X01",
      grossAmount: 5000,
      platformFee: 500,
      netAmount: 4500,
      status: EARNING_STATUS.LOCKED,
      eligibleAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days future
      createdAt: new Date().toISOString(),
    });
    // Eligible
    earnings.push({
      id: `earn_${Math.random().toString(36).substr(2, 9)}`,
      sellerId: seller.id,
      orderId: "ORD-2025-X02",
      grossAmount: 2000,
      platformFee: 200,
      netAmount: 1800,
      status: EARNING_STATUS.ELIGIBLE,
      eligibleAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Yesterday
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    });
  });
  return earnings;
}

function generatePayouts(sellers) {
  const payouts = [];
  sellers.forEach((seller) => {
    payouts.push({
      id: `pay_${Math.random().toString(36).substr(2, 9)}`,
      sellerId: seller.id,
      amount: 5000,
      status: PAYOUT_STATUS.PAID,
      releasedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
      transactionRef: "TXN_MOCK_12345",
    });
  });
  return payouts;
}

// --------------------------------------------------
// API ACTIONS
// --------------------------------------------------

export const PayoutService = {
  // SELLER METHODS
  getSellerSummary: async (sellerId) => {
    await delay(600);
    const seller = MOCK_DB.sellers.find((s) => s.id === sellerId);
    if (!seller) throw new Error("Seller not found");
    return seller.balance;
  },

  getSellerEarnings: async (sellerId) => {
    await delay(800);
    return MOCK_DB.earnings.filter((e) => e.sellerId === sellerId);
  },

  getSellerPayouts: async (sellerId) => {
    await delay(700);
    return MOCK_DB.payouts
      .filter((p) => p.sellerId === sellerId)
      .sort((a, b) => new Date(b.releasedAt) - new Date(a.releasedAt));
  },

  // ADMIN METHODS
  getAllSellerBalances: async () => {
    await delay(500);
    return MOCK_DB.sellers.map((s) => ({
      ...s,
      lastPayout:
        MOCK_DB.payouts.find((p) => p.sellerId === s.id)?.releasedAt || null,
    }));
  },

  getSellerLedger: async (sellerId) => {
    await delay(600);
    return MOCK_DB.ledger.filter((l) => l.sellerId === sellerId);
  },

  toggleSellerHold: async (sellerId, shouldHold) => {
    await delay(1000);
    const seller = MOCK_DB.sellers.find((s) => s.id === sellerId);
    if (seller) {
      seller.balance.onHold = shouldHold;
      // In a real app we'd add an audit log here
    }
    return true;
  },

  createPayoutBatch: async (sellerId, earningIds) => {
    await delay(1500);
    const seller = MOCK_DB.sellers.find((s) => s.id === sellerId);
    if (!seller) throw new Error("Seller not found");

    // Calculate total
    const earningsToPay = MOCK_DB.earnings.filter(
      (e) =>
        earningIds.includes(e.id) &&
        e.sellerId === sellerId &&
        e.status === EARNING_STATUS.ELIGIBLE,
    );
    if (earningsToPay.length === 0)
      throw new Error("No eligible earnings selected");

    const totalAmount = earningsToPay.reduce((sum, e) => sum + e.netAmount, 0);

    // Create Payout
    const newPayout = {
      id: `pay_${Math.random().toString(36).substr(2, 9)}`,
      sellerId: sellerId,
      amount: totalAmount,
      status: PAYOUT_STATUS.PAID, // Auto-paid in mock
      releasedAt: new Date().toISOString(),
      transactionRef: `TXN_MOCK_${Date.now()}`,
    };

    MOCK_DB.payouts.unshift(newPayout);

    // Update Earnings Status
    earningsToPay.forEach((e) => (e.status = EARNING_STATUS.PAID));

    // Update Ledger
    MOCK_DB.ledger.unshift({
      id: `led_${Math.random().toString(36).substr(2, 9)}`,
      sellerId: sellerId,
      type: LEDGER_TYPE.PAYOUT,
      amount: -totalAmount,
      description: `Payout ${newPayout.id}`,
      date: new Date().toISOString(),
      referenceId: newPayout.id,
    });

    // Update Balance
    seller.balance.available -= totalAmount;
    seller.balance.paid += totalAmount;

    return newPayout;
  },
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
