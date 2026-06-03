import React from "react";
import { formatCurrency, formatNumber } from "../../utils/format";
import { PanelHeader } from "../ui/PanelHeader";
import { StatusPill } from "../ui/StatusPill";
import { Table } from "../ui/Table";

export function CampaignTable({ campaigns, isLoading }) {
  return (
    <section className="panel">
      <PanelHeader
        title="Campaigns"
        description="Budget, spending, view volume, and payout rate by campaign."
      />
      <Table
        isLoading={isLoading}
        emptyText="No campaigns yet."
        headers={["Campaign", "Budget", "Remaining", "Views", "Rate", "Status"]}
        rows={campaigns.map((campaign) => [
          <div>
            <p className="font-medium text-gray-950">{campaign.title}</p>
            <p className="text-xs text-gray-500">{campaign.creatorId?.name || campaign.description}</p>
          </div>,
          formatCurrency(campaign.budget),
          formatCurrency(campaign.remainingBudget),
          formatNumber(campaign.totalViews),
          formatCurrency(campaign.payoutPer1000Views),
          <StatusPill value={campaign.status} />,
        ])}
      />
    </section>
  );
}
