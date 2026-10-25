import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useMentorship";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Step 2 · Student profile — Mentora" },
      { name: "description", content: "Enter your name, branch, year, batch and focus area." },
      { property: "og:title", content: "Step 2 · Student profile — Mentora" },
      { property: "og:description", content: "Your academic details for mentor matching." },
    ],
  }),
  component: ProfilePage,
});

const field =
  "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary";

function ProfilePage() {
  const { data: profile } = useProfile();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [branch, setBranch] = useState("B.Tech CSE");
  const [year, setYear] = useState(3);
  const [batch, setBatch] = useState("2023-27");
  const [focus, setFocus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name);
    setBranch(profile.branch);
    setYear(profile.year);
    setBatch(profile.batch);
    setFocus(profile.focus_area);
  }, [profile]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase.from("profiles").upsert({
      id: auth.user!.id,
      full_name: fullName,
      branch,
      year,
      batch,
      focus_area: focus,
      updated_at: new Date().toISOString(),
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    await qc.invalidateQueries({ queryKey: ["profile"] });
    toast.success("Profile saved");
    navigate({ to: "/skills" });
  };

  return (
    <AppShell step="profile">
      <div className="max-w-2xl animate-rise">
        <div className="label-mono">Step 02 · student profile</div>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight">Your academic details</h1>
        <form onSubmit={save} className="mt-6 space-y-6">
          <div className="rounded-xl border border-border bg-card/60 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-mono">Full name</label>
              <input className={`${field} mt-1`} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div>
              <label className="label-mono">Branch</label>
              <input className={`${field} mt-1`} value={branch} onChange={(e) => setBranch(e.target.value)} required />
            </div>
            <div>
              <label className="label-mono">Year</label>
              <select className={`${field} mt-1`} value={year} onChange={(e) => setYear(Number(e.target.value))}>
                {[1, 2, 3, 4].map((y) => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-mono">Batch</label>
              <input className={`${field} mt-1`} value={batch} onChange={(e) => setBatch(e.target.value)} required />
            </div>
            <div className="sm:col-span-2">
              <label className="label-mono">Focus area</label>
              <input
                className={`${field} mt-1`}
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                required
                placeholder="Applied ML, computer vision, robotics…"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-primary px-5 py-2.5 font-display text-sm font-medium text-primary-foreground transition-colors hover:bg-foreground disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save & continue to Skills →"}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
