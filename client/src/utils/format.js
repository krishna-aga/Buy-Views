const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const number = new Intl.NumberFormat("en-IN");

export function formatCurrency(value = 0) {
  return currency.format(Number(value) || 0);
}

export function formatNumber(value = 0) {
  return number.format(Number(value) || 0);
}

export function getCampaignTitle(campaign) {
  return campaign?.campaignId?.title || campaign?.title || "Campaign";
}
