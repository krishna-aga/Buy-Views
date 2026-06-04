import React, { useState } from "react";
import { apiRequest } from "../../lib/api";
import { formatCurrency } from "../../utils/format";
import { PanelHeader } from "../ui/PanelHeader";

export function WithdrawalRequestPanel({
  token,
  wallet,
  onError,
  onNotice,
  onWithdrawalCreated,
}) {
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const withdrawableBalance = Number(wallet?.withdrawableBalance || 0);
  const canWithdraw = withdrawableBalance > 0;

  const createWithdrawal = async (event) => {
    event.preventDefault();
    onError("");
    setIsSubmitting(true);

    try {
      await apiRequest("/withdrawals", {
        token,
        method: "POST",
        body: { amount: Number(amount) },
      });

      setAmount("");
      onNotice("Withdrawal request created. Admin approval will simulate a successful payout.");
      await onWithdrawalCreated();
    } catch (withdrawalError) {
      onError(withdrawalError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="panel">
      <PanelHeader
        title="Request withdrawal"
        description="Admin approval simulates a successful payout for test mode demonstration."
      />
      <div className="rounded-3xl border border-stone-950/10 bg-white/65 p-4 text-sm">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">Withdrawable balance</p>
        <p className="mt-2 font-display text-3xl text-stone-950">
          {formatCurrency(withdrawableBalance)}
        </p>
      </div>
      <form className="mt-4 space-y-4" onSubmit={createWithdrawal}>
        <label className="field">
          <span>Amount</span>
          <input
            disabled={!canWithdraw}
            max={withdrawableBalance || undefined}
            min="1"
            name="amount"
            onChange={(event) => setAmount(event.target.value)}
            required
            type="number"
            value={amount}
          />
        </label>
        <button className="btn-primary w-full" disabled={!canWithdraw || isSubmitting}>
          {isSubmitting ? "Creating..." : "Request withdrawal"}
        </button>
      </form>
    </section>
  );
}
