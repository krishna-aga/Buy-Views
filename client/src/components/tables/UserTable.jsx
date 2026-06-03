import React from "react";
import { PanelHeader } from "../ui/PanelHeader";
import { Table } from "../ui/Table";

export function UserTable({ users, isLoading }) {
  return (
    <section className="panel">
      <PanelHeader title="Users" description="Registered accounts across all platform roles." />
      <Table
        isLoading={isLoading}
        emptyText="No users found."
        headers={["Name", "Email", "Role", "YouTube", "Created"]}
        rows={users.map((user) => [
          user.name,
          user.email,
          <span className="capitalize">{user.role}</span>,
          user.youtubeConnected ? "Connected" : "Not connected",
          user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown",
        ])}
      />
    </section>
  );
}
