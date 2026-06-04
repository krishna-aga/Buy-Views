import React from "react";

export function MetricStrip({ items }) {
  return (
    <section className="grid gap-3 md:grid-cols-4">
      {items.map(([label, value], index) => (
        <div
          className="group relative overflow-hidden rounded-[1.4rem] border border-stone-950/10 bg-stone-50/80 p-4 shadow-[0_18px_50px_rgba(61,42,25,0.08)] backdrop-blur transition hover:-translate-y-1 hover:bg-white"
          key={label}
        >
          <div className="absolute -right-6 -top-8 h-20 w-20 rounded-full bg-[#d8793f]/10 transition group-hover:scale-125" />
          <p className="text-[0.68rem] font-black uppercase tracking-[0.22em] text-stone-500">{label}</p>
          <p className="mt-3 font-display text-2xl text-stone-950">{value ?? 0}</p>
          <p className="mt-3 h-1 w-10 rounded-full bg-[#c65f36]" style={{ opacity: 0.35 + index * 0.12 }} />
        </div>
      ))}
    </section>
  );
}
