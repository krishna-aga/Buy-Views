export const currency = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

export const integer = (value = 0) => new Intl.NumberFormat("en-IN").format(Number(value || 0));

export const dateTime = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "-";

export const statusTone = (status = "") => {
  const normalized = status.toLowerCase();

  if (["active", "approved", "completed"].includes(normalized)) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (["pending", "paused"].includes(normalized)) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (["cancelled", "rejected"].includes(normalized)) {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }

  return "bg-slate-50 text-slate-700 border-slate-200";
};
