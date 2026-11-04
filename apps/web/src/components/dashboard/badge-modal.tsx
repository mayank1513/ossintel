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
  const [metric, setMetric] = useState<string>("overall");
  const [style, setStyle] = useState<string>("flat");
  const [source, setSource] = useState<"github" | "api">("github");
  const [copyFormat, setCopyFormat] = useState<"markdown" | "html" | "url">(
    "markdown",
  );
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // Resolve JSON endpoint based on source choice
  let jsonUrl = "";
  if (source === "github") {
    jsonUrl = `https://raw.githubusercontent.com/ossintel/badges/main/${type === "repo" ? `repo/${target}` : `user/${target}`}.json`;
  } else {
    const query = metric !== "overall" ? `?metric=${metric}` : "";
    jsonUrl = `https://ossintel.js.org/api/badges/${type === "repo" ? `repo/${target}` : `user/${target}`}${query}`;
  }

  // Construct Shields.io badge URL
  const queryParams = new URLSearchParams();
  queryParams.set("url", jsonUrl);
  if (style !== "flat") {
    queryParams.set("style", style);
  }
  const shieldsBadgeUrl = `https://img.shields.io/endpoint?${queryParams.toString()}`;

  const destinationUrl =
    type === "repo"
      ? `https://ossintel.js.org/repo/${target}`
      : `https://ossintel.js.org/user/${target}`;

  const markdownSnippet = `[![OSSIntel](${shieldsBadgeUrl})](${destinationUrl})`;
  const htmlSnippet = `<a href="${destinationUrl}"><img src="${shieldsBadgeUrl}" alt="OSSIntel" /></a>`;

  const copyText =
    copyFormat === "markdown"
      ? markdownSnippet
      : copyFormat === "html"
        ? htmlSnippet
        : shieldsBadgeUrl;

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
              <h2 className="text-lg font-bold tracking-tight">
                OSSIntel Shields.io Badges
              </h2>
              <p className="text-xs text-muted-foreground">
                Embed deterministic telemetry and alpha scoring in your README
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
            {/* biome-ignore lint/performance/noImgElement: Shields.io dynamic badge image */}
            <img
              src={shieldsBadgeUrl}
              alt="OSSIntel Badge"
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Metric Selector */}
          <div className="space-y-1.5">
            <label
              htmlFor="badge-metric-select"
              className="text-xs font-bold text-muted-foreground"
            >
              Metric
            </label>
            <select
              id="badge-metric-select"
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {type === "repo" ? (
                <>
                  <option value="overall">Alpha Score (Overall)</option>
                  <option value="velocity">Velocity</option>
                  <option value="health">Health</option>
                  <option value="community">Community</option>
                  <option value="impact">Impact</option>
                  <option value="risk">Risk</option>
                </>
              ) : (
                <>
                  <option value="overall">OSSIQ (Overall)</option>
                  <option value="maintainer">Maintainer</option>
                  <option value="contributor">Contributor</option>
                  <option value="influence">Influence</option>
                </>
              )}
            </select>
          </div>

          {/* Style Selector */}
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

          {/* Host Source Selector */}
          <div className="space-y-1.5">
            <label
              htmlFor="badge-source-select"
              className="text-xs font-bold text-muted-foreground"
            >
              Hosting Provider
            </label>
            <select
              id="badge-source-select"
              value={source}
              onChange={(e) => setSource(e.target.value as "github" | "api")}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="github">GitHub App Repo (CDN)</option>
              <option value="api">Dynamic API (Live SWR)</option>
            </select>
          </div>
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
            Hosted via GitHub App repo &amp; shields.io custom endpoint protocol
          </span>
          <a
            href="https://shields.io/badges/endpoint-badge"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline flex items-center gap-1 font-medium"
          >
            Shields.io Spec <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
