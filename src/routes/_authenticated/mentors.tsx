import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { MentorAvatar } from "@/components/MentorAvatar";
import { useMentors } from "@/hooks/useMentorship";

export const Route = createFileRoute("/_authenticated/mentors")({
  head: () => ({
    meta: [
      { title: "Mentor directory — Mentora" },
      {
        name: "description",
        content: "Browse every faculty and industry mentor with their expertise, rating and open slots.",
      },
      { property: "og:title", content: "Mentor directory — Mentora" },
      {
        property: "og:description",
        content: "Expertise areas, research domains, ratings and capacity for each mentor.",
      },
    ],
  }),
  component: MentorsPage,
});

function MentorsPage() {
  const { data: mentors, isLoading } = useMentors();
  const [q, setQ] = useState("");

  const list = (mentors ?? []).filter((m) =>
    `${m.name} ${m.department} ${m.expertise.join(" ")} ${m.domains.join(" ")}`
      .toLowerCase()
      .includes(q.toLowerCase()),
  );

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4 animate-rise">
        <div>
          <div className="label-mono">Step 04 · mentor database</div>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight">
            Every mentor in the pool
          </h1>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search expertise or department…"
          className="w-72 rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
        />
      </div>

      {isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading mentors…</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {list.map((m, i) => (
            <article
              key={m.id}
              className="rounded-2xl border border-border bg-card/60 p-5 transition-colors hover:border-primary/50 animate-rise"
              style={{ animationDelay: `${0.05 * i}s` }}
            >
              <div className="flex items-start gap-4">
                <MentorAvatar name={m.name} />
                <div className="min-w-0 flex-1">
                  <div className="font-display font-semibold">{m.name}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {m.role} · {m.department}
                  </div>
                  <div className="font-mono text-[11px] text-primary mt-0.5">
                    ★ {m.rating.toFixed(1)} · {m.capacity} slots
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{m.bio}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {m.expertise.map((e) => (
                  <span
                    key={e}
                    className="px-2 py-0.5 rounded-full bg-card border border-border text-[11px]"
                  >
                    {e}
                  </span>
                ))}
              </div>
            </article>
          ))}
          {list.length === 0 && (
            <p className="text-sm text-muted-foreground">No mentors match that search.</p>
          )}
        </div>
      )}
    </AppShell>
  );
}
