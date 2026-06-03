import React from "react";

export function StatusMessage({ message, tone }) {
  if (!message) return null;

  const classes =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-green-200 bg-green-50 text-green-800";

  return <div className={`mb-4 rounded-md border px-4 py-3 text-sm ${classes}`}>{message}</div>;
}
