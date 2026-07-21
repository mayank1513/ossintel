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
    <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
          <Award className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-100">Unified Skill Radar</h3>
          <p className="text-xs text-slate-400">
            Calculated domain expertise based on active code, publications, and
            community impact
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {skills.map((skill) => {
          const isExpanded = expandedSkill === skill.topic;

          // Determine color scheme based on score
          let barColor = "from-indigo-500 to-purple-500";
          let badgeBg = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
          if (skill.score >= 80) {
            barColor = "from-teal-400 to-emerald-500";
            badgeBg =
              "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
          } else if (skill.score >= 60) {
            barColor = "from-blue-400 to-indigo-500";
            badgeBg = "bg-blue-500/10 text-blue-400 border-blue-500/20";
          } else if (skill.score < 30) {
            barColor = "from-slate-500 to-slate-400";
            badgeBg = "bg-slate-500/10 text-slate-400 border-slate-500/20";
          }

          return (
            // biome-ignore lint/a11y/useSemanticElements: required to avoid symentic errors
            <div
              key={skill.topic}
              className="p-4 bg-slate-950/40 border border-slate-850 hover:border-slate-800 rounded-2xl transition-all duration-300 cursor-pointer"
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
                  <span className="font-bold text-slate-200 text-sm">
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
                <div className="flex items-center gap-2 text-xs font-bold text-slate-350">
                  <span>{skill.score} / 100</span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2.5 bg-slate-950 border border-slate-900 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-linear-to-r ${barColor} rounded-full transition-all duration-500`}
                  style={{ width: `${skill.score}%` }}
                />
              </div>

              {/* Collapsible evidence detail panel */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-850 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in-up">
                  {skill.evidence.githubStars > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-slate-900/50 border border-slate-850 rounded-xl">
                      <Star className="h-4 w-4 text-amber-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-500 block leading-none font-semibold">
                          Stars
                        </span>
                        <span className="text-xs font-extrabold text-slate-200">
                          {skill.evidence.githubStars}
                        </span>
                      </div>
                    </div>
                  )}
                  {skill.evidence.githubPrs > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-slate-900/50 border border-slate-850 rounded-xl">
                      <GitPullRequest className="h-4 w-4 text-green-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-500 block leading-none font-semibold">
                          PR Contributions
                        </span>
                        <span className="text-xs font-extrabold text-slate-200">
                          {skill.evidence.githubPrs}
                        </span>
                      </div>
                    </div>
                  )}
                  {skill.evidence.npmDownloads > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-slate-900/50 border border-slate-850 rounded-xl">
                      <Package className="h-4 w-4 text-red-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-500 block leading-none font-semibold">
                          Downloads
                        </span>
                        <span className="text-xs font-extrabold text-slate-200">
                          {skill.evidence.npmDownloads.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                  {skill.evidence.stackoverflowAnswers > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-slate-900/50 border border-slate-850 rounded-xl">
                      <HelpCircle className="h-4 w-4 text-orange-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-500 block leading-none font-semibold">
                          SO Answers
                        </span>
                        <span className="text-xs font-extrabold text-slate-200">
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
