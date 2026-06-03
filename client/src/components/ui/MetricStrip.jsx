import React from "react";

export function MetricStrip({ items }) {
  return (
    <section className="grid gap-3 md:grid-cols-4">
      {items.map(([label, value]) => (
        <div className="rounded-lg border border-gray-200 bg-white p-4" key={label}>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
          <p className="mt-2 text-xl font-semibold text-gray-950">{value ?? 0}</p>
        </div>
      ))}
    </section>
  );
}
