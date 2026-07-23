"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Database,
  RefreshCw,
  Settings,
  User,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { AINarrator } from "@/components/dashboard/ai-narrator";
import { DimensionBreakdown } from "@/components/dashboard/dimension-breakdown";
import { EcosystemGraph } from "@/components/dashboard/ecosystem-graph";
import { FindingsList } from "@/components/dashboard/findings-list";
import { OpenSourceImpact } from "@/components/dashboard/open-source-impact";
import { OrgSelector } from "@/components/dashboard/org-selector";
import { OverviewCard } from "@/components/dashboard/overview-card";
import { PlatformCards } from "@/components/dashboard/platform-cards";
import { ProfileCard } from "@/components/dashboard/profile-card";
import { RecommendationsGrid } from "@/components/dashboard/recommendations-grid";
import { RepositoriesTable } from "@/components/dashboard/repositories-table";
import { SkillRadar } from "@/components/dashboard/skill-radar";
import { GithubIcon } from "@/components/icons";
import { ErrorAlert } from "@/components/ui/error-alert";
import { GitHubAppBanner } from "@/components/ui/github-app-banner";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { SuggestionToast } from "@/components/ui/suggestion-toast";
import { useAuthStatus } from "@/hooks/use-auth-status";
import { useDeveloperScores } from "@/hooks/use-developer-scores";
import { useGithubOrgs } from "@/hooks/use-github-orgs";
import { useGithubUser } from "@/hooks/use-github-user";
import { useNpmUser } from "@/hooks/use-npm-user";
import { useStackOverflowUser } from "@/hooks/use-stackoverflow-user";
import { clearCache, getCacheSettings, saveCacheSettings } from "@/lib/cache";

const STEPS = [
  "Establishing connection to GitHub APIs...",
  "Retrieving portfolio profile metadata...",
  "Analyzing public repositories stats...",
  "Running scoring models & metrics engine...",
  "Generating recommendations & findings...",
  "Finalizing Open Source Intelligence report...",
];

export default function UserPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold text-muted-foreground">
              Loading Dashboard...
            </span>
          </div>
        </div>
      }
    >
      <UserDashboardContent />
    </Suspense>
  );
}

function UserDashboardContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = (params.username || params.orgname) as string;

  const entryPlatform = searchParams.get("platform") || "github";
  const entryId = searchParams.get("id") || "";

  // Active identities state
  const [githubUsername, setGithubUsername] = useState<string>(
    entryPlatform === "github" ? username : "",
  );
  const [linkedNpm, setLinkedNpm] = useState<string>("");
  const [linkedSO, setLinkedSO] = useState<string>("");

  const handleLinkNpm = (npmName: string) => {
    setLinkedNpm(npmName);
    if (githubUsername && typeof window !== "undefined") {
      if (npmName) {
        localStorage.setItem(`ossintel:npm:${githubUsername}`, npmName);
      } else {
        localStorage.removeItem(`ossintel:npm:${githubUsername}`);
      }
    }
  };

  const handleLinkSO = (soId: string) => {
    setLinkedSO(soId);
    if (githubUsername && typeof window !== "undefined") {
      if (soId) {
        localStorage.setItem(`ossintel:so:${githubUsername}`, soId);
      } else {
        localStorage.removeItem(`ossintel:so:${githubUsername}`);
      }
    }
  };

  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);
  const [includeUserRepos, setIncludeUserRepos] = useState<boolean>(true);
  const [contribLimit, setContribLimit] = useState<number>(Infinity);

  // Toast/Alert dismiss states
  const [dismissedNpm, setDismissedNpm] = useState<boolean>(false);
  const [dismissedSO, setDismissedSO] = useState<boolean>(false);
  const [dismissedError, setDismissedError] = useState<boolean>(false);

  // 1. Fetch GitHub data if Github account is linked
  const userQuery = useGithubUser(githubUsername, contribLimit);

  // 2. Fetch selected organizations data
  const orgsQuery = useGithubOrgs(selectedOrgs);

  // 3. Fetch Npm data if npm account is linked
  const npmQuery = useNpmUser(linkedNpm);

  // 4. Fetch StackOverflow data if SO account is linked
  const soQuery = useStackOverflowUser(linkedSO);

  const isLoadingCombined =
    userQuery.isLoading ||
    orgsQuery.isLoading ||
    npmQuery.isLoading ||
    soQuery.isLoading;
  const isFetchingCombined =
    userQuery.isFetching ||
    orgsQuery.isFetching ||
    npmQuery.isFetching ||
    soQuery.isFetching;
  const errorCombined =
    userQuery.error || orgsQuery.error || npmQuery.error || soQuery.error;

  // API Key configurations state
  const [showTokensConfig, setShowTokensConfig] = useState(false);
  const queryClient = useQueryClient();
  const { data: authData, isLoading: loadingAuth } = useAuthStatus();
  const hasGithubPat = !!authData?.hasGithubPat;

  // Client cache settings state
  const [quotaInput, setQuotaInput] = useState(100);
  const [staleInput, setStaleInput] = useState(7);

  const isInitialLoad = useRef(true);

  // Load cache settings from storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const settings = getCacheSettings();
      setQuotaInput(settings.quotaMb);
      setStaleInput(settings.staleDays);
    }
  }, []);

  // Load linked identities
  useEffect(() => {
    if (typeof window !== "undefined") {
      let initialNpm = entryPlatform === "npm" ? username : "";
      let initialSO =
        entryPlatform === "stackoverflow" ? entryId || username : "";

      if (githubUsername) {
        const savedNpm = localStorage.getItem(`ossintel:npm:${githubUsername}`);
        if (savedNpm) initialNpm = savedNpm;

        const savedSO = localStorage.getItem(`ossintel:so:${githubUsername}`);
        if (savedSO) initialSO = savedSO;
      }

      if (initialNpm) setLinkedNpm(initialNpm);
      if (initialSO) setLinkedSO(initialSO);
    }
  }, [githubUsername, entryPlatform, entryId, username]);

  // Auto-select all organizations by default on initial load
  useEffect(() => {
    if (isInitialLoad.current && userQuery.data?.metadata?.organizations) {
      const orgLogins = userQuery.data.metadata.organizations.map(
        (o: { login: string }) => o.login,
      );
      setSelectedOrgs(orgLogins);
      isInitialLoad.current = false;
    }
  }, [userQuery.data]);

  // Redirect between /user/ and /org/ based on loaded profile type
  useEffect(() => {
    if (userQuery.data?.type === "org" && params.username) {
      router.replace(`/org/${username}${window.location.search}`);
    } else if (userQuery.data?.type === "user" && params.orgname) {
      router.replace(`/user/${username}${window.location.search}`);
    }
  }, [userQuery.data, username, params, router]);

  // Auto-suggest linking GitHub from NPM packages
  useEffect(() => {
    if (entryPlatform === "npm" && npmQuery.data?.packages && !githubUsername) {
      // Look for a github repository owner in packages metadata
      for (const pkg of npmQuery.data.packages) {
        if (pkg.repository?.includes("github.com/")) {
          const match = pkg.repository.match(/github\.com\/([a-zA-Z0-9_-]+)/);
          if (match?.[1]) {
            const confirmed = window.confirm(
              `We detected GitHub user @${match[1]} from your npm package repository links. Link this GitHub profile?`,
            );
            if (confirmed) {
              setGithubUsername(match[1]);
            }
            break;
          }
        }
      }
    }
  }, [entryPlatform, npmQuery.data, githubUsername]);

  // Auto-suggest linking GitHub from Stack Overflow name
  useEffect(() => {
    if (
      entryPlatform === "stackoverflow" &&
      soQuery.data?.displayName &&
      !githubUsername
    ) {
      const confirmed = window.confirm(
        `Link GitHub profile matching Stack Overflow name @${soQuery.data.displayName}?`,
      );
      if (confirmed) {
        setGithubUsername(soQuery.data.displayName);
      }
    }
  }, [entryPlatform, soQuery.data, githubUsername]);

  // Handle manual full refresh
  const handleRefresh = async () => {
    setDismissedNpm(false);
    setDismissedSO(false);
    setDismissedError(false);
    if (githubUsername) {
      await userQuery.refresh();
      await orgsQuery.refreshAll();
    }
    if (linkedNpm) {
      await npmQuery.refresh();
    }
    if (linkedSO) {
      await soQuery.refresh();
    }
  };

  // Extract social links (LinkedIn and Stack Overflow) from user metadata if available
  const linkedinUrl = useMemo(() => {
    const metadata = userQuery.data?.metadata as
      | Record<string, unknown>
      | undefined;
    const socialLinks = metadata?.socialLinks as string[] | undefined;
    return (
      socialLinks?.find((url: string) => url.includes("linkedin.com")) || null
    );
  }, [userQuery.data]);

  const stackoverflowUrl = useMemo(() => {
    if (linkedSO) return `https://stackoverflow.com/users/${linkedSO}`;
    const metadata = userQuery.data?.metadata as
      | Record<string, unknown>
      | undefined;
    const socialLinks = metadata?.socialLinks as string[] | undefined;
    return (
      socialLinks?.find((url: string) => url.includes("stackoverflow.com")) ||
      null
    );
  }, [linkedSO, userQuery.data]);

  const npmStats = useMemo(() => {
    if (!npmQuery.data) return null;
    return {
      totalDownloads: npmQuery.data.totalWeeklyDownloads,
      packageCount: npmQuery.data.packages.length,
      topPackage: npmQuery.data.packages[0]?.name || undefined,
    };
  }, [npmQuery.data]);

  const soStats = useMemo(() => {
    if (!soQuery.data) return null;
    return {
      reputation: soQuery.data.reputation,
      badgeCount: soQuery.data.badgeCounts,
      topTags: soQuery.data.topTags.slice(0, 3).map((t) => t.name),
    };
  }, [soQuery.data]);

  const impactStats = useMemo(() => {
    if (!userQuery.data) return null;
    const repos = userQuery.data.repositories || [];
    const totalStars = repos.reduce(
      (acc, r) => acc + (r.stargazersCount || 0),
      0,
    );
    const totalForks = repos.reduce((acc, r) => acc + (r.forksCount || 0), 0);
    const prsMerged = (userQuery.data.externalContributions || []).filter(
      (c) => c.mergedAt !== null,
    ).length;
    return {
      stars: totalStars,
      forks: totalForks,
      prsMerged,
    };
  }, [userQuery.data]);

  // Perform dynamic score calculations
  const clientIntel = useDeveloperScores({
    userRepos: userQuery.data?.repositories || [],
    orgsQueries: orgsQuery.queries,
    includeUserRepos,
    npmUser: npmQuery.data || null,
    stackoverflowUser: soQuery.data || null,
    userLogin: userQuery.data?.metadata?.login || githubUsername || "",
    userName: userQuery.data?.metadata?.name || githubUsername || "",
    externalContributions: userQuery.data?.externalContributions || [],
    organizations: userQuery.data?.metadata?.organizations || [],
  });

  const fullAnalysisData = useMemo(() => {
    return {
      ...clientIntel,
      type: "user" as const,
      metadata: userQuery.data?.metadata || {
        login: githubUsername,
        name: githubUsername,
      },
    };
  }, [clientIntel, userQuery.data, githubUsername]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary/30">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--grid-line-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-line-color)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-6 py-12 z-10 flex flex-col gap-10">
        {/* Loading overlay */}
        <LoadingOverlay
          isLoading={isLoadingCombined}
          title={`Syncing OSS Identity for ${githubUsername || username || "developer"}...`}
          steps={STEPS}
        />

        {/* Dashboard Panels */}
        {!githubUsername && !isLoadingCombined ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground/80 max-w-md mx-auto space-y-6">
            <AlertTriangle className="h-12 w-12 text-primary/80 animate-pulse" />
            <div>
              <h3 className="text-lg font-bold text-foreground">
                GitHub Connection Required
              </h3>
              <p className="text-xs text-muted-foreground mt-2">
                Unified scoring and repository analysis require a linked GitHub
                profile. Enter a GitHub profile username below to bind your
                metrics:
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <input
                type="text"
                placeholder="Enter GitHub Username..."
                className="bg-muted/40 border border-border rounded-xl p-3 w-full text-foreground outline-none focus:border-primary text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setGithubUsername((e.target as HTMLInputElement).value);
                  }
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  const input = e.currentTarget
                    .previousSibling as HTMLInputElement;
                  if (input.value) setGithubUsername(input.value);
                }}
                className="px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] rounded-xl text-xs font-semibold transition-all"
              >
                Link
              </button>
            </div>
          </div>
        ) : (
          userQuery.data &&
          clientIntel &&
          !isLoadingCombined && (
            <div className="space-y-8 animate-fade-in">
              {(!userQuery.data.isAppInstalled ||
                userQuery.data.uninstalledOrgs?.length) && (
                <GitHubAppBanner
                  profileLogin={userQuery.data.metadata.login}
                  type="user"
                  uninstalledOrgs={userQuery.data.uninstalledOrgs || []}
                  isAppInstalled={userQuery.data.isAppInstalled || false}
                />
              )}
              {/* Status Header Banner */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-card/60 border border-border/80 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/10 rounded-full text-primary text-xs font-bold uppercase tracking-wider">
                    <User className="h-3.5 w-3.5" /> Unified OSS Identity
                  </div>
                  {isFetchingCombined && (
                    <span className="text-xs text-primary/80 font-semibold animate-pulse">
                      Refreshing cache items...
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTokensConfig(!showTokensConfig)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-muted/40 hover:bg-muted border border-border text-muted-foreground hover:text-foreground text-xs font-bold rounded-xl transition-all"
                  >
                    <Settings className="h-3.5 w-3.5 text-primary/80" />{" "}
                    Settings
                  </button>

                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="flex items-center gap-1 px-4 py-2 bg-muted/40 hover:bg-muted border border-border text-muted-foreground hover:text-foreground text-xs font-bold rounded-xl transition-all"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh Analysis
                  </button>
                </div>
              </div>

              {/* Tokens Config panel */}
              {showTokensConfig && (
                <div className="p-6 bg-card border border-border rounded-2xl space-y-4 max-w-xl mx-auto animate-fade-in-up">
                  <h4 className="text-sm font-bold text-foreground">
                    Application Settings
                  </h4>

                  <div className="space-y-4 text-left">
                    <div>
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                        GitHub Connection
                      </span>
                      {loadingAuth ? (
                        <div className="flex items-center justify-center gap-2 p-3 bg-muted/40 border border-border rounded-xl text-xs text-muted-foreground font-semibold h-[46px]">
                          <span className="h-3.5 w-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span>Checking status...</span>
                        </div>
                      ) : hasGithubPat ? (
                        <div className="flex items-center justify-between p-3 bg-muted/40 border border-border rounded-xl">
                          <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />{" "}
                            Connected to GitHub
                          </span>
                          <button
                            type="button"
                            onClick={async () => {
                              await fetch("/api/auth/logout", {
                                method: "POST",
                              });
                              queryClient.invalidateQueries({
                                queryKey: ["auth-status"],
                              });
                              handleRefresh();
                            }}
                            className="px-3 py-1.5 bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-destructive rounded-lg text-xs font-bold transition-all"
                          >
                            Disconnect
                          </button>
                        </div>
                      ) : (
                        <a
                          href="/api/auth/github"
                          className="flex items-center justify-center gap-2 w-full p-3 bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                          <GithubIcon className="h-4 w-4" /> Connect GitHub
                          Account
                        </a>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1.5">
                        Connecting your GitHub account automatically boosts your
                        API rate limits from 60 to 5,000 requests/hour.
                      </p>
                    </div>

                    {/* Local Cache Management */}
                    <div className="border-t border-border/80 pt-4 mt-2">
                      <div className="flex items-center gap-1.5 mb-3">
                        <Database className="h-4 w-4 text-primary/85" />
                        <h5 className="text-xs font-bold text-foreground">
                          Local Cache Management
                        </h5>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <label
                            htmlFor="cache-quota-input"
                            className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1"
                          >
                            Storage Quota (MB)
                          </label>
                          <input
                            id="cache-quota-input"
                            type="number"
                            min="10"
                            max="2000"
                            value={quotaInput}
                            onChange={(e) =>
                              setQuotaInput(Number(e.target.value))
                            }
                            className="w-full bg-muted/40 border border-border outline-none rounded-lg p-2 text-foreground text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="cache-stale-input"
                            className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1"
                          >
                            Stale Time (Days)
                          </label>
                          <input
                            id="cache-stale-input"
                            type="number"
                            min="1"
                            max="365"
                            value={staleInput}
                            onChange={(e) =>
                              setStaleInput(Number(e.target.value))
                            }
                            className="w-full bg-muted/40 border border-border outline-none rounded-lg p-2 text-foreground text-xs font-mono"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            saveCacheSettings({
                              quotaMb: quotaInput,
                              staleDays: staleInput,
                            });
                            alert("Cache settings saved successfully.");
                          }}
                          className="flex-1 px-3 py-2 bg-muted/40 hover:bg-muted border border-border text-muted-foreground hover:text-foreground rounded-lg text-xs font-bold transition-all"
                        >
                          Save Cache Config
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (
                              confirm(
                                "Are you sure you want to clear all locally cached developer profiles?",
                              )
                            ) {
                              await clearCache();
                              alert("Local cache cleared.");
                              handleRefresh();
                            }
                          }}
                          className="px-3 py-2 bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-destructive rounded-lg text-xs font-bold transition-all shrink-0"
                        >
                          Clear Cache
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowTokensConfig(false)}
                      className="px-4 py-2 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-xl text-xs font-bold transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                  <OverviewCard
                    data={fullAnalysisData}
                    npmStats={npmStats}
                    soStats={soStats}
                    impactStats={impactStats}
                  />
                  <DimensionBreakdown scores={clientIntel.scores} />

                  {userQuery.data?.type !== "org" && (
                    <>
                      {/* Identity Resolution Links */}
                      <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-4">
                        <h4 className="text-sm font-bold text-foreground">
                          Linked OSS Identities
                        </h4>
                        <div className="space-y-3">
                          {/* GitHub */}
                          <div className="flex items-center justify-between p-3 bg-muted/45 border border-border/80 rounded-xl">
                            <div className="flex items-center gap-2">
                              <GithubIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-xs font-semibold text-foreground">
                                GitHub
                              </span>
                            </div>
                            <span className="text-xs font-bold text-muted-foreground truncate max-w-[120px]">
                              {githubUsername
                                ? `@${githubUsername}`
                                : "Not linked"}
                            </span>
                          </div>

                          {/* npm */}
                          <div className="flex items-center justify-between p-3 bg-muted/45 border border-border/80 rounded-xl">
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 bg-rose-500/10 text-rose-600 flex items-center justify-center rounded text-[10px] font-bold">
                                N
                              </div>
                              <span className="text-xs font-semibold text-foreground">
                                npm
                              </span>
                            </div>
                            {linkedNpm ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-muted-foreground truncate max-w-[80px]">
                                  ~{linkedNpm}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleLinkNpm("")}
                                  className="text-[10px] text-destructive hover:underline"
                                >
                                  Unlink
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  const val = prompt("Enter npm username:");
                                  if (val) handleLinkNpm(val);
                                }}
                                className="text-[10px] text-primary/90 hover:underline font-bold"
                              >
                                Link Profile
                              </button>
                            )}
                          </div>

                          {/* Stack Overflow */}
                          <div className="flex items-center justify-between p-3 bg-muted/45 border border-border/80 rounded-xl">
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 bg-amber-500/10 text-amber-600 flex items-center justify-center rounded text-[10px] font-bold">
                                S
                              </div>
                              <span className="text-xs font-semibold text-foreground">
                                Stack Overflow
                              </span>
                            </div>
                            {linkedSO ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-muted-foreground truncate max-w-[80px]">
                                  ID: {linkedSO}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleLinkSO("")}
                                  className="text-[10px] text-destructive hover:underline"
                                >
                                  Unlink
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  const val = prompt(
                                    "Enter Stack Overflow User ID:",
                                  );
                                  if (val) handleLinkSO(val);
                                }}
                                className="text-[10px] text-primary/90 hover:underline font-bold"
                              >
                                Link Profile
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Exclude User Repos Toggle */}
                      <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-3">
                        <h4 className="text-sm font-bold text-foreground">
                          Personal Repositories Filter
                        </h4>
                        <label className="flex items-center gap-3 p-3 bg-muted/45 border border-border rounded-xl cursor-pointer hover:border-primary/30 transition-colors">
                          <input
                            type="checkbox"
                            checked={includeUserRepos}
                            onChange={(e) =>
                              setIncludeUserRepos(e.target.checked)
                            }
                            className="rounded border-border text-primary focus:ring-primary focus:ring-offset-background bg-muted h-4 w-4"
                          />
                          <span className="text-xs font-semibold text-foreground">
                            Include @{githubUsername} repositories
                          </span>
                        </label>
                      </div>

                      {/* Organization Selection checklist Component */}
                      <OrgSelector
                        organizations={
                          userQuery.data?.metadata?.organizations || []
                        }
                        selectedOrgs={selectedOrgs}
                        onChangeSelectedOrgs={setSelectedOrgs}
                      />
                    </>
                  )}
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                  {/* Profile Details Component */}
                  <ProfileCard
                    avatarUrl={userQuery.data?.metadata?.avatarUrl}
                    name={userQuery.data?.metadata?.name}
                    login={userQuery.data?.metadata?.login}
                    bio={userQuery.data?.metadata?.bio}
                    company={userQuery.data?.metadata?.company}
                    location={userQuery.data?.metadata?.location}
                    email={userQuery.data?.metadata?.email}
                    htmlUrl={userQuery.data?.metadata?.htmlUrl}
                    twitterUsername={userQuery.data?.metadata?.twitterUsername}
                    blog={userQuery.data?.metadata?.blog}
                    readme={userQuery.data?.metadata?.readme}
                    npmUrl={
                      linkedNpm ? `https://www.npmjs.com/~${linkedNpm}` : null
                    }
                    stackoverflowUrl={stackoverflowUrl}
                    linkedinUrl={linkedinUrl}
                    type={userQuery.data?.type}
                  />

                  {/* Skill Radar */}
                  {clientIntel.scores.skills &&
                    clientIntel.scores.skills.length > 0 && (
                      <SkillRadar skills={clientIntel.scores.skills} />
                    )}

                  {/* Ecosystem Graph */}
                  {clientIntel.scores.skills &&
                    clientIntel.scores.skills.length > 0 && (
                      <EcosystemGraph skills={clientIntel.scores.skills} />
                    )}

                  {/* Granular Platform Stats */}
                  <PlatformCards
                    npmUser={npmQuery.data || null}
                    stackoverflowUser={soQuery.data || null}
                  />

                  <AINarrator promptContext={clientIntel.promptContext} />

                  {userQuery.data?.type !== "org" &&
                    userQuery.data?.externalContributions && (
                      <OpenSourceImpact
                        contributions={userQuery.data.externalContributions}
                        limit={contribLimit}
                        onLimitChange={setContribLimit}
                        badges={clientIntel.scores.badges}
                      />
                    )}

                  <FindingsList findings={clientIntel.findings} />

                  <RecommendationsGrid
                    recommendations={clientIntel.recommendations}
                  />

                  {clientIntel.repositories && (
                    <RepositoriesTable
                      repositories={clientIntel.repositories}
                      username={userQuery.data.metadata.login}
                      externalContributions={clientIntel.externalContributions}
                    />
                  )}
                </div>
              </div>
            </div>
          )
        )}

        {/* Floating Toast Container */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4 max-w-sm w-full pointer-events-none">
          {/* Toast 1: Unified Error Alert */}
          {errorCombined && !dismissedError && (
            <ErrorAlert
              error={errorCombined}
              message={errorCombined.message}
              onRetry={handleRefresh}
              onDismiss={() => setDismissedError(true)}
            />
          )}

          {/* Toast 3: npm Suggestion */}
          {userQuery.data?.metadata?.suggestions?.npm &&
            !linkedNpm &&
            !dismissedNpm && (
              <SuggestionToast
                title="Suggested npm Identity"
                message={`Link npm account @${userQuery.data.metadata.suggestions.npm.username} to aggregate package download metrics?`}
                onConfirm={() =>
                  handleLinkNpm(
                    userQuery.data.metadata.suggestions?.npm?.username || "",
                  )
                }
                onOverride={() => {
                  const userOverride = prompt(
                    "Enter custom npm username to override:",
                  );
                  if (userOverride) handleLinkNpm(userOverride);
                }}
                onDismiss={() => setDismissedNpm(true)}
              />
            )}

          {/* Toast 4: StackOverflow Suggestion */}
          {userQuery.data?.metadata?.suggestions?.stackoverflow &&
            !linkedSO &&
            !dismissedSO && (
              <SuggestionToast
                title="Suggested Stack Overflow Profile"
                message={`Link Stack Overflow profile ID ${userQuery.data.metadata.suggestions.stackoverflow.profileId} (${userQuery.data.metadata.suggestions.stackoverflow.displayName})?`}
                onConfirm={() =>
                  handleLinkSO(
                    userQuery.data.metadata.suggestions?.stackoverflow
                      ?.profileId || "",
                  )
                }
                onOverride={() => {
                  const soOverride = prompt(
                    "Enter custom Stack Overflow Profile ID to override:",
                  );
                  if (soOverride) handleLinkSO(soOverride);
                }}
                onDismiss={() => setDismissedSO(true)}
              />
            )}
        </div>
      </main>
    </div>
  );
}
