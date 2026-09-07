import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { MentorAvatar } from "@/components/MentorAvatar";
import { ScoreBar } from "@/components/ScoreBar";
import { supabase } from "@/integrations/supabase/client";
import { useAllocation, useMentors, useProfile } from "@/hooks/useMentorship";
import { rankMentors, type Match } from "@/lib/matching";

export const Route = createFileRoute("/_authenticated/matches")({
  head: () => ({
    meta: [
      { title: "Match results — Mentora" },
      {
        name: "description",
        content: "Ranked mentor matches with a 0–100 compatibility score and the reasoning behind it.",
      },
      { property: "og:title", content: "Match results — Mentora" },
      {
        property: "og:description",
        content: "Skill overlap, domain alignment, rating and availability, weighted into one score.",
      },
    ],
  }),
  component: MatchesPage,
});

function MatchCard({
  match,
  rank,
  allocatedId,
  onAllocate,
  busy,
}: {
  match: Match;
  rank: number;
  allocatedId?: string;
  onAllocate: (m: Match) => void;
  busy: boolean;
}) {
  const isTop = rank === 0;
  const isMine = allocatedId === match.mentor.id;

  return (
    <article
      className={`rounded-2xl border p-5 transition-colors animate-rise ${
        isTop || isMine
          ? "border-primary/40 bg-accent-soft/40 hover:border-primary"
          : "border-border bg-card/60 hover:border-primary/50"
      }`}
      style={{ animationDelay: `${0.1 + rank * 0.1}s` }}
    >
      <div className="flex items-start gap-4">
        <MentorAvatar name={match.mentor.name} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display font-semibold">{match.mentor.name}</span>
            {isMine ? (
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-foreground text-background">
                Allocated
              </span>
            ) : isTop ? (
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-primary text-primary-foreground">
                Best match
              </span>
            ) : null}
          </div>
          <div className="font-mono text-[11px] text-muted-foreground">
            {match.mentor.department} · {match.mentor.capacity} slots open
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {match.mentor.expertise.slice(0, 3).map((e) => (
              <span
                key={e}
                className="px-2 py-0.5 rounded-full bg-card border border-border text-[11px]"
              >
                {e}
              </span>
            ))}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div
            className={`font-display text-4xl font-bold leading-none tabular-nums ${
              isTop || isMine ? "text-primary" : "text-foreground"
            }`}
          >
            {match.score}
          </div>
          <div className="label-mono">score</div>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        <ScoreBar label="Skill overlap" value={match.breakdown.skill} delay={0.3} />
        <ScoreBar label="Interest alignment" value={match.breakdown.domain} delay={0.42} />
        <ScoreBar
          label="Mentor rating"
          value={match.breakdown.rating}
          display={match.mentor.rating.toFixed(1)}
          delay={0.54}
        />
      </div>

      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
        {match.sharedSkills.length > 0
          ? `Shares ${match.sharedSkills.length} of your skills (${match.sharedSkills.slice(0, 3).join(", ")}).`
          : "No direct skill overlap yet."}{" "}
        {match.sharedDomains.length > 0
          ? `Works in ${match.sharedDomains.slice(0, 2).join(" and ")}.`
          : ""}
      </p>

      <button
        onClick={() => onAllocate(match)}
        disabled={busy || isMine}
        className={`mt-4 w-full rounded-lg font-display font-medium text-sm py-2.5 transition-colors disabled:opacity-60 ${
          isTop
            ? "bg-primary text-primary-foreground hover:bg-foreground"
            : "border border-border bg-card hover:border-primary hover:text-primary"
        }`}
      >
        {isMine ? "Current allocation" : "Confirm allocation"}
      </button>
    </article>
  );
}

function MatchesPage() {
  const { data: profile } = useProfile();
  const { data: mentors, isLoading } = useMentors();
  const { data: allocation } = useAllocation();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const matches = useMemo(
    () => (profile && mentors ? rankMentors(profile, mentors) : []),
    [profile, mentors],
  );

  const allocate = async (m: Match) => {
    setBusy(true);
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase.from("allocations").upsert(
      {
        student_id: auth.user!.id,
        mentor_id: m.mentor.id,
        score: m.score,
        breakdown: m.breakdown,
        status: "confirmed",
      },
      { onConflict: "student_id" },
    );
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await qc.invalidateQueries({ queryKey: ["allocation"] });
    toast.success(`${m.mentor.name} allocated`);
    navigate({ to: "/dashboard" });
  };

  const noSkills = profile && profile.skills.length === 0;

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4 animate-rise">
        <div>
          <div className="label-mono">Step 05 &amp; 06 · matching results, ranked</div>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-balance">
            Strongest fits for your profile
          </h1>
        </div>
        <div className="font-mono text-[11px] text-muted-foreground">
          {matches.length} mentors · scored 0–100 · 45% skills, 30% interests, 15% rating, 10%
          availability
        </div>
      </div>

      {noSkills ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Add your skills and interests on the{" "}
          <Link to="/profile" className="text-primary underline">
            profile page
          </Link>{" "}
          to run the matching algorithm.
        </p>
      ) : isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Scoring mentors…</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-4">
          {matches.map((m, i) => (
            <MatchCard
              key={m.mentor.id}
              match={m}
              rank={i}
              allocatedId={allocation?.mentor_id}
              onAllocate={allocate}
              busy={busy}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}
