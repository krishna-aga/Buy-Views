import React, { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";
import { PanelHeader } from "../ui/PanelHeader";

const emptyForm = {
  accountType: "vpa",
  accountHolderName: "",
  phone: "",
  accountNumber: "",
  ifscCode: "",
  upiId: "",
};

export function PayoutAccountPanel({ token, payoutAccount, onAccountSaved, onError, onNotice }) {
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!payoutAccount) return;

    setForm((current) => ({
      ...current,
      accountType: payoutAccount.accountType || "vpa",
      accountHolderName: payoutAccount.accountHolderName || "",
      phone: payoutAccount.phone || "",
      ifscCode: payoutAccount.ifscCode || "",
      upiId: payoutAccount.upiId || "",
      accountNumber: "",
    }));
  }, [payoutAccount]);

  const updateForm = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const saveAccount = async (event) => {
    event.preventDefault();
    onError("");
    setIsSaving(true);

    try {
      const payload = await apiRequest("/payout-account", {
        token,
        method: "PUT",
        body: form,
      });

      onAccountSaved(payload.payoutAccount);
      onNotice("Payout account saved.");
    } catch (saveError) {
      onError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="panel">
      <PanelHeader
        title="Payout account"
        description="Required before creating a withdrawal request."
      />
      {payoutAccount && (
        <div className="mb-4 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
          <p className="font-medium text-gray-950">
            {payoutAccount.accountType === "vpa" ? "UPI payout account" : "Bank payout account"}
          </p>
          <p className="mt-1">
            {payoutAccount.accountType === "vpa"
              ? payoutAccount.upiId
              : `${payoutAccount.accountNumberMasked} · ${payoutAccount.ifscCode}`}
          </p>
        </div>
      )}
      <form className="space-y-4" onSubmit={saveAccount}>
        <label className="field">
          <span>Payout method</span>
          <select name="accountType" value={form.accountType} onChange={updateForm}>
            <option value="vpa">UPI ID</option>
            <option value="bank_account">Bank account</option>
          </select>
        </label>
        <label className="field">
          <span>Account holder name</span>
          <input name="accountHolderName" value={form.accountHolderName} onChange={updateForm} required />
        </label>
        <label className="field">
          <span>Phone</span>
          <input
            name="phone"
            maxLength={10}
            pattern="[0-9]{10}"
            value={form.phone}
            onChange={updateForm}
            required
          />
        </label>
        {form.accountType === "vpa" ? (
          <label className="field">
            <span>UPI ID</span>
            <input name="upiId" placeholder="name@upi" value={form.upiId} onChange={updateForm} required />
          </label>
        ) : (
          <div className="space-y-4">
            <label className="field">
              <span>Account number</span>
              <input name="accountNumber" value={form.accountNumber} onChange={updateForm} required />
            </label>
            <label className="field">
              <span>IFSC code</span>
              <input name="ifscCode" value={form.ifscCode} onChange={updateForm} required />
            </label>
          </div>
        )}
        <button className="btn-secondary w-full" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save payout account"}
        </button>
      </form>
    </section>
  );
}
