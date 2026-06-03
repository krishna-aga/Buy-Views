import React, { useMemo } from "react";

export function StatusPill({ value }) {
  const normalized = String(value || "unknown");
  const tone = useMemo(() => {
    if (["active", "approved", "connected"].includes(normalized)) return "green";
    if (["pending", "paused"].includes(normalized)) return "amber";
    if (["removed", "rejected", "cancelled"].includes(normalized)) return "red";
    return "gray";
  }, [normalized]);

  const classes = {
    green: "border-green-200 bg-green-50 text-green-800",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    red: "border-red-200 bg-red-50 text-red-800",
    gray: "border-gray-200 bg-gray-50 text-gray-700",
  };

  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs capitalize ${classes[tone]}`}>
      {normalized}
    </span>
  );
}
