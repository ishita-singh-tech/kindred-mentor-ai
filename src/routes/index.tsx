import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mentora — Intelligent Student Mentorship Allocation" },
      {
        name: "description",
        content:
          "Register, list your skills and interests, and get matched to the right faculty or industry mentor with an explainable compatibility score.",
      },
      { property: "og:title", content: "Mentora — Intelligent Student Mentorship Allocation" },
      {
        property: "og:description",
        content:
          "Skill-and-interest based mentor matching for B.Tech students, with ranked scores and feedback tracking.",
      },
    ],
  }),
  component: Landing,
});

const STEPS = [
  { n: "01", t: "Register", d: "Create your student account with email or Google." },
  { n: "02", t: "Profile", d: "Branch, year, batch and focus area in one form." },
  { n: "03", t: "Skills & interests", d: "Tag what you know and what you want to work on." },
  { n: "04", t: "Mentor database", d: "Faculty and industry mentors with expertise and capacity." },
  { n: "05", t: "Matching algorithm", d: "Weighted overlap, alignment, rating and availability." },
  { n: "06", t: "Allocation", d: "Confirm one mentor; the choice is saved to your record." },
  { n: "07", t: "Dashboard", d: "Your mentor, the score breakdown and progress." },
  { n: "08", t: "Feedback", d: "Rate each session and leave a short note." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="h-1 bg-gradient-to-r from-primary via-accent-soft to-background" />

      <header className="max-w-[1440px] mx-auto px-6 h-14 flex items-center gap-3">
        <span className="size-7 rounded-md bg-primary grid place-items-center text-primary-foreground font-display font-bold text-sm">
          M
        </span>
        <span className="font-display font-semibold tracking-tight">Mentora</span>
        <span className="hidden sm:inline label-mono">Allocation Console</span>
        <Link
          to="/auth"
          className="ml-auto px-3 py-1.5 rounded-md bg-foreground text-background font-mono text-[11px] uppercase tracking-wider"
        >
          Sign in
        </Link>
      </header>

      <main className="max-w-[1440px] mx-auto px-6 py-14">
        <section className="max-w-2xl animate-rise">
          <div className="label-mono">Intelligent student mentorship allocation</div>
          <h1 className="mt-3 font-display text-5xl font-bold leading-[1.05] text-balance">
            The right mentor, with the reasoning shown.
          </h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Mentora scores every mentor in the department against your skills, interests, their
            rating and their remaining capacity — then ranks them 0 to 100 so the allocation is
            defensible, not arbitrary.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/auth"
              className="rounded-lg bg-primary px-5 py-2.5 text-primary-foreground font-display font-medium text-sm transition-colors hover:bg-foreground"
            >
              Register as a student
            </Link>
            <span className="font-mono text-[11px] text-muted-foreground">
              8 mentors seeded · scored 0–100
            </span>
          </div>
        </section>

        <section className="mt-14 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {STEPS.map((s, i) => (
            <article
              key={s.n}
              className="rounded-xl border border-border bg-card/60 p-5 animate-rise"
              style={{ animationDelay: `${0.05 * i}s` }}
            >
              <div className="font-mono text-[11px] text-primary">{s.n}</div>
              <h2 className="mt-2 font-display text-base font-semibold">{s.t}</h2>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
