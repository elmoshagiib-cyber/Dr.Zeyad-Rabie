import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ffkuhskhzmhjwrbyswjm.supabase.co";
const supabaseAnonKey = "sb_publishable_JvhoPTfpS-3K2_Ctz8H8nQ_y6YqUzvA";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);