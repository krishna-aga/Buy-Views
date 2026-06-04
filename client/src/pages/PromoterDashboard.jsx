import React, { useEffect, useState } from "react";
import { apiRequest, youtubeConnectUrl } from "../lib/api";
import { MetricStrip } from "../components/ui/MetricStrip";
import { PanelHeader } from "../components/ui/PanelHeader";
import { AvailableCampaigns } from "../components/tables/AvailableCampaigns";
import { SubmissionTable } from "../components/tables/SubmissionTable";
import { WithdrawalTable } from "../components/tables/WithdrawalTable";
import { WithdrawalRequestPanel } from "../components/wallet/WithdrawalRequestPanel";
import { formatCurrency } from "../utils/format";

export function PromoterDashboard({ token, user, onError, onNotice, refreshUser }) {
  const [campaigns, setCampaigns] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [reelUrl, setReelUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const youtubeReady = Boolean(user.youtubeConnected && user.youtubeChannelId);

  const loadWorkspace = async () => {
    const [campaignPayload, submissionPayload, walletPayload, withdrawalPayload] =
      await Promise.all([
        apiRequest("/campaigns", { token }),
        apiRequest("/submissions/my", { token }),
        apiRequest("/wallet", { token }),
        apiRequest("/withdrawals/my", { token }),
      ]);

    setCampaigns(campaignPayload.campaigns || []);
    setSubmissions(submissionPayload.submissions || []);
    setWallet(walletPayload.wallet || null);
    setWithdrawals(withdrawalPayload.withdrawals || []);
  };

  useEffect(() => {
    loadWorkspace()
      .catch((loadError) => onError(loadError.message))
      .finally(() => setIsLoading(false));
  }, []);

  const connectYoutube = () => {
    onNotice("Opening Google OAuth. Complete consent to enable YouTube submissions.");
    window.location.assign(youtubeConnectUrl(token));
  };

  const submitShort = async (event) => {
    event.preventDefault();
    onError("");

    if (!youtubeReady) {
      connectYoutube();
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest("/submissions", {
        token,
        method: "POST",
        body: {
          campaignId: selectedCampaignId,
          reelUrl,
          platform: "youtube",
        },
      });
      setReelUrl("");
      setSelectedCampaignId("");
      onNotice("Submission created. YouTube ownership was verified.");
      await Promise.all([loadWorkspace(), refreshUser()]);
    } catch (submitError) {
      onError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="grid items-start gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="panel-ink relative overflow-hidden">
          <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-[#2c7a70]/25 blur-3xl" />
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#f4c06f]">Promoter bay</p>
          <h2 className="relative mt-4 font-display text-5xl leading-none sm:text-6xl">
            Pick a campaign. Ship the Short. Track the lift.
          </h2>
          <p className="relative mt-4 max-w-xl text-sm leading-7 text-stone-300">
            YouTube ownership verification keeps the workflow clean while synced views translate
            into withdrawable earnings.
          </p>
        </div>
        <section className="panel">
          <PanelHeader
            title="Submit YouTube Short"
            description="OAuth must be complete before this form can create a submission."
          />
          <form className="space-y-4" onSubmit={submitShort}>
            <label className="field">
              <span>Campaign</span>
              <select
                value={selectedCampaignId}
                onChange={(event) => setSelectedCampaignId(event.target.value)}
                required
                disabled={!youtubeReady}
              >
                <option value="">Select campaign</option>
                {campaigns.map((campaign) => (
                  <option key={campaign._id} value={campaign._id}>
                    {campaign.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>YouTube Short URL</span>
              <input
                type="url"
                placeholder="https://www.youtube.com/shorts/..."
                value={reelUrl}
                onChange={(event) => setReelUrl(event.target.value)}
                required
                disabled={!youtubeReady}
              />
            </label>
            {!youtubeReady && (
              <p className="rounded-2xl border border-amber-900/10 bg-amber-100 px-4 py-3 text-sm text-amber-950">
                Connect YouTube first. The backend rejects submissions until your channel is
                verified.
              </p>
            )}
            <button className="btn-primary w-full" disabled={isSubmitting}>
              {!youtubeReady
                ? "Connect YouTube to submit"
                : isSubmitting
                  ? "Submitting..."
                  : "Submit Short"}
            </button>
          </form>
        </section>
      </section>

      <MetricStrip
        items={[
          ["Approved earnings", formatCurrency(wallet?.approvedEarnings ?? user.approvedEarnings)],
          ["Withdrawable", formatCurrency(wallet?.withdrawableBalance ?? user.approvedEarnings)],
          ["Withdrawn", formatCurrency(wallet?.totalWithdrawn ?? user.totalWithdrawn)],
          ["YouTube", youtubeReady ? "Connected" : "Required"],
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <section className="space-y-6">
          <WithdrawalRequestPanel
            token={token}
            wallet={wallet}
            onError={onError}
            onNotice={onNotice}
            onWithdrawalCreated={loadWorkspace}
          />
          <div className="panel">
            <PanelHeader
              title="YouTube account"
              description="Required before a promoter can submit a Short."
            />
            <div className="rounded-3xl border border-stone-950/10 bg-white/60 p-4 text-sm">
              <p className="font-black text-stone-950">
                {youtubeReady ? "Connected channel" : "Not connected"}
              </p>
              <p className="mt-1 text-stone-600">
                {youtubeReady
                  ? user.youtubeChannelId
                  : "Connect YouTube so submitted Shorts can be verified against your channel."}
              </p>
            </div>
            <button className="btn-secondary mt-4 w-full" onClick={connectYoutube} type="button">
              {youtubeReady ? "Reconnect YouTube" : "Connect YouTube"}
            </button>
          </div>
        </section>

        <section className="space-y-6">
          <AvailableCampaigns
            campaigns={campaigns}
            isLoading={isLoading}
            onSelect={(campaignId) => setSelectedCampaignId(campaignId)}
            youtubeReady={youtubeReady}
            onConnect={connectYoutube}
          />
          <SubmissionTable submissions={submissions} />
          <WithdrawalTable withdrawals={withdrawals} />
        </section>
      </div>
    </div>
  );
}
