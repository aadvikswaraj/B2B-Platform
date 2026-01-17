// Payment collection fee estimates for Razorpay (Standard) - public approximation
// Source: user-provided configuration. Confirm with Razorpay merchant agreement for production use.

export const RazorpayEstimate = {
  meta: {
    provider: "razorpay_estimate",
    currency: "INR",
    generated_at: "2025-10-31T20:00:00+05:30",
    notes:
      "These values are estimates for the Razorpay 'Standard' offering. Some items (especially UPI technology fees and international/cross-border specifics) are NOT publicly broken out and should be confirmed with Razorpay sales/merchant agreement.",
  },
  contact_sales_threshold_in_inr: 500000,
  defaults: {
    gst_percent_on_fee: 18,
    refund_policy_note:
      "Original transaction fee often not reversed on refunds; confirm in merchant agreement.",
    settlement_time_days: {
      default: 2,
      cards: 2,
      upi: 1,
      international: 3,
    },
    chargeback_fee_in_inr: null,
    currency_conversion_fee_percent: null,
  },
  payment_fee_table: [
    {
      method: "card_domestic",
      display_name: "Domestic Cards (Visa/MasterCard - credit/debit)",
      platform_fee_percent: 2.0,
      mdr_percent: null,
      technology_fee_percent: null,
      gst_percent: 18,
      effective_fee_percent_including_gst: 2.36,
      settlement_time_days: 2,
      refund_consequence:
        "Original fee typically retained by gateway; refund may not return fee.",
      confirmed: false,
      notes:
        "Standard domestic card rate on public Razorpay pages. Some categories (debit vs credit) may vary slightly.",
    },
    {
      method: "card_premium",
      display_name: "Premium Instruments (Diners, Amex, Corporate cards)",
      platform_fee_percent: 3.0,
      mdr_percent: null,
      technology_fee_percent: null,
      gst_percent: 18,
      effective_fee_percent_including_gst: 3.54,
      settlement_time_days: 2,
      refund_consequence:
        "Original fee typically retained by gateway; refund may not return fee.",
      confirmed: false,
      notes:
        "Higher because of issuer/network costs; this often covers corporate and premium cards.",
    },
    {
      method: "upi",
      display_name: "UPI (P2M)",
      platform_fee_percent: 0.0,
      mdr_percent: 0.0,
      technology_fee_percent: 0.0,
      gst_percent: 18,
      effective_fee_percent_including_gst: 0.0,
      settlement_time_days: 1,
      refund_consequence:
        "Refunds processed back to payer; check whether gateway refunds any tech fees.",
      confirmed: false,
      notes:
        "Regulation mandates zero MDR for UPI; however gateway 'technology fee' may apply in some contracts—public docs do not clearly list a standalone UPI tech fee. Confirm with Razorpay.",
    },
    {
      method: "net_banking",
      display_name: "Netbanking / IMPS / NEFT",
      platform_fee_percent: 2.0,
      mdr_percent: null,
      technology_fee_percent: null,
      gst_percent: 18,
      effective_fee_percent_including_gst: 2.36,
      settlement_time_days: 2,
      refund_consequence:
        "Depends on bank/gateway flow; confirm for partial refunds.",
      confirmed: false,
      notes:
        "Some banks or specific netbanking flows may have different treatment; treat as 'standard domestic' unless contract says otherwise.",
    },
    {
      method: "wallets",
      display_name: "Payment Wallets (e.g., Paytm Wallet)",
      platform_fee_percent: 2.0,
      mdr_percent: null,
      technology_fee_percent: null,
      gst_percent: 18,
      effective_fee_percent_including_gst: 2.36,
      settlement_time_days: 2,
      refund_consequence:
        "Gateway may charge for refunds or keep original fee; check wallet provider rules.",
      confirmed: false,
      notes:
        "Wallet-specific rates can vary; some wallets have promotional zero-fee windows.",
    },
    {
      method: "international_cards",
      display_name: "International Cards / Cross-border payments",
      platform_fee_percent: 3.5,
      mdr_percent: null,
      technology_fee_percent: null,
      gst_percent: 18,
      effective_fee_percent_including_gst: 4.13,
      settlement_time_days: 3,
      refund_consequence:
        "Cross-border refunds may incur FX reconversion and possible retained fees.",
      confirmed: false,
      notes:
        "Includes an estimated extra for cross-border/FX handling. Exact percent depends on card type, issuing country and FX rules.",
    },
    {
      method: "export_receipts_money_saver",
      display_name: "Export / Money Saver (special foreign receipts)",
      platform_fee_percent: 1.0,
      mdr_percent: null,
      technology_fee_percent: null,
      gst_percent: 0,
      effective_fee_percent_including_gst: 1.0,
      settlement_time_days: 3,
      refund_consequence:
        "Check product T&Cs—GST and FX treatment may differ.",
      confirmed: false,
      notes:
        "Some Razorpay export products advertise lower fees (example: money-saver export accounts). Confirm exact eligibility and limits.",
    },
  ],
};

export default RazorpayEstimate;
