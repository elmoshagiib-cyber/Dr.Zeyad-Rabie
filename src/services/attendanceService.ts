import { supabase } from "../lib/supabase";

export async function createAttendanceSession(data: any) {
  const { data: session, error } = await supabase
    .from("attendance_sessions")
    .insert(data)
    .select()
    .single();

  if (error) throw error;

  return session;
}

export async function getActiveAttendanceSession() {
  const { data, error } = await supabase
    .from("attendance_sessions")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return data;
}