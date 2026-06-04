import React from "react";

export function PanelHeader({ title, description }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4 border-b border-stone-950/10 pb-4">
      <div>
        <p className="eyebrow mb-1">Workspace</p>
        <h2 className="font-display text-2xl text-stone-950">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-stone-600">{description}</p>
      </div>
      <div className="mt-2 hidden h-3 w-3 rounded-full bg-[#c65f36] shadow-[0_0_0_6px_rgba(198,95,54,0.12)] sm:block" />
    </div>
  );
}
