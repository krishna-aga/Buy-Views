import React, { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import { MetricStrip } from "../components/ui/MetricStrip";
import { CampaignTable } from "../components/tables/CampaignTable";
import { UserTable } from "../components/tables/UserTable";

export function AdminDashboard({ token, onError }) {
  const [users, setUsers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiRequest("/admin/users", { token }), apiRequest("/admin/campaigns", { token })])
      .then(([usersPayload, campaignsPayload]) => {
        setUsers(usersPayload.users || []);
        setCampaigns(campaignsPayload.campaigns || []);
      })
      .catch((adminError) => onError(adminError.message))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <MetricStrip
        items={[
          ["Users", users.length],
          ["Campaigns", campaigns.length],
          ["Creators", users.filter((item) => item.role === "creator").length],
          ["Promoters", users.filter((item) => item.role === "promoter").length],
        ]}
      />
      <UserTable users={users} isLoading={isLoading} />
      <CampaignTable campaigns={campaigns} isLoading={isLoading} />
    </div>
  );
}
