import React, { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import { MetricStrip } from "../components/ui/MetricStrip";
import { PanelHeader } from "../components/ui/PanelHeader";
import { CampaignTable } from "../components/tables/CampaignTable";
import { CreatorWalletPanel } from "../components/wallet/CreatorWalletPanel";
import { formatCurrency, formatNumber } from "../utils/format";

const emptyCampaignForm = {
  title: "",
  description: "",
  clipDriveUrl: "",
  budget: "",
  payoutPer1000Views: "",
  status: "active",
};

export function CreatorDashboard({ token, user, onError, onNotice }) {
  const [campaigns, setCampaigns] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [form, setForm] = useState(emptyCampaignForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const budgetAmount = Number(form.budget) || 0;
  const walletBalance = Number(wallet?.walletBalance) || 0;
  const depositShortfall = Math.max(0, budgetAmount - walletBalance);
  const hasInsufficientBalance = budgetAmount > 0 && depositShortfall > 0;

  const loadCreatorData = async () => {
    const [campaignPayload, walletPayload] = await Promise.all([
      apiRequest("/campaigns/my", { token }),
      apiRequest("/wallet", { token }),
    ]);

    setCampaigns(campaignPayload.campaigns || []);
    setAnalytics(campaignPayload.analytics || null);
    setWallet(walletPayload.wallet || null);
  };

  useEffect(() => {
    loadCreatorData()
      .catch((loadError) => onError(loadError.message))
      .finally(() => setIsLoading(false));
  }, []);

  const updateForm = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const createCampaign = async (event) => {
    event.preventDefault();
    onError("");

    if (hasInsufficientBalance) {
      onError(
        `Add ${formatCurrency(depositShortfall)} to your wallet before creating this campaign.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest("/campaigns", {
        token,
        method: "POST",
        body: {
          ...form,
          budget: Number(form.budget),
          payoutPer1000Views: Number(form.payoutPer1000Views),
        },
      });
      setForm(emptyCampaignForm);
      onNotice("Campaign created.");
      await loadCreatorData();
    } catch (createError) {
      onError(createError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section className="space-y-6">
        <CreatorWalletPanel
          token={token}
          user={user}
          wallet={wallet}
          onError={onError}
          onNotice={onNotice}
          onPaymentComplete={(nextWallet) => setWallet(nextWallet)}
          suggestedAmount={depositShortfall}
        />
        <section className="panel h-fit">
          <PanelHeader
            title="Create campaign"
            description="Lock budget and publish clips for promoter distribution."
          />
          <form className="space-y-4" onSubmit={createCampaign}>
            <label className="field">
              <span>Title</span>
              <input name="title" value={form.title} onChange={updateForm} required />
            </label>
            <label className="field">
              <span>Description</span>
              <textarea
                name="description"
                rows={3}
                value={form.description}
                onChange={updateForm}
              />
            </label>
            <label className="field">
              <span>Google Drive clip URL</span>
              <input
                name="clipDriveUrl"
                type="url"
                value={form.clipDriveUrl}
                onChange={updateForm}
                required
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="field">
                <span>Budget</span>
                <input
                  name="budget"
                  type="number"
                  min="1"
                  value={form.budget}
                  onChange={updateForm}
                  required
                />
              </label>
              <label className="field">
                <span>Rate per 1,000</span>
                <input
                  name="payoutPer1000Views"
                  type="number"
                  min="1"
                  value={form.payoutPer1000Views}
                  onChange={updateForm}
                  required
                />
              </label>
            </div>
            {hasInsufficientBalance && (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                Wallet balance is {formatCurrency(walletBalance)}. Add{" "}
                {formatCurrency(depositShortfall)} before this campaign budget can be locked.
              </div>
            )}
            <button className="btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting
                ? "Creating..."
                : hasInsufficientBalance
                  ? "Add money before creating"
                  : "Create campaign"}
            </button>
          </form>
        </section>
      </section>

      <section className="space-y-6">
        <MetricStrip
          items={[
            ["Wallet", formatCurrency(wallet?.walletBalance)],
            ["Campaigns", analytics?.totalCampaigns],
            ["Spend", formatCurrency(analytics?.totalSpend)],
            ["Views", formatNumber(analytics?.totalViews)],
          ]}
        />
        <CampaignTable campaigns={campaigns} isLoading={isLoading} />
      </section>
    </div>
  );
}
