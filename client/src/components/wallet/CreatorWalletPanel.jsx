import React, { useState } from "react";
import { apiRequest } from "../../lib/api";
import { formatCurrency } from "../../utils/format";
import { PanelHeader } from "../ui/PanelHeader";

const loadRazorpayCheckout = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Unable to load Razorpay Checkout"));
    document.body.appendChild(script);
  });

export function CreatorWalletPanel({
  token,
  user,
  wallet,
  onError,
  onNotice,
  onPaymentComplete,
  suggestedAmount = 0,
}) {
  const [amount, setAmount] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  const addMoney = async (event) => {
    event.preventDefault();
    onError("");
    setIsPaying(true);

    try {
      const depositAmount = Number(amount);
      const payload = await apiRequest("/wallet/create-order", {
        token,
        method: "POST",
        body: { amount: depositAmount },
      });

      await loadRazorpayCheckout();

      const checkout = new window.Razorpay({
        key: payload.order.keyId,
        amount: Math.round(payload.order.amount * 100),
        currency: payload.order.currency,
        name: "CeatorReach",
        description: "Creator wallet deposit",
        order_id: payload.order.orderId,
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#211915",
        },
        handler: async (response) => {
          try {
            const verifyPayload = await apiRequest("/wallet/verify-payment", {
              token,
              method: "POST",
              body: response,
            });

            setAmount("");
            onNotice("Wallet deposit completed.");
            onPaymentComplete(verifyPayload.wallet);
          } catch (verifyError) {
            onError(verifyError.message);
          }
        },
      });

      checkout.on("payment.failed", (response) => {
        onError(response.error?.description || "Razorpay payment failed");
      });

      checkout.open();
    } catch (paymentError) {
      onError(paymentError.message);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <section className="panel">
      <PanelHeader
        title="Creator wallet"
        description="Add money before creating campaigns. Campaign budgets are locked from this balance."
      />
      <div className="rounded-3xl border border-stone-950/10 bg-white/65 p-4">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">Wallet balance</p>
        <p className="mt-2 font-display text-4xl text-stone-950">
          {formatCurrency(wallet?.walletBalance)}
        </p>
      </div>
      {suggestedAmount > 0 && (
        <div className="mt-4 rounded-3xl border border-amber-900/10 bg-amber-100 p-4 text-sm text-amber-950">
          <p>Add {formatCurrency(suggestedAmount)} to cover the current campaign budget.</p>
          <button
            className="mt-2 text-sm font-black underline underline-offset-4"
            onClick={() => setAmount(String(suggestedAmount))}
            type="button"
          >
            Use this amount
          </button>
        </div>
      )}
      <form className="mt-4 space-y-4" onSubmit={addMoney}>
        <label className="field">
          <span>Add amount</span>
          <input
            min="1"
            max="100000"
            name="amount"
            onChange={(event) => setAmount(event.target.value)}
            placeholder="1000"
            required
            type="number"
            value={amount}
          />
        </label>
        <button className="btn-primary w-full" disabled={isPaying}>
          {isPaying ? "Opening payment..." : "Add money with Razorpay"}
        </button>
      </form>
    </section>
  );
}
