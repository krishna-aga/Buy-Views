import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";
import { currency, dateTime, integer } from "../lib/format";
import { Badge, Button, Input, Section, Select, Stat, Table, Textarea } from "../components/ui";

const creatorCampaignDefaults = {
  title: "",
  description: "",
  clipDriveUrl: "",
  budget: "",
  payoutPer1000Views: "",
};

const promoterSubmissionDefaults = {
  campaignId: "",
  reelUrl: "",
  platform: "instagram",
};

const withdrawalDefaults = {
  amount: "",
};

function DashboardPage() {
  const { user, token, logout } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-app">
      <div className="border-b border-line bg-panel">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">CreatorReach</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">Operations workspace</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-slate-900">{user?.name}</div>
              <div className="text-xs uppercase tracking-wide text-slate-500">{user?.role}</div>
            </div>
            <Button variant="secondary" onClick={logout}>
              Sign out
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6">
        {user?.role === "creator" ? (
          <CreatorDashboard token={token} refreshKey={refreshKey} onRefresh={() => setRefreshKey((value) => value + 1)} />
        ) : null}
        {user?.role === "promoter" ? (
          <PromoterDashboard token={token} refreshKey={refreshKey} onRefresh={() => setRefreshKey((value) => value + 1)} />
        ) : null}
        {user?.role === "admin" ? <AdminDashboard token={token} refreshKey={refreshKey} /> : null}
      </div>
    </div>
  );
}

function CreatorDashboard({ token, refreshKey, onRefresh }) {
  const [data, setData] = useState({ campaigns: [], analytics: null });
  const [form, setForm] = useState(creatorCampaignDefaults);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/campaigns/my", { token }).then((response) => {
      setData({
        campaigns: response.campaigns,
        analytics: response.analytics,
      });
    });
  }, [refreshKey, token]);

  const handleCreateCampaign = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await apiRequest("/campaigns", {
        token,
        method: "POST",
        body: {
          ...form,
          budget: Number(form.budget),
          payoutPer1000Views: Number(form.payoutPer1000Views),
        },
      });
      setForm(creatorCampaignDefaults);
      onRefresh();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: "title",
      label: "Campaign",
      render: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.title}</div>
          <div className="mt-1 max-w-md text-xs text-slate-500">{row.description}</div>
        </div>
      ),
    },
    {
      key: "budget",
      label: "Budget",
      render: (row) => currency(row.budget),
    },
    {
      key: "remainingBudget",
      label: "Remaining",
      render: (row) => currency(row.remainingBudget),
    },
    {
      key: "totalViews",
      label: "Views",
      render: (row) => integer(row.totalViews),
    },
    {
      key: "rate",
      label: "Rate / 1000",
      render: (row) => currency(row.payoutPer1000Views),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <Badge status={row.status}>{row.status}</Badge>,
    },
    {
      key: "clip",
      label: "Clip",
      render: (row) => (
        <a className="text-sm text-slate-700 underline" href={row.clipDriveUrl} target="_blank" rel="noreferrer">
          Open drive link
        </a>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Campaigns" value={integer(data.analytics?.totalCampaigns)} />
        <Stat label="Total spend" value={currency(data.analytics?.totalSpend)} />
        <Stat label="Views generated" value={integer(data.analytics?.totalViews)} />
        <Stat label="Submissions" value={integer(data.analytics?.totalSubmissions)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Section title="Campaign inventory" description="Review performance, budgets, and clip sources across active and historical campaigns.">
          <Table columns={columns} rows={data.campaigns.map((campaign) => ({ ...campaign, key: campaign._id }))} />
        </Section>

        <Section title="Create campaign" description="Budget is locked from the creator wallet when a campaign is created.">
          <form className="space-y-4" onSubmit={handleCreateCampaign}>
            <Input label="Campaign title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            <Textarea
              label="Description"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            />
            <Input
              label="Google Drive clip URL"
              value={form.clipDriveUrl}
              onChange={(event) => setForm((current) => ({ ...current, clipDriveUrl: event.target.value }))}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Budget (INR)" type="number" min="0" value={form.budget} onChange={(event) => setForm((current) => ({ ...current, budget: event.target.value }))} />
              <Input
                label="Payout per 1000 views (INR)"
                type="number"
                min="0"
                value={form.payoutPer1000Views}
                onChange={(event) => setForm((current) => ({ ...current, payoutPer1000Views: event.target.value }))}
              />
            </div>
            {error ? <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div> : null}
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? "Creating..." : "Create campaign"}
            </Button>
          </form>
        </Section>
      </div>
    </div>
  );
}

function PromoterDashboard({ token, refreshKey, onRefresh }) {
  const [campaigns, setCampaigns] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [submissionForm, setSubmissionForm] = useState(promoterSubmissionDefaults);
  const [withdrawalForm, setWithdrawalForm] = useState(withdrawalDefaults);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    Promise.all([
      apiRequest("/campaigns", { token }),
      apiRequest("/submissions/my", { token }),
      apiRequest("/wallet", { token }),
      apiRequest("/withdrawals/my", { token }),
    ]).then(([campaignResponse, submissionResponse, walletResponse, withdrawalResponse]) => {
      setCampaigns(campaignResponse.campaigns);
      setSubmissions(submissionResponse.submissions);
      setWallet(walletResponse.wallet);
      setWithdrawals(withdrawalResponse.withdrawals);
    });
  }, [refreshKey, token]);

  const handleSubmission = async (event) => {
    event.preventDefault();
    setBusy("submission");
    setError("");

    try {
      await apiRequest("/submissions", {
        token,
        method: "POST",
        body: submissionForm,
      });
      setSubmissionForm(promoterSubmissionDefaults);
      onRefresh();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy("");
    }
  };

  const handleWithdrawal = async (event) => {
    event.preventDefault();
    setBusy("withdrawal");
    setError("");

    try {
      await apiRequest("/withdrawals", {
        token,
        method: "POST",
        body: { amount: Number(withdrawalForm.amount) },
      });
      setWithdrawalForm(withdrawalDefaults);
      onRefresh();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy("");
    }
  };

  const campaignColumns = [
    {
      key: "title",
      label: "Campaign",
      render: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.title}</div>
          <div className="mt-1 text-xs text-slate-500">Creator: {row.creatorId?.name || "-"}</div>
        </div>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (row) => <div className="max-w-md text-sm text-slate-600">{row.description}</div>,
    },
    {
      key: "payout",
      label: "Payout / 1000",
      render: (row) => currency(row.payoutPer1000Views),
    },
    {
      key: "budget",
      label: "Remaining",
      render: (row) => currency(row.remainingBudget),
    },
    {
      key: "clip",
      label: "Clip source",
      render: (row) => (
        <a className="text-sm text-slate-700 underline" href={row.clipDriveUrl} target="_blank" rel="noreferrer">
          Open clip
        </a>
      ),
    },
  ];

  const submissionColumns = [
    {
      key: "campaign",
      label: "Campaign",
      render: (row) => row.campaignId?.title || "-",
    },
    {
      key: "platform",
      label: "Platform",
      render: (row) => row.platform,
    },
    {
      key: "views",
      label: "Views",
      render: (row) => integer(row.views),
    },
    {
      key: "earnings",
      label: "Earnings",
      render: (row) => currency(row.earnings),
    },
    {
      key: "status",
      label: "Campaign status",
      render: (row) => <Badge status={row.campaignId?.status}>{row.campaignId?.status || "-"}</Badge>,
    },
    {
      key: "link",
      label: "Post link",
      render: (row) => (
        <a className="text-sm text-slate-700 underline" href={row.reelUrl} target="_blank" rel="noreferrer">
          Open post
        </a>
      ),
    },
  ];

  const withdrawalColumns = [
    {
      key: "amount",
      label: "Amount",
      render: (row) => currency(row.amount),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <Badge status={row.status}>{row.status}</Badge>,
    },
    {
      key: "notes",
      label: "Notes",
      render: (row) => row.notes || "-",
    },
    {
      key: "createdAt",
      label: "Requested",
      render: (row) => dateTime(row.createdAt),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Wallet balance" value={currency(wallet?.walletBalance)} />
        <Stat label="Approved earnings" value={currency(wallet?.approvedEarnings)} />
        <Stat label="Pending withdrawals" value={currency(wallet?.pendingWithdrawals)} />
        <Stat label="Total withdrawn" value={currency(wallet?.totalWithdrawn)} />
      </div>

      {error ? <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Section title="Available campaigns" description="Browse active campaigns and copy the clip source before posting to your short-form channel.">
          <Table columns={campaignColumns} rows={campaigns.map((campaign) => ({ ...campaign, key: campaign._id }))} />
        </Section>

        <div className="space-y-6">
          <Section title="Submit reel or short" description="Submit the public post URL after publishing.">
            <form className="space-y-4" onSubmit={handleSubmission}>
              <Select
                label="Campaign"
                value={submissionForm.campaignId}
                onChange={(event) => setSubmissionForm((current) => ({ ...current, campaignId: event.target.value }))}
                options={[
                  { value: "", label: "Select campaign" },
                  ...campaigns.map((campaign) => ({ value: campaign._id, label: campaign.title })),
                ]}
              />
              <Select
                label="Platform"
                value={submissionForm.platform}
                onChange={(event) => setSubmissionForm((current) => ({ ...current, platform: event.target.value }))}
                options={[
                  { value: "instagram", label: "Instagram" },
                  { value: "youtube", label: "YouTube" },
                  { value: "tiktok", label: "TikTok" },
                  { value: "other", label: "Other" },
                ]}
              />
              <Input
                label="Post URL"
                value={submissionForm.reelUrl}
                onChange={(event) => setSubmissionForm((current) => ({ ...current, reelUrl: event.target.value }))}
              />
              <Button type="submit" className="w-full" disabled={busy === "submission"}>
                {busy === "submission" ? "Submitting..." : "Submit post"}
              </Button>
            </form>
          </Section>

          <Section title="Request withdrawal" description="Withdraw from approved earnings only. Pending requests remain visible in the history table.">
            <form className="space-y-4" onSubmit={handleWithdrawal}>
              <Input
                label="Amount (INR)"
                type="number"
                min="0"
                value={withdrawalForm.amount}
                onChange={(event) => setWithdrawalForm({ amount: event.target.value })}
              />
              <Button type="submit" className="w-full" disabled={busy === "withdrawal"}>
                {busy === "withdrawal" ? "Requesting..." : "Request withdrawal"}
              </Button>
            </form>
          </Section>
        </div>
      </div>

      <Section title="Submission history" description="Track approved views and earnings across all your posts.">
        <Table columns={submissionColumns} rows={submissions.map((submission) => ({ ...submission, key: submission._id }))} />
      </Section>

      <Section title="Withdrawal history" description="Finance review status for each payout request.">
        <Table columns={withdrawalColumns} rows={withdrawals.map((withdrawal) => ({ ...withdrawal, key: withdrawal._id }))} />
      </Section>
    </div>
  );
}

function AdminDashboard({ token, refreshKey }) {
  const [users, setUsers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [viewUpdates, setViewUpdates] = useState({});
  const [notes, setNotes] = useState({});
  const [error, setError] = useState("");

  const load = () =>
    Promise.all([
      apiRequest("/admin/users", { token }),
      apiRequest("/admin/campaigns", { token }),
      apiRequest("/admin/submissions", { token }),
      apiRequest("/admin/withdrawals", { token }),
    ]).then(([usersResponse, campaignsResponse, submissionsResponse, withdrawalsResponse]) => {
      setUsers(usersResponse.users);
      setCampaigns(campaignsResponse.campaigns);
      setSubmissions(submissionsResponse.submissions);
      setWithdrawals(withdrawalsResponse.withdrawals);
    });

  useEffect(() => {
    load().catch((requestError) => setError(requestError.message));
  }, [refreshKey, token]);

  const handleViewUpdate = async (submissionId) => {
    setError("");
    try {
      await apiRequest(`/admin/submissions/${submissionId}/views`, {
        token,
        method: "PUT",
        body: { views: Number(viewUpdates[submissionId] || 0) },
      });
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleWithdrawalAction = async (withdrawalId, action) => {
    setError("");
    try {
      await apiRequest(`/admin/withdrawals/${withdrawalId}/${action}`, {
        token,
        method: "PUT",
        body: { notes: notes[withdrawalId] || "" },
      });
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const userColumns = [
    {
      key: "name",
      label: "User",
      render: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.name}</div>
          <div className="mt-1 text-xs text-slate-500">{row.email}</div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (row) => <Badge status={row.role}>{row.role}</Badge>,
    },
    {
      key: "approvedEarnings",
      label: "Approved",
      render: (row) => currency(row.approvedEarnings),
    },
    {
      key: "withdrawn",
      label: "Withdrawn",
      render: (row) => currency(row.totalWithdrawn),
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (row) => dateTime(row.createdAt),
    },
  ];

  const campaignColumns = [
    {
      key: "title",
      label: "Campaign",
      render: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.title}</div>
          <div className="mt-1 text-xs text-slate-500">{row.creatorId?.name || "-"}</div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <Badge status={row.status}>{row.status}</Badge>,
    },
    {
      key: "spent",
      label: "Spent",
      render: (row) => currency(row.totalSpent),
    },
    {
      key: "remaining",
      label: "Remaining",
      render: (row) => currency(row.remainingBudget),
    },
    {
      key: "views",
      label: "Views",
      render: (row) => integer(row.totalViews),
    },
  ];

  const submissionColumns = [
    {
      key: "campaign",
      label: "Campaign",
      render: (row) => row.campaignId?.title || "-",
    },
    {
      key: "promoter",
      label: "Promoter",
      render: (row) => row.promoterId?.name || "-",
    },
    {
      key: "platform",
      label: "Platform",
      render: (row) => row.platform,
    },
    {
      key: "views",
      label: "Views",
      render: (row) => (
        <div className="flex min-w-[220px] items-center gap-2">
          <input
            type="number"
            className="w-28 rounded-md border border-line px-2 py-1.5 text-sm"
            value={viewUpdates[row._id] ?? row.views}
            onChange={(event) => setViewUpdates((current) => ({ ...current, [row._id]: event.target.value }))}
          />
          <Button variant="secondary" onClick={() => handleViewUpdate(row._id)}>
            Update
          </Button>
        </div>
      ),
    },
    {
      key: "earnings",
      label: "Earnings",
      render: (row) => currency(row.earnings),
    },
  ];

  const withdrawalColumns = [
    {
      key: "promoter",
      label: "Promoter",
      render: (row) => row.promoterId?.name || "-",
    },
    {
      key: "amount",
      label: "Amount",
      render: (row) => currency(row.amount),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <Badge status={row.status}>{row.status}</Badge>,
    },
    {
      key: "notes",
      label: "Review",
      render: (row) => (
        <div className="min-w-[280px] space-y-2">
          <input
            className="w-full rounded-md border border-line px-2 py-1.5 text-sm"
            value={notes[row._id] ?? row.notes ?? ""}
            onChange={(event) => setNotes((current) => ({ ...current, [row._id]: event.target.value }))}
            placeholder="Internal notes"
          />
          {row.status === "pending" ? (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => handleWithdrawalAction(row._id, "approve")}>
                Approve
              </Button>
              <Button variant="danger" onClick={() => handleWithdrawalAction(row._id, "reject")}>
                Reject
              </Button>
            </div>
          ) : (
            <span className="text-xs text-slate-500">Reviewed</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {error ? <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div> : null}
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Users" value={integer(users.length)} />
        <Stat label="Campaigns" value={integer(campaigns.length)} />
        <Stat label="Submissions" value={integer(submissions.length)} />
        <Stat label="Withdrawals" value={integer(withdrawals.length)} />
      </div>
      <Section title="Users" description="Audit account mix, balances, and payout history.">
        <Table columns={userColumns} rows={users.map((user) => ({ ...user, key: user._id }))} />
      </Section>
      <Section title="Campaigns" description="Monitor campaign budgets and current delivery status.">
        <Table columns={campaignColumns} rows={campaigns.map((campaign) => ({ ...campaign, key: campaign._id }))} />
      </Section>
      <Section title="Submissions" description="Manual view entry for the MVP workflow.">
        <Table columns={submissionColumns} rows={submissions.map((submission) => ({ ...submission, key: submission._id }))} />
      </Section>
      <Section title="Withdrawals" description="Approve or reject promoter payout requests.">
        <Table columns={withdrawalColumns} rows={withdrawals.map((withdrawal) => ({ ...withdrawal, key: withdrawal._id }))} />
      </Section>
    </div>
  );
}

export default DashboardPage;
