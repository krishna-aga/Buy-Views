import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";
import { Button, Input, Select } from "../components/ui";

const initialRegister = {
  name: "",
  email: "",
  password: "",
  role: "creator",
};

const initialLogin = {
  email: "",
  password: "",
};

function AuthPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [registerForm, setRegisterForm] = useState(initialRegister);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      const payload = mode === "login" ? loginForm : registerForm;
      const path = mode === "login" ? "/auth/login" : "/auth/register";
      const data = await apiRequest(path, {
        method: "POST",
        body: payload,
      });

      login({ token: data.token, user: data.user });
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-app">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-10">
        <div className="grid w-full gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-md border border-line bg-panel p-8">
            <div className="max-w-2xl">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">CreatorReach</div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
                Manage creator promotion campaigns with the same discipline as a performance team.
              </h1>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <Feature
                  title="Creator operations"
                  text="Launch campaigns, lock budgets, track spend, and monitor short-form distribution."
                />
                <Feature
                  title="Promoter workflow"
                  text="Find active campaigns, submit reel links, and manage earnings and withdrawals."
                />
                <Feature
                  title="Admin controls"
                  text="Review users, adjust view counts, and approve payouts from one control surface."
                />
              </div>
            </div>
          </section>

          <section className="rounded-md border border-line bg-panel p-8">
            <div className="flex gap-2 rounded-md border border-line bg-slate-50 p-1">
              <button
                type="button"
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${mode === "login" ? "bg-white text-slate-900" : "text-slate-600"}`}
                onClick={() => setMode("login")}
              >
                Sign in
              </button>
              <button
                type="button"
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${mode === "register" ? "bg-white text-slate-900" : "text-slate-600"}`}
                onClick={() => setMode("register")}
              >
                Create account
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {mode === "register" ? (
                <>
                  <Input
                    label="Full name"
                    value={registerForm.name}
                    onChange={(event) => setRegisterForm((current) => ({ ...current, name: event.target.value }))}
                  />
                  <Select
                    label="Account role"
                    value={registerForm.role}
                    onChange={(event) => setRegisterForm((current) => ({ ...current, role: event.target.value }))}
                    options={[
                      { value: "creator", label: "Creator" },
                      { value: "promoter", label: "Promoter" },
                    ]}
                  />
                </>
              ) : null}

              <Input
                label="Email"
                type="email"
                value={mode === "login" ? loginForm.email : registerForm.email}
                onChange={(event) =>
                  mode === "login"
                    ? setLoginForm((current) => ({ ...current, email: event.target.value }))
                    : setRegisterForm((current) => ({ ...current, email: event.target.value }))
                }
              />

              <Input
                label="Password"
                type="password"
                value={mode === "login" ? loginForm.password : registerForm.password}
                onChange={(event) =>
                  mode === "login"
                    ? setLoginForm((current) => ({ ...current, password: event.target.value }))
                    : setRegisterForm((current) => ({ ...current, password: event.target.value }))
                }
              />

              {error ? <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div> : null}

              <Button className="w-full" disabled={busy} type="submit">
                {busy ? "Processing..." : mode === "login" ? "Sign in" : "Create account"}
              </Button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

function Feature({ title, text }) {
  return (
    <div className="rounded-md border border-line p-4">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-2 text-sm leading-6 text-slate-600">{text}</div>
    </div>
  );
}

export default AuthPage;
