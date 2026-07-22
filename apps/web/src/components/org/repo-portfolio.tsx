"use client";

import { FolderGit2, Pin, Star } from "lucide-react";
import type React from "react";
import { useMemo } from "react";
import {
  type EnrichedRepo,
  groupRepositoriesByLifecycle,
  LIFECYCLE_STAGES,
  type LifecycleStage,
} from "@/lib/org-portfolio";

interface RepoPortfolioProps {
  repositories: EnrichedRepo[];
  pinnedRepositories?: string[];
}

export const RepositoryPortfolio: React.FC<RepoPortfolioProps> = ({
  repositories,
  pinnedRepositories = [],
}) => {
  const groups = useMemo(() => {
    return groupRepositoriesByLifecycle(repositories, pinnedRepositories);
  }, [repositories, pinnedRepositories]);

  // Layout categorization rows
  const layoutGroups = [
    {
      title: "Ecosystem Engines",
      subtitle: "Active projects driving growth and strategic value",
      stages: ["incubating", "growing", "core"] as LifecycleStage[],
    },
    {
      title: "Stable Operations",
      subtitle: "Mature assets and maintenance utilities",
      stages: ["stable", "maintenance", "legacy"] as LifecycleStage[],
    },
    {
      title: "Sandbox & Archive",
      subtitle: "Incubators, prototypes, and archived repositories",
      stages: ["experimental", "archived"] as LifecycleStage[],
    },
  ];

  return (
    <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl flex flex-col gap-8 shadow-xl">
      <div className="flex flex-col gap-2">
        <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
          <FolderGit2 className="h-5 w-5 text-indigo-400" /> Ecosystem Lifecycle
          Map
        </h3>
        <p className="text-xs text-slate-500 font-semibold">
          Strategic mapping of projects through open-source sustainability
          stages
        </p>
      </div>

      <div className="space-y-8">
        {layoutGroups.map((row) => (
          <div key={row.title} className="space-y-4">
            <div className="border-l-2 border-indigo-500/60 pl-3">
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">
                {row.title}
              </h4>
              <p className="text-[10px] text-slate-500 font-bold">
                {row.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {row.stages.map((stageId) => {
                const stageDef = LIFECYCLE_STAGES.find((s) => s.id === stageId);
                const list = groups[stageId] || [];

                return (
                  <div
                    key={stageId}
                    className={`p-4 border rounded-2xl flex flex-col justify-between gap-4 transition-all duration-300 ${stageDef?.colorClass}`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black uppercase tracking-wider">
                          {stageDef?.label}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-950/60 border border-slate-800/40 text-[9px] font-black rounded-full text-slate-400">
                          {list.length}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                        {stageDef?.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800/30">
                      {list.length > 0 ? (
                        list.slice(0, 3).map((repo) => (
                          <div
                            key={repo.fullName}
                            className="p-2 bg-slate-950/40 border border-slate-850 hover:border-slate-750 rounded-xl space-y-1.5 transition-all"
                          >
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="font-extrabold text-[11px] text-slate-200 truncate flex items-center gap-1">
                                {repo.isPinned && (
                                  <Pin className="h-3 w-3 text-yellow-400 shrink-0 transform rotate-45" />
                                )}
                                {repo.repoName}
                              </span>
                              <span className="text-[9px] text-slate-400 font-black">
                                {repo.scores.overall} pts
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[9px] text-slate-500 font-bold">
                              <span className="flex items-center gap-0.5">
                                <Star className="h-2.5 w-2.5 text-yellow-500/80" />{" "}
                                {repo.stars}
                              </span>
                              {repo.language && (
                                <span className="px-1.5 py-0.2 bg-slate-900 border border-slate-800/80 rounded text-slate-400">
                                  {repo.language}
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-500 font-semibold block text-center py-2">
                          No projects
                        </span>
                      )}

                      {list.length > 3 && (
                        <span className="text-[9px] text-indigo-400 font-bold block text-center hover:underline cursor-pointer">
                          + {list.length - 3} more projects
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
