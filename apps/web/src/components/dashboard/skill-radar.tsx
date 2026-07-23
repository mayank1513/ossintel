"use client";

import type { TopicExpertise } from "@ossintel/scoring";
import {
  Award,
  ChevronDown,
  ChevronUp,
  GitPullRequest,
  HelpCircle,
  Package,
  Star,
} from "lucide-react";
import type React from "react";
import { useState } from "react";

interface SkillRadarProps {
  skills: TopicExpertise[];
}

export const SkillRadar: React.FC<SkillRadarProps> = ({ skills }) => {
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  if (!skills || skills.length === 0) return null;

  const toggleExpand = (topic: string) => {
    setExpandedSkill((prev) => (prev === topic ? null : topic));
  };

  return (
    <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/5 border border-primary/10 rounded-xl text-primary">
          <Award className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">Unified Skill Radar</h3>
          <p className="text-xs text-muted-foreground">
            Calculated domain expertise based on active code, publications, and
            community impact
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {skills.map((skill) => {
          const isExpanded = expandedSkill === skill.topic;

          // Determine color scheme based on score
          let barColor = "from-primary to-primary/80";
          let badgeBg = "bg-primary/5 text-primary border-primary/10";
          if (skill.score >= 80) {
            barColor = "from-teal-400 to-emerald-500";
            badgeBg =
              "bg-emerald-500/10 text-emerald-600 border-emerald-500/25";
          } else if (skill.score >= 60) {
            barColor = "from-blue-400 to-indigo-500";
            badgeBg = "bg-blue-500/10 text-blue-600 border-blue-500/25";
          } else if (skill.score < 30) {
            barColor = "from-muted to-muted/80";
            badgeBg = "bg-muted text-muted-foreground border-border";
          }

          return (
            // biome-ignore lint/a11y/useSemanticElements: required to avoid symentic errors
            <div
              key={skill.topic}
              className="p-4 bg-muted/40 border border-border/80 hover:border-border rounded-xl transition-all duration-300 cursor-pointer"
              onClick={() => toggleExpand(skill.topic)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleExpand(skill.topic);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground text-sm">
                    {skill.topic}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 font-extrabold uppercase rounded-full border ${badgeBg}`}
                  >
                    {skill.score >= 80
                      ? "Master"
                      : skill.score >= 60
                        ? "Expert"
                        : skill.score >= 30
                          ? "Proficient"
                          : "Novice"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                  <span>{skill.score} / 100</span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground/80" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground/80" />
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2.5 bg-muted border border-border rounded-full overflow-hidden">
                <div
                  className={`h-full bg-linear-to-r ${barColor} rounded-full transition-all duration-500`}
                  style={{ width: `${skill.score}%` }}
                />
              </div>

              {/* Collapsible evidence detail panel */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-border/80 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in-up">
                  {skill.evidence.githubStars > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-card border border-border/80 rounded-xl">
                      <Star className="h-4 w-4 text-amber-600 shrink-0" />
                      <div>
                        <span className="text-[10px] text-muted-foreground/85 block leading-none font-semibold">
                          Stars
                        </span>
                        <span className="text-xs font-extrabold text-foreground">
                          {skill.evidence.githubStars}
                        </span>
                      </div>
                    </div>
                  )}
                  {skill.evidence.githubPrs > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-card border border-border/80 rounded-xl">
                      <GitPullRequest className="h-4 w-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-[10px] text-muted-foreground/85 block leading-none font-semibold">
                          PR Contributions
                        </span>
                        <span className="text-xs font-extrabold text-foreground">
                          {skill.evidence.githubPrs}
                        </span>
                      </div>
                    </div>
                  )}
                  {skill.evidence.npmDownloads > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-card border border-border/80 rounded-xl">
                      <Package className="h-4 w-4 text-rose-600 shrink-0" />
                      <div>
                        <span className="text-[10px] text-muted-foreground/85 block leading-none font-semibold">
                          Downloads
                        </span>
                        <span className="text-xs font-extrabold text-foreground">
                          {skill.evidence.npmDownloads.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                  {skill.evidence.stackoverflowAnswers > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-card border border-border/80 rounded-xl">
                      <HelpCircle className="h-4 w-4 text-amber-600 shrink-0" />
                      <div>
                        <span className="text-[10px] text-muted-foreground/85 block leading-none font-semibold">
                          SO Answers
                        </span>
                        <span className="text-xs font-extrabold text-foreground">
                          {skill.evidence.stackoverflowAnswers}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
