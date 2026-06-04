import React from "react";
import { formatCurrency, formatNumber } from "../../utils/format";
import { PanelHeader } from "../ui/PanelHeader";
import { Table } from "../ui/Table";

export function AvailableCampaigns({ campaigns, isLoading, onSelect, youtubeReady, onConnect }) {
  return (
    <section className="panel">
      <PanelHeader
        title="Available campaigns"
        description="Active creator campaigns available for YouTube Shorts promotion."
      />
      <Table
        isLoading={isLoading}
        emptyText="No active campaigns available."
        headers={["Campaign", "Budget left", "Views", "Rate", "Action"]}
        rows={campaigns.map((campaign) => [
          <div>
            <p className="font-black text-stone-950">{campaign.title}</p>
            <a
              className="text-xs font-black text-[#9b4f2e] underline-offset-4 hover:underline"
              href={campaign.clipDriveUrl}
              rel="noreferrer"
              target="_blank"
            >
              Open clip
            </a>
          </div>,
          formatCurrency(campaign.remainingBudget),
          formatNumber(campaign.totalViews),
          formatCurrency(campaign.payoutPer1000Views),
          <button
            className="btn-secondary py-1.5 text-xs"
            onClick={() => (youtubeReady ? onSelect(campaign._id) : onConnect())}
            type="button"
          >
            {youtubeReady ? "Prepare submission" : "Connect YouTube"}
          </button>,
        ])}
      />
    </section>
  );
}
