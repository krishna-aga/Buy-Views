import React from "react";

export function PageFrame({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden text-stone-950">
      <div className="pointer-events-none absolute inset-0 opacity-[0.28] [background-image:linear-gradient(rgba(32,24,17,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(32,24,17,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="pointer-events-none absolute -left-28 top-24 h-72 w-72 rounded-full bg-[#e7a15b]/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-10 h-96 w-96 rounded-full bg-[#2c7a70]/20 blur-3xl" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
