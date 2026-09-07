import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useMentorship";
import { INTEREST_OPTIONS, SKILL_OPTIONS } from "@/lib/matching";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Your student profile — Mentora" },
      {
        name: "description",
        content: "Set your branch, year, focus area, skills and interests used for mentor matching.",
      },
      { property: "og:title", content: "Your student profile — Mentora" },
      {
        property: "og:description",
        content: "Skills and interests drive the mentor compatibility score.",
      },
    ],
  }),
  component: ProfilePage,
});

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "px-2.5 py-1 rounded-full bg-accent-soft text-primary text-xs font-medium transition-colors"
          : "px-2.5 py-1 rounded-full bg-foreground/5 text-foreground text-xs font-medium transition-colors hover:bg-accent-soft"
      }
    >
      {label}
    </button>
  );
}

function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [branch, setBranch] = useState("B.Tech CSE");
  const [year, setYear] = useState(3);
  const [batch, setBatch] = useState("2022-26");
  const [focus, setFocus] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name);
    setBranch(profile.branch);
    setYear(profile.year);
    setBatch(profile.batch);
    setFocus(profile.focus_area);
    setSkills(profile.skills ?? []);
    setInterests(profile.interests ?? []);
  }, [profile]);

  const toggle = (list: string[], set: (v: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (skills.length === 0) {
      toast.error("Pick at least one skill");
      return;
    }
    setBusy(true);
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase.from("profiles").upsert({
      id: auth.user!.id,
      full_name: fullName,
      branch,
      year,
      batch,
      focus_area: focus,
      skills,
      interests,
      updated_at: new Date().toISOString(),
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await qc.invalidateQueries({ queryKey: ["profile"] });
    toast.success("Profile saved — running the match");
    navigate({ to: "/matches" });
  };

  const field =
    "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary";

  return (
    <AppShell>
      <div className="max-w-3xl animate-rise">
        <div className="label-mono">Step 02 &amp; 03 · profile, skills and interests</div>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight">
          Tell the algorithm who you are
        </h1>

        {isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading your profile…</p>
        ) : (
          <form onSubmit={save} className="mt-6 space-y-6">
            <div className="rounded-xl border border-border bg-card/60 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-mono">Full name</label>
                <input
                  className={`${field} mt-1`}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label-mono">Branch</label>
                <input
                  className={`${field} mt-1`}
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label-mono">Year</label>
                <select
                  className={`${field} mt-1`}
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                >
                  {[1, 2, 3, 4].map((y) => (
                    <option key={y} value={y}>
                      Year {y}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-mono">Batch</label>
                <input
                  className={`${field} mt-1`}
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label-mono">Focus area</label>
                <input
                  className={`${field} mt-1`}
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  placeholder="Applied ML, retrieval-augmented generation, robotics…"
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card/60 p-5">
              <span className="label-mono">Skill tags · {skills.length} selected</span>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {SKILL_OPTIONS.map((s) => (
                  <Chip
                    key={s}
                    label={s}
                    active={skills.includes(s)}
                    onClick={() => toggle(skills, setSkills, s)}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card/60 p-5">
              <span className="label-mono">Interest tags · {interests.length} selected</span>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {INTEREST_OPTIONS.map((s) => (
                  <Chip
                    key={s}
                    label={s}
                    active={interests.includes(s)}
                    onClick={() => toggle(interests, setInterests, s)}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-primary px-5 py-2.5 font-display text-sm font-medium text-primary-foreground transition-colors hover:bg-foreground disabled:opacity-60"
            >
              {busy ? "Saving…" : "Save and run matching"}
            </button>
          </form>
        )}
      </div>
    </AppShell>
  );
}
