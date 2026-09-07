import { initials, mentorPhoto } from "@/lib/mentor-media";
import { cn } from "@/lib/utils";

export function MentorAvatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const src = mentorPhoto(name);
  const base = cn(
    "rounded-lg bg-accent-soft shrink-0 grid place-items-center overflow-hidden size-14",
    className,
  );

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        loading="lazy"
        width={512}
        height={512}
        className={cn(base, "object-cover")}
      />
    );
  }

  return (
    <div className={base}>
      <span className="font-display font-semibold text-sm text-primary">{initials(name)}</span>
    </div>
  );
}
