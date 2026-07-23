"use client";

import {
  ArrowUpRight,
  BarChart4,
  Building,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useMemo } from "react";
import { useAuthStatus } from "@/hooks/use-auth-status";
import { GithubIcon } from "../icons";

interface GitHubAppBannerProps {
  profileLogin: string;
  type: "user" | "org";
  uninstalledOrgs?: string[];
  isAppInstalled?: boolean;
}

export const GitHubAppBanner: React.FC<GitHubAppBannerProps> = ({
  profileLogin,
  type,
  uninstalledOrgs = [],
  isAppInstalled = false,
}) => {
  const { data: authData, isLoading: loading } = useAuthStatus();

  const shouldShow = useMemo(() => {
    if (!authData) return false;

    const viewerLogin = authData.login;
    const viewerOrgs: string[] = Array.isArray(authData.organizations)
      ? authData.organizations
      : [];

    if (type === "user") {
      // Only show banner on user's own profile page
      return !!(viewerLogin?.toLowerCase() === profileLogin.toLowerCase());
    } else if (type === "org") {
      // Show on org pages only if the organization belongs to the logged-in user
      const belongsToViewer = viewerOrgs.some(
        (org) => org.toLowerCase() === profileLogin.toLowerCase(),
      );
      return !!(viewerLogin && belongsToViewer);
    }
    return false;
  }, [authData, profileLogin, type]);

  if (loading || !shouldShow) return null;

  const installUrl = "https://github.com/apps/ossintel/installations/new";
  const hasUninstalledOrgs = uninstalledOrgs.length > 0;

  return (
    <div className="relative p-6 md:p-8 bg-card border border-border rounded-2xl overflow-hidden shadow-sm transition-all duration-300 group flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,var(--muted),transparent_40%)] pointer-events-none" />

      <div className="space-y-4 max-w-2xl relative z-10">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 bg-primary/5 border border-primary/10 text-[10px] font-black text-primary rounded-full uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5" /> Recommended
          </span>
          <h4 className="text-sm font-extrabold text-foreground">
            {isAppInstalled && hasUninstalledOrgs
              ? "Link Your Organizations to OSSIntel"
              : "Install the OSSIntel GitHub App"}
          </h4>
        </div>

        <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
          {isAppInstalled && hasUninstalledOrgs
            ? `The OSSIntel GitHub App is installed on your personal profile, but not on all of your organizations: ${uninstalledOrgs.join(", ")}. Connect them to enable complete ecosystem mapping.`
            : "Authenticate as an installation to unlock full ecosystem insights, higher rate limits, and seamless metrics aggregation."}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px] text-foreground/90 font-bold">
          <div className="flex items-center gap-2">
            <BarChart4 className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>More complete analysis of repositories</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpRight className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Higher API rate limits for your profile</span>
          </div>
          <div className="flex items-center gap-2">
            <Building className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Analysis of selected org repositories</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Fine-grained repository access control</span>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          OSSIntel only requests minimum metadata permissions. You remain in
          full control.
        </p>
      </div>

      <div className="shrink-0 relative z-10">
        <a
          href={installUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] text-xs font-black rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <GithubIcon className="h-4 w-4 shrink-0" />{" "}
          {isAppInstalled && hasUninstalledOrgs
            ? "Configure Installations"
            : "Install GitHub App"}
        </a>
      </div>
    </div>
  );
};
