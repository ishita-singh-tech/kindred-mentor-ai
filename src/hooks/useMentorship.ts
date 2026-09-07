import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Mentor, StudentProfile } from "@/lib/matching";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<StudentProfile | null> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", auth.user.id)
        .maybeSingle();
      if (error) throw error;
      return data as StudentProfile | null;
    },
  });
}

export function useMentors() {
  return useQuery({
    queryKey: ["mentors"],
    queryFn: async (): Promise<Mentor[]> => {
      const { data, error } = await supabase.from("mentors").select("*").order("rating", {
        ascending: false,
      });
      if (error) throw error;
      return (data ?? []) as Mentor[];
    },
  });
}

export type Allocation = {
  id: string;
  student_id: string;
  mentor_id: string;
  score: number;
  breakdown: { skill: number; domain: number; rating: number; availability: number };
  status: string;
  created_at: string;
};

export function useAllocation() {
  return useQuery({
    queryKey: ["allocation"],
    queryFn: async (): Promise<Allocation | null> => {
      const { data, error } = await supabase.from("allocations").select("*").maybeSingle();
      if (error) throw error;
      return data as Allocation | null;
    },
  });
}

export type Feedback = {
  id: string;
  mentor_id: string;
  rating: number;
  comment: string;
  created_at: string;
};

export function useFeedback() {
  return useQuery({
    queryKey: ["feedback"],
    queryFn: async (): Promise<Feedback[]> => {
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Feedback[];
    },
  });
}
