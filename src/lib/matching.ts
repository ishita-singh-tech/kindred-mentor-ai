export type Mentor = {
  id: string;
  name: string;
  role: string;
  department: string;
  expertise: string[];
  domains: string[];
  rating: number;
  capacity: number;
  bio: string;
};

export type StudentProfile = {
  id: string;
  full_name: string;
  branch: string;
  year: number;
  batch: string;
  focus_area: string;
  skills: string[];
  interests: string[];
};

export type MatchBreakdown = {
  skill: number;
  domain: number;
  rating: number;
  availability: number;
};

export type Match = {
  mentor: Mentor;
  score: number;
  breakdown: MatchBreakdown;
  sharedSkills: string[];
  sharedDomains: string[];
};

const WEIGHTS = { skill: 0.45, domain: 0.3, rating: 0.15, availability: 0.1 };

const norm = (v: string) => v.trim().toLowerCase();

/** Jaccard-style overlap, biased toward covering the student's own list. */
function overlap(student: string[], mentor: string[]) {
  if (student.length === 0) return { pct: 0, shared: [] as string[] };
  const mentorSet = new Set(mentor.map(norm));
  const shared = student.filter((s) => mentorSet.has(norm(s)));
  const union = new Set([...student.map(norm), ...mentor.map(norm)]).size;
  const coverage = shared.length / student.length;
  const jaccard = union === 0 ? 0 : shared.length / union;
  return { pct: Math.round((0.7 * coverage + 0.3 * jaccard) * 100), shared };
}

export function scoreMentor(profile: StudentProfile, mentor: Mentor, taken = 0): Match {
  const skill = overlap(profile.skills, mentor.expertise);
  const domain = overlap(profile.interests, mentor.domains);
  const ratingPct = Math.round((mentor.rating / 5) * 100);
  const free = Math.max(mentor.capacity - taken, 0);
  const availability = Math.round(Math.min(free / Math.max(mentor.capacity, 1), 1) * 100);

  const score = Math.round(
    skill.pct * WEIGHTS.skill +
      domain.pct * WEIGHTS.domain +
      ratingPct * WEIGHTS.rating +
      availability * WEIGHTS.availability,
  );

  return {
    mentor,
    score,
    breakdown: { skill: skill.pct, domain: domain.pct, rating: ratingPct, availability },
    sharedSkills: skill.shared,
    sharedDomains: domain.shared,
  };
}

export function rankMentors(profile: StudentProfile, mentors: Mentor[]): Match[] {
  return mentors
    .map((m) => scoreMentor(profile, m))
    .sort((a, b) => b.score - a.score || b.mentor.rating - a.mentor.rating);
}

export const SKILL_OPTIONS = [
  "Python",
  "PyTorch",
  "TensorFlow",
  "Machine Learning",
  "Deep Learning",
  "Computer Vision",
  "NLP",
  "Transformers",
  "MLOps",
  "Cloud",
  "Kubernetes",
  "Docker",
  "Distributed Systems",
  "Statistics",
  "Data Analysis",
  "Robotics",
  "Embedded C",
  "ROS",
  "Networks",
  "Cryptography",
  "Cybersecurity",
  "LLM Systems",
  "Research Writing",
];

export const INTEREST_OPTIONS = [
  "Research",
  "Applied ML",
  "Computer Vision",
  "Deep Learning",
  "NLP",
  "Product AI",
  "Systems",
  "Distributed AI",
  "Data Science",
  "Robotics",
  "DevOps",
  "Security",
];
