"use client";

import { detectInput } from "@ossintel/input-parser";
import { useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Binary,
  CheckCircle2,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Footer } from "@/components/footer";
import { GithubIcon } from "@/components/icons";
import { useAuthStatus } from "@/hooks/use-auth-status";

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { data: authData, isLoading: loadingAuth } = useAuthStatus();
  const hasGithubPat = !!authData?.hasGithubPat;
  const inputRef = useRef<HTMLInputElement>(null);

  // Check auth error params on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const authError = params.get("auth_error");
      if (authError) {
        setError(decodeURIComponent(authError));
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, []);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setError(null);

    const performAnalyze = async () => {
      try {
        const detection = detectInput(query);
        const externalBase = process.env.NEXT_PUBLIC_EXTERNAL_DASHBOARD_URL;
        let targetPath = "";

        if (
          detection.platform === "vscode" ||
          detection.platform === "medium" ||
          detection.platform === "leetcode"
        ) {
          throw new Error(
            `Platform ${detection.platform} intelligence is coming soon!`,
          );
        }

        if (detection.platform === "github") {
          if (detection.type === "repo") {
            targetPath = `/repo/${detection.owner}/${detection.repo}`;
          } else if (detection.type === "org") {
            targetPath = `/org/${detection.owner}`;
          } else {
            targetPath = `/user/${detection.owner}`;
          }
        } else if (detection.platform === "npm") {
          if (detection.type === "package") {
            targetPath = `/package/npm/${detection.name}`;
          } else {
            targetPath = `/user/${detection.name}?platform=npm`;
          }
        } else if (detection.platform === "stackoverflow") {
          targetPath = `/user/${detection.profileId}?platform=stackoverflow&id=${detection.profileId}`;
        } else {
          const cleaned = query.trim();
          if (cleaned.includes("/")) {
            targetPath = `/repo/${cleaned}`;
          } else {
            targetPath = `/user/${cleaned}`;
          }
        }

        if (externalBase) {
          window.location.href = `${externalBase}${targetPath}`;
        } else {
          router.push(targetPath);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Invalid search query";
        setError(message);
      }
    };
    performAnalyze();
  };

  const handleExampleClick = (value: string) => {
    setQuery(value);
    // Autofocus input box immediately with a tiny timeout to ensure react states sync
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        // Position cursor at the very end of the text
        const len = inputRef.current.value.length;
        inputRef.current.setSelectionRange(len, len);
      }
    }, 10);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary/30 flex flex-col justify-between transition-colors duration-200">
      {/* Background decoration - Opacity handled via grid-line-color CSS variable (RGBA) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--grid-line-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-line-color)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Main Search Panel - Reduced padding-vertical for faster visual reveal */}
      <main className="relative max-w-7xl mx-auto px-6 py-16 md:py-20 z-10 flex-1 flex flex-col justify-center items-center gap-10">
        <section className="flex flex-col gap-6 text-center max-w-3xl mx-auto w-full">
          <div className="space-y-4">
            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/95 to-muted-foreground/75 bg-clip-text text-transparent leading-tight animate-fade-in pb-2">
              Open Source Intelligence
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto font-normal leading-relaxed">
              Evaluate developer portfolios, codebase structures, and security
              configurations using deterministic scorecards and AI-powered
              recommendations.
            </p>
            {process.env.NEXT_PUBLIC_EXTERNAL_DASHBOARD_URL && (
              <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 bg-muted border border-border rounded-full text-muted-foreground text-xs font-semibold max-w-max mx-auto">
                <span>
                  Showcase Redirect: Analyses will open in the Vercel Cloud
                  platform.
                </span>
              </div>
            )}
          </div>

          <form
            onSubmit={handleAnalyze}
            className="p-1.5 bg-card border border-border/80 rounded-2xl shadow-lg shadow-shadow flex flex-col md:flex-row gap-2.5 w-full max-w-3xl mx-auto"
          >
            <div className="flex-1 flex items-center gap-3 px-4 bg-muted/40 border border-border/50 rounded-xl focus-within:border-primary/20 focus-within:bg-background transition-all duration-200">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Enter GitHub/NPM user, org, repo, package URL, or prefix..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-transparent border-0 outline-none w-full py-3 text-foreground placeholder:text-muted-foreground/60 text-sm font-normal"
              />
            </div>

            <div className="flex gap-2 justify-center">
              <button
                type="submit"
                disabled={!query.trim()}
                className="px-6 py-3 bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] rounded-xl text-sm font-semibold shadow-sm transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Analyze <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Query Syntax Cheat Sheet */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-2xl mx-auto w-full mt-2 text-[11px] text-muted-foreground font-mono leading-normal bg-muted/10 border border-border/40 p-4 rounded-2xl">
            <div>
              <span className="text-foreground font-bold block mb-1.5">
                GitHub
              </span>
              <ul className="space-y-0.5 list-none pl-0">
                <li>
                  • repo:{" "}
                  <button
                    type="button"
                    onClick={() => handleExampleClick("react18-tools/kosha")}
                    className="text-primary/80 hover:text-primary cursor-pointer hover:underline bg-transparent border-0 p-0 text-left font-mono"
                  >
                    react18-tools/kosha
                  </button>
                </li>
                <li>
                  • org:{" "}
                  <button
                    type="button"
                    onClick={() => handleExampleClick("org:react18-tools")}
                    className="text-primary/80 hover:text-primary cursor-pointer hover:underline bg-transparent border-0 p-0 text-left font-mono"
                  >
                    org:react18-tools
                  </button>
                </li>
                <li>
                  • user:{" "}
                  <button
                    type="button"
                    onClick={() => handleExampleClick("user:mayank1513")}
                    className="text-primary/80 hover:text-primary cursor-pointer hover:underline bg-transparent border-0 p-0 text-left font-mono"
                  >
                    user:mayank1513
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <span className="text-foreground font-bold block mb-1.5">
                NPM Registry
              </span>
              <ul className="space-y-0.5 list-none pl-0">
                <li>
                  • pkg:{" "}
                  <button
                    type="button"
                    onClick={() => handleExampleClick("npm:@ossintel/scoring")}
                    className="text-primary/80 hover:text-primary cursor-pointer hover:underline bg-transparent border-0 p-0 text-left font-mono"
                  >
                    npm:@ossintel/scoring
                  </button>
                </li>
                <li>
                  • scoped:{" "}
                  <button
                    type="button"
                    onClick={() => handleExampleClick("@ossintel/scoring")}
                    className="text-primary/80 hover:text-primary cursor-pointer hover:underline bg-transparent border-0 p-0 text-left font-mono"
                  >
                    @ossintel/scoring
                  </button>
                </li>
                <li>
                  • user:{" "}
                  <button
                    type="button"
                    onClick={() => handleExampleClick("npm:~mayank1513")}
                    className="text-primary/80 hover:text-primary cursor-pointer hover:underline bg-transparent border-0 p-0 text-left font-mono"
                  >
                    npm:~mayank1513
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <span className="text-foreground font-bold block mb-1.5">
                Others
              </span>
              <ul className="space-y-0.5 list-none pl-0">
                <li>
                  • stackoverflow:{" "}
                  <button
                    type="button"
                    onClick={() => handleExampleClick("so:12345")}
                    className="text-primary/80 hover:text-primary cursor-pointer hover:underline bg-transparent border-0 p-0 text-left font-mono"
                  >
                    so:12345
                  </button>
                </li>
                <li>
                  • medium:{" "}
                  <button
                    type="button"
                    onClick={() => handleExampleClick("medium:@mayank1513")}
                    className="text-primary/80 hover:text-primary cursor-pointer hover:underline bg-transparent border-0 p-0 text-left font-mono"
                  >
                    medium:@mayank1513
                  </button>
                </li>
                <li>
                  • leetcode:{" "}
                  <button
                    type="button"
                    onClick={() => handleExampleClick("leetcode:mayank1513")}
                    className="text-primary/80 hover:text-primary cursor-pointer hover:underline bg-transparent border-0 p-0 text-left font-mono"
                  >
                    leetcode:mayank1513
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* GitHub Connection Banner */}
          {loadingAuth ? (
            <div className="p-4.5 bg-card border border-border/50 rounded-2xl max-w-xl mx-auto w-full flex items-center justify-center gap-2 mt-2 animate-fade-in text-xs font-semibold text-muted-foreground shadow-sm shadow-shadow h-[68px]">
              <span className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>Verifying GitHub connection...</span>
            </div>
          ) : hasGithubPat ? (
            <div className="p-4.5 bg-card border border-border/50 rounded-2xl max-w-xl mx-auto w-full flex items-center justify-between gap-4 mt-2 animate-fade-in-up text-left shadow-sm shadow-shadow">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />{" "}
                  Connected to GitHub
                </h4>
                <p className="text-[11px] text-muted-foreground leading-normal">
                  Ecosystem queries are running with an elevated limit of 5,000
                  requests/hour.
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  queryClient.invalidateQueries({ queryKey: ["auth-status"] });
                }}
                className="px-3 py-1.5 bg-destructive/10 hover:bg-destructive/15 text-destructive rounded-xl text-xs font-semibold transition-all duration-200 shrink-0"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="p-4.5 bg-card border border-border/50 rounded-2xl max-w-xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4 mt-2 animate-fade-in-up text-left shadow-sm shadow-shadow">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary/70 shrink-0" />{" "}
                  Enhance API Limits
                </h4>
                <p className="text-[11px] text-muted-foreground leading-normal">
                  Connect your GitHub account to increase API rate limits to
                  5,000 requests/hour. We only request basic public profile
                  access.
                </p>
              </div>
              <a
                href="/api/auth/github"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-sm"
              >
                <GithubIcon className="h-3.5 w-3.5 shrink-0" /> Connect GitHub
              </a>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="max-w-lg mx-auto w-full p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex gap-3 items-center text-destructive text-xs font-semibold leading-normal">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Repository Scorecard Audit Preview Mockup */}
          <div className="w-full max-w-2xl mx-auto bg-card border border-border/80 rounded-2xl shadow-xl shadow-shadow overflow-hidden mt-6 animate-fade-in-up text-left">
            {/* Header of the mock window */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b border-border/60">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-border" />
                <span className="w-2 h-2 rounded-full bg-border" />
                <span className="w-2 h-2 rounded-full bg-border" />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground select-none">
                ossintel.js.org/repo/react18-tools/kosha
              </span>
              <div className="w-6" />
            </div>
            {/* Content of the mock window */}
            <div className="p-5 space-y-5">
              {/* Title block */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted/50 rounded-xl border border-border/40">
                    <GithubIcon className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-foreground">
                        react18-tools/kosha
                      </h4>
                      <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                        Healthy
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Deterministic scoring audit completed
                    </p>
                  </div>
                </div>
                <div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground block">
                      Audit Score
                    </span>
                    <span className="text-xl font-black text-foreground tracking-tight">
                      92
                      <span className="text-xs text-muted-foreground font-normal">
                        /100
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Pillars Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Security Pillar */}
                <div className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-500" />{" "}
                      Security
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      96%
                    </span>
                  </div>
                  <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: "96%" }}
                    />
                  </div>
                  <span className="text-[9px] text-muted-foreground block">
                    0 Vulnerabilities found
                  </span>
                </div>

                {/* Quality Pillar */}
                <div className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Activity className="h-3 w-3 text-primary/70" /> Quality
                    </span>
                    <span className="text-xs font-bold text-primary">88%</span>
                  </div>
                  <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: "88%" }}
                    />
                  </div>
                  <span className="text-[9px] text-muted-foreground block">
                    Active release cycle
                  </span>
                </div>

                {/* Community Pillar */}
                <div className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3 text-emerald-500" /> Community
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      94%
                    </span>
                  </div>
                  <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: "94%" }}
                    />
                  </div>
                  <span className="text-[9px] text-muted-foreground block">
                    High PR merge rate
                  </span>
                </div>
              </div>

              {/* Insights bullet preview */}
              <div className="p-3.5 bg-muted/30 border border-border/40 rounded-xl space-y-2">
                <h5 className="text-[9px] font-bold uppercase tracking-wider text-foreground">
                  AI Intelligence Summary
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                    <span>Outdated dependencies are fully contained</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                    <span>Regular publishing schedule maintained</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                    <span>Multiple active code reviewers validated</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                    <span>Scorecard indicates low risk profile</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Structured SEO JSON-LD block */}
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data injection
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "OSSIntel",
            url: "https://ossintel.js.org",
            description:
              "Unified platform metrics, impact scorecards, active community health, and security risk audits for developers, repositories, and organizations.",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "All",
            author: {
              "@type": "Person",
              name: "Mayank Kumar Chaudhari",
            },
            license: "https://opensource.org/licenses/MIT",
            softwareHelp: "https://ossintel.js.org/docs",
            hasPart: [
              {
                "@type": "SoftwareSourceCode",
                name: "@ossintel/scoring",
                description: "Deterministic reputation metrics engine",
                codeRepository:
                  "https://github.com/ossintel/ossintel/tree/main/packages/scoring",
              },
              {
                "@type": "SoftwareSourceCode",
                name: "@ossintel/github-normalizer",
                description: "GitHub API data normalizer",
                codeRepository:
                  "https://github.com/ossintel/ossintel/tree/main/packages/github-normalizer",
              },
              {
                "@type": "SoftwareSourceCode",
                name: "@ossintel/insights",
                description: "Rule-based audit insights engine",
                codeRepository:
                  "https://github.com/ossintel/ossintel/tree/main/packages/insights",
              },
            ],
          }),
        }}
      />

      {/* Reusable Packages Showcase Section - Alternating background class bg-muted/40 */}
      <section className="relative border-t border-border bg-muted/40 w-full py-16 md:py-24 z-10">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h3 className="text-primary/60 text-xs font-semibold uppercase tracking-widest">
              Modular Architecture
            </h3>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground/80 bg-clip-text text-transparent">
              Powered by Reusable Core Packages
            </h2>
            <p className="text-sm md:text-base text-muted-foreground font-normal leading-relaxed">
              OSSIntel is built as a set of decoupled, standard npm modules.
              Developers can install, extend, and integrate these engines in
              their own applications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Scoring Package Card */}
            <div className="group relative p-6 bg-card border border-border/60 hover:border-ring/20 rounded-2xl transition-all duration-300 flex flex-col justify-between hover:shadow-lg hover:shadow-shadow">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[var(--card-glow)] to-transparent rounded-tr-2xl rounded-bl-full pointer-events-none group-hover:from-[var(--card-glow)] transition-all" />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-muted/40 border border-border/40 rounded-xl text-muted-foreground group-hover:text-primary group-hover:bg-primary/5 transition-all duration-300">
                    <Workflow className="h-6 w-6" />
                  </div>
                  <span className="px-2 py-0.5 bg-primary/5 border border-border/30 rounded-full text-[9px] font-semibold text-muted-foreground/85 select-none">
                    Core Engine
                  </span>
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-base font-bold text-foreground tracking-tight">
                    @ossintel/scoring
                  </h4>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                    Deterministic reputation metrics engine
                  </p>
                </div>
                <p className="text-xs text-muted-foreground/80 leading-relaxed">
                  Evaluates software health, community activity, maintainer
                  metrics, and organization footprints using pure, deterministic
                  mathematical models.
                </p>
                <ul className="text-[11px] text-muted-foreground/75 space-y-1.5">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-muted-foreground/30 group-hover:bg-primary/60 rounded-full transition-colors" />{" "}
                    No side-effects, fully deterministic
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-muted-foreground/30 group-hover:bg-primary/60 rounded-full transition-colors" />{" "}
                    Extensible weights and tiers
                  </li>
                </ul>
              </div>
              <div className="pt-6 mt-auto">
                <Link
                  href="/docs/scoring"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all duration-200 group/link"
                >
                  Explore API Docs{" "}
                  <ArrowRight className="h-3 w-3 group-hover/link:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Normalizer Package Card */}
            <div className="group relative p-6 bg-card border border-border/60 hover:border-ring/20 rounded-2xl transition-all duration-300 flex flex-col justify-between hover:shadow-lg hover:shadow-shadow">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[var(--card-glow)] to-transparent rounded-tr-2xl rounded-bl-full pointer-events-none group-hover:from-[var(--card-glow)] transition-all" />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-muted/40 border border-border/40 rounded-xl text-muted-foreground group-hover:text-primary group-hover:bg-primary/5 transition-all duration-300">
                    <Binary className="h-6 w-6" />
                  </div>
                  <span className="px-2 py-0.5 bg-primary/5 border border-border/30 rounded-full text-[9px] font-semibold text-muted-foreground/85 select-none">
                    Data Parser
                  </span>
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-base font-bold text-foreground tracking-tight">
                    @ossintel/github-normalizer
                  </h4>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                    GitHub API data normalizer
                  </p>
                </div>
                <p className="text-xs text-muted-foreground/80 leading-relaxed">
                  Fetches and normalizes raw GitHub REST/GraphQL payloads,
                  handling paginated requests, cache mapping, and rate limits
                  gracefully.
                </p>
                <ul className="text-[11px] text-muted-foreground/75 space-y-1.5">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-muted-foreground/30 group-hover:bg-primary/60 rounded-full transition-colors" />{" "}
                    Auto-paginated contributions fetcher
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-muted-foreground/30 group-hover:bg-primary/60 rounded-full transition-colors" />{" "}
                    Input type detection (user, org, repo)
                  </li>
                </ul>
              </div>
              <div className="pt-6 mt-auto">
                <Link
                  href="/docs/github-normalizer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all duration-200 group/link"
                >
                  Explore API Docs{" "}
                  <ArrowRight className="h-3 w-3 group-hover/link:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Insights Package Card */}
            <div className="group relative p-6 bg-card border border-border/60 hover:border-ring/20 rounded-2xl transition-all duration-300 flex flex-col justify-between hover:shadow-lg hover:shadow-shadow">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[var(--card-glow)] to-transparent rounded-tr-2xl rounded-bl-full pointer-events-none group-hover:from-[var(--card-glow)] transition-all" />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-muted/40 border border-border/40 rounded-xl text-muted-foreground group-hover:text-primary group-hover:bg-primary/5 transition-all duration-300">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <span className="px-2 py-0.5 bg-primary/5 border border-border/30 rounded-full text-[9px] font-semibold text-muted-foreground/85 select-none">
                    Insights Engine
                  </span>
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-base font-bold text-foreground tracking-tight">
                    @ossintel/insights
                  </h4>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                    Rule-based audit insights engine
                  </p>
                </div>
                <p className="text-xs text-muted-foreground/80 leading-relaxed">
                  Generates natural language software findings, flags key risks,
                  outlines actionable recommendations, and compiles LLM context
                  blocks.
                </p>
                <ul className="text-[11px] text-muted-foreground/75 space-y-1.5">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-muted-foreground/30 group-hover:bg-primary/60 rounded-full transition-colors" />{" "}
                    Configurable ruleset definitions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-muted-foreground/30 group-hover:bg-primary/60 rounded-full transition-colors" />{" "}
                    Clean prompt context export
                  </li>
                </ul>
              </div>
              <div className="pt-6 mt-auto">
                <Link
                  href="/docs/insights"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all duration-200 group/link"
                >
                  Explore API Docs{" "}
                  <ArrowRight className="h-3 w-3 group-hover/link:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Utility Packages Sub-grid */}
          <div className="pt-8 border-t border-border/80 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-left">
              <h5 className="text-sm font-bold text-foreground">
                Additional Modules
              </h5>
              <p className="text-xs text-muted-foreground leading-normal">
                Includes{" "}
                <Link href="/docs/npm">
                  <code className="text-foreground font-semibold font-mono">
                    @ossintel/npm
                  </code>{" "}
                  (NPM registry statistics fetcher)
                </Link>{" "}
                and{" "}
                <Link href="/docs/stackoverflow">
                  <code className="text-foreground font-semibold font-mono">
                    @ossintel/stackoverflow
                  </code>{" "}
                </Link>
                (StackOverflow profile statistics fetcher).
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/docs"
                className="px-5 py-2.5 bg-primary hover:opacity-90 active:scale-[0.98] text-primary-foreground text-xs font-semibold rounded-xl shadow-sm transition-all whitespace-nowrap"
              >
                Ecosystem Overview
              </Link>
              <Link
                href="/docs/scoring"
                className="px-5 py-2.5 bg-muted hover:bg-muted/80 border border-border/60 text-foreground text-xs font-semibold rounded-xl active:scale-[0.98] transition-all whitespace-nowrap"
              >
                Read Scoring Docs
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
