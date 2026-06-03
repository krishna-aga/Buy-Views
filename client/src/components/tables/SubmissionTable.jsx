import React from "react";
import { formatCurrency, formatNumber, getCampaignTitle } from "../../utils/format";
import { PanelHeader } from "../ui/PanelHeader";
import { StatusPill } from "../ui/StatusPill";
import { Table } from "../ui/Table";

export function SubmissionTable({ submissions }) {
  return (
    <section className="panel">
      <PanelHeader
        title="My submissions"
        description="Submitted Shorts with tracked views and calculated earnings."
      />
      <Table
        emptyText="No submissions yet."
        headers={["Campaign", "Views", "Earnings", "Status", "Last sync"]}
        rows={submissions.map((submission) => [
          <a
            className="font-medium text-gray-950 underline-offset-2 hover:underline"
            href={submission.reelUrl}
            rel="noreferrer"
            target="_blank"
          >
            {getCampaignTitle(submission)}
          </a>,
          formatNumber(submission.views),
          formatCurrency(submission.earnings),
          <StatusPill value={submission.status} />,
          submission.lastSyncedAt ? new Date(submission.lastSyncedAt).toLocaleDateString() : "Not synced",
        ])}
      />
    </section>
  );
}
