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
          notes: action === "approve" ? "Approved by admin" : "Rejected by admin",
        },
      });
      onNotice(`Withdrawal ${action === "approve" ? "approved" : "rejected"}.`);
      await loadAdminData();
    } catch (actionError) {
      onError(actionError.message);
    } finally {
      setActionId("");
    }
  };

  return (
    <div className="space-y-6">
      <MetricStrip
        items={[
          ["Users", users.length],
          ["Campaigns", campaigns.length],
          ["Pending withdrawals", withdrawals.filter((item) => item.status === "pending").length],
          ["Promoters", users.filter((item) => item.role === "promoter").length],
        ]}
      />
      <AdminWithdrawalTable
        withdrawals={withdrawals}
        isLoading={isLoading}
        actionId={actionId}
        onApprove={(withdrawalId) => updateWithdrawal(withdrawalId, "approve")}
        onReject={(withdrawalId) => updateWithdrawal(withdrawalId, "reject")}
      />
      <UserTable users={users} isLoading={isLoading} />
      <CampaignTable campaigns={campaigns} isLoading={isLoading} />
    </div>
  );
}
