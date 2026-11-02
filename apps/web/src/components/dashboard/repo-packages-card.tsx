"use client";

import type { NormalizedNpmPackage } from "@ossintel/npm";
import {
  Box,
  Download,
  ExternalLink,
  Layers,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type React from "react";
import { formatCompactNumber } from "@/lib/format";

interface RepoPackagesCardProps {
  packages: NormalizedNpmPackage[];
  velocityScore?: number;
}

export const RepoPackagesCard: React.FC<RepoPackagesCardProps> = ({
  packages,
  velocityScore,
}) => {
  if (!packages || packages.length === 0) return null;

  const totalMonthlyDownloads = packages.reduce(
    (sum, pkg) => sum + (pkg.monthlyDownloads || 0),
    0,
  );
  const totalWeeklyDownloads = packages.reduce(
    (sum, pkg) => sum + (pkg.weeklyDownloads || 0),
    0,
  );
  const isMonorepo = packages.length > 1;

  return (
    <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-6 relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
      <div className="absolute top-0 right-0 w-36 h-36 bg-red-500/5 rounded-full filter blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-rose-600 shadow-sm">
            {isMonorepo ? (
              <Layers className="h-5 w-5" />
            ) : (
              <Box className="h-5 w-5" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-foreground text-base tracking-tight flex items-center gap-2">
              {isMonorepo ? "Monorepo Packages" : "NPM Package"}
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20">
                {packages.length}{" "}
                {packages.length === 1 ? "Package" : "Packages"}
              </span>
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              Real-world installation velocity from npm registry
            </p>
          </div>
        </div>

        {velocityScore !== undefined && velocityScore > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold shadow-xs">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Velocity Score: {velocityScore}/100</span>
          </div>
        )}
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3.5 bg-muted/40 border border-border/80 rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block flex items-center gap-1.5">
            <Download className="h-3 w-3 text-rose-600" /> Monthly Downloads
          </span>
          <span className="text-2xl font-black text-foreground block">
            {formatCompactNumber(totalMonthlyDownloads)}
          </span>
          <span className="text-[11px] text-muted-foreground block font-medium">
            ~{formatCompactNumber(totalWeeklyDownloads)} / week
          </span>
        </div>

        <div className="p-3.5 bg-muted/40 border border-border/80 rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3 text-emerald-600" /> Active Ecosystem
          </span>
          <span className="text-2xl font-black text-foreground block">
            {packages.filter((p) => !p.isDeprecated).length}
          </span>
          <span className="text-[11px] text-muted-foreground block font-medium">
            Published & maintained
          </span>
        </div>
      </div>

      {/* Package List */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
          Published Artifacts
        </span>
        <div className="divide-y divide-border/60 border border-border/80 rounded-xl overflow-hidden bg-background/50">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={`https://www.npmjs.com/package/${encodeURIComponent(pkg.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-sm text-foreground hover:text-rose-600 transition-colors flex items-center gap-1.5"
                  >
                    {pkg.name}
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-muted border border-border/80 text-muted-foreground">
                    v{pkg.version}
                  </span>
                  {pkg.hasTypeScript && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 border border-blue-500/20">
                      TS
                    </span>
                  )}
                  {pkg.hasESM && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 border border-purple-500/20">
                      ESM
                    </span>
                  )}
                  {pkg.license && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/60">
                      {pkg.license}
                    </span>
                  )}
                </div>
                {pkg.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {pkg.description}
                  </p>
                )}
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-foreground block font-mono">
                  {formatCompactNumber(pkg.monthlyDownloads)}/mo
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  {formatCompactNumber(pkg.weeklyDownloads)}/wk
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
