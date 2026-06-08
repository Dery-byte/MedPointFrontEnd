import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../../shared/components/Icon";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { useConfig } from "../../config/ConfigContext";
import { PaymentService, submitOrder, generateReference, initializePayment, verifyPayment, verifyPaymentOtp } from "../services/orderService";

// ── Config ───────────────────────────────────────────────────────────────────
const PAYSTACK_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "pk_test_DUMMY_KEY_REPLACE_ME";

function fmt(n) { return `GH₵ ${Number(n).toFixed(2)}`; }

// ── Constants ─────────────────────────────────────────────────────────────────
const MOMO_NETWORKS = [
  { id: "mtn",        label: "MTN MoMo",     color: "#FFCC00", text: "#1a1100" },
  { id: "vodafone",   label: "Vodafone Cash", color: "#E60000", text: "#fff"   },
  { id: "airteltigo", label: "AirtelTigo",   color: "#EF4444", text: "#fff"   },
];

const DELIVERY_OPTIONS = [
  { id: "standard", label: "Standard delivery",     desc: "2 – 3 business days",                    fee: 10 },
  { id: "express",  label: "Express delivery",      desc: "Same day / next day",                    fee: 25 },
  { id: "pickup",   label: "Pick up at warehouse",  desc: "Collect from our store — no charge",     fee: 0  },
];

const WAREHOUSE_ADDRESS = "MedPoint Store, Accra — Collect at front desk";

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatCard(val) {
  return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(val) {
  const d = val.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
}

const EMAIL_RE = /\S+@\S+\.\S+/;

const PROMO_CODES_KEY = "medpoint_promo_codes";
function loadActiveCodes() {
  try {
    const codes = JSON.parse(localStorage.getItem(PROMO_CODES_KEY) || "[]");
    const now = Date.now();
    return codes.filter(c => c.active && (!c.expiresAt || new Date(c.expiresAt).getTime() > now));
  } catch { return []; }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Checkout() {
  const { items, total, clear } = useCart();
  const { state: authState }    = useAuth();
  const { customer }            = authState;
  const { toast }               = useToast();
  const navigate                = useNavigate();
  const { config, fmt: configFmt } = useConfig();
  const gateway = config.paymentGateway || "paystack";
  const gatewayLabel = gateway === "moolre" ? "Moolre" : "Paystack";

  // ── Step 1 fields ──────────────────────────────────────────────────────────
  const [name,         setName]         = useState(customer?.name  || "");
  const [email,        setEmail]        = useState(customer?.email || "");
  const [phone,        setPhone]        = useState(customer?.phone || "");
  const [address,      setAddress]      = useState("");
  const [notes,        setNotes]        = useState("");
  const [deliveryType, setDeliveryType] = useState("standard");

  // ── Step 2 fields ──────────────────────────────────────────────────────────
  const [payMethod,    setPayMethod]    = useState("online");
  const [momoNetwork,  setMomoNetwork]  = useState("mtn");
  const [momoPhone,    setMomoPhone]    = useState("");
  const [cardNumber,   setCardNumber]   = useState("");
  const [cardExpiry,   setCardExpiry]   = useState("");
  const [cardCvv,      setCardCvv]      = useState("");
  const [cardName,     setCardName]     = useState("");
  const [promoCode,    setPromoCode]    = useState("");
  const [promoApplied, setPromoApplied] = useState(null);
  const [promoError,   setPromoError]   = useState("");

  // ── UI state ──────────────────────────────────────────────────────────────
  const [step,       setStep]      = useState(1);
  const [processing, setProcessing] = useState(false);
  const [errors,     setErrors]     = useState({});
  const [summaryOpen,setSummaryOpen] = useState(false);
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpInternalRef, setOtpInternalRef] = useState("");
  const [otpProviderRef, setOtpProviderRef] = useState("");
  const [otpVal,      setOtpVal]      = useState("");
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [waitingForPayment, setWaitingForPayment] = useState(false);
  const [pollAttempts, setPollAttempts] = useState(0);

  // ── Pricing ───────────────────────────────────────────────────────────────
  const isPickup         = deliveryType === "pickup";
  const selectedDelivery = DELIVERY_OPTIONS.find(d => d.id === deliveryType);
  const baseFee          = isPickup ? 0 : (total >= 200 ? 0 : selectedDelivery.fee);
  const promoDiscount    = promoApplied
    ? promoApplied.type === "percent"
      ? Math.round(total * promoApplied.value / 100 * 100) / 100
      : Math.min(promoApplied.value, total)
    : 0;
  const grandTotal = total - promoDiscount + baseFee;

  // ── Real-time step validity (for button disable) ──────────────────────────
  const step1Valid = Boolean(
    name.trim() &&
    phone.trim() &&
    (isPickup || address.trim()) &&
    (!email.trim() || EMAIL_RE.test(email))
  );

  const step2Valid = (() => {
    if (processing) return false;
    if (payMethod === "online")   return true;
    if (payMethod === "momo")     return momoPhone.replace(/\D/g, "").length >= 10;
    // card
    return (
      cardNumber.replace(/\s/g, "").length === 16 &&
      cardExpiry.length === 5 &&
      cardCvv.length >= 3 &&
      cardName.trim().length > 0
    );
  })();

  // ── Empty cart guard ──────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <main className="container" style={{ paddingTop: "4rem" }}>
        <div className="empty-state empty-state-page">
          <Icon name="shopping-bag" size={52} color="var(--muted)" />
          <h2>Nothing to checkout</h2>
          <Link to="/shop" className="btn-primary">Shop now</Link>
        </div>
      </main>
    );
  }

  // ── Validation ────────────────────────────────────────────────────────────
  const validateStep1 = () => {
    const e = {};
    if (!name.trim())  e.name  = "Full name is required";
    if (!phone.trim()) e.phone = "Phone number is required";
    if (email && !EMAIL_RE.test(email)) e.email = "Invalid email address";
    if (!isPickup && !address.trim())   e.address = "Delivery address is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePayment = () => {
    if (payMethod === "online") return true; // popup handles it
    const e = {};
    if (payMethod === "momo") {
      if (momoPhone.replace(/\D/g, "").length < 10)
        e.momoPhone = "Enter a valid 10-digit phone number";
    } else {
      if (cardNumber.replace(/\s/g, "").length < 16) e.cardNumber = "Enter a valid card number";
      if (!cardExpiry || cardExpiry.length < 5)       e.cardExpiry = "Enter expiry (MM/YY)";
      if (!cardCvv || cardCvv.length < 3)             e.cardCvv    = "Enter CVV";
      if (!cardName.trim())                           e.cardName   = "Enter name on card";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Promo ─────────────────────────────────────────────────────────────────
  const applyPromo = () => {
    setPromoError("");
    const key = promoCode.trim().toUpperCase();
    if (!key) { setPromoError("Enter a promo code"); return; }
    if (promoApplied?.code === key) { setPromoError("Already applied"); return; }
    const codes = loadActiveCodes();
    const match = codes.find(c => c.code === key);
    if (!match) { setPromoError("Invalid or expired promo code"); return; }
    if (match.minOrder && total < match.minOrder) {
      setPromoError(`Minimum order of GH₵ ${match.minOrder} required`); return;
    }
    setPromoApplied({ code: match.code, type: match.type, value: match.value });
    const label = match.type === "percent" ? `${match.value}% off` : `GH₵ ${match.value} off`;
    toast({ message: `Promo applied — ${label}!`, type: "success" });
  };
  const removePromo = () => { setPromoApplied(null); setPromoCode(""); setPromoError(""); };

  // ── Payment helpers ───────────────────────────────────────────────────────
  const deliveryAddress = isPickup ? "Warehouse Pickup" : address;

  /** Finalise order after payment is confirmed */
  async function finaliseOrder(paymentMethod, paymentReference) {
    await submitOrder({
      customer: { name, email, phone },
      items,
      total: grandTotal,
      paymentMethod,
      paymentReference,
      deliveryAddress,
    });
    clear();
    navigate("/order-confirmation", {
      state: { reference: paymentReference, total: grandTotal, items, payMethod, name },
      replace: true,
    });
  }

  /** Online redirect flow — calls backend to initialize, then redirects to gateway */
  async function handleOnlinePay() {
    const billingEmail = email.trim() || `${phone.replace(/\D/g, "")}@medpointstore.com`;
    setProcessing(true);
    try {
      // 1. Register payment server-side → get authorizationUrl + reference
      const init = await initializePayment({
        email:       billingEmail,
        amount:      grandTotal,
        description: `MedPoint order — ${name}`,
        phone:       phone, 
      });

      // 2. Persist full order snapshot 
      localStorage.setItem(`pending_order_${init.reference}`, JSON.stringify({
        name, email: billingEmail, phone, deliveryAddress, items, grandTotal, payMethod: gateway.toUpperCase(),
      }));

      // 3. Redirect browser to hosted checkout
      window.location.href = init.authorizationUrl;
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.message?.startsWith("OTP_REQUIRED:")) {
        const parts = errorData.message.split(":");
        setOtpInternalRef(parts[1]);
        setOtpProviderRef(parts[2] === "null" ? null : parts[2]);
        setOtpRequired(true);
        setProcessing(false);
        return;
      }
      setProcessing(false);
      toast({ message: errorData?.message || err.message || `Could not open ${gatewayLabel} payment page. Please try again.`, type: "error" });
    }
  }

  async function handleVerifyOtp() {
    setOtpVerifying(true);
    const billingEmail = email.trim() || `${phone.replace(/\D/g, "")}@medpointstore.com`;
    try {
      const res = await verifyPaymentOtp({
        email: billingEmail,
        amount: grandTotal,
        phone: phone,
        otpCode: otpVal,
        providerReference: otpProviderRef,
        reference: otpInternalRef,
      });

      if (res.message === "PROMPT_TRIGGERED") {
        toast({ message: "Verification successful! Please authorize on your phone.", type: "success" });
        setOtpRequired(false);
        setWaitingForPayment(true);
        setOtpVal("");
        // Automatic polling removed at user request
      } else if (res.message.startsWith("OTP_VERIFIED:")) {
         const finalRes = await initializePayment({
           email: billingEmail,
           amount: grandTotal,
           phone: phone,
           providerReference: otpProviderRef,
           reference: otpInternalRef
         });
         if (finalRes.message === "PROMPT_TRIGGERED") {
           toast({ message: "Verification successful! Please authorize on your phone.", type: "success" });
           setOtpRequired(false);
           setWaitingForPayment(true);
           setOtpVal("");
           // Automatic polling removed at user request
         } else {
           throw new Error(finalRes.message || "Failed to trigger payment prompt");
         }
      }
    } catch (err) {
      toast({ message: err.response?.data?.message || err.message || "OTP verification failed", type: "error" });
    } finally {
      setOtpVerifying(false);
    }
  }

  async function handleCheckStatus() {
    setOtpVerifying(true); // Reuse verifying state for loading spinner on button
    try {
      const status = await verifyPayment(otpInternalRef);
      if (status.message?.toLowerCase().includes("success") || status.status?.toLowerCase() === "success" || status.code === "TS00") {
        toast({ message: "Payment confirmed! Finishing your order...", type: "success" });
        await finaliseOrder(gateway.toUpperCase(), otpInternalRef);
      } else if (status.message?.toLowerCase().includes("fail") || status.code === "TF00") {
        toast({ message: "Payment not yet confirmed. Please authorize on your phone first.", type: "warning" });
      } else {
        toast({ message: "Payment still pending. Please authorize on your phone and try again.", type: "info" });
      }
    } catch (err) {
      toast({ message: "Error checking status. Please try again.", type: "error" });
    } finally {
      setOtpVerifying(false);
    }
  }

  /** MoMo / Card stub flow */
  async function handleManualPay() {
    if (!validatePayment()) return;
    setProcessing(true);
    const reference = generateReference();
    try {
      let payResult;
      if (payMethod === "momo") {
        payResult = await PaymentService.initiateMomo({
          network: momoNetwork, phone: momoPhone, amount: grandTotal, reference,
        });
      } else {
        payResult = await PaymentService.initiateCard({
          cardNumber: cardNumber.replace(/\s/g, ""), expiry: cardExpiry,
          cvv: cardCvv, amount: grandTotal, reference,
        });
      }
      if (payResult.status !== "success") throw new Error("Payment was not successful.");
      const method = payMethod === "momo" ? momoNetwork.toUpperCase() : "CARD";
      await finaliseOrder(method, payResult.reference || reference);
    } catch (err) {
      toast({ message: err.message || "Payment failed. Please try again.", type: "error" });
    } finally {
      setProcessing(false);
    }
  }

  function handlePay() {
    if (payMethod === "online") { handleOnlinePay(); return; }
    handleManualPay();
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <main className="container checkout-page">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Checkout</h1>
          <p className="page-sub">Complete your order</p>
        </div>
        <Link to="/cart" className="btn-outline btn-sm">
          <Icon name="arrow-left" size={14} /> Back to cart
        </Link>
      </div>

      {/* Progress steps */}
      <div className="checkout-steps">
        <div className={`checkout-step${step >= 1 ? " checkout-step-done" : ""}`}>
          <div className="checkout-step-num">
            {step > 1 ? <Icon name="check" size={14} /> : "1"}
          </div>
          <span>Delivery details</span>
        </div>
        <div className="checkout-step-line" />
        <div className={`checkout-step${step >= 2 ? " checkout-step-done" : ""}`}>
          <div className="checkout-step-num">2</div>
          <span>Payment</span>
        </div>
      </div>

      <div className="checkout-layout">

        {/* ── Left: forms ───────────────────────────────────────────────── */}
        <div className="checkout-form-col">

          {/* ══ STEP 1: Delivery ══════════════════════════════════════════ */}
          {step === 1 && (
            <div className="checkout-card">
              <h2 className="checkout-card-title">
                <Icon name="map-pin" size={18} /> Delivery details
              </h2>

              <div className="form-grid-2">
                <div className="form-field">
                  <label>Full name <span className="required">*</span></label>
                  <input
                    className={`form-input${errors.name ? " input-error" : ""}`}
                    value={name} onChange={e => { setName(e.target.value); setErrors(p => ({...p, name: ""})); }}
                    placeholder="John Mensah"
                  />
                  {errors.name && <span className="field-error">{errors.name}</span>}
                </div>
                <div className="form-field">
                  <label>Phone number <span className="required">*</span></label>
                  <input
                    className={`form-input${errors.phone ? " input-error" : ""}`}
                    value={phone} onChange={e => { setPhone(e.target.value); setErrors(p => ({...p, phone: ""})); }}
                    placeholder="0244 000 000" type="tel"
                  />
                  {errors.phone && <span className="field-error">{errors.phone}</span>}
                </div>
              </div>

              <div className="form-field">
                <label>Email address <span className="optional">(optional, for receipt)</span></label>
                <input
                  className={`form-input${errors.email ? " input-error" : ""}`}
                  value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({...p, email: ""})); }}
                  placeholder="you@email.com" type="email"
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              {/* Delivery options */}
              <div className="form-field">
                <label>Delivery option</label>
                <div className="delivery-options">
                  {DELIVERY_OPTIONS.map(opt => {
                    const isFree = opt.id === "pickup" || total >= 200;
                    const fee    = isFree ? 0 : opt.fee;
                    return (
                      <button
                        key={opt.id}
                        className={`delivery-option${deliveryType === opt.id ? " delivery-option-active" : ""}${opt.id === "pickup" ? " delivery-option-pickup" : ""}`}
                        onClick={() => { setDeliveryType(opt.id); setErrors(p => ({...p, address: ""})); }}
                        type="button"
                      >
                        <div className="delivery-option-radio">
                          {deliveryType === opt.id && <div className="delivery-option-dot" />}
                        </div>
                        <div className="delivery-option-body">
                          <div className="delivery-option-name">
                            {opt.id === "pickup" && <Icon name="store" size={13} color="currentColor" style={{ marginRight: 5 }} />}
                            {opt.label}
                          </div>
                          <div className="delivery-option-desc">{opt.desc}</div>
                        </div>
                        <div className="delivery-option-price">
                          {fee === 0 || isFree
                            ? <span className="free-tag">Free</span>
                            : fmt(fee)}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {!isPickup && total >= 200 && (
                  <p className="co-free-note" style={{ marginTop: 8 }}>
                    <Icon name="check-circle" size={13} color="var(--success)" /> Free delivery on orders above GH₵ 200
                  </p>
                )}
              </div>

              {/* Address or warehouse info */}
              {isPickup ? (
                <div className="pickup-info-box">
                  <Icon name="map-pin" size={16} color="var(--primary)" />
                  <div>
                    <p className="pickup-info-label">Pickup address</p>
                    <p className="pickup-info-addr">{WAREHOUSE_ADDRESS}</p>
                    <p className="pickup-info-hint">Bring your order reference when you arrive.</p>
                  </div>
                </div>
              ) : (
                <div className="form-field">
                  <label>Delivery address <span className="required">*</span></label>
                  <textarea
                    className={`form-input form-textarea${errors.address ? " input-error" : ""}`}
                    value={address} onChange={e => { setAddress(e.target.value); setErrors(p => ({...p, address: ""})); }}
                    placeholder="Street name, area / neighbourhood, city..." rows={3}
                  />
                  {errors.address && <span className="field-error">{errors.address}</span>}
                </div>
              )}

              {/* Order notes */}
              <div className="form-field">
                <label>Order notes <span className="optional">(optional)</span></label>
                <textarea
                  className="form-input form-textarea"
                  value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Any special instructions..." rows={2}
                />
              </div>

              <button
                className="btn-primary checkout-next-btn"
                onClick={() => { if (validateStep1()) setStep(2); }}
                type="button"
                disabled={!step1Valid}
                title={!step1Valid ? "Fill in all required fields to continue" : undefined}
              >
                Continue to payment <Icon name="arrow-right" size={16} />
              </button>
            </div>
          )}

          {/* ══ STEP 2: Payment ═══════════════════════════════════════════ */}
          {step === 2 && (
            <div className="checkout-card">
              <button className="checkout-back-btn" onClick={() => setStep(1)} type="button">
                <Icon name="arrow-left" size={15} /> Back to delivery
              </button>

              <h2 className="checkout-card-title">
                <Icon name="credit-card" size={18} /> Payment method
              </h2>

              {/* Payment tabs */}
              <div className="pay-method-tabs">
                <button
                  type="button"
                  className={`pay-method-tab${payMethod === "online" ? " pay-method-tab-active" : ""}`}
                  onClick={() => setPayMethod("online")}
                >
                  <Icon name="credit-card" size={18} />
                  <span>Pay with {gatewayLabel}</span>
                  <span className="pay-recommended-badge">Recommended</span>
                </button>
                <button
                  type="button"
                  className={`pay-method-tab${payMethod === "momo" ? " pay-method-tab-active" : ""}`}
                  onClick={() => setPayMethod("momo")}
                >
                  <Icon name="momo" size={18} />
                  <span>Mobile Money</span>
                </button>
                <button
                  type="button"
                  className={`pay-method-tab${payMethod === "card" ? " pay-method-tab-active" : ""}`}
                  onClick={() => setPayMethod("card")}
                >
                  <Icon name="credit-card" size={18} />
                  <span>Card (manual)</span>
                </button>
              </div>

              {/* ── Online Gateway ─────────────────────────────────────────────── */}
              {payMethod === "online" && (
                <div className="pay-form paystack-info-panel">
                  <div className="paystack-logo-row">
                    <div className="paystack-badge">
                      <Icon name="lock" size={14} color="var(--primary)" />
                      Secured by {gatewayLabel}
                    </div>
                  </div>
                  <p className="paystack-desc">
                    Click <strong>Pay {fmt(grandTotal)}</strong> below. A secure {gatewayLabel} page will open where you can pay with:
                  </p>
                  <ul className="paystack-methods-list">
                    <li><Icon name="credit-card" size={13} /> Debit / Credit Card</li>
                    <li><Icon name="momo" size={13} /> Mobile Money</li>
                    {gateway === "paystack" && <li><Icon name="building-2" size={13} /> Bank transfer</li>}
                  </ul>
                </div>
              )}

              {/* ── MoMo form ────────────────────────────────────────────── */}
              {payMethod === "momo" && (
                <div className="pay-form">
                  <div className="form-field">
                    <label>Select network</label>
                    <div className="momo-networks">
                      {MOMO_NETWORKS.map(n => (
                        <button
                          key={n.id} type="button"
                          className={`momo-network-btn${momoNetwork === n.id ? " momo-network-active" : ""}`}
                          onClick={() => setMomoNetwork(n.id)}
                          style={momoNetwork === n.id ? { borderColor: n.color, background: n.color + "18" } : {}}
                        >
                          <span className="momo-dot" style={{ background: n.color }} />
                          <span className="momo-network-label">{n.label}</span>
                          {momoNetwork === n.id && <Icon name="check-circle" size={15} color={n.color} style={{ marginLeft: "auto" }} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Registered MoMo number <span className="required">*</span></label>
                    <div className="phone-input-wrap">
                      <span className="phone-flag">
                        <Icon name="phone" size={15} color="var(--muted)" /> +233
                      </span>
                      <input
                        className={`form-input phone-input${errors.momoPhone ? " input-error" : ""}`}
                        value={momoPhone}
                        onChange={e => { setMomoPhone(e.target.value); setErrors(p => ({...p, momoPhone: ""})); }}
                        placeholder="0244 000 000" type="tel"
                      />
                    </div>
                    {errors.momoPhone && <span className="field-error">{errors.momoPhone}</span>}
                  </div>

                  <div className="momo-prompt">
                    <Icon name="alert" size={15} color="var(--primary)" />
                    <p>A payment prompt will be sent to your phone. Approve it to complete your order.</p>
                  </div>
                </div>
              )}

              {/* ── Card form ────────────────────────────────────────────── */}
              {payMethod === "card" && (
                <div className="pay-form">
                  <div className="form-field">
                    <label>Name on card <span className="required">*</span></label>
                    <input
                      className={`form-input${errors.cardName ? " input-error" : ""}`}
                      value={cardName}
                      onChange={e => { setCardName(e.target.value); setErrors(p => ({...p, cardName: ""})); }}
                      placeholder="JOHN MENSAH"
                    />
                    {errors.cardName && <span className="field-error">{errors.cardName}</span>}
                  </div>
                  <div className="form-field">
                    <label>Card number <span className="required">*</span></label>
                    <div className="card-input-wrap">
                      <Icon name="credit-card" size={16} color="var(--muted)" />
                      <input
                        className={`form-input card-input${errors.cardNumber ? " input-error" : ""}`}
                        value={cardNumber}
                        onChange={e => { setCardNumber(formatCard(e.target.value)); setErrors(p => ({...p, cardNumber: ""})); }}
                        placeholder="0000 0000 0000 0000" maxLength={19}
                      />
                    </div>
                    {errors.cardNumber && <span className="field-error">{errors.cardNumber}</span>}
                  </div>
                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>Expiry <span className="required">*</span></label>
                      <input
                        className={`form-input${errors.cardExpiry ? " input-error" : ""}`}
                        value={cardExpiry}
                        onChange={e => { setCardExpiry(formatExpiry(e.target.value)); setErrors(p => ({...p, cardExpiry: ""})); }}
                        placeholder="MM/YY" maxLength={5}
                      />
                      {errors.cardExpiry && <span className="field-error">{errors.cardExpiry}</span>}
                    </div>
                    <div className="form-field">
                      <label>CVV <span className="required">*</span></label>
                      <input
                        className={`form-input${errors.cardCvv ? " input-error" : ""}`}
                        value={cardCvv}
                        onChange={e => { setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4)); setErrors(p => ({...p, cardCvv: ""})); }}
                        placeholder="123" type="password" maxLength={4}
                      />
                      {errors.cardCvv && <span className="field-error">{errors.cardCvv}</span>}
                    </div>
                  </div>
                  <div className="momo-prompt">
                    <Icon name="lock" size={15} color="var(--primary)" />
                    <p>Your card details are encrypted. We never store card information.</p>
                  </div>
                </div>
              )}

              {/* Pay button */}
              <button
                className="btn-primary checkout-pay-btn"
                onClick={handlePay}
                disabled={!step2Valid || processing}
                type="button"
              >
                {processing ? (
                  <><Icon name="loader" size={18} className="spin" /> Processing payment…</>
                ) : (
                  <><Icon name="lock" size={16} /> Pay {fmt(grandTotal)}</>
                )}
              </button>

              <p className="checkout-secure-note">
                <Icon name="lock" size={12} color="var(--muted)" /> Secured &amp; encrypted checkout
              </p>

              {/* ── Moolre OTP Modal ── */}
              {otpRequired && (
                <div className="otp-modal-overlay">
                  <div className="otp-modal">
                    <h3>Verify Payment</h3>
                    <p>A verification code has been sent to <strong>{phone}</strong> via SMS. Please enter it below to proceed.</p>
                    <div className="form-field">
                      <input 
                        className="form-input text-center" 
                        value={otpVal} 
                        onChange={e => setOtpVal(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="000000"
                        style={{ fontSize: "1.5rem", letterSpacing: "0.5em", fontWeight: 700 }}
                      />
                    </div>
                    <div className="otp-modal-btns">
                      <button className="btn-outline" onClick={() => setOtpRequired(false)}>Cancel</button>
                      <button className="btn-primary" onClick={handleVerifyOtp} disabled={otpVal.length < 6 || otpVerifying}>
                        {otpVerifying ? "Verifying..." : "Confirm Code"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Payment Waiting Modal ── */}
              {waitingForPayment && (
                <div className="otp-modal-overlay">
                  <div className="otp-modal text-center">
                    <div className="mb-4">
                      <Icon name="loader" size={48} className="spin" color="var(--primary)" />
                    </div>
                    <h3>Payment Initiated</h3>
                    <p>Please authorize the payment on your mobile device.</p>
                    <p className="text-sm text-muted">Once you have entered your PIN on your phone, click the button below to confirm your order.</p>
                    
                    <div className="co-divider my-4" />
                    
                    <div className="otp-modal-btns mt-4">
                      <button 
                        className="btn-primary w-full" 
                        onClick={handleCheckStatus}
                        disabled={otpVerifying}
                      >
                        {otpVerifying ? (
                          <Icon name="loader" size={18} className="spin mr-2" />
                        ) : (
                          <Icon name="check-circle" size={18} className="mr-2" />
                        )}
                        Confirm Payment
                      </button>
                      <button 
                        className="btn-outline btn-sm mt-2" 
                        onClick={() => setWaitingForPayment(false)}
                        disabled={otpVerifying}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right: order summary ─────────────────────────────────────── */}
        <div className="checkout-summary-col">
          <div className="checkout-card">
            <div
              className="co-summary-toggle-row"
              onClick={() => setSummaryOpen(v => !v)}
              role="button"
              aria-expanded={summaryOpen}
            >
              <h3 className="checkout-card-title">
                <Icon name="clipboard-list" size={18} /> Order summary
                <span className="co-items-count">({items.length} item{items.length !== 1 ? "s" : ""})</span>
              </h3>
              <svg
                className={`co-toggle-chevron${summaryOpen ? " co-toggle-chevron-open" : ""}`}
                viewBox="0 0 24 24" width="16" height="16" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            <div className={`co-summary-body${summaryOpen ? " co-summary-visible" : ""}`}>
              <div className="co-items">
                {items.map(item => (
                  <div key={item.id} className="co-item-row">
                    <div className="co-item-info">
                      <span className="co-item-qty-badge">{item.qty}</span>
                      <span className="co-item-name">{item.name}</span>
                    </div>
                    <span className="co-item-price">{fmt(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>

              <div className="co-divider" />

              {/* Promo */}
              <div className="co-promo">
                {!promoApplied ? (
                  <>
                    <div className="co-promo-row">
                      <input
                        className="form-input co-promo-input"
                        value={promoCode}
                        onChange={e => { setPromoCode(e.target.value); setPromoError(""); }}
                        placeholder="Promo code"
                        onKeyDown={e => e.key === "Enter" && applyPromo()}
                      />
                      <button type="button" className="co-promo-btn" onClick={applyPromo}>Apply</button>
                    </div>
                    {promoError && <span className="field-error">{promoError}</span>}
                  </>
                ) : (
                  <div className="co-promo-applied">
                    <Icon name="tag" size={14} color="var(--success)" />
                    <span>
                      {promoApplied.code} — {promoApplied.type === "percent"
                        ? `${promoApplied.value}% off` : `GH₵ ${promoApplied.value} off`}
                    </span>
                    <button type="button" className="co-promo-remove" onClick={removePromo}>
                      <Icon name="x" size={13} />
                    </button>
                  </div>
                )}
              </div>

              <div className="co-divider" />

              <div className="co-summary-row">
                <span>Subtotal</span>
                <span>{fmt(total)}</span>
              </div>
              {promoApplied && (
                <div className="co-summary-row co-summary-discount">
                  <span>Discount ({promoApplied.type === "percent" ? `${promoApplied.value}%` : `GH₵ ${promoApplied.value}`})</span>
                  <span>− {fmt(promoDiscount)}</span>
                </div>
              )}
              <div className="co-summary-row">
                <span>
                  {isPickup ? "Delivery (warehouse pickup)" : `Delivery (${selectedDelivery.label})`}
                </span>
                <span>
                  {baseFee === 0
                    ? <span className="free-tag">Free</span>
                    : fmt(baseFee)}
                </span>
              </div>

              <div className="co-divider" />

              <div className="co-total-row">
                <strong>Total</strong>
                <div className="co-total-price-col">
                  {promoApplied && (
                    <span className="co-original-price">{fmt(total + baseFee)}</span>
                  )}
                  <strong className="co-grand-total">{fmt(grandTotal)}</strong>
                </div>
              </div>

              {step === 1 && (
                <div className="co-summary-cta">
                  <p className="co-summary-hint">
                    {step1Valid
                      ? <><Icon name="check-circle" size={13} color="var(--success)" /> Ready to continue to payment</>
                      : <><Icon name="alert" size={13} color="var(--muted)" /> Fill in required fields to continue</>
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Trust badges */}
          <div className="co-trust-strip">
            {[
              { icon: "lock",         text: "Secure payment"   },
              { icon: "refresh-cw",  text: "Easy returns"      },
              { icon: "check-circle",text: "Verified products" },
            ].map(t => (
              <div key={t.text} className="co-trust-item">
                <Icon name={t.icon} size={14} color="var(--primary)" />
                <span>{t.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
