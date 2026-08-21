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

// المسارات دي بتخص لوحات التحكم (المدرس / الأدمن) ومينفعش تتحسب كزيارات عامة
const EXCLUDED_PREFIXES = ["/instructor", "/admin", "/staff-login"];

function isExcludedPath(pathname: string): boolean {
  return EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

// تسجيل زيارة واحدة بس لكل يوم لكل زائر (session-based) بدل كل صفحة يفتحها
function alreadyTrackedToday(visitorId: string): boolean {
  const key = `visit_tracked_${visitorId}`;
  const lastDate = localStorage.getItem(key);
  const today = new Date().toDateString();
  return lastDate === today;
}

function markTrackedToday(visitorId: string) {
  const key = `visit_tracked_${visitorId}`;
  localStorage.setItem(key, new Date().toDateString());
}

export function useVisitTracker() {
  const location = useLocation();

  useEffect(() => {
    if (isExcludedPath(location.pathname)) return;

    const visitorId = getVisitorId();

    if (alreadyTrackedToday(visitorId)) return;

    supabase
      .from("site_visits")
      .insert({
        visitor_id: visitorId,
        page: location.pathname,
      })
      .then(({ error }) => {
        if (error) {
          console.error("visit tracking error:", error);
        } else {
          markTrackedToday(visitorId);
        }
      });
  }, [location.pathname]);
}