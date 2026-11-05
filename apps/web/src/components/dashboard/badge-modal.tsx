"use client";

import { Check, Copy, ExternalLink, ShieldCheck, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface BadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "repo" | "user";
  target: string; // "owner/repo" or "username"
  currentScore?: number;
}

export const BadgeModal: React.FC<BadgeModalProps> = ({
  isOpen,
  onClose,
  type,
  target,
  currentScore,
}) => {
  const [provider, setProvider] = useState<"ossintel" | "shields">("ossintel");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [style, setStyle] = useState<string>("flat");
  const [copyFormat, setCopyFormat] = useState<"markdown" | "html" | "url">(
    "markdown",
  );
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const targetLower = target.toLowerCase();
  const destinationUrl =
    type === "repo"
      ? `https://ossintel.js.org/repo/${target}`
      : `https://ossintel.js.org/user/${target}`;

  // 1. OSSIntel Native Badge URL (Raw CDN SVG with eye logo & dual-color wordmark)
  const ossintelBadgeUrl = `https://raw.githubusercontent.com/ossintel/badges/main/${
    type === "repo" ? `repo/${targetLower}` : `user/${targetLower}`
  }${theme === "light" ? "-light" : ""}.svg`;

  // 2. Shields.io Custom Endpoint Badge URL
  const rawJsonUrl = `https://raw.githubusercontent.com/ossintel/badges/main/${
    type === "repo" ? `repo/${targetLower}` : `user/${targetLower}`
  }.json`;
  const shieldsQueryParams = new URLSearchParams();
  shieldsQueryParams.set("url", rawJsonUrl);
  if (style !== "flat") {
    shieldsQueryParams.set("style", style);
  }
  const shieldsBadgeUrl = `https://img.shields.io/endpoint?${shieldsQueryParams.toString()}`;

  // Active badge URL based on provider selection
  const activeBadgeUrl =
    provider === "ossintel" ? ossintelBadgeUrl : shieldsBadgeUrl;

  const markdownSnippet = `[![OSSIQ](${activeBadgeUrl})](${destinationUrl})`;
  const htmlSnippet = `<a href="${destinationUrl}"><img src="${activeBadgeUrl}" alt="OSSIQ" /></a>`;

  const copyText =
    copyFormat === "markdown"
      ? markdownSnippet
      : copyFormat === "html"
        ? htmlSnippet
        : activeBadgeUrl;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6 text-foreground overflow-hidden">
        {/* Glow ambient decoration */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full filter blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">OSSIQ Badges</h2>
              <p className="text-xs text-muted-foreground">
                Embed deterministic developer intelligence and telemetry in your
                README
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Badge Live Preview Card */}
        <div className="p-6 rounded-2xl bg-muted/20 border border-border/80 flex flex-col items-center justify-center gap-4 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Live Preview
          </span>
          <div className="p-4 bg-background/80 border border-border/60 rounded-xl shadow-inner flex items-center justify-center min-h-[50px] w-full">
            {/* biome-ignore lint/performance/noImgElement: dynamic badge image */}
            <img
              src={activeBadgeUrl}
              alt="OSSIQ Badge"
              className="h-6 transition-all duration-300"
            />
          </div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-2">
            Target:{" "}
            <code className="font-mono text-primary font-bold">{target}</code>
            {currentScore !== undefined && (
              <span className="text-emerald-500 font-bold">
                (Score: {currentScore}/100)
              </span>
            )}
          </div>
        </div>

        {/* Configuration Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Badge Provider */}
          <div className="space-y-1.5">
            <label
              htmlFor="badge-provider-select"
              className="text-xs font-bold text-muted-foreground"
            >
              Badge Provider
            </label>
            <select
              id="badge-provider-select"
              value={provider}
              onChange={(e) =>
                setProvider(e.target.value as "ossintel" | "shields")
              }
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="ossintel">OSSIntel (Native SVG)</option>
              <option value="shields">Shields.io</option>
            </select>
          </div>

          {provider === "ossintel" ? (
            /* Theme Selector for OSSIntel */
            <div className="space-y-1.5">
              <label
                htmlFor="badge-theme-select"
                className="text-xs font-bold text-muted-foreground"
              >
                Theme
              </label>
              <select
                id="badge-theme-select"
                value={theme}
                onChange={(e) => setTheme(e.target.value as "dark" | "light")}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="dark">Dark Theme (Default)</option>
                <option value="light">Light Theme</option>
              </select>
            </div>
          ) : (
            /* Shield Style Selector for Shields.io */
            <div className="space-y-1.5">
              <label
                htmlFor="badge-style-select"
                className="text-xs font-bold text-muted-foreground"
              >
                Shield Style
              </label>
              <select
                id="badge-style-select"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="flat">Flat (Standard)</option>
                <option value="flat-square">Flat Square</option>
                <option value="for-the-badge">For the Badge</option>
                <option value="plastic">Plastic</option>
              </select>
            </div>
          )}
        </div>

        {/* Copy Snippet Tabs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/80">
              <button
                type="button"
                onClick={() => setCopyFormat("markdown")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  copyFormat === "markdown"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Markdown
              </button>
              <button
                type="button"
                onClick={() => setCopyFormat("html")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  copyFormat === "html"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                HTML
              </button>
              <button
                type="button"
                onClick={() => setCopyFormat("url")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  copyFormat === "url"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Badge URL
              </button>
            </div>

            <Button
              size="sm"
              onClick={handleCopy}
              className="gap-1.5 font-bold rounded-xl"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-300" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy Snippet
                </>
              )}
            </Button>
          </div>

          <div className="relative">
            <pre className="p-3 bg-muted/30 border border-border/80 rounded-xl text-xs font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap break-all select-all">
              {copyText}
            </pre>
          </div>
        </div>

        {/* Documentation notice */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground/80 border-t border-border/60 pt-3">
          <span>
            {provider === "ossintel"
              ? "Dual-color native SVG edge-cached via GitHub Raw CDN"
              : "Dynamic badge rendered via Shields.io custom endpoint protocol"}
          </span>
          <a
            href="https://github.com/ossintel/badges"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline flex items-center gap-1 font-medium"
          >
            ossintel/badges <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
