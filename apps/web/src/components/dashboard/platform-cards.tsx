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
        <div className="relative overflow-hidden p-6 bg-slate-900/80 border border-slate-800/80 rounded-3xl shadow-xl space-y-6 group hover:border-indigo-500/30 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent opacity-50 pointer-events-none" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
                <Box className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100">
                  npm Ecosystem Footprint
                </h3>
                <a
                  href={npmUser.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-red-400 hover:underline"
                >
                  @{npmUser.username}
                </a>
              </div>
            </div>
            <TrendingUp className="h-5 w-5 text-red-500/60" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Downloads
              </span>
              <span className="text-xl font-extrabold text-slate-100 block mt-1">
                {npmUser.totalDownloads.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 block">
                weekly downloads
              </span>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Active Libraries
              </span>
              <span className="text-xl font-extrabold text-slate-100 block mt-1">
                {npmUser.activePackagesCount}
              </span>
              <span className="text-[10px] text-slate-400 block">
                out of {npmUser.packages.length} published
              </span>
            </div>
          </div>

          {/* Heuristic Bars */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-350 mb-1">
                <span>TypeScript Declarations</span>
                <span className="text-slate-200">{tsPercent}%</span>
              </div>
              <div className="h-2 bg-slate-950 border border-slate-850 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${tsPercent}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-350 mb-1">
                <span>ES Modules (ESM) Support</span>
                <span className="text-slate-200">{esmPercent}%</span>
              </div>
              <div className="h-2 bg-slate-950 border border-slate-850 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                  style={{ width: `${esmPercent}%` }}
                />
              </div>
            </div>
          </div>

          {npmUser.popularPackage && (
            <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500 shrink-0" />
                <span className="text-xs font-bold text-slate-300">
                  Popular package
                </span>
              </div>
              <span className="text-xs font-bold text-slate-200 truncate max-w-[150px]">
                {npmUser.popularPackage}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Stack Overflow Card */}
      {stackoverflowUser && (
        <div className="relative overflow-hidden p-6 bg-slate-900/80 border border-slate-800/80 rounded-3xl shadow-xl space-y-6 group hover:border-orange-500/30 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent opacity-50 pointer-events-none" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-400">
                <HelpCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100">
                  Stack Overflow Impact
                </h3>
                <a
                  href={stackoverflowUser.profileLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-orange-400 hover:underline"
                >
                  {stackoverflowUser.displayName}
                </a>
              </div>
            </div>
            <Award className="h-5 w-5 text-orange-500/60" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Reputation Score
              </span>
              <span className="text-xl font-extrabold text-slate-100 block mt-1">
                {stackoverflowUser.reputation.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 block">
                total authority
              </span>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Answer Quality
              </span>
              <span className="text-xl font-extrabold text-slate-100 block mt-1">
                {stackoverflowUser.acceptanceRate}%
              </span>
              <span className="text-[10px] text-slate-400 block">
                acceptance rate
              </span>
            </div>
          </div>

          {/* Badges Grid */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Earned Badges
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-950/50 border border-slate-850 rounded-xl justify-center">
                <div className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="text-xs font-bold text-slate-200">
                  {stackoverflowUser.badgeCounts.gold}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-950/50 border border-slate-850 rounded-xl justify-center">
                <div className="h-2 w-2 rounded-full bg-slate-350" />
                <span className="text-xs font-bold text-slate-200">
                  {stackoverflowUser.badgeCounts.silver}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-950/50 border border-slate-850 rounded-xl justify-center">
                <div className="h-2 w-2 rounded-full bg-amber-700" />
                <span className="text-xs font-bold text-slate-200">
                  {stackoverflowUser.badgeCounts.bronze}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center justify-between text-xs">
            <span className="font-bold text-slate-350">
              Developer Seniority
            </span>
            <span className="font-extrabold text-slate-200">
              {stackoverflowUser.yearsActive} years active
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
