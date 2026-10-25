import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { MentorAvatar } from "@/components/MentorAvatar";
import { ScoreBar } from "@/components/ScoreBar";
import { useAllocation, useFeedback, useMentors, useProfile } from "@/hooks/useMentorship";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your mentorship dashboard — Mentora" },
      {
        name: "description",
        content: "Your allocated mentor, the score breakdown, session progress and latest feedback.",
      },
      { property: "og:title", content: "Your mentorship dashboard — Mentora" },
      {
        property: "og:description",
        content: "Track your allocation, progress and session feedback in one place.",
      },
    ],
  }),
  component: DashboardPage,
});

const TOTAL_SESSIONS = 12;

function DashboardPage() {
  const { data: profile } = useProfile();
  const { data: mentors } = useMentors();
  const { data: allocation } = useAllocation();
  const { data: feedback } = useFeedback();

  const mentor = mentors?.find((m) => m.id === allocation?.mentor_id);
  const sessions = feedback?.length ?? 0;
  const pct = Math.round((sessions / TOTAL_SESSIONS) * 100);
  const last = feedback?.[0];

  return (
    <AppShell step="dashboard">
      <section className="grid grid-cols-1 lg:grid-cols-[336px_1fr] gap-8 items-start">
        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-card/60 p-5 animate-rise">
            <div className="flex items-center justify-between mb-4">
              <span className="label-mono">Student profile</span>
              <span className="font-mono text-[10px] text-primary">
                {profile?.skills.length ? "Locked" : "Incomplete"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-14 rounded-lg bg-accent-soft grid place-items-center font-display font-semibold">
                {(profile?.full_name || "S").slice(0, 1).toUpperCase()}
              </div>
              <div>
                <div className="font-display font-semibold">{profile?.full_name || "Student"}</div>
                <div className="font-mono text-[11px] text-muted-foreground">
                  {profile?.branch} · Year {profile?.year}
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Focus</span>
                <span className="font-medium">{profile?.focus_area || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Batch</span>
                <span className="font-mono text-[13px]">{profile?.batch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sessions logged</span>
                <span className="font-medium">
                  {sessions} of {TOTAL_SESSIONS}
                </span>
              </div>
            </div>
          </div>

          <div
            className="rounded-xl border border-border bg-card/60 p-5 animate-rise"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="label-mono">Skill &amp; interest tags</span>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(profile?.skills ?? []).map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 rounded-full bg-accent-soft text-primary text-xs font-medium"
                >
                  {s}
                </span>
              ))}
              {(profile?.interests ?? []).map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 rounded-full bg-foreground/5 text-foreground text-xs font-medium"
                >
                  {s}
                </span>
              ))}
              {!profile?.skills.length && (
                <Link to="/profile" className="text-sm text-primary underline">
                  Add your skills
                </Link>
              )}
            </div>
          </div>
        </aside>

        <section className="space-y-6">
          <div className="animate-rise" style={{ animationDelay: "0.05s" }}>
            <div className="label-mono">Step 07 · dashboard</div>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-balance">
              Your mentorship at a glance
            </h1>
          </div>

          {mentor && allocation ? (
            <article
              className="rounded-2xl border border-primary/40 bg-accent-soft/40 p-5 animate-rise"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="flex items-start gap-4">
                <MentorAvatar name={mentor.name} />
                <div className="min-w-0 flex-1">
                  <div className="font-display font-semibold">{mentor.name}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {mentor.role} · {mentor.department}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{mentor.bio}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-display text-4xl font-bold leading-none text-primary tabular-nums">
                    {allocation.score}
                  </div>
                  <div className="label-mono">score</div>
                </div>
              </div>
              <div className="mt-4 space-y-2.5">
                <ScoreBar label="Skill overlap" value={allocation.breakdown.skill} delay={0.3} />
                <ScoreBar
                  label="Interest alignment"
                  value={allocation.breakdown.domain}
                  delay={0.42}
                />
                <ScoreBar
                  label="Mentor rating"
                  value={allocation.breakdown.rating}
                  display={mentor.rating.toFixed(1)}
                  delay={0.54}
                />
              </div>
            </article>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center animate-rise">
              <div className="label-mono">Allocation status</div>
              <div className="mt-2 font-display text-lg font-semibold">No mentor allocated yet</div>
              <Link to="/matches" className="mt-3 inline-block text-sm text-primary underline">
                Run the matching algorithm
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-card/60 p-5">
              <div className="label-mono">Allocation status</div>
              <div className="mt-2 font-display text-lg font-semibold">
                {allocation ? "Confirmed" : "Pending"}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {allocation
                  ? `Since ${new Date(allocation.created_at).toLocaleDateString()}`
                  : "Pick a mentor from your ranked matches"}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card/60 p-5">
              <div className="label-mono">Progress</div>
              <div className="mt-2 font-display text-3xl font-bold text-primary tabular-nums">
                {sessions}
                <span className="text-lg text-muted-foreground">/{TOTAL_SESSIONS}</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-foreground/8">
                <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-2 font-mono text-[11px] text-muted-foreground">
                {pct}% of the mentorship plan complete
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card/60 p-5">
              <div className="label-mono">Feedback · last session</div>
              <div className="mt-3 flex gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    className={`size-5 rounded-full ${
                      last && n <= last.rating ? "bg-primary" : "bg-foreground/15"
                    }`}
                  />
                ))}
              </div>
              <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                {last ? `${last.rating} / 5 · "${last.comment || "no note"}"` : "No feedback yet"}
              </div>
              <Link
                to="/feedback"
                className="mt-4 inline-block rounded-lg border border-border bg-card px-3 py-2 font-display text-sm font-medium transition-colors hover:border-primary hover:text-primary"
              >
                Rate this mentor
              </Link>
            </div>
          </div>
        </section>
      </section>
    </AppShell>
  );
}
