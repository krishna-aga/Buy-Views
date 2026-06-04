import React from "react";

function dashboardTitle(role) {
  if (role === "creator") return "Creator dashboard";
  if (role === "promoter") return "Promoter dashboard";
  return "Operations dashboard";
}

export function Header({ user, onSignOut }) {
  return (
    <header className="px-4 pt-4 sm:px-6">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between rounded-[2rem] border border-stone-950/10 bg-stone-50/75 px-5 py-4 shadow-[0_20px_60px_rgba(61,42,25,0.10)] backdrop-blur">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#211915] font-display text-2xl text-[#f4c06f] shadow-lg">
            C
          </div>
          <div>
            <p className="eyebrow">CeatorReach</p>
            <h1 className="font-display text-2xl text-stone-950 sm:text-3xl">{dashboardTitle(user.role)}</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-black text-stone-950">{user.name}</p>
            <p className="text-xs capitalize text-stone-500">{user.role}</p>
          </div>
          <button className="btn-secondary" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
