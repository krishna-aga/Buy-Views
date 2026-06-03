import React from "react";

function dashboardTitle(role) {
  if (role === "creator") return "Creator dashboard";
  if (role === "promoter") return "Promoter dashboard";
  return "Operations dashboard";
}

export function Header({ user, onSignOut }) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">CeatorReach</p>
          <h1 className="text-xl font-semibold text-gray-950">{dashboardTitle(user.role)}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-950">{user.name}</p>
            <p className="text-xs capitalize text-gray-500">{user.role}</p>
          </div>
          <button className="btn-secondary" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
