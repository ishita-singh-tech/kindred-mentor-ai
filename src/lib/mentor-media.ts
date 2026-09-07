import mentor1 from "@/assets/mentor-1.jpg";
import mentor2 from "@/assets/mentor-2.jpg";
import mentor3 from "@/assets/mentor-3.jpg";

const byName: Record<string, string> = {
  "Dr. R. Menon": mentor1,
  "Meera Iyer": mentor2,
  "Prof. S. Raghavan": mentor3,
};

export function mentorPhoto(name: string): string | undefined {
  return byName[name];
}

export function initials(name: string): string {
  return name
    .replace(/^(Dr\.|Prof\.)\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
