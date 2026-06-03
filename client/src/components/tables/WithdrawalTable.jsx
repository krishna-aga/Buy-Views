import React from "react";
import { formatCurrency } from "../../utils/format";
import { PanelHeader } from "../ui/PanelHeader";
import { StatusPill } from "../ui/StatusPill";
import { Table } from "../ui/Table";

export function WithdrawalTable({ withdrawals }) {
  return (
    <section className="panel">
      <PanelHeader
        title="Withdrawal history"
        description="Promoter payout requests and operation decisions."
      />
      <Table
        emptyText="No withdrawals requested."
        headers={["Amount", "Status", "Notes", "Requested"]}
        rows={withdrawals.map((withdrawal) => [
          formatCurrency(withdrawal.amount),
          <StatusPill value={withdrawal.status} />,
          withdrawal.notes || "No notes",
          withdrawal.createdAt ? new Date(withdrawal.createdAt).toLocaleDateString() : "Unknown",
        ])}
      />
    </section>
  );
}
