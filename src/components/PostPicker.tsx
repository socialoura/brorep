"use client";

import { useState } from "react";
import type { ScanResult } from "@/components/ScanLoading";
import type { CartItem } from "@/components/ServiceSelect";
import { useTranslation } from "@/lib/i18n";

function fmtN(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

export interface PostAssignment {
  postId: string;
  postUrl: string;
  imageUrl: string;
  likes: boolean;
  views: boolean;
}

function buildPostUrl(platform: string, username: string, postId: string): string {
  if (platform === "tiktok") return `https://www.tiktok.com/@${username}/video/${postId}`;
  if (platform === "instagram") return `https://www.instagram.com/p/${postId}/`;
  if (platform === "x") return `https://x.com/${username}/status/${postId}`;
  return "";
}

export default function PostPicker({
  profile,
  platform,
  cart,
  onConfirm,
  onBack,
}: {
  profile: ScanResult;
  platform: string;
  cart: CartItem[];
  onConfirm: (assignments: PostAssignment[]) => void;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const hasLikes = cart.some((c) => ["likes", "x_likes"].includes(c.service));
  const hasViews = cart.some((c) => ["views", "x_retweets"].includes(c.service));

  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    if (selected.size === profile.posts.length) {
      setSelected(new Set());
    } else {
      const allIds = new Set(profile.posts.map((p) => p.id));
      setSelected(allIds);
      // Auto-confirm when selecting all
      const assignments: PostAssignment[] = profile.posts.map((post) => ({
        postId: post.id,
        postUrl: buildPostUrl(platform, profile.username, post.id),
        imageUrl: post.imageUrl || "",
        likes: hasLikes,
        views: hasViews,
      }));
      onConfirm(assignments);
    }
  }

  function handleConfirm() {
    const assignments: PostAssignment[] = Array.from(selected).map((postId) => {
      const post = profile.posts.find((p) => p.id === postId);
      return {
        postId,
        postUrl: post ? buildPostUrl(platform, profile.username, postId) : "",
        imageUrl: post?.imageUrl || "",
        likes: hasLikes,
        views: hasViews,
      };
    });
    onConfirm(assignments);
  }

  const isX = platform === "x";
  const accent = isX ? "rgb(29, 155, 240)" : "rgb(105, 201, 208)";
  const accentBg = isX ? "rgba(29, 155, 240, 0.1)" : "rgba(79, 179, 186, 0.1)";
  const accentBorder = isX ? "rgba(29, 155, 240, 0.2)" : "rgba(105, 201, 208, 0.2)";
  const accentGlow = isX ? "rgba(29, 155, 240, 0.15)" : "rgba(105, 201, 208, 0.15)";
  const accentShadow = isX ? "rgba(29, 155, 240, 0.25)" : "rgba(105, 201, 208, 0.25)";
  const gradientBg = isX ? "linear-gradient(135deg, rgb(20, 120, 200), rgb(29, 155, 240))" : "linear-gradient(135deg, rgb(79, 179, 186), rgb(105, 201, 208))";
  const services = isX
    ? [hasLikes && "likes", hasViews && "retweets"].filter(Boolean).join(" + ")
    : [hasLikes && "likes", hasViews && "vues"].filter(Boolean).join(" + ");

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
      {/* Title */}
      <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#fff", margin: "0 0 4px 0" }}>
        {t("posts.title")} <span style={{ color: accent, textShadow: `0 0 20px ${accentShadow}` }}>{t("posts.posts")}</span>
      </h2>
      <p style={{ fontSize: "13px", color: "rgb(169, 181, 174)", margin: "0 0 6px 0" }}>
        {t("posts.whichPosts")} {services} ?
      </p>
      <p style={{ fontSize: "11px", color: "rgb(107, 117, 111)", margin: "0 0 20px 0" }}>
        {selected.size} post{selected.size !== 1 ? "s" : ""} {t("posts.selected")}{selected.size !== 1 ? "s" : ""} — {services} {t("posts.distributed")}
      </p>

      {/* Select all */}
      <button
        onClick={selectAll}
        style={{
          marginBottom: "16px",
          padding: "8px 16px",
          borderRadius: "10px",
          border: `1px solid ${accentBorder}`,
          backgroundColor: selected.size === profile.posts.length ? accentBg : "rgba(255, 255, 255, 0.03)",
          color: selected.size === profile.posts.length ? accent : "rgb(169, 181, 174)",
          fontSize: "12px",
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "all 0.2s",
        }}
      >
        {selected.size === profile.posts.length ? t("posts.deselectAll") : t("posts.selectAll")}
      </button>

      {/* Posts grid */}
      {profile.posts.length === 0 ? (
        <p style={{ fontSize: "13px", color: "rgb(107, 117, 111)", margin: "20px 0" }}>
          {t("posts.noPosts")}
        </p>
      ) : (
        <div
          className="grid-posts"
          style={{ marginBottom: "24px" }}
        >
          {profile.posts.map((post) => {
            const isOn = selected.has(post.id);
            return (
              <button
                key={post.id}
                onClick={() => toggle(post.id)}
                style={{
                  position: "relative",
                  aspectRatio: "1",
                  borderRadius: "12px",
                  overflow: "hidden",
                  cursor: "pointer",
                  border: isOn ? `2px solid ${accent}` : "2px solid transparent",
                  boxShadow: isOn ? `0 0 16px ${accentGlow}` : "none",
                  padding: 0,
                  background: "rgb(14, 21, 18)",
                  transition: "all 0.2s",
                }}
              >
                {/* Thumbnail */}
                {post.imageUrl ? (
                  <img
                    src={post.imageUrl}
                    alt={post.caption || "Post"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      opacity: isOn ? 1 : 0.5,
                      transition: "opacity 0.2s",
                    }}
                  />
                ) : isX && post.caption ? (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      justifyContent: "flex-start",
                      padding: "10px",
                      backgroundColor: isOn ? "rgba(29, 155, 240, 0.08)" : "rgba(29, 155, 240, 0.03)",
                      opacity: isOn ? 1 : 0.6,
                      overflow: "hidden",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="rgb(29,155,240)" style={{ marginBottom: "6px", flexShrink: 0, opacity: 0.6 }}>
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <span style={{ fontSize: "9px", lineHeight: 1.35, color: "rgb(169,181,174)", wordBreak: "break-word", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 5, WebkitBoxOrient: "vertical" as const }}>
                      {post.caption}
                    </span>
                  </div>
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: isX ? "rgba(29, 155, 240, 0.05)" : "rgba(79, 179, 186, 0.05)",
                      opacity: isOn ? 1 : 0.5,
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgb(107, 117, 111)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" /><rect x="2" y="6" width="14" height="12" rx="2" />
                    </svg>
                  </div>
                )}

                {/* Overlay with stats */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "4px 6px",
                    background: "linear-gradient(transparent, rgba(0, 0, 0, 0.7))",
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {hasLikes && (
                    <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "10px", color: "#fff" }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                      </svg>
                      {fmtN(post.likesCount)}
                    </span>
                  )}
                  {hasViews && (
                    <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "10px", color: "#fff" }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" />
                      </svg>
                      {fmtN(post.viewsCount)}
                    </span>
                  )}
                </div>

                {/* Checkmark */}
                {isOn && (
                  <div
                    style={{
                      position: "absolute",
                      top: "6px",
                      right: "6px",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      backgroundColor: accent,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={handleConfirm}
        disabled={selected.size === 0}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "14px 32px",
          borderRadius: "14px",
          border: "none",
          cursor: selected.size > 0 ? "pointer" : "not-allowed",
          fontWeight: 700,
          fontSize: "14px",
          fontFamily: "inherit",
          color: selected.size > 0 ? "#000" : "rgb(80, 80, 80)",
          background: selected.size > 0 ? gradientBg : "rgba(255, 255, 255, 0.06)",
          boxShadow: selected.size > 0 ? `0 10px 30px ${accentShadow}` : "none",
          transition: "all 0.2s",
          opacity: selected.size > 0 ? 1 : 0.5,
        }}
        onMouseEnter={(e) => { if (selected.size > 0) e.currentTarget.style.transform = "scale(1.03)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </svg>
        {selected.size > 0
          ? `${t("posts.validate")} (${selected.size} post${selected.size > 1 ? "s" : ""})`
          : t("posts.selectAtLeast")
        }
      </button>

      {/* Back */}
      <button
        onClick={onBack}
        style={{
          marginTop: "14px",
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
        {t("posts.editCart")}
      </button>
    </div>
  );
}
