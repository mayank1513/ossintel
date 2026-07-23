"use client";

import type { NormalizedNpmUser } from "@ossintel/npm";
import type { NormalizedStackOverflowUser } from "@ossintel/stackoverflow";
import { Award, Box, Flame, HelpCircle, TrendingUp } from "lucide-react";
import type React from "react";

interface PlatformCardsProps {
  npmUser: NormalizedNpmUser | null;
  stackoverflowUser: NormalizedStackOverflowUser | null;
}

export const PlatformCards: React.FC<PlatformCardsProps> = ({
  npmUser,
  stackoverflowUser,
}) => {
  if (!npmUser && !stackoverflowUser) return null;

  // Calculate TypeScript & ESM percentages
  const tsPercent = npmUser?.packages.length
    ? Math.round(
        (npmUser.packages.filter((p) => p.hasTypeScript).length /
          npmUser.packages.length) *
          100,
      )
    : 0;

  const esmPercent = npmUser?.packages.length
    ? Math.round(
        (npmUser.packages.filter((p) => p.hasESM).length /
          npmUser.packages.length) *
          100,
      )
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {/* npm Card */}
      {npmUser && (
        <div className="relative overflow-hidden p-6 bg-card border border-border rounded-2xl shadow-sm space-y-6 group hover:border-primary/20 transition-all duration-300">
          <div className="absolute inset-0 bg-linear-to-br from-red-500/5 via-transparent to-transparent opacity-50 pointer-events-none" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/5 border border-red-500/10 rounded-xl text-rose-600">
                <Box className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">
                  npm Ecosystem Footprint
                </h3>
                <a
                  href={npmUser.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  @{npmUser.username}
                </a>
              </div>
            </div>
            <TrendingUp className="h-5 w-5 text-red-500/60" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/40 border border-border/80 rounded-xl">
              <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider block">
                Total Weekly Downloads
              </span>
              <span className="text-xl font-extrabold text-foreground block mt-1">
                {npmUser.totalWeeklyDownloads.toLocaleString()}
              </span>
              <span className="text-[10px] text-muted-foreground block">
                weekly downloads
              </span>
            </div>

            <div className="p-4 bg-muted/40 border border-border/80 rounded-xl">
              <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider block">
                Active Libraries
              </span>
              <span className="text-xl font-extrabold text-foreground block mt-1">
                {npmUser.activePackagesCount}
              </span>
              <span className="text-[10px] text-muted-foreground block">
                out of {npmUser.packages.length} published
              </span>
            </div>
          </div>

          {/* Heuristic Bars */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-1">
                <span>TypeScript Declarations</span>
                <span className="text-foreground">{tsPercent}%</span>
              </div>
              <div className="h-2 bg-muted border border-border/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${tsPercent}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-1">
                <span>ES Modules (ESM) Support</span>
                <span className="text-foreground">{esmPercent}%</span>
              </div>
              <div className="h-2 bg-muted border border-border/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                  style={{ width: `${esmPercent}%` }}
                />
              </div>
            </div>
          </div>

          {npmUser.popularPackage && (
            <div className="p-3 bg-muted/40 border border-border/80 rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500 shrink-0" />
                <span className="text-xs font-bold text-foreground/90">
                  Popular package
                </span>
              </div>
              <span className="text-xs font-bold text-foreground truncate max-w-[150px]">
                {npmUser.popularPackage}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Stack Overflow Card */}
      {stackoverflowUser && (
        <div className="relative overflow-hidden p-6 bg-card border border-border rounded-2xl shadow-sm space-y-6 group hover:border-amber-600/30 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent opacity-50 pointer-events-none" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/5 border border-orange-500/10 rounded-xl text-amber-600">
                <HelpCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">
                  Stack Overflow Impact
                </h3>
                <a
                  href={stackoverflowUser.profileLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-amber-600 hover:underline"
                >
                  {stackoverflowUser.displayName}
                </a>
              </div>
            </div>
            <Award className="h-5 w-5 text-orange-500/60" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/40 border border-border/80 rounded-xl">
              <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider block">
                Reputation Score
              </span>
              <span className="text-xl font-extrabold text-foreground block mt-1">
                {stackoverflowUser.reputation.toLocaleString()}
              </span>
              <span className="text-[10px] text-muted-foreground block">
                total authority
              </span>
            </div>

            <div className="p-4 bg-muted/40 border border-border/80 rounded-xl">
              <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider block">
                Answer Quality
              </span>
              <span className="text-xl font-extrabold text-foreground block mt-1">
                {stackoverflowUser.acceptanceRate}%
              </span>
              <span className="text-[10px] text-muted-foreground block">
                acceptance rate
              </span>
            </div>
          </div>

          {/* Badges Grid */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider block">
              Earned Badges
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/40 border border-border/80 rounded-xl justify-center">
                <div className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="text-xs font-bold text-foreground">
                  {stackoverflowUser.badgeCounts.gold}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/40 border border-border/80 rounded-xl justify-center">
                <div className="h-2 w-2 rounded-full bg-slate-300" />
                <span className="text-xs font-bold text-foreground">
                  {stackoverflowUser.badgeCounts.silver}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/40 border border-border/80 rounded-xl justify-center">
                <div className="h-2 w-2 rounded-full bg-amber-700" />
                <span className="text-xs font-bold text-foreground">
                  {stackoverflowUser.badgeCounts.bronze}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-muted/40 border border-border/80 rounded-xl flex items-center justify-between text-xs">
            <span className="font-bold text-muted-foreground">
              Developer Seniority
            </span>
            <span className="font-extrabold text-foreground">
              {stackoverflowUser.yearsActive} years active
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
