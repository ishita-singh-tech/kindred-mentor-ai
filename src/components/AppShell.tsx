import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useMentorship";
import { initials } from "@/lib/mentor-media";

const NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/profile", label: "Profile" },
  { to: "/mentors", label: "Directory" },
  { to: "/matches", label: "Match Results" },
  { to: "/feedback", label: "Feedback" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { data: profile } = useProfile();
  const navigate = useNavigate();

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

          <nav className="ml-auto flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="px-3 py-1.5 rounded-md text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "px-3 py-1.5 rounded-md bg-foreground text-background" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3 pl-5 border-l border-border">
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
      </header>

      <main className="max-w-[1440px] mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
