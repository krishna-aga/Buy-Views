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
    green: "border-emerald-900/10 bg-emerald-100 text-emerald-900",
    amber: "border-amber-900/10 bg-amber-100 text-amber-950",
    red: "border-red-900/10 bg-red-100 text-red-900",
    gray: "border-stone-900/10 bg-stone-100 text-stone-700",
  };

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black capitalize ${classes[tone]}`}>
      {normalized}
    </span>
  );
}
