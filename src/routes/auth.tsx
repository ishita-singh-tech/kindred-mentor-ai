import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Student registration & sign in — Mentora" },
      {
        name: "description",
        content: "Create your Mentora student account or sign in to see your mentor allocation.",
      },
      { property: "og:title", content: "Student registration & sign in — Mentora" },
      {
        property: "og:description",
        content: "Register with email or Google to start the mentor matching process.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success("Account created — check your email to confirm, then sign in.");
          setMode("signin");
          return;
        }
        toast.success("Account created");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/profile" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/profile" });
  };

  const field =
    "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="h-1 bg-gradient-to-r from-primary via-accent-soft to-background" />
      <div className="max-w-[1440px] mx-auto px-6 h-14 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="size-7 rounded-md bg-primary grid place-items-center text-primary-foreground font-display font-bold text-sm">
            M
          </span>
          <span className="font-display font-semibold tracking-tight">Mentora</span>
        </Link>
      </div>

      <div className="mx-auto max-w-md px-6 py-12 animate-rise">
        <div className="label-mono">Step 01 · registration</div>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
          {mode === "signup" ? "Create your student account" : "Welcome back"}
        </h1>

        <div className="mt-6 rounded-2xl border border-border bg-card/60 p-6">
          <button
            onClick={google}
            className="w-full rounded-lg border border-border bg-card py-2.5 font-display text-sm font-medium transition-colors hover:border-primary hover:text-primary"
          >
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              or email
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <div>
                <label className="label-mono">Full name</label>
                <input
                  className={`${field} mt-1`}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Ananya Krishnan"
                />
              </div>
            )}
            <div>
              <label className="label-mono">College email</label>
              <input
                type="email"
                className={`${field} mt-1`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@college.edu"
              />
            </div>
            <div>
              <label className="label-mono">Password</label>
              <input
                type="password"
                className={`${field} mt-1`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="At least 6 characters"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-primary py-2.5 font-display text-sm font-medium text-primary-foreground transition-colors hover:bg-foreground disabled:opacity-60"
            >
              {busy ? "Please wait…" : mode === "signup" ? "Register" : "Sign in"}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            className="mt-4 w-full font-mono text-[11px] text-muted-foreground hover:text-primary"
          >
            {mode === "signup" ? "Already registered? Sign in" : "New here? Create an account"}
          </button>
        </div>
      </div>
    </div>
  );
}
