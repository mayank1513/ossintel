"use client";

import type { TopicExpertise } from "@ossintel/scoring";
import { HelpCircle, Network, Package } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { GithubIcon } from "../icons";

interface EcosystemGraphProps {
  skills: TopicExpertise[];
}

export const EcosystemGraph: React.FC<EcosystemGraphProps> = ({ skills }) => {
  const [selectedTopic, setSelectedTopic] = useState<string>(
    skills[0]?.topic || "",
  );

  if (!skills || skills.length === 0) return null;

  const currentSkill =
    skills.find((s) => s.topic === selectedTopic) || skills[0];

  return (
    <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
            <Network className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100">
              Cross-Platform Ecosystem Graph
            </h3>
            <p className="text-xs text-slate-400">
              Interactive view of multi-platform evidence for each skill
            </p>
          </div>
        </div>

        {/* Topic Pills */}
        <div className="flex flex-wrap gap-1.5">
          {skills.slice(0, 5).map((s) => (
            <button
              key={s.topic}
              type="button"
              onClick={() => setSelectedTopic(s.topic)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all border ${
                selectedTopic === s.topic
                  ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/40"
                  : "bg-slate-950/60 text-slate-450 border-slate-850 hover:border-slate-800 hover:text-slate-200"
              }`}
            >
              {s.topic}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Graph Layout */}
      <div className="relative flex flex-col md:flex-row items-center justify-center p-8 bg-slate-950/40 border border-slate-850 rounded-2xl min-h-[300px] overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/10 blur-[80px] pointer-events-none rounded-full" />

        <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-xl gap-8 z-10">
          {/* Platform Nodes (Left Column on Desktop) */}
          <div className="flex flex-col gap-6 w-full md:w-56">
            {/* GitHub Node */}
            <div className="flex items-center gap-3 p-3 bg-slate-900/60 border border-slate-850 rounded-2xl hover:border-indigo-500/30 transition-all duration-300">
              <div className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-350">
                <GithubIcon className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 block leading-none">
                  GitHub
                </span>
                <span className="text-xs font-extrabold text-slate-200 mt-1 block">
                  {currentSkill.evidence.githubStars > 0
                    ? `${currentSkill.evidence.githubStars.toLocaleString()} Stars`
                    : "No direct repos"}
                </span>
                <span className="text-[10px] text-slate-450 block leading-none mt-0.5">
                  {currentSkill.evidence.githubPrs} PRs contributed
                </span>
              </div>
            </div>

            {/* npm Node */}
            <div className="flex items-center gap-3 p-3 bg-slate-900/60 border border-slate-850 rounded-2xl hover:border-indigo-500/30 transition-all duration-300">
              <div className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-red-400">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 block leading-none">
                  npm
                </span>
                <span className="text-xs font-extrabold text-slate-200 mt-1 block">
                  {currentSkill.evidence.npmDownloads > 0
                    ? `${currentSkill.evidence.npmDownloads.toLocaleString()} Downloads`
                    : "No packages"}
                </span>
                <span className="text-[10px] text-slate-450 block leading-none mt-0.5">
                  {currentSkill.evidence.npmPackages} modules published
                </span>
              </div>
            </div>

            {/* Stack Overflow Node */}
            <div className="flex items-center gap-3 p-3 bg-slate-900/60 border border-slate-850 rounded-2xl hover:border-indigo-500/30 transition-all duration-300">
              <div className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-orange-400">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 block leading-none">
                  Stack Overflow
                </span>
                <span className="text-xs font-extrabold text-slate-200 mt-1 block">
                  {currentSkill.evidence.stackoverflowScore > 0
                    ? `${currentSkill.evidence.stackoverflowScore.toLocaleString()} Score`
                    : "No answers"}
                </span>
                <span className="text-[10px] text-slate-450 block leading-none mt-0.5">
                  {currentSkill.evidence.stackoverflowAnswers} answers published
                </span>
              </div>
            </div>
          </div>

          {/* Connection Lines (Desktop only) */}
          <div className="hidden md:flex flex-col justify-center items-center h-48 w-12 relative shrink-0">
            <svg
              className="w-full h-full text-slate-800"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Connection paths</title>
              <path
                d="M 10 20 Q 50 50 90 50"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4"
              />
              <path
                d="M 10 50 L 90 50"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4"
              />
              <path
                d="M 10 80 Q 50 50 90 50"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4"
              />
              <circle cx="90" cy="50" r="3" fill="#6366f1" />
            </svg>
          </div>

          {/* Central Skill Node */}
          <div className="relative flex flex-col items-center justify-center p-8 bg-gradient-to-b from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 shadow-[0_0_30px_-5px_rgba(99,102,241,0.2)] rounded-full h-40 w-40 text-center shrink-0 animate-pulse">
            <span className="text-sm font-extrabold text-indigo-300 block mb-1">
              {currentSkill.topic}
            </span>
            <span className="text-2xl font-black text-white block">
              {currentSkill.score}%
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-1">
              expertise
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
