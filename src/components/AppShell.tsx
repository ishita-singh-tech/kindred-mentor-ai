import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAllocation, useFeedback, useProfile } from "@/hooks/useMentorship";
import { initials } from "@/lib/mentor-media";

export const STEPS = [
  { key: "register", to: "/auth", label: "Register" },
  { key: "profile", to: "/profile", label: "Profile" },
  { key: "skills", to: "/skills", label: "Skills & Interests" },
  { key: "mentors", to: "/mentors", label: "Mentor Database" },
  { key: "matches", to: "/matches", label: "Matching" },
  { key: "allocation", to: "/matches", label: "Allocation" },
  { key: "dashboard", to: "/dashboard", label: "Dashboard" },
  { key: "feedback", to: "/feedback", label: "Feedback" },
] as const;

export type StepKey = (typeof STEPS)[number]["key"];

function useStepState() {
  const { data: profile, isLoading: l1 } = useProfile();
  const { data: allocation, isLoading: l2 } = useAllocation();
  const { data: feedback, isLoading: l3 } = useFeedback();
  const profileDone = !!(profile?.full_name && profile?.focus_area);
  const skillsDone = profileDone && (profile?.skills.length ?? 0) > 0;
  const allocated = !!allocation;
  const done: Record<StepKey, boolean> = {
    register: true,
    profile: profileDone,
    skills: skillsDone,
    mentors: skillsDone,
    matches: allocated,
    allocation: allocated,
    dashboard: allocated,
    feedback: (feedback?.length ?? 0) > 0,
  };
  const unlocked = (i: number) => i === 0 || STEPS.slice(0, i).every((s) => done[s.key]) || (STEPS[i]?.key === "matches" && skillsDone);
  return { done, unlocked, loading: l1 || l2 || l3, profile };
}

export function AppShell({ step, children }: { step: StepKey; children: ReactNode }) {
  const navigate = useNavigate();
  const { done, unlocked, loading, profile } = useStepState();
  const idx = STEPS.findIndex((s) => s.key === step);
  const firstOpen = STEPS.findIndex((s, i) => !done[s.key] && unlocked(i));
  const blocker = STEPS[firstOpen >= 0 ? firstOpen : 1] ?? STEPS[1];
  const locked = !loading && !unlocked(idx);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="h-1 bg-gradient-to-r from-primary via-accent-soft to-background" />

      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-[1440px] mx-auto px-6 h-14 flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <span className="size-7 rounded-md bg-primary grid place-items-center text-primary-foreground font-display font-bold text-sm">
              M
            </span>
            <span className="font-display font-semibold tracking-tight">Mentora</span>
            <span className="hidden lg:inline label-mono">Allocation Console</span>
          </Link>
          <div className="ml-auto flex items-center gap-3 pl-5 border-l border-border">
            <div className="size-8 rounded-full bg-accent-soft grid place-items-center font-display font-semibold text-xs">
              {initials(profile?.full_name || "Student")}
            </div>
            <div className="leading-tight">
              <div className="text-sm font-medium">{profile?.full_name || "Student"}</div>
              <button onClick={signOut} className="font-mono text-[10px] text-muted-foreground hover:text-primary">
                Sign out
              </button>
            </div>
          </div>
        </div>

        <nav className="max-w-[1440px] mx-auto px-6 pb-3 flex gap-1 overflow-x-auto">
          {STEPS.map((s, i) => {
            const isCurrent = i === idx;
            const open = unlocked(i);
            const cls = isCurrent
              ? "bg-foreground text-background"
              : done[s.key]
                ? "text-primary hover:bg-accent-soft"
                : open
                  ? "text-foreground hover:bg-accent-soft"
                  : "text-muted-foreground/50 cursor-not-allowed";
            const inner = (
              <>
                <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span>{s.label}</span>
                {done[s.key] && !isCurrent && <span aria-hidden>✓</span>}
              </>
            );
            const base = `shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-[11px] uppercase tracking-wider transition-colors ${cls}`;
            if (!open || s.key === "register") {
              return (
                <span key={s.key} className={base}>
                  {inner}
                </span>
              );
            }
            return (
              <Link key={s.key} to={s.to} className={base}>
                {inner}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="max-w-[1440px] mx-auto px-6 py-8">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : locked ? (
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border p-8 text-center animate-rise">
            <div className="label-mono">Step {String(idx + 1).padStart(2, "0")} is locked</div>
            <div className="mt-2 font-display text-lg font-semibold">
              Finish “{blocker.label}” first
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Each step unlocks the next one.</p>
            <Link
              to={blocker.to}
              className="mt-4 inline-block rounded-lg bg-primary px-5 py-2.5 font-display text-sm font-medium text-primary-foreground hover:bg-foreground"
            >
              Go to {blocker.label}
            </Link>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}

export function NextStep({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="inline-block rounded-lg bg-primary px-5 py-2.5 font-display text-sm font-medium text-primary-foreground transition-colors hover:bg-foreground"
    >
      {label} →
    </Link>
  );
}
