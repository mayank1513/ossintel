"use client";
import {
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  Info,
  RefreshCw,
  Sparkles,
  User,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// React icons
import { FaGithub, FaKey } from "react-icons/fa";
import { SiNpm } from "react-icons/si";
import { AINarrator } from "@/components/dashboard/ai-narrator";
import { DimensionBreakdown } from "@/components/dashboard/dimension-breakdown";
import { FindingsList } from "@/components/dashboard/findings-list";
import { LanguagesChart } from "@/components/dashboard/languages-chart";
import { OverviewCard } from "@/components/dashboard/overview-card";
import { RecommendationsGrid } from "@/components/dashboard/recommendations-grid";
import { Input } from "@/components/ui/input";
import { useGithubRepo } from "@/hooks/use-github-orgs";
import { getCacheTimestamp } from "@/lib/cache";

const STEPS = [
  "Establishing connection to GitHub APIs...",
  "Retrieving repository structure and metadata...",
  "Scanning code changes and commit intervals...",
  "Analyzing developer pool...",
  "Running metrics scoring models...",
  "Generating findings and recommendations...",
  "Finalizing report...",
];

export default function RepoPage() {
  const params = useParams();
  const router = useRouter();
  const owner = params.owner as string;
  const repo = params.repo as string;

  const cacheKeyStr = `repo:${owner}:${repo}`;
  const { data, error, isLoading, refetch, isFetching, refresh } =
    useGithubRepo(owner, repo);

  const [loadingStep, setLoadingStep] = useState(0);

  // PAT config state
  const [patInput, setPatInput] = useState("");
  const [showPatConfig, setShowPatConfig] = useState(false);

  // Rate limiting countdown state
  const [rateLimitReset, setRateLimitReset] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState("");

  // Cached state indicator
  const [cachedTime, setCachedTime] = useState<string | null>(null);

  // loading steps animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    interval = setInterval(() => {
      setLoadingStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 900);
    return () => clearInterval(interval);
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (!rateLimitReset) return;
    const interval = setInterval(() => {
      const resetDate = new Date(rateLimitReset);
      const diffSec = Math.ceil((resetDate.getTime() - Date.now()) / 1000);
      if (diffSec <= 0) {
        setRateLimitReset(null);
        setCooldown("");
        clearInterval(interval);
        refresh();
      } else {
        const mins = Math.floor(diffSec / 60);
        const secs = diffSec % 60;
        setCooldown(mins > 0 ? `${mins}m ${secs}s` : `${secs}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [rateLimitReset, refresh]);

  // Load token from storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedToken = sessionStorage.getItem("github_token");
      if (savedToken) setPatInput(savedToken);
    }
  }, []);

  // Read cache timestamp for UI display
  useEffect(() => {
    if (data) {
      getCacheTimestamp(cacheKeyStr).then((ts) => {
        if (ts) {
          setCachedTime(new Date(ts).toLocaleTimeString());
        } else {
          setCachedTime(null);
        }
      });
    }
  }, [data, cacheKeyStr]);

  const handleRefresh = () => {
    refresh();
  };

  const handleSavePat = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("github_token", patInput);
    }
    setShowPatConfig(false);
    setRateLimitReset(null);
    setCooldown("");
    handleRefresh();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500/30">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-50" />

      {/* Header */}
      <header className="relative border-b border-slate-800 bg-slate-900/80 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Search
          </button>
          <div className="flex items-center gap-2">
            <div className="p-0.5 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
              {/* biome-ignore lint/performance/noImgElement: static logo asset */}
              <img
                src="/ossintel.png"
                alt="OSSIntel Logo"
                className="h-6 w-6 object-contain"
              />
            </div>
            <span className="text-sm font-bold">OSSIntel</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-6 py-12 z-10 flex flex-col gap-10">
        {/* Loading overlay */}
        {(isLoading || isFetching) && (
          <div className="max-w-xl mx-auto w-full p-8 bg-slate-900/80 border border-slate-800 rounded-3xl shadow-2xl flex flex-col gap-6 items-center text-center">
            <div className="relative">
              <div className="h-16 w-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
              <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-indigo-400 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold">
                Scanning Repository {owner}/{repo}...
              </h3>
              <p className="text-sm text-slate-400 max-w-sm h-12 flex items-center justify-center">
                {STEPS[loadingStep]}
              </p>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${((loadingStep + 1) / STEPS.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Custom Rate Limit Error Box */}
        {error?.message.includes("Rate Limit Exceeded") && (
          <div className="max-w-xl mx-auto w-full p-6 bg-slate-900/90 border border-rose-500/30 rounded-3xl shadow-xl flex flex-col gap-4 text-left">
            <div className="flex gap-4 items-start text-rose-200">
              <AlertTriangle className="h-6 w-6 text-rose-500 shrink-0 mt-1" />
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-rose-400">
                  GitHub API Rate Limit Exceeded
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your search rate limit was reached. It will automatically
                  reset in{" "}
                  <strong className="text-indigo-400">
                    {cooldown || "a moment"}
                  </strong>
                  .
                </p>
              </div>
            </div>

            {/* PAT retry interface */}
            <div className="border-t border-slate-800/80 pt-4 mt-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <FaKey className="text-indigo-400 h-3.5 w-3.5" /> Have a
                  GitHub Access Token?
                </span>
                <button
                  type="button"
                  onClick={() => setShowPatConfig(!showPatConfig)}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline"
                >
                  {showPatConfig ? "Cancel" : "Add Git PAT"}
                </button>
              </div>

              {showPatConfig && (
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="ghp_..."
                    value={patInput}
                    onChange={(e) => setPatInput(e.target.value)}
                    className="flex-1 text-xs h-9 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={handleSavePat}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all"
                  >
                    Save & Retry
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* General Error box */}
        {error && !error.message.includes("Rate Limit Exceeded") && (
          <div className="max-w-lg mx-auto w-full p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex gap-3.5 items-start text-rose-200">
            <AlertTriangle className="h-6 w-6 text-rose-500 shrink-0" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm">Analysis Failed</h4>
              <p className="text-xs text-rose-300 leading-relaxed">
                {error.message}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold underline mt-2 block"
              >
                Retry Request
              </button>
            </div>
          </div>
        )}

        {/* Repositories detail analysis page layout */}
        {data && !isLoading && !isFetching && (
          <div className="space-y-8 animate-fade-in">
            {/* Cache indicator and navigation backlinks panel */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl shadow-md">
              {/* Backlinks */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                  Backlinks:
                </span>

                <button
                  type="button"
                  onClick={() => router.push(`/user/${owner}`)}
                  className="px-3 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow"
                >
                  <User className="h-3.5 w-3.5 text-indigo-400" /> Owner profile
                  (@{owner})
                </button>

                <a
                  href={`https://github.com/${owner}/${repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow"
                >
                  <FaGithub className="h-3.5 w-3.5 text-indigo-400" /> GitHub
                  Repository <ExternalLink className="h-3 w-3 opacity-60" />
                </a>

                {/* npm link helper */}
                {owner.toLowerCase() === "npm" ? (
                  <a
                    href={`https://www.npmjs.com/package/${repo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow"
                  >
                    <SiNpm className="h-3.5 w-3.5 text-rose-400" /> npm Registry
                    package <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                ) : (
                  <a
                    href={`https://www.npmjs.com/package/${repo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow"
                  >
                    <SiNpm className="h-3.5 w-3.5 text-slate-500" /> Search npm
                  </a>
                )}
              </div>

              {/* Cache status details */}
              <div className="flex items-center gap-3">
                {cachedTime && (
                  <span className="text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5" /> Cached data from{" "}
                    {cachedTime}
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleRefresh}
                  className="flex items-center gap-1 px-4 py-2 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </button>
              </div>
            </div>

            {/* Dashboard panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                <OverviewCard data={data} />
                <DimensionBreakdown scores={data.scores} />
                {data.languages && (
                  <LanguagesChart languages={data.languages} />
                )}
              </div>

              {/* Right Column */}
              <div className="lg:col-span-2 flex flex-col gap-8">
                <AINarrator promptContext={data.promptContext} />
                <FindingsList findings={data.findings} />
                <RecommendationsGrid recommendations={data.recommendations} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
