"use client";

import { useEffect, useState } from "react";

export type AbVariant = "A" | "B";

const STORAGE_KEY = "fanovaly_ab_variant";
const VISITOR_KEY = "fanovaly_visitor_id";

function generateVisitorId(): string {
  // Random ID with timestamp for uniqueness
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = generateVisitorId();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

function getOrCreateVariant(): AbVariant {
  if (typeof window === "undefined") return "A";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "A" || stored === "B") return stored;
  // 50/50 random split
  const variant: AbVariant = Math.random() < 0.5 ? "A" : "B";
  localStorage.setItem(STORAGE_KEY, variant);
  return variant;
}

/**
 * Returns the A/B variant for the current visitor.
 * Persistent across sessions (localStorage).
 * Tracks the visit via /api/ab/track on first mount.
 *
 * Returns "A" during SSR (default) and the real variant after hydration.
 */
export function useAbVariant(): { variant: AbVariant; visitorId: string; ready: boolean } {
  const [variant, setVariant] = useState<AbVariant>("A");
  const [visitorId, setVisitorId] = useState<string>("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const v = getOrCreateVariant();
    const id = getOrCreateVisitorId();
    setVariant(v);
    setVisitorId(id);
    setReady(true);

    // Track visit (fire & forget, debounced via session flag)
    const sessionFlag = `ab_tracked_${Date.now() - (Date.now() % 3600000)}`; // hourly bucket
    if (!sessionStorage.getItem(sessionFlag)) {
      sessionStorage.setItem(sessionFlag, "1");
      fetch("/api/ab/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId: id, variant: v }),
      }).catch(() => {});
    }
  }, []);

  return { variant, visitorId, ready };
}
