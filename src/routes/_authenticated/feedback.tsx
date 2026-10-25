import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { MentorAvatar } from "@/components/MentorAvatar";
import { supabase } from "@/integrations/supabase/client";
import { useAllocation, useFeedback, useMentors } from "@/hooks/useMentorship";

export const Route = createFileRoute("/_authenticated/feedback")({
  head: () => ({
    meta: [
      { title: "Session feedback — Mentora" },
      {
        name: "description",
        content: "Rate each mentorship session out of five and leave a short note for the record.",
      },
      { property: "og:title", content: "Session feedback — Mentora" },
      {
        property: "og:description",
        content: "Feedback history for your allocated mentor, session by session.",
      },
    ],
  }),
  component: FeedbackPage,
});

function FeedbackPage() {
  const { data: allocation } = useAllocation();
  const { data: mentors } = useMentors();
  const { data: history } = useFeedback();
  const qc = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const mentor = mentors?.find((m) => m.id === allocation?.mentor_id);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocation) return;
    setBusy(true);
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase.from("feedback").insert({
      student_id: auth.user!.id,
      mentor_id: allocation.mentor_id,
      rating,
      comment,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setComment("");
    setRating(5);
    await qc.invalidateQueries({ queryKey: ["feedback"] });
    toast.success("Feedback recorded");
  };

  const average =
    history && history.length > 0
      ? (history.reduce((s, f) => s + f.rating, 0) / history.length).toFixed(1)
      : "—";

  return (
    <AppShell step="feedback">
      <div className="max-w-3xl animate-rise">
        <div className="label-mono">Step 08 · feedback</div>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight">
          Rate your mentorship sessions
        </h1>

        {!allocation || !mentor ? (
          <p className="mt-6 text-sm text-muted-foreground">
            You need an allocated mentor first —{" "}
            <Link to="/matches" className="text-primary underline">
              see your matches
            </Link>
            .
          </p>
        ) : (
          <>
            <div className="mt-6 rounded-2xl border border-border bg-card/60 p-5">
              <div className="flex items-center gap-3">
                <MentorAvatar name={mentor.name} className="size-12" />
                <div>
                  <div className="font-display font-semibold">{mentor.name}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {history?.length ?? 0} sessions rated · your average {average}
                  </div>
                </div>
              </div>

              <form onSubmit={submit} className="mt-5 space-y-4">
                <div>
                  <span className="label-mono">Session rating</span>
                  <div className="mt-2 flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        aria-label={`${n} out of 5`}
                        onClick={() => setRating(n)}
                        className={`size-8 rounded-full transition-colors ${
                          n <= rating ? "bg-primary" : "bg-foreground/15 hover:bg-accent-soft"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label-mono">What happened in the session?</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    placeholder="Clarified my CV pipeline and set the next milestone."
                    className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-lg bg-primary px-5 py-2.5 font-display text-sm font-medium text-primary-foreground transition-colors hover:bg-foreground disabled:opacity-60"
                >
                  {busy ? "Saving…" : "Submit feedback"}
                </button>
              </form>
            </div>

            <div className="mt-6 space-y-3">
              {(history ?? []).map((f) => (
                <div
                  key={f.id}
                  className="rounded-xl border border-border bg-card/60 p-4 flex items-start gap-4"
                >
                  <div className="flex gap-1 pt-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        className={`size-3 rounded-full ${
                          n <= f.rating ? "bg-primary" : "bg-foreground/15"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm">{f.comment || "No note left."}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {new Date(f.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
