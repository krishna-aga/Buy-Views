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
    <div className="space-y-6">
      <section className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        <div className="panel-ink relative overflow-hidden">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#f4c06f]/20 blur-3xl" />
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#f4c06f]">Creator desk</p>
          <h2 className="relative mt-4 font-display text-5xl leading-none sm:text-6xl">
            Launch the next clip economy.
          </h2>
          <p className="relative mt-4 max-w-2xl text-sm leading-7 text-stone-300">
            Lock campaign budgets, publish clip links, and watch spend turn into verified YouTube
            Shorts traction.
          </p>
          <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["01", "Fund wallet"],
              ["02", "Lock budget"],
              ["03", "Track Shorts"],
            ].map(([step, label]) => (
              <div className="rounded-3xl border border-stone-50/10 bg-stone-50/10 p-4" key={step}>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#f4c06f]">{step}</p>
                <p className="mt-2 text-sm font-black text-stone-100">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <CreatorWalletPanel
          token={token}
          user={user}
          wallet={wallet}
          onError={onError}
          onNotice={onNotice}
          onPaymentComplete={(nextWallet) => setWallet(nextWallet)}
          suggestedAmount={depositShortfall}
        />
      </section>

      <MetricStrip
        items={[
          ["Wallet", formatCurrency(wallet?.walletBalance)],
          ["Campaigns", analytics?.totalCampaigns],
          ["Spend", formatCurrency(analytics?.totalSpend)],
          ["Views", formatNumber(analytics?.totalViews)],
        ]}
      />

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.35fr]">
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
              <div className="rounded-2xl border border-amber-900/10 bg-amber-100 px-4 py-3 text-sm text-amber-950">
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
        <CampaignTable campaigns={campaigns} isLoading={isLoading} />
      </section>
    </div>
  );
}
