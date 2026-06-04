import React from "react";
import { formatCurrency } from "../../utils/format";
import { PanelHeader } from "../ui/PanelHeader";
import { StatusPill } from "../ui/StatusPill";
import { Table } from "../ui/Table";

export function AdminWithdrawalTable({ withdrawals, isLoading, actionId, onApprove, onReject }) {
  return (
    <section className="panel">
      <PanelHeader
        title="Withdrawal requests"
        description="Approve pending requests with a simulated test payout reference."
      />
      <Table
        isLoading={isLoading}
        emptyText="No withdrawal requests found."
        headers={["Promoter", "Amount", "Simulation", "Status", "Requested", "Actions"]}
        rows={withdrawals.map((withdrawal) => {
          const isPending = withdrawal.status === "pending";
          const isBusy = actionId === withdrawal._id;

          return [
            <div>
              <p className="font-black text-stone-950">
                {withdrawal.promoterId?.name || "Unknown promoter"}
              </p>
              <p className="text-xs text-stone-500">{withdrawal.promoterId?.email || "No email"}</p>
            </div>,
            formatCurrency(withdrawal.amount),
            <div>
              <p className="text-stone-700">{withdrawal.payoutReference || "Pending approval"}</p>
              <p className="text-xs text-stone-500">
                {withdrawal.remarks || withdrawal.notes || "No remarks"}
              </p>
            </div>,
            <StatusPill value={withdrawal.status} />,
            withdrawal.createdAt ? new Date(withdrawal.createdAt).toLocaleDateString() : "Unknown",
            <div className="flex flex-wrap gap-2">
              <button
                className="btn-secondary py-1.5 text-xs"
                disabled={!isPending || isBusy}
                onClick={() => onApprove(withdrawal._id)}
                type="button"
              >
                {isBusy ? "Working..." : "Approve"}
              </button>
              <button
                className="btn-secondary py-1.5 text-xs"
                disabled={!isPending || isBusy}
                onClick={() => onReject(withdrawal._id)}
                type="button"
              >
                Reject
              </button>
            </div>,
          ];
        })}
      />
    </section>
  );
}
