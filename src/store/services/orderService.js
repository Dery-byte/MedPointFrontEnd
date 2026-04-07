// import api from "./storeApi";

import api from "../../shared/services/api";
import storeApi from "./storeApi";

/**
 * Payment service — structured for easy Paystack / Hubtel swap-in.
 *
 * To go live with Paystack:
 *   1. Set VITE_PAYSTACK_PUBLIC_KEY in your .env
 *   2. Replace initiateMomo / initiateCard with Paystack popup or redirect calls
 *
 * To go live with Hubtel:
 *   1. Set VITE_HUBTEL_CLIENT_ID and VITE_HUBTEL_CLIENT_SECRET
 *   2. Replace initiateMomo with Hubtel Collect API
 */

// ── Backend Payment API ──────────────────────────────────────────────────────

/**
 * Register a new payment transaction with the backend (Paystack server-side).
 * POST /payments/initialize
 * Returns { success, reference, accessCode, authorizationUrl }
 */
export async function initializePayment({ email, amount, callbackUrl, description }) {
  const { data } = await api.post("/payments/initialize", {
    email,
    amount,
    currency: "GHS",
    callbackUrl,
    description,
  });
  return data;
}

/**
 * Verify a completed Paystack transaction by reference.
 * GET /payments/verify/{reference}
 * Returns { success, reference, status, amount }
 */
export async function verifyPayment(reference) {
  const { data } = await api.get(`/payments/verify/${reference}`);
  return data;
}

// ── Payment Stubs ────────────────────────────────────────────────────────────

export const PaymentService = {
  /**
   * Initiate Mobile Money payment.
   * @param {{ network: string, phone: string, amount: number, reference: string }} params
   */
  async initiateMomo({ network, phone, amount, reference }) {
    // ── PAYSTACK (swap in): ───────────────────────────────────────────────────
    // const { data } = await api.post("/payments/momo", { network, phone, amount, reference });
    // return { status: data.status, reference: data.reference };

    // ── HUBTEL (swap in): ────────────────────────────────────────────────────
    // const { data } = await api.post("/payments/hubtel/collect", { network, phone, amount, reference });
    // return { status: data.status, reference: data.CheckoutId };

    // ── STUB (current): ─────────────────────────────────────────────────────
    await new Promise((r) => setTimeout(r, 1800)); // simulate network delay
    return { status: "success", reference };
  },

  /**
   * Initiate card payment.
   * @param {{ cardNumber: string, expiry: string, cvv: string, amount: number, reference: string }} params
   */
  async initiateCard({ cardNumber, expiry, cvv, amount, reference }) {
    // ── PAYSTACK (swap in): ───────────────────────────────────────────────────
    // const { data } = await api.post("/payments/card", { cardNumber, expiry, cvv, amount, reference });
    // return { status: data.status, reference: data.reference };

    // ── STUB (current): ─────────────────────────────────────────────────────
    await new Promise((r) => setTimeout(r, 2000));
    if (cardNumber.startsWith("0000")) throw new Error("Card declined. Please check your details.");
    return { status: "success", reference };
  },
};

// ── Order / Checkout ─────────────────────────────────────────────────────────

export function generateReference() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MP-${ts}-${rand}`;
}

/**
 * Submit a storefront order after payment confirmation.
 * POST /store/orders
 * Body: { customerName, phone, address, items, total, paymentMethod, paymentReference }
 */
export async function submitOrder({
  customer,
  items,
  total,
  paymentMethod,
  paymentReference,
  deliveryAddress,
}) {
  try {
    const { data } = await api.post("/store/orders", {
      customerName: customer?.name ?? "Guest",
      customerEmail: customer?.email ?? null,
      phone: customer?.phone ?? null,
      address: deliveryAddress,
      items: items.map((i) => ({
        productId: i.id,
        name: i.name,
        quantity: i.qty,
        unitPrice: i.price,
        imageUrl: i.imageUrl ?? null,
      })),
      total,
      paymentMethod,
      paymentReference,
    });
    return data;
  } catch (err) {
    // Fallback: if the store/orders endpoint doesn't exist yet,
    // try the existing mart checkout endpoint
    if (err.response?.status === 404) {
      const { data } = await api.post("/mart/checkout", {
        items: items.map((i) => ({ productId: i.id, quantity: i.qty })),
      });
      return { ...data, reference: paymentReference };
    }
    throw err;
  }
}

/**
 * Fetch storefront orders (admin view).
 * GET /store/orders
 */
export async function getStoreOrders() {
  try {
    const { data } = await api.get("/store/orders");
    return data;
  } catch {
    return [];
  }
}

/**
 * Update the status of an order (staff only).
 * PATCH /store/orders/:id/status
 */
export async function updateOrderStatus(orderId, status) {
  const { data } = await api.patch(`/store/orders/${orderId}/status`, { status });
  return data;
}

/**
 * Fetch orders for the currently authenticated customer.
 * GET /store/orders/my
 */
export async function getMyOrders() {
  try {
    const { data } = await storeApi.get("/store/orders/my");
    return data;
  } catch {
    return [];
  }
}
