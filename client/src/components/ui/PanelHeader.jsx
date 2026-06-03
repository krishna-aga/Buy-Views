import React from "react";

export function PanelHeader({ title, description }) {
  return (
    <div className="mb-4 border-b border-gray-200 pb-4">
      <h2 className="text-base font-semibold text-gray-950">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-gray-600">{description}</p>
    </div>
  );
}
