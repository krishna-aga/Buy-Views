import React, { useState } from "react";
import { apiRequest } from "../lib/api";
import { PageFrame } from "../components/layout/PageFrame";
import { StatusMessage } from "../components/ui/StatusMessage";

function InfoRow({ label, value }) {
  return (
    <tr>
      <th className="w-36 bg-gray-50 px-4 py-3 font-medium text-gray-700">{label}</th>
      <td className="px-4 py-3 text-gray-600">{value}</td>
    </tr>
  );
}

export function AuthView({ error, setError, setNotice, setSession }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "promoter",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateForm = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsSubmitting(true);

    try {
      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : {
              name: form.name,
              email: form.email,
              password: form.password,
              role: form.role,
            };
      const response = await apiRequest(`/auth/${mode === "login" ? "login" : "register"}`, {
        method: "POST",
        body: payload,
      });

      setSession({ token: response.token, user: response.user });
      setNotice(mode === "login" ? "Signed in successfully." : "Account created successfully.");
    } catch (authError) {
      setError(authError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageFrame>
      <main className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">CeatorReach</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-950">
            Campaign operations for creator promotion teams.
          </h1>
          <p className="mt-4 text-base leading-7 text-gray-600">
            Manage creator campaigns, promoter submissions, earnings, and YouTube verification from
            one restrained workspace built for daily use.
          </p>
          <div className="mt-8 overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-gray-200">
                <InfoRow label="Creators" value="Create campaigns and track spend." />
                <InfoRow label="Promoters" value="Submit YouTube Shorts after OAuth connection." />
                <InfoRow label="Operations" value="Review users, campaigns, and payout controls." />
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-5">
            <div className="grid grid-cols-2 rounded-md border border-gray-200 bg-gray-50 p-1">
              <button
                className={`auth-tab ${mode === "login" ? "auth-tab-active" : ""}`}
                onClick={() => setMode("login")}
                type="button"
              >
                Login
              </button>
              <button
                className={`auth-tab ${mode === "register" ? "auth-tab-active" : ""}`}
                onClick={() => setMode("register")}
                type="button"
              >
                Sign up
              </button>
            </div>
          </div>

          <form className="space-y-4 p-5" onSubmit={submit}>
            <StatusMessage message={error} tone="error" />
            {mode === "register" && (
              <label className="field">
                <span>Name</span>
                <input name="name" value={form.name} onChange={updateForm} required />
              </label>
            )}
            <label className="field">
              <span>Email</span>
              <input name="email" type="email" value={form.email} onChange={updateForm} required />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                name="password"
                type="password"
                minLength={6}
                value={form.password}
                onChange={updateForm}
                required
              />
            </label>
            {mode === "register" && (
              <label className="field">
                <span>Account type</span>
                <select name="role" value={form.role} onChange={updateForm}>
                  <option value="promoter">Promoter</option>
                  <option value="creator">Creator</option>
                </select>
              </label>
            )}
            <button className="btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
            </button>
          </form>
        </section>
      </main>
    </PageFrame>
  );
}
