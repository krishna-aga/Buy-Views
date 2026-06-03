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
        headers={["Amount", "Status", "Payout reference", "Remarks", "Requested"]}
        rows={withdrawals.map((withdrawal) => [
          formatCurrency(withdrawal.amount),
          <StatusPill value={withdrawal.status} />,
          withdrawal.payoutReference || "Not completed",
          withdrawal.remarks || withdrawal.notes || "No remarks",
          withdrawal.createdAt ? new Date(withdrawal.createdAt).toLocaleDateString() : "Unknown",
        ])}
      />
    </section>
  );
}
