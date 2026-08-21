import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

function getVisitorId(): string {
  const key = "visitor_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export function useVisitTracker() {
  const location = useLocation();

  useEffect(() => {
    const visitorId = getVisitorId();

    supabase
      .from("site_visits")
      .insert({
        visitor_id: visitorId,
        page: location.pathname,
      })
      .then(({ error }) => {
        if (error) console.error("visit tracking error:", error);
      });
  }, [location.pathname]);
}