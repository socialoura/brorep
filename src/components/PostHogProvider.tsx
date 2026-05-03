"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

let posthogInitialized = false;
function initPostHog() {
  if (posthogInitialized || typeof window === "undefined" || !process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) return;
  posthogInitialized = true;
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
    capture_pageview: false,
    capture_pageleave: true,
    loaded: () => {},
  });
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ph = usePostHog();

  useEffect(() => {
    if (pathname && ph) {
      let url = window.origin + pathname;
      if (searchParams.toString()) url += "?" + searchParams.toString();
      ph.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams, ph]);

  return null;
}

export default function PostHogProviderWrapper({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(posthogInitialized);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) return;
    const init = () => { initPostHog(); setReady(true); };
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(init, { timeout: 3000 });
    } else {
      setTimeout(init, 1500);
    }
  }, []);

  if (!ready || !process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  );
}
