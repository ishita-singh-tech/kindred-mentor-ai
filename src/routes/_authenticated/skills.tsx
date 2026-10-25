import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useMentorship";
import { INTEREST_OPTIONS, SKILL_OPTIONS } from "@/lib/matching";

export const Route = createFileRoute("/_authenticated/skills")({
  head: () => ({
    meta: [
      { title: "Step 3 · Skills & interests — Mentora" },
      { name: "description", content: "Tag the skills you have and the areas you want to work in." },
      { property: "og:title", content: "Step 3 · Skills & interests — Mentora" },
      { property: "og:description", content: "Skills and interests drive the mentor match score." },
    ],
  }),
  component: SkillsPage,
});

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "px-2.5 py-1 rounded-full bg-accent-soft text-primary text-xs font-medium ring-1 ring-primary/40"
          : "px-2.5 py-1 rounded-full bg-foreground/5 text-foreground text-xs font-medium hover:bg-accent-soft"
      }
    >
      {label}
    </button>
  );
}

function SkillsPage() {
  const { data: profile } = useProfile();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setSkills(profile.skills ?? []);
    setInterests(profile.interests ?? []);
  }, [profile]);

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const save = async () => {
    if (skills.length === 0 || interests.length === 0) {
      toast.error("Pick at least one skill and one interest");
      return;
    }
    setBusy(true);
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("profiles")
      .update({ skills, interests, updated_at: new Date().toISOString() })
      .eq("id", auth.user!.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    await qc.invalidateQueries({ queryKey: ["profile"] });
    toast.success("Skills saved");
    navigate({ to: "/mentors" });
  };

  return (
    <AppShell step="skills">
      <div className="max-w-3xl animate-rise space-y-6">
        <div>
          <div className="label-mono">Step 03 · skills &amp; interests</div>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight">What do you know, and where are you headed?</h1>
        </div>
        <div className="rounded-xl border border-border bg-card/60 p-5">
          <span className="label-mono">Skills · {skills.length} selected</span>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {SKILL_OPTIONS.map((s) => (
              <Chip key={s} label={s} active={skills.includes(s)} onClick={() => toggle(skills, setSkills, s)} />
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card/60 p-5">
          <span className="label-mono">Interests · {interests.length} selected</span>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {INTEREST_OPTIONS.map((s) => (
              <Chip key={s} label={s} active={interests.includes(s)} onClick={() => toggle(interests, setInterests, s)} />
            ))}
          </div>
        </div>
        <button
          onClick={save}
          disabled={busy}
          className="rounded-lg bg-primary px-5 py-2.5 font-display text-sm font-medium text-primary-foreground transition-colors hover:bg-foreground disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save & view Mentor Database →"}
        </button>
      </div>
    </AppShell>
  );
}
