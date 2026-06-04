import React, { useState } from "react";
import { apiRequest } from "../lib/api";
import { PageFrame } from "../components/layout/PageFrame";
import { StatusMessage } from "../components/ui/StatusMessage";

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
      <main className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <section className="relative overflow-hidden rounded-[2.4rem] border border-stone-950/10 bg-[#211915] p-7 text-stone-50 shadow-[0_34px_90px_rgba(33,25,21,0.28)] sm:p-10">
          <div className="absolute -right-20 top-0 h-80 w-80 rounded-full bg-[#e7a15b]/25 blur-3xl" />
          <div className="absolute bottom-8 right-10 hidden h-44 w-44 rounded-full border border-stone-50/15 lg:block" />
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#f4c06f]">CeatorReach</p>
          <h1 className="relative mt-5 max-w-3xl font-display text-5xl leading-[0.95] tracking-tight sm:text-7xl">
            Campaign ops with a creator-room pulse.
          </h1>
          <p className="relative mt-6 max-w-2xl text-base leading-7 text-stone-200">
            Manage creator campaigns, promoter submissions, earnings, and YouTube verification from
            one focused workspace built for daily promotion work.
          </p>
          <div className="relative mt-10 grid gap-3 sm:grid-cols-3">
            {[
              ["Creators", "Launch budgets"],
              ["Promoters", "Submit Shorts"],
              ["Admins", "Clear payouts"],
            ].map(([label, value]) => (
              <div className="rounded-3xl border border-stone-50/10 bg-stone-50/10 p-4" key={label}>
                <p className="text-xs uppercase tracking-[0.2em] text-stone-300">{label}</p>
                <p className="mt-2 font-display text-2xl">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="mb-6">
            <p className="eyebrow">Access</p>
            <h2 className="mt-2 font-display text-4xl">Enter the studio</h2>
          </div>
          <div className="border-b border-stone-950/10 pb-5">
            <div className="grid grid-cols-2 rounded-full border border-stone-950/10 bg-white/60 p-1">
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

          <form className="space-y-4 pt-5" onSubmit={submit}>
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
