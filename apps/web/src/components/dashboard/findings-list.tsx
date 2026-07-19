"use client";

import { AlertTriangle, Award, ChevronDown, ChevronUp } from "lucide-react";
import type React from "react";
import { useState } from "react";

interface Finding {
  id: string;
  type: "highlight" | "warning";
  category: string;
  title: string;
  description: string;
  score?: number;
}

interface FindingsListProps {
  findings: Finding[];
}

export const FindingsList: React.FC<FindingsListProps> = ({ findings }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl overflow-hidden transition-all duration-300">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-t-3xl transition-colors hover:bg-slate-850/30"
      >
        <h3 className="text-base font-bold flex items-center gap-2">
          <Award className="h-5 w-5 text-indigo-400" /> Audit Findings
          {findings && findings.length > 0 && (
            <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-350 px-2 py-0.5 rounded-full font-bold ml-1">
              {findings.length}
            </span>
          )}
        </h3>
        <span className="text-slate-500">
          {isOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </span>
      </button>

      {isOpen && (
        <div className="px-6 pb-6 border-t border-slate-800/50 pt-4 animate-fade-in-up">
          {findings && findings.length > 0 ? (
            <div className="space-y-4">
              {findings.map((f) => (
                <div
                  key={f.id}
                  className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex gap-4 items-start"
                >
                  <span
                    className={`p-2 rounded-xl border shrink-0 ${
                      f.type === "warning"
                        ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4" />
                  </span>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-100">
                        {f.title}
                      </h4>
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          f.type === "warning"
                            ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        {f.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-350 leading-relaxed font-medium">
                      {f.description}
                    </p>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                      Category: {f.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic text-center py-4">
              No significant findings reported.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
