import React from "react";

export function StatusMessage({ message, tone }) {
  if (!message) return null;

  const classes =
    tone === "error"
      ? "border-red-900/10 bg-red-100 text-red-900"
      : "border-emerald-900/10 bg-emerald-100 text-emerald-900";

  return <div className={`mb-4 rounded-2xl border px-4 py-3 text-sm font-bold ${classes}`}>{message}</div>;
}
