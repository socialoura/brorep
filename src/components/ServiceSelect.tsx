"use client";

import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import posthog from "posthog-js";
import type { ScanResult } from "@/components/ScanLoading";
import type { YouTubeVideoInfo } from "@/components/YouTubeUrlInput";
import { useTranslation, fmtPrice, type Currency } from "@/lib/i18n";

type ServiceType = "followers" | "likes" | "views" | "yt_subscribers" | "yt_likes" | "yt_views" | "sp_streams" | "x_followers" | "x_likes" | "x_retweets" | "tw_followers" | "tw_live_viewers";

interface Pack {
  qty: number;
  price: number;
  priceUsd: number;
  priceGbp: number;
  priceCad: number;
  priceNzd: number;
  priceChf: number;
  popular?: boolean;
}

export interface CartItem {
  service: ServiceType;
  label: string;
  qty: number;
  price: number;
  priceUsd: number;
  priceGbp: number;
  priceCad: number;
  priceNzd: number;
  priceChf: number;
  liveStartAt?: string; // ISO date for Twitch live viewers (when stream starts)
}

const DEFAULT_SERVICES: Partial<Record<ServiceType, { label: string; icon: React.ReactNode; packs: Pack[] }>> = {
  followers: {
    label: "Followers",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    packs: [
      { qty: 100, price: 2.99, priceUsd: 2.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 250, price: 5.99, priceUsd: 5.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 500, price: 9.99, priceUsd: 9.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0, popular: true },
      { qty: 1000, price: 16.99, priceUsd: 16.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 2500, price: 34.99, priceUsd: 34.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 5000, price: 59.99, priceUsd: 59.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 10000, price: 99.99, priceUsd: 99.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 25000, price: 199.99, priceUsd: 199.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
    ],
  },
  likes: {
    label: "Likes",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
    packs: [
      { qty: 100, price: 1.99, priceUsd: 1.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 250, price: 3.99, priceUsd: 3.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 500, price: 6.99, priceUsd: 6.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0, popular: true },
      { qty: 1000, price: 11.99, priceUsd: 11.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 2500, price: 24.99, priceUsd: 24.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 5000, price: 44.99, priceUsd: 44.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 10000, price: 79.99, priceUsd: 79.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 25000, price: 149.99, priceUsd: 149.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
    ],
  },
  views: {
    label: "Vues",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
    packs: [
      { qty: 500, price: 1.99, priceUsd: 1.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 1000, price: 3.49, priceUsd: 3.49, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 2500, price: 7.99, priceUsd: 7.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 5000, price: 12.99, priceUsd: 12.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0, popular: true },
      { qty: 10000, price: 22.99, priceUsd: 22.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 25000, price: 49.99, priceUsd: 49.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 50000, price: 89.99, priceUsd: 89.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 100000, price: 149.99, priceUsd: 149.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
    ],
  },
  yt_subscribers: {
    label: "Abonnés",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    packs: [
      { qty: 100, price: 3.99, priceUsd: 3.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 250, price: 7.99, priceUsd: 7.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 500, price: 13.99, priceUsd: 13.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0, popular: true },
      { qty: 1000, price: 24.99, priceUsd: 24.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 2500, price: 49.99, priceUsd: 49.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 5000, price: 89.99, priceUsd: 89.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
    ],
  },
  yt_likes: {
    label: "Likes",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
      </svg>
    ),
    packs: [
      { qty: 100, price: 2.49, priceUsd: 2.49, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 250, price: 4.99, priceUsd: 4.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 500, price: 8.99, priceUsd: 8.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0, popular: true },
      { qty: 1000, price: 14.99, priceUsd: 14.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 2500, price: 29.99, priceUsd: 29.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 5000, price: 54.99, priceUsd: 54.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
    ],
  },
  yt_views: {
    label: "Vues",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
    packs: [
      { qty: 500, price: 2.49, priceUsd: 2.49, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 1000, price: 4.49, priceUsd: 4.49, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 2500, price: 9.99, priceUsd: 9.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 5000, price: 16.99, priceUsd: 16.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0, popular: true },
      { qty: 10000, price: 29.99, priceUsd: 29.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 25000, price: 59.99, priceUsd: 59.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 50000, price: 99.99, priceUsd: 99.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
    ],
  },
  sp_streams: {
    label: "Streams",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" />
      </svg>
    ),
    packs: [
      { qty: 1000, price: 2.99, priceUsd: 2.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 2500, price: 6.49, priceUsd: 6.49, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 5000, price: 11.99, priceUsd: 11.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 10000, price: 21.99, priceUsd: 21.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0, popular: true },
      { qty: 25000, price: 49.99, priceUsd: 49.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 50000, price: 89.99, priceUsd: 89.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 100000, price: 159.99, priceUsd: 159.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 250000, price: 349.99, priceUsd: 349.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
    ],
  },
  x_followers: {
    label: "Followers",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    packs: [
      { qty: 100, price: 3.49, priceUsd: 3.49, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 250, price: 6.99, priceUsd: 6.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 500, price: 11.99, priceUsd: 11.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0, popular: true },
      { qty: 1000, price: 19.99, priceUsd: 19.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 2500, price: 39.99, priceUsd: 39.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 5000, price: 69.99, priceUsd: 69.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
    ],
  },
  x_likes: {
    label: "Likes",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
    packs: [
      { qty: 100, price: 2.49, priceUsd: 2.49, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 250, price: 4.99, priceUsd: 4.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 500, price: 8.99, priceUsd: 8.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0, popular: true },
      { qty: 1000, price: 14.99, priceUsd: 14.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 2500, price: 29.99, priceUsd: 29.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 5000, price: 54.99, priceUsd: 54.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
    ],
  },
  tw_followers: {
    label: "Followers",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    packs: [
      { qty: 100, price: 3.49, priceUsd: 3.49, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 250, price: 6.99, priceUsd: 6.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 500, price: 11.99, priceUsd: 11.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0, popular: true },
      { qty: 1000, price: 19.99, priceUsd: 19.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 2500, price: 39.99, priceUsd: 39.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 5000, price: 69.99, priceUsd: 69.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 10000, price: 119.99, priceUsd: 119.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 25000, price: 249.99, priceUsd: 249.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
    ],
  },
  tw_live_viewers: {
    label: "Live Viewers",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
    packs: [
      { qty: 10, price: 4.99, priceUsd: 4.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 25, price: 9.99, priceUsd: 9.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 50, price: 17.99, priceUsd: 17.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0, popular: true },
      { qty: 100, price: 29.99, priceUsd: 29.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 250, price: 64.99, priceUsd: 64.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 500, price: 119.99, priceUsd: 119.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 1000, price: 219.99, priceUsd: 219.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 2500, price: 499.99, priceUsd: 499.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
    ],
  },
  x_retweets: {
    label: "Retweets",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m17 2 4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" />
      </svg>
    ),
    packs: [
      { qty: 100, price: 2.99, priceUsd: 2.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 250, price: 5.49, priceUsd: 5.49, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 500, price: 9.99, priceUsd: 9.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0, popular: true },
      { qty: 1000, price: 17.99, priceUsd: 17.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 2500, price: 34.99, priceUsd: 34.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
      { qty: 5000, price: 59.99, priceUsd: 59.99, priceGbp: 0, priceCad: 0, priceNzd: 0, priceChf: 0 },
    ],
  },
};

const TIKTOK_KEYS: ServiceType[] = ["followers", "likes", "views"];
const YOUTUBE_KEYS: ServiceType[] = ["yt_views", "yt_likes", "yt_subscribers"];
const SPOTIFY_KEYS: ServiceType[] = ["sp_streams"];
const X_KEYS: ServiceType[] = ["x_followers", "x_likes", "x_retweets"];
const TWITCH_KEYS: ServiceType[] = ["tw_followers", "tw_live_viewers"];
const SERVICE_KEYS: ServiceType[] = [...TIKTOK_KEYS, ...YOUTUBE_KEYS, ...SPOTIFY_KEYS, ...X_KEYS, ...TWITCH_KEYS];

function fmtQty(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000) + "K";
  return String(n);
}

function priceForCurrency(p: Pack | CartItem, c: Currency): number {
  switch (c) {
    case "usd": return p.priceUsd || p.price;
    case "gbp": return p.priceGbp || p.price;
    case "cad": return p.priceCad || p.price;
    case "nzd": return p.priceNzd || p.price;
    case "chf": return p.priceChf || p.price;
    default: return p.price;
  }
}

type Services = Partial<Record<ServiceType, { label: string; icon: React.ReactNode; packs: Pack[] }>>;

interface ComboItem {
  service: string;
  qty: number;
}

interface ComboPack {
  id: number;
  name: string;
  name_en?: string;
  items: ComboItem[];
  discount_percent: number;
}

function findClosestPack(service: ServiceType, qty: number, servicesData: Services = DEFAULT_SERVICES as Services): Pack | null {
  const packs = servicesData[service]?.packs;
  if (!packs) return null;
  // Find exact match or closest >= qty
  const exact = packs.find((p) => p.qty === qty);
  if (exact) return exact;
  const bigger = packs.filter((p) => p.qty >= qty).sort((a, b) => a.qty - b.qty);
  return bigger[0] || packs[packs.length - 1];
}

export default function ServiceSelect({
  profile,
  onCheckout,
  onBack,
  platform = "tiktok",
  username: externalUsername,
  onUsernameChange,
  videoInfo,
  onVideoInfoChange,
}: {
  profile?: ScanResult | null;
  onCheckout: (cart: CartItem[]) => void;
  onBack: () => void;
  platform?: string;
  username?: string;
  onUsernameChange?: (u: string) => void;
  videoInfo?: YouTubeVideoInfo | null;
  onVideoInfoChange?: (info: YouTubeVideoInfo | null) => void;
}) {
  const { t, lang, currency } = useTranslation();
  const isYouTube = platform === "youtube";
  const isX = platform === "x";
  const isTwitch = platform === "twitch";
  // Theme colors
  const accent = isYouTube ? "rgb(255, 0, 0)" : isX ? "rgb(29, 155, 240)" : isTwitch ? "rgb(145, 71, 255)" : "rgb(105, 201, 208)";
  const accentMid = isYouTube ? "rgb(204, 0, 0)" : isX ? "rgb(29, 155, 240)" : isTwitch ? "rgb(145, 71, 255)" : "rgb(105, 201, 208)";
  const accentDark = isYouTube ? "rgb(153, 0, 0)" : isX ? "rgb(20, 120, 200)" : isTwitch ? "rgb(110, 50, 200)" : "rgb(79, 179, 186)";
  const accentBg = isYouTube ? "rgba(255, 0, 0, 0.05)" : isX ? "rgba(29, 155, 240, 0.05)" : isTwitch ? "rgba(145, 71, 255, 0.05)" : "rgba(79, 179, 186, 0.05)";
  const accentBorder = isYouTube ? "rgba(255, 0, 0, 0.12)" : isX ? "rgba(29, 155, 240, 0.12)" : isTwitch ? "rgba(145, 71, 255, 0.12)" : "rgba(105, 201, 208, 0.12)";
  const accentBorderStrong = isYouTube ? "rgba(255, 0, 0, 0.2)" : isX ? "rgba(29, 155, 240, 0.2)" : isTwitch ? "rgba(145, 71, 255, 0.2)" : "rgba(105, 201, 208, 0.2)";
  const accentGlow = isYouTube ? "rgba(255, 0, 0, 0.25)" : isX ? "rgba(29, 155, 240, 0.25)" : isTwitch ? "rgba(145, 71, 255, 0.25)" : "rgba(105, 201, 208, 0.25)";
  const gradientBg = isYouTube ? "linear-gradient(135deg, rgb(153, 0, 0), rgb(255, 0, 0))" : isX ? "linear-gradient(135deg, rgb(20, 120, 200), rgb(29, 155, 240))" : isTwitch ? "linear-gradient(135deg, rgb(110, 50, 200), rgb(145, 71, 255))" : "linear-gradient(135deg, rgb(79, 179, 186), rgb(105, 201, 208))";
  const activeKeys = isYouTube ? YOUTUBE_KEYS : isX ? X_KEYS : isTwitch ? TWITCH_KEYS : TIKTOK_KEYS;
  const [activeTab, setActiveTab] = useState<ServiceType>(activeKeys[0]);
  // One selected pack index per service type
  const [selections, setSelections] = useState<Partial<Record<ServiceType, number>>>({}); 
  const [combos, setCombos] = useState<ComboPack[]>([]);
  const [combosLoading, setCombosLoading] = useState(true);
  const [selectedCombo, setSelectedCombo] = useState<{ id: number; items: CartItem[] } | null>(null);
  const [usernameError, setUsernameError] = useState(false);
  const [previewProfile, setPreviewProfile] = useState<{ username: string; fullName: string; avatarUrl: string; followersCount: number } | null>(null);
  const [previewVideo, setPreviewVideo] = useState<YouTubeVideoInfo | null>(videoInfo || null);
  const [urlInvalid, setUrlInvalid] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const lookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [services, setServices] = useState<Services>(DEFAULT_SERVICES as Services);
  const [pricingLoaded, setPricingLoaded] = useState(false);
  const [toast, setToast] = useState<{ message: string; cta: string; targetTab: ServiceType } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showCombos = platform === "tiktok";

  useEffect(() => {
    // Fetch combos + dynamic pricing in parallel — combos only on TikTok
    if (showCombos) {
      fetch("/api/combos")
        .then((r) => r.json())
        .then((data) => { if (data.combos) setCombos(data.combos); })
        .catch(() => {})
        .finally(() => setCombosLoading(false));
    } else {
      setCombosLoading(false);
    }

    fetch("/api/pricing")
      .then((r) => r.json())
      .then((data) => {
        if (!data.pricing || !Array.isArray(data.pricing)) return;
        const grouped: Partial<Record<ServiceType, Pack[]>> = {};
        for (const row of data.pricing) {
          const svc = row.service as ServiceType;
          if (!SERVICE_KEYS.includes(svc)) continue;
          if (!grouped[svc]) grouped[svc] = [];
          grouped[svc]!.push({ qty: Number(row.qty), price: Number(row.price), priceUsd: Number(row.price_usd || 0), priceGbp: Number(row.price_gbp || 0), priceCad: Number(row.price_cad || 0), priceNzd: Number(row.price_nzd || 0), priceChf: Number(row.price_chf || 0), popular: !!row.popular });
        }
        setServices((prev) => {
          const next = { ...prev };
          for (const key of activeKeys) {
            if (grouped[key] && grouped[key]!.length > 0) {
              const sorted = grouped[key]!.sort((a, b) => a.qty - b.qty);
              // If no pack is marked popular in DB, fall back to middle pack
              if (!sorted.some((p) => p.popular)) {
                const popIdx = Math.floor(sorted.length / 2);
                sorted[popIdx] = { ...sorted[popIdx], popular: true };
              }
              next[key] = { ...next[key]!, packs: sorted };
            }
          }
          return next;
        });
      })
      .catch(() => {})
      .finally(() => setPricingLoaded(true));
  }, []);

  // Debounced lookup for profile (or YouTube video) preview based on the input value.
  useEffect(() => {
    if (lookupTimer.current) clearTimeout(lookupTimer.current);
    const raw = (externalUsername || "").trim();

    if (isYouTube) {
      if (raw.length < 4) { setPreviewVideo(null); setPreviewLoading(false); setUrlInvalid(false); onVideoInfoChange?.(null); return; }
      setUrlInvalid(false);
      setPreviewLoading(true);
      lookupTimer.current = setTimeout(() => {
        fetch(`/api/youtube-video-info?url=${encodeURIComponent(raw)}`)
          .then((r) => r.json())
          .then((data) => {
            if (data && !data.error && data.videoId) {
              const info = data as YouTubeVideoInfo;
              setPreviewVideo(info);
              setUrlInvalid(false);
              setEditingUsername(false);
              onVideoInfoChange?.(info);
            } else {
              setPreviewVideo(null);
              setUrlInvalid(true);
              onVideoInfoChange?.(null);
            }
          })
          .catch(() => { setPreviewVideo(null); setUrlInvalid(true); onVideoInfoChange?.(null); })
          .finally(() => setPreviewLoading(false));
      }, 600);
      return () => { if (lookupTimer.current) clearTimeout(lookupTimer.current); };
    }

    if (raw.length < 2) { setPreviewProfile(null); setPreviewLoading(false); return; }
    setPreviewLoading(true);
    lookupTimer.current = setTimeout(() => {
      const endpoint = isX
        ? `/api/scraper-x?username=${encodeURIComponent(raw)}`
        : isTwitch
          ? `/api/scraper-twitch?username=${encodeURIComponent(raw)}`
          : platform === "instagram"
            ? `/api/scraper-instagram?username=${encodeURIComponent(raw)}`
            : `/api/scraper-tiktok?username=${encodeURIComponent(raw)}`;
      fetch(endpoint)
        .then((r) => r.json())
        .then((data) => {
          if (data.username) {
            setPreviewProfile({
              username: data.username,
              fullName: data.fullName || data.username,
              avatarUrl: data.avatarUrl || "",
              followersCount: data.followersCount || 0,
            });
          } else {
            setPreviewProfile(null);
          }
        })
        .catch(() => setPreviewProfile(null))
        .finally(() => setPreviewLoading(false));
    }, 800);
    return () => { if (lookupTimer.current) clearTimeout(lookupTimer.current); };
  }, [externalUsername, platform, isYouTube, isX, isTwitch, onVideoInfoChange]);

  // Pre-select TOP pack (the one with `popular: true`) once pricing is loaded.
  // Only runs once per tab — if the user deselects, we don't re-select.
  const autoSelectedRef = useRef<Set<ServiceType>>(new Set());
  useEffect(() => {
    if (!pricingLoaded) return; // wait for real packs from /api/pricing
    if (autoSelectedRef.current.has(activeTab)) return;
    if (selectedCombo) return; // user picked a combo, don't override
    if (selections[activeTab] !== undefined) {
      autoSelectedRef.current.add(activeTab);
      return;
    }
    const svc = services[activeTab];
    if (!svc || !svc.packs || svc.packs.length === 0) return;
    const popIdx = svc.packs.findIndex((p) => p.popular);
    if (popIdx >= 0) {
      setSelections((prev) => (prev[activeTab] !== undefined ? prev : { ...prev, [activeTab]: popIdx }));
      autoSelectedRef.current.add(activeTab);
    }
  }, [activeTab, services, selectedCombo, selections, pricingLoaded]);

  const service = services[activeTab]!;
  const selectedIdx = selections[activeTab] ?? null;

  const MULTI_DISCOUNT = 0.10; // 10% off when 2+ services

  function showToast(message: string, cta: string, targetTab: ServiceType) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, cta, targetTab });
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  }

  function togglePack(idx: number) {
    setSelectedCombo(null); // clear combo when selecting individual packs
    setSelections((prev) => {
      const copy = { ...prev };
      if (copy[activeTab] === idx) {
        delete copy[activeTab];
      } else {
        copy[activeTab] = idx;
        const pack = service.packs[idx];
        if (pack) posthog.capture("service_selected", { platform, service: activeTab, qty: pack.qty, price: pack.price });
        // Show toast suggesting another service
        const missing = activeKeys.filter((k) => k !== activeTab && copy[k] === undefined);
        if (missing.length > 0) {
          const suggest = missing[0];
          const suggestLabel = services[suggest]?.label || suggest;
          showToast(
            t("service.toastMsg").replace("{service}", suggestLabel),
            `${t("service.toastCta")} ${suggestLabel} →`,
            suggest
          );
        }
      }
      return copy;
    });
  }

  // Build cart from all selections OR from combo
  const uniqueServiceCount = selectedCombo ? 0 : Object.keys(selections).length;
  const hasMultiDiscount = !selectedCombo && uniqueServiceCount >= 2;

  const cart: CartItem[] = selectedCombo
    ? selectedCombo.items
    : activeKeys
      .filter((k) => selections[k] !== undefined)
      .map((k) => {
        const pack = services[k]!.packs[selections[k]!];
        const discountMult = hasMultiDiscount ? (1 - MULTI_DISCOUNT) : 1;
        return {
          service: k,
          label: services[k]!.label,
          qty: pack.qty,
          price: Number((pack.price * discountMult).toFixed(2)),
          priceUsd: Number(((pack.priceUsd || pack.price) * discountMult).toFixed(2)),
          priceGbp: Number(((pack.priceGbp || pack.price) * discountMult).toFixed(2)),
          priceCad: Number(((pack.priceCad || pack.price) * discountMult).toFixed(2)),
          priceNzd: Number(((pack.priceNzd || pack.price) * discountMult).toFixed(2)),
          priceChf: Number(((pack.priceChf || pack.price) * discountMult).toFixed(2)),
        };
      });

  const totalBeforeDiscount = selectedCombo
    ? 0
    : activeKeys
      .filter((k) => selections[k] !== undefined)
      .reduce((sum, k) => {
        const pack = services[k]!.packs[selections[k]!];
        return sum + priceForCurrency(pack, currency);
      }, 0);
  const total = cart.reduce((sum, item) => sum + priceForCurrency(item, currency), 0);
  const currentUsername = profile?.username || externalUsername || "";
  const hasItems = cart.length > 0;
  const hasUsername = isYouTube
    ? !!(videoInfo || previewVideo)
    : currentUsername.trim().length >= 2;
  const canCheckout = hasItems && hasUsername;

  function handleCheckoutClick() {
    if (!hasItems) return;
    if (!hasUsername) {
      setUsernameError(true);
      setTimeout(() => setUsernameError(false), 2000);
      const el = document.getElementById("username-input-section");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    onCheckout(cart);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        maxWidth: "540px",
        padding: "0 16px",
      }}
    >
      {/* Username input or mini profile recap (TikTok/Instagram/X/Twitch) */}
      {!isYouTube && profile && !editingUsername ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "10px 16px",
            borderRadius: "12px",
            backgroundColor: accentBg,
            border: `1px solid ${accentBorder}`,
            marginBottom: "20px",
            width: "100%",
            maxWidth: "360px",
          }}
        >
          <img
            src={profile.avatarUrl}
            alt={profile.username}
            style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", border: `2px solid ${accentBorderStrong}` }}
          />
          <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#fff" }}>@{profile.username}</p>
          </div>
          <button
            onClick={() => { setEditingUsername(true); onUsernameChange?.(""); }}
            style={{ padding: "5px 10px", borderRadius: "8px", border: `1px solid ${accentBorder}`, background: "transparent", color: "rgb(169,181,174)", fontSize: "11px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", transition: "all 0.2s", flexShrink: 0 }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = accentBorder; e.currentTarget.style.color = "rgb(169,181,174)"; }}
          >
            {lang === "en" ? "Change" : "Changer"}
          </button>
        </div>
      ) : null}

      {/* YouTube video recap */}
      {isYouTube && previewVideo && !editingUsername ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "10px 12px",
            borderRadius: "12px",
            backgroundColor: accentBg,
            border: `1px solid ${accentBorder}`,
            marginBottom: "20px",
            width: "100%",
            maxWidth: "360px",
          }}
        >
          <img
            src={previewVideo.thumbnail}
            alt={previewVideo.title}
            style={{ width: "60px", height: "40px", borderRadius: "6px", objectFit: "cover", border: `1px solid ${accentBorderStrong}`, flexShrink: 0 }}
          />
          <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{previewVideo.title}</p>
            <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "rgb(107,117,111)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{previewVideo.channelName}</p>
          </div>
          <button
            onClick={() => { setEditingUsername(true); onUsernameChange?.(""); setPreviewVideo(null); onVideoInfoChange?.(null); }}
            style={{ padding: "5px 10px", borderRadius: "8px", border: `1px solid ${accentBorder}`, background: "transparent", color: "rgb(169,181,174)", fontSize: "11px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", transition: "all 0.2s", flexShrink: 0 }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = accentBorder; e.currentTarget.style.color = "rgb(169,181,174)"; }}
          >
            {lang === "en" ? "Change" : "Changer"}
          </button>
        </div>
      ) : null}

      {/* Title */}
      <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#fff", margin: "0 0 4px 0" }}>
        {t("service.composeTitle")} <span style={{ color: accent, textShadow: `0 0 20px ${isYouTube ? 'rgba(255,0,0,0.3)' : 'rgba(105,201,208,0.3)'}` }}>{t("service.pack")}</span>
      </h2>
      <p style={{ fontSize: "13px", color: "rgb(169, 181, 174)", margin: "0 0 20px 0" }}>
        {t("service.composeSubtitle")}
      </p>

      {/* Tabs */}
      <div className="service-tabs">
        {activeKeys.map((key) => {
          const isActive = activeTab === key;
          const hasSelection = selections[key] !== undefined;
          return (
            <button
              key={key}
              className="service-tab-btn"
              onClick={() => setActiveTab(key)}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: 600,
                color: isActive ? "#000" : "rgb(169, 181, 174)",
                background: isActive ? gradientBg : "transparent",
                boxShadow: isActive ? `0 4px 16px ${accentGlow}` : "none",
                transition: "all 0.2s",
              }}
            >
              <span style={{ display: "flex", opacity: isActive ? 1 : 0.6 }}>{DEFAULT_SERVICES[key]?.icon}</span>
              {services[key]?.label}
              {hasSelection && !isActive && (
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    backgroundColor: accent,
                    position: "absolute",
                    top: "6px",
                    right: "6px",
                    boxShadow: `0 0 4px ${isYouTube ? 'rgba(255,0,0,0.5)' : 'rgba(105,201,208,0.5)'}`,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Multi-service discount banner */}
      <div style={{
        width: "100%", padding: "8px 14px", borderRadius: "10px", marginBottom: "14px",
        background: hasMultiDiscount
          ? `linear-gradient(135deg, ${isYouTube ? "rgba(255,0,0,0.12)" : "rgba(105,201,208,0.12)"}, ${isYouTube ? "rgba(255,0,0,0.04)" : "rgba(105,201,208,0.04)"})`
          : "rgba(255,255,255,0.02)",
        border: hasMultiDiscount ? `1px solid ${accentBorderStrong}` : `1px dashed ${accentBorder}`,
        display: "flex", alignItems: "center", gap: "8px", transition: "all 0.3s",
      }}>
        <span style={{ fontSize: "16px" }}>{hasMultiDiscount ? "🎉" : "🎁"}</span>
        <span style={{ fontSize: "12px", fontWeight: 600, color: hasMultiDiscount ? accent : "rgb(169,181,174)" }}>
          {hasMultiDiscount ? t("service.discountApplied") : t("service.discountHint")}
        </span>
      </div>

      {/* Packs grid — 2 cols × 4 rows */}
      <div className="grid-packs" style={{ marginBottom: "20px" }}>
        {(() => {
          const basePPU = service.packs.length > 0 ? priceForCurrency(service.packs[0], currency) / service.packs[0].qty : 0;
          return service.packs.map((pack, i) => {
            const isSelected = selectedIdx === i;
            const ppu = priceForCurrency(pack, currency) / pack.qty;
            const savePct = basePPU > 0 ? Math.round((1 - ppu / basePPU) * 100) : 0;
            return (
              <button
                key={i}
                onClick={() => togglePack(i)}
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  padding: "14px 8px",
                  borderRadius: "14px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  border: isSelected ? `2px solid ${accent}` : `1px solid ${accentBorder}`,
                  backgroundColor: isSelected ? (isYouTube ? "rgba(255, 0, 0, 0.1)" : "rgba(79, 179, 186, 0.1)") : "rgba(255, 255, 255, 0.02)",
                  boxShadow: isSelected ? (isYouTube ? "0 0 20px rgba(255,0,0,0.1), inset 0 0 20px rgba(255,0,0,0.05)" : "0 0 20px rgba(105, 201, 208, 0.1), inset 0 0 20px rgba(79, 179, 186, 0.05)") : "none",
                  transition: "all 0.2s",
                }}
              >
                {pack.popular && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-7px",
                      right: "-2px",
                      zIndex: 1,
                      padding: "2px 7px",
                      borderRadius: "9999px",
                      fontSize: "8px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      background: isYouTube ? "#1a0a0a" : "#0a1a1b",
                      color: accent,
                      border: `1px solid ${accentBorderStrong}`,
                    }}
                  >
                    {t("service.top")}
                  </span>
                )}
                {isSelected && (
                  <span
                    style={{
                      position: "absolute",
                      top: "8px",
                      left: "8px",
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      backgroundColor: accent,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={isYouTube ? "#fff" : "#000"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
                <span style={{ fontSize: "18px", fontWeight: 700, color: "rgb(232, 247, 237)" }}>
                  {fmtQty(pack.qty)}
                </span>
                <span style={{ fontSize: "10px", color: "rgb(107, 117, 111)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                  {service.label}
                </span>
                <span
                  style={{
                    marginTop: "2px",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: isSelected ? accentMid : "rgb(169, 181, 174)",
                    transition: "color 0.2s",
                  }}
                >
                  {fmtPrice(priceForCurrency(pack, currency), currency)}
                </span>
                {savePct > 0 && (
                  <span style={{
                    marginTop: "2px", fontSize: "10px", fontWeight: 700,
                    color: "#00d26a", backgroundColor: "rgba(0,210,106,0.1)",
                    padding: "1px 6px", borderRadius: "6px",
                  }}>
                    -{savePct}%
                  </span>
                )}
              </button>
            );
          });
        })()}
      </div>

      {/* Username / URL input — after packs */}
      {((!isYouTube && (!profile || editingUsername)) || (isYouTube && (!previewVideo || editingUsername))) && (
        <div id="username-input-section" style={{ width: "100%", maxWidth: "360px", marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "rgb(169,181,174)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {isYouTube ? t("service.youtubeUrlLabel") : t("service.usernameLabel")}
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "0", borderRadius: "12px", border: usernameError ? `1px solid #ef4444` : `1px solid ${accentBorder}`, backgroundColor: usernameError ? "rgba(239,68,68,0.05)" : accentBg, overflow: "hidden", transition: "all 0.3s", animation: usernameError ? "shake 0.4s ease-in-out" : "none" }}>
            {!isYouTube && (
              <span style={{ padding: "0 0 0 14px", fontSize: "14px", color: "rgb(107,117,111)", fontWeight: 600, userSelect: "none" }}>@</span>
            )}
            <input
              type={isYouTube ? "url" : "text"}
              value={externalUsername || ""}
              onChange={(e) => isYouTube
                ? onUsernameChange?.(e.target.value)
                : onUsernameChange?.(e.target.value.replace(/^@/, "").replace(/\s/g, ""))
              }
              placeholder={isYouTube ? t("service.youtubeUrlPlaceholder") : t("service.usernamePlaceholder")}
              style={{ flex: 1, padding: isYouTube ? "12px 14px" : "12px 14px 12px 4px", border: "none", background: "transparent", color: "#fff", fontSize: "14px", fontFamily: "inherit", outline: "none" }}
            />
          </div>
          {/* Preview dropdown */}
          {!isYouTube && (previewLoading || previewProfile) && (externalUsername || "").trim().length >= 2 && (
            <div style={{
              marginTop: "6px", padding: "10px 14px", borderRadius: "10px",
              border: `1px solid ${accentBorder}`, backgroundColor: "rgba(14,21,18,0.95)",
              display: "flex", alignItems: "center", gap: "10px",
              animation: "fadeIn 0.2s ease",
            }}>
              {previewLoading ? (
                <>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", flexShrink: 0, animation: "pulse 1.5s ease-in-out infinite" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: "12px", width: "80px", borderRadius: "4px", background: "rgba(255,255,255,0.06)", marginBottom: "6px", animation: "pulse 1.5s ease-in-out infinite" }} />
                    <div style={{ height: "10px", width: "50px", borderRadius: "4px", background: "rgba(255,255,255,0.04)", animation: "pulse 1.5s ease-in-out infinite" }} />
                  </div>
                </>
              ) : previewProfile ? (
                <>
                  {previewProfile.avatarUrl ? (
                    <img
                      src={previewProfile.avatarUrl.startsWith("http") ? `/api/image-proxy?url=${encodeURIComponent(previewProfile.avatarUrl)}` : previewProfile.avatarUrl}
                      alt=""
                      style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", border: `2px solid ${accent}`, flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: accentBg, border: `2px solid ${accent}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: accent }}>{(previewProfile.username[0] || "?").toUpperCase()}</span>
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {previewProfile.fullName}
                    </p>
                    <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "rgb(107,117,111)" }}>
                      @{previewProfile.username}
                      {previewProfile.followersCount > 0 && (
                        <> · {previewProfile.followersCount >= 1000 ? `${(previewProfile.followersCount / 1000).toFixed(1)}K` : previewProfile.followersCount} followers</>
                      )}
                    </p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <button
                    onClick={() => { onUsernameChange?.(""); setPreviewProfile(null); }}
                    style={{ marginLeft: "4px", padding: "4px 8px", borderRadius: "8px", border: `1px solid ${accentBorder}`, background: "transparent", color: "rgb(169,181,174)", fontSize: "10px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", transition: "all 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = accentBorder; e.currentTarget.style.color = "rgb(169,181,174)"; }}
                  >
                    {lang === "en" ? "Change" : "Changer"}
                  </button>
                </>
              ) : null}
            </div>
          )}
          {/* YouTube video preview dropdown */}
          {isYouTube && (previewLoading || previewVideo) && (externalUsername || "").trim().length >= 4 && (
            <div style={{
              marginTop: "6px", padding: "10px 12px", borderRadius: "10px",
              border: `1px solid ${accentBorder}`, backgroundColor: "rgba(14,21,18,0.95)",
              display: "flex", alignItems: "center", gap: "10px",
              animation: "fadeIn 0.2s ease",
            }}>
              {previewLoading ? (
                <>
                  <div style={{ width: "60px", height: "40px", borderRadius: "6px", background: "rgba(255,255,255,0.06)", flexShrink: 0, animation: "pulse 1.5s ease-in-out infinite" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: "12px", width: "80%", borderRadius: "4px", background: "rgba(255,255,255,0.06)", marginBottom: "6px", animation: "pulse 1.5s ease-in-out infinite" }} />
                    <div style={{ height: "10px", width: "50%", borderRadius: "4px", background: "rgba(255,255,255,0.04)", animation: "pulse 1.5s ease-in-out infinite" }} />
                  </div>
                </>
              ) : previewVideo ? (
                <>
                  <img
                    src={previewVideo.thumbnail}
                    alt=""
                    style={{ width: "60px", height: "40px", borderRadius: "6px", objectFit: "cover", border: `1px solid ${accent}`, flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {previewVideo.title}
                    </p>
                    <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "rgb(107,117,111)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {previewVideo.channelName}
                    </p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </>
              ) : null}
            </div>
          )}
          {/* YouTube URL invalid hint */}
          {isYouTube && urlInvalid && !previewLoading && (
            <p style={{ marginTop: "6px", fontSize: "12px", color: "#ef4444", fontWeight: 500 }}>
              {t("service.youtubeUrlInvalid")}
            </p>
          )}
          {usernameError && (
            <p style={{ marginTop: "6px", fontSize: "12px", color: "#ef4444", fontWeight: 500 }}>
              {isYouTube ? t("service.youtubeUrlRequired") : t("service.usernameRequired")}
            </p>
          )}
        </div>
      )}

      {/* Combo packs — TikTok only, below individual packs */}
      {showCombos && (combosLoading ? (
        <div style={{ width: "100%", marginBottom: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
            {[1, 2].map((i) => (
              <div key={i} style={{ padding: "16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)" }}>
                <div style={{ height: "14px", width: "60%", borderRadius: "6px", background: "rgba(255,255,255,0.05)", marginBottom: "10px", animation: "pulse 1.5s ease-in-out infinite" }} />
                <div style={{ height: "10px", width: "80%", borderRadius: "6px", background: "rgba(255,255,255,0.03)", marginBottom: "6px", animation: "pulse 1.5s ease-in-out infinite" }} />
                <div style={{ height: "10px", width: "40%", borderRadius: "6px", background: "rgba(255,255,255,0.03)", animation: "pulse 1.5s ease-in-out infinite" }} />
              </div>
            ))}
          </div>
        </div>
      ) : combos.length > 0 && (
        <div style={{ width: "100%", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "0 0 14px 0" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.06)" }} />
            <span style={{ fontSize: "11px", color: "rgb(107, 117, 111)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("service.orCompose")}</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.06)" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
            {combos.map((combo) => {
              const comboItems = combo.items
                .map((ci) => {
                  const svc = ci.service as ServiceType;
                  const pack = findClosestPack(svc, ci.qty, services);
                  if (!pack) return null;
                  return { service: svc, label: services[svc]?.label ?? svc, qty: pack.qty, price: pack.price, priceUsd: pack.priceUsd || pack.price, priceGbp: pack.priceGbp || pack.price, priceCad: pack.priceCad || pack.price, priceNzd: pack.priceNzd || pack.price, priceChf: pack.priceChf || pack.price };
                })
                .filter(Boolean) as CartItem[];

              const originalTotal = comboItems.reduce((s, i) => s + priceForCurrency(i, currency), 0);
              const discountedTotal = originalTotal * (1 - combo.discount_percent / 100);

              return (
                <button
                  key={combo.id}
                  onClick={() => {
                    if (selectedCombo?.id === combo.id) {
                      setSelectedCombo(null); // deselect
                    } else {
                      const dm = 1 - combo.discount_percent / 100;
                      const discountedItems = comboItems.map((item) => ({
                        ...item,
                        price: Number((item.price * dm).toFixed(2)),
                        priceUsd: Number((item.priceUsd * dm).toFixed(2)),
                        priceGbp: Number((item.priceGbp * dm).toFixed(2)),
                        priceCad: Number((item.priceCad * dm).toFixed(2)),
                        priceNzd: Number((item.priceNzd * dm).toFixed(2)),
                        priceChf: Number((item.priceChf * dm).toFixed(2)),
                      }));
                      setSelections({}); // clear individual selections
                      setSelectedCombo({ id: combo.id, items: discountedItems });
                      posthog.capture("combo_selected", { combo_name: combo.name, discount_percent: combo.discount_percent, total: discountedItems.reduce((s, i) => s + i.price, 0) });
                    }
                  }}
                  style={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    padding: "16px",
                    borderRadius: "14px",
                    border: selectedCombo?.id === combo.id ? `2px solid ${accent}` : `1px solid ${accentBorderStrong}`,
                    background: selectedCombo?.id === combo.id
                      ? (isYouTube ? "rgba(255, 0, 0, 0.12)" : "rgba(105, 201, 208, 0.12)")
                      : (isYouTube ? "linear-gradient(135deg, rgba(255, 0, 0, 0.08), rgba(255, 0, 0, 0.02))" : "linear-gradient(135deg, rgba(79, 179, 186, 0.08), rgba(105, 201, 208, 0.02))"),
                    boxShadow: selectedCombo?.id === combo.id ? `0 0 20px ${accentGlow}` : "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textAlign: "left",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => { if (selectedCombo?.id !== combo.id) { e.currentTarget.style.borderColor = isYouTube ? "rgba(255, 0, 0, 0.4)" : "rgba(105, 201, 208, 0.4)"; e.currentTarget.style.transform = "scale(1.02)"; } }}
                  onMouseLeave={(e) => { if (selectedCombo?.id !== combo.id) { e.currentTarget.style.borderColor = isYouTube ? "rgba(255, 0, 0, 0.2)" : "rgba(105, 201, 208, 0.2)"; e.currentTarget.style.transform = "scale(1)"; } }}
                >
                  <span style={{
                    position: "absolute", top: "-8px", right: "10px",
                    padding: "3px 10px", borderRadius: "9999px",
                    fontSize: "10px", fontWeight: 800,
                    background: gradientBg,
                    color: "#000", letterSpacing: "0.03em",
                  }}>
                    -{combo.discount_percent}%
                  </span>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#fff" }}>{lang === "en" && combo.name_en ? combo.name_en : combo.name}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {comboItems.map((item, i) => (
                      <span key={i} style={{ padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, backgroundColor: "rgba(255,255,255,0.04)", color: "rgb(169, 181, 174)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        {fmtQty(item.qty)} {item.label}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "12px", color: "rgb(107, 117, 111)", textDecoration: "line-through" }}>{fmtPrice(originalTotal, currency)}</span>
                    <span style={{ fontSize: "16px", fontWeight: 800, color: accent }}>{fmtPrice(discountedTotal, currency)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Cart summary */}
      {cart.length > 0 && (
        <div
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: "12px",
            backgroundColor: isYouTube ? "rgba(255, 0, 0, 0.06)" : "rgba(79, 179, 186, 0.06)",
            border: `1px solid ${isYouTube ? 'rgba(255,0,0,0.15)' : 'rgba(105,201,208,0.15)'}`,
            marginBottom: "20px",
          }}
        >
          <p style={{ margin: "0 0 8px 0", fontSize: "11px", fontWeight: 600, color: "rgb(169, 181, 174)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {t("service.yourCart")}
          </p>
          {cart.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "4px 0",
              }}
            >
              <span style={{ fontSize: "13px", color: "rgb(232, 247, 237)" }}>
                {fmtQty(item.qty)} {item.label}
              </span>
              <span style={{ fontSize: "13px", fontWeight: 600, color: accentMid }}>
                {fmtPrice(priceForCurrency(item, currency), currency)}
              </span>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: `1px solid ${isYouTube ? 'rgba(255,0,0,0.1)' : 'rgba(105,201,208,0.1)'}`,
              marginTop: "8px",
              paddingTop: "8px",
            }}
          >
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{t("service.total")}</span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {hasMultiDiscount && <span style={{ fontSize: "12px", color: "rgb(107,117,111)", textDecoration: "line-through" }}>{fmtPrice(totalBeforeDiscount, currency)}</span>}
              <span style={{ fontSize: "16px", fontWeight: 700, color: accent }}>{fmtPrice(total, currency)}</span>
              {hasMultiDiscount && <span style={{ fontSize: "10px", fontWeight: 700, color: accent, padding: "2px 6px", borderRadius: "6px", background: isYouTube ? "rgba(255,0,0,0.1)" : "rgba(105,201,208,0.1)" }}>-10%</span>}
            </span>
          </div>
          {/* Suggest missing services */}
          {(() => {
            const cartServiceKeys = new Set(cart.map((c) => c.service));
            const missing = activeKeys.filter((k) => !cartServiceKeys.has(k));
            if (missing.length === 0) return null;
            return (
              <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: `1px dashed ${isYouTube ? "rgba(255,0,0,0.1)" : "rgba(105,201,208,0.1)"}` }}>
                <p style={{ margin: "0 0 6px 0", fontSize: "11px", color: "rgb(107,117,111)" }}>
                  {t("service.boostTip")}
                </p>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {missing.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveTab(key)}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "4px",
                        padding: "5px 10px", borderRadius: "8px", border: `1px dashed ${accentBorderStrong}`,
                        background: "transparent", color: accent, fontSize: "11px", fontWeight: 600,
                        cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = accentBg; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <span style={{ display: "flex", opacity: 0.7 }}>{DEFAULT_SERVICES[key]?.icon}</span>
                      + {services[key]?.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={handleCheckoutClick}
        disabled={!hasItems}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "16px 36px",
          borderRadius: "14px",
          border: "none",
          cursor: hasItems ? "pointer" : "not-allowed",
          fontWeight: 700,
          fontSize: "16px",
          fontFamily: "inherit",
          color: hasItems ? (isYouTube ? "#fff" : "#000") : "rgb(80, 80, 80)",
          background: hasItems ? gradientBg : "rgba(255, 255, 255, 0.06)",
          boxShadow: hasItems ? `0 10px 30px ${accentGlow}` : "none",
          transition: "all 0.2s",
          opacity: hasItems ? 1 : 0.5,
        }}
        onMouseEnter={(e) => { if (hasItems) e.currentTarget.style.transform = "scale(1.03)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />
        </svg>
        {cart.length > 0
          ? `${t("service.checkout")} ${fmtPrice(total, currency)}`
          : t("service.selectAtLeast")
        }
      </button>

      {/* Back */}
      <button
        onClick={onBack}
        style={{
          marginTop: "14px",
          marginBottom: "16px",
          fontSize: "12px",
          color: "rgb(107, 117, 111)",
          background: "none",
          border: "none",
          cursor: "pointer",
          textDecoration: "underline",
          fontFamily: "inherit",
          transition: "color 0.2s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "rgb(169, 181, 174)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "rgb(107, 117, 111)"; }}
      >
        {t("service.backToProfile")}
      </button>

      {/* Spacer for fixed bottom bar */}
      <div style={{ height: "72px" }} />

      {/* Toast notification */}
      {typeof window !== "undefined" && toast && ReactDOM.createPortal(
        <div
          style={{
            position: "fixed",
            bottom: "68px",
            left: "50%",
            transform: "translateX(-50%)",
            maxWidth: "360px",
            width: "calc(100% - 32px)",
            padding: "12px 14px",
            borderRadius: "12px",
            background: isYouTube ? "rgba(40,8,8,0.97)" : "rgba(8,30,28,0.97)",
            border: `1px solid ${accentBorderStrong}`,
            backdropFilter: "blur(12px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            animation: "fadeIn 0.3s ease",
            boxShadow: `0 8px 32px ${isYouTube ? "rgba(255,0,0,0.15)" : "rgba(105,201,208,0.15)"}`,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: "12px", color: "rgb(232,247,237)", lineHeight: 1.4 }}>{toast.message}</p>
          </div>
          <button
            onClick={() => { setActiveTab(toast.targetTab); setToast(null); }}
            style={{
              padding: "6px 12px", borderRadius: "8px", border: "none",
              background: gradientBg, color: isYouTube ? "#fff" : "#000",
              fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              whiteSpace: "nowrap", flexShrink: 0,
            }}
          >
            {toast.cta}
          </button>
          <button
            onClick={() => setToast(null)}
            style={{ background: "none", border: "none", color: "rgb(107,117,111)", fontSize: "14px", cursor: "pointer", padding: "0 2px", flexShrink: 0 }}
          >
            ✕
          </button>
        </div>,
        document.body
      )}

      {/* Fixed bottom cart bar — always visible */}
      {typeof window !== "undefined" && ReactDOM.createPortal(
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "10px 16px",
            background: "linear-gradient(180deg, rgba(5,10,12,0.97), rgba(3,7,8,1))",
            borderTop: `1px solid ${accentBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 9999,
            backdropFilter: "blur(16px)",
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>{cart.length > 0 ? `${cart.length} ${cart.length > 1 ? "articles" : "article"}` : t("service.emptyCart")}</span>
              {cart.length > 0 && <span style={{ fontSize: "15px", fontWeight: 700, color: accent, marginLeft: "8px" }}>{fmtPrice(total, currency)}</span>}
            </div>
          </div>
          <button
            onClick={handleCheckoutClick}
            disabled={!hasItems}
            style={{
              padding: "10px 24px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "13px",
              fontFamily: "inherit",
              color: isYouTube ? "#fff" : "#000",
              background: gradientBg,
              opacity: hasItems ? 1 : 0.5,
              flexShrink: 0,
            }}
          >
            {t("service.checkout")} &rarr;
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
