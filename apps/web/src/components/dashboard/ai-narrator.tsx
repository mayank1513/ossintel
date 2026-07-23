import { CheckCircle2, Copy, Sparkles } from "lucide-react";
import type React from "react";
import { useState } from "react";

interface PromptContext {
  summary: string;
  scoresText: string;
  metricsText: string;
  findingsText: string;
  recommendationsText: string;
}

interface AINarratorProps {
  promptContext: PromptContext;
}

export const AINarrator: React.FC<AINarratorProps> = ({ promptContext }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const fullText = `${promptContext.summary}\n\n${promptContext.scoresText}\n\n${promptContext.metricsText}\n\n${promptContext.findingsText}\n\n${promptContext.recommendationsText}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 bg-card border border-border rounded-2xl flex flex-col gap-5 shadow-sm relative">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          type="button"
          onClick={copyToClipboard}
          className={`p-2 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 ${
            copied
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
              : "bg-muted/40 border-border text-muted-foreground hover:text-foreground hover:border-border/85"
          }`}
        >
          {copied ? (
            <>
              <CheckCircle2 className="h-4 w-4" /> Copied context!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" /> Copy Prompt Context
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 text-primary/85">
        <Sparkles className="h-5 w-5" />
        <h3 className="font-extrabold text-sm uppercase tracking-wider">
          AI Narrator Report
        </h3>
      </div>

      <div className="space-y-4 text-sm text-foreground/90 leading-relaxed font-medium">
        <p className="bg-muted/40 p-4 border border-border/60 rounded-xl italic">
          "{promptContext.summary}"
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
          <div className="space-y-2">
            <span className="text-muted-foreground/80 font-bold uppercase tracking-wider block">
              Key Performance
            </span>
            <p>
              The codebase highlights score strengths in its component metrics,
              balancing community growth and risk mitigation to maintain stable
              ecosystem levels.
            </p>
          </div>
          <div className="space-y-2">
            <span className="text-muted-foreground/80 font-bold uppercase tracking-wider block">
              Ecosystem Action
            </span>
            <p>
              Follow the prioritized recommendations below to optimize
              repository maintenance and reduce bus factors or backlog density.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
