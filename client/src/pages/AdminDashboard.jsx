import React, { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import { MetricStrip } from "../components/ui/MetricStrip";
import { CampaignTable } from "../components/tables/CampaignTable";
import { UserTable } from "../components/tables/UserTable";
import { AdminWithdrawalTable } from "../components/tables/AdminWithdrawalTable";

export function AdminDashboard({ token, onError, onNotice }) {
  const [users, setUsers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState("");

  const loadAdminData = async () => {
    const [usersPayload, campaignsPayload, withdrawalsPayload] = await Promise.all([
      apiRequest("/admin/users", { token }),
      apiRequest("/admin/campaigns", { token }),
      apiRequest("/admin/withdrawals", { token }),
    ]);

    setUsers(usersPayload.users || []);
    setCampaigns(campaignsPayload.campaigns || []);
    setWithdrawals(withdrawalsPayload.withdrawals || []);
  };

  useEffect(() => {
    loadAdminData()
      .catch((adminError) => onError(adminError.message))
      .finally(() => setIsLoading(false));
  }, []);

  const updateWithdrawal = async (withdrawalId, action) => {
    onError("");
    setActionId(withdrawalId);

    try {
      await apiRequest(`/admin/withdrawals/${withdrawalId}/${action}`, {
        token,
        method: "PUT",
        body: {
          remarks: action === "approve" ? "Simulated payout approved" : "Rejected by admin",
        },
      });
      onNotice(`Withdrawal ${action === "approve" ? "completed" : "rejected"}.`);
      await loadAdminData();
    } catch (actionError) {
      onError(actionError.message);
    } finally {
      setActionId("");
    }
  };

  return (
    <div className="space-y-6">
      <section className="panel-ink relative overflow-hidden">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#c65f36]/25 blur-3xl" />
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#f4c06f]">Admin tower</p>
        <div className="relative mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-display text-5xl leading-none sm:text-6xl">Keep the market honest.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-300">
              Review users, monitor campaigns, and clear simulated payouts from one operations
              cockpit.
            </p>
          </div>
          <div className="rounded-3xl border border-stone-50/10 bg-stone-50/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-300">Queue</p>
            <p className="mt-1 font-display text-4xl">
              {withdrawals.filter((item) => item.status === "pending").length}
            </p>
          </div>
        </div>
      </section>
      <MetricStrip
        items={[
          ["Users", users.length],
          ["Campaigns", campaigns.length],
          ["Pending withdrawals", withdrawals.filter((item) => item.status === "pending").length],
          ["Promoters", users.filter((item) => item.role === "promoter").length],
        ]}
      />
      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.9fr]">
        <AdminWithdrawalTable
          withdrawals={withdrawals}
          isLoading={isLoading}
          actionId={actionId}
          onApprove={(withdrawalId) => updateWithdrawal(withdrawalId, "approve")}
          onReject={(withdrawalId) => updateWithdrawal(withdrawalId, "reject")}
        />
        <UserTable users={users} isLoading={isLoading} />
      </section>
      <CampaignTable campaigns={campaigns} isLoading={isLoading} />
    </div>
  );
}
