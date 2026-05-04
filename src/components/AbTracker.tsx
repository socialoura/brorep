"use client";

import { useAbVariant } from "@/lib/useAbVariant";

/**
 * Lightweight component that ensures the A/B variant is determined and tracked
 * for every visitor on every page. Renders nothing.
 *
 * Mount this in the root layout so visitors are bucketed even if they never
 * interact with a component that calls useAbVariant().
 */
export default function AbTracker() {
  useAbVariant();
  return null;
}
