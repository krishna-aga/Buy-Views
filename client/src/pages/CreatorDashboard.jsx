import React, { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import { MetricStrip } from "../components/ui/MetricStrip";
import { PanelHeader } from "../components/ui/PanelHeader";
import { CampaignTable } from "../components/tables/CampaignTable";
import { formatCurrency, formatNumber } from "../utils/format";

const emptyCampaignForm = {
  title: "",
  description: "",
  clipDriveUrl: "",
  budget: "",
  payoutPer1000Views: "",
  status: "active",
};

export function CreatorDashboard({ token, onError, onNotice }) {
  const [campaigns, setCampaigns] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [form, setForm] = useState(emptyCampaignForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCampaigns = async () => {
    const payload = await apiRequest("/campaigns/my", { token });
    setCampaigns(payload.campaigns || []);
    setAnalytics(payload.analytics || null);
  };

  useEffect(() => {
    loadCampaigns()
      .catch((loadError) => onError(loadError.message))
      .finally(() => setIsLoading(false));
  }, []);

  const updateForm = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const createCampaign = async (event) => {
    event.preventDefault();
    onError("");
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
      await loadCampaigns();
    } catch (createError) {
      onError(createError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
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
          <button className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create campaign"}
          </button>
        </form>
      </section>

      <section className="space-y-6">
        <MetricStrip
          items={[
            ["Campaigns", analytics?.totalCampaigns],
            ["Spend", formatCurrency(analytics?.totalSpend)],
            ["Views", formatNumber(analytics?.totalViews)],
            ["Submissions", analytics?.totalSubmissions],
          ]}
        />
        <CampaignTable campaigns={campaigns} isLoading={isLoading} />
      </section>
    </div>
  );
}
