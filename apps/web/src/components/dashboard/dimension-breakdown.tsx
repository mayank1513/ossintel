import type { IdentityScores, RepositoryScores } from "@ossintel/scoring";
import {
  Activity,
  AlertTriangle,
  Award,
  GitPullRequest,
  Heart,
  Info,
  Users,
} from "lucide-react";
import type React from "react";

interface DimensionBreakdownProps {
  scores: IdentityScores | RepositoryScores;
}

export const DimensionBreakdown: React.FC<DimensionBreakdownProps> = ({
  scores,
}) => {
  const getScoreColorClass = (score: number) => {
    if (score >= 75)
      return "text-emerald-500 stroke-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 40)
      return "text-amber-500 stroke-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-rose-500 stroke-rose-500 bg-rose-500/10 border-rose-500/20";
  };

  const getScoreBgClass = (score: number) => {
    if (score >= 75) return "bg-emerald-500";
    if (score >= 40) return "bg-amber-500";
    return "bg-rose-500";
  };

  const scoresObj = scores;
  const isUser = "maintainer" in scoresObj;

  // 1. Repository-mode fallback metrics
  const getHealthReason = (score: number) => {
    if (score >= 75)
      return "Excellent health. Active updates and well-managed issue tracker relative to its size.";
    if (score >= 40)
      return "Moderate health. Updates are less frequent or there is a backlog of open issues.";
    return "Low health. Repository is archived, has long-delayed updates, or has an excessively high open issues ratio.";
  };

  const getImpactReason = (score: number) => {
    if (score >= 75)
      return "High impact. Massive stars, forks, and watchers count, indicating wide adoption.";
    if (score >= 40)
      return "Medium impact. Solid community adoption and interest with good traction.";
    return "Low impact. Project is still growing or has niche visibility with fewer stars/forks.";
  };

  const getActivityReason = (score: number) => {
    if (score >= 75)
      return "Highly active. Regular commits and frequent releases in the past year.";
    if (score >= 40)
      return "Moderate activity. Stable codebase with occasional commits or releases.";
    return "Low activity. No recent commits or releases; project may be mature or inactive.";
  };

  const getCommunityReason = (score: number) => {
    if (score >= 75)
      return "Strong community. Diverse contributor base, active topic tags, and complete metadata.";
    if (score >= 40)
      return "Healthy community. Stable developer participation and standard repository metadata.";
    return "Limited community. Low contributor headcount, or missing topics/homepage details.";
  };

  const getRiskReason = (score: number) => {
    if (score >= 50)
      return "High risk. Low developer count (single point of failure), stale updates, or excessive issues.";
    if (score >= 20)
      return "Moderate risk. Stale commits or small developer base; proceed with caution.";
    return "Low risk. Active development, diverse contributors, and healthy popularity ratio.";
  };

  const repoMetrics = [
    {
      label: "Health Score",
      val: (scoresObj as RepositoryScores).health || 0,
      icon: Heart,
      calc: "Evaluates the ratio of open issues to repo popularity (stars + forks) and the recency of code updates (last commit recency).",
      getReason: getHealthReason,
    },
    {
      label: "Impact Score",
      val: (scoresObj as RepositoryScores).impact || 0,
      icon: Award,
      calc: "Logarithmic scale of GitHub stars (50%), forks (35%), and watchers (15%). Measures ecosystem footprint.",
      getReason: getImpactReason,
    },
    {
      label: "Activity Score",
      val: (scoresObj as RepositoryScores).activity || 0,
      icon: Activity,
      calc: "Combines the recency of the last commit (60%) and the frequency of releases in the last 12 months (40%).",
      getReason: getActivityReason,
    },
    {
      label: "Community Score",
      val: (scoresObj as RepositoryScores).community || 0,
      icon: Users,
      calc: "Evaluates total contributors count (70%), repository topics (15%), and repository documentation completeness (15%). Falls back to star-based contributor estimates when throttled.",
      getReason: getCommunityReason,
    },
    {
      label: "Risk Score",
      val: (scoresObj as RepositoryScores).risk || 0,
      icon: AlertTriangle,
      inverse: true,
      calc: "Assesses risk based on lack of updates (>3 months), low contributor counts (<5 developers), fork status, and open issues exceeding popularity.",
      getReason: getRiskReason,
    },
  ];

  // 2. User-mode reputation metrics
  const userMetrics = isUser
    ? [
        {
          label: "Maintainer Score",
          val: scoresObj.maintainer || 0,
          icon: Heart,
          calc: "Measures code quality, health, and activity across owned or maintained repositories, popularity-weighted to prioritize flagship projects.",
          evidence: scoresObj.evidence.maintainer,
          factors: scoresObj.factors.maintainer,
        },
        {
          label: "Contributor Score",
          val: scoresObj.contributor || 0,
          icon: GitPullRequest,
          calc: "Measures PR contributions to external repositories. Factored with dynamic project importance and repeat contributor bonuses.",
          evidence: scoresObj.evidence.contributor,
          factors: scoresObj.factors.contributor,
        },
        {
          label: "Organization Leadership",
          val: scoresObj.organization || 0,
          icon: Users,
          calc: "Measures administrative scale and activity across organization workspaces you manage or lead.",
          evidence: scoresObj.evidence.organization,
          factors: scoresObj.factors.organization,
        },
        {
          label: "Community Influence",
          val: scoresObj.influence || 0,
          icon: Award,
          calc: "Measures total downstream adoption based on log-scaled stars, forks, and weekly npm packages downloads.",
          evidence: scoresObj.evidence.influence,
          factors: scoresObj.factors.influence,
        },
      ]
    : [];

  const metrics = isUser ? userMetrics : repoMetrics;

  return (
    <div className="p-6 bg-card border border-border rounded-2xl flex flex-col gap-4 shadow-sm">
      <h4 className="text-xs font-bold text-muted-foreground/80 uppercase tracking-widest">
        {isUser ? "OSSIQ Engine Breakdown" : "Dimension Breakdown"}
      </h4>
      <div className="space-y-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const displayColorVal =
            "inverse" in metric && metric.inverse
              ? 100 - metric.val
              : metric.val;
          return (
            <div
              key={metric.label}
              className={`p-4 rounded-xl flex flex-col gap-3 transition-colors ${
                isUser
                  ? "bg-muted/40 border border-border/80 hover:border-border"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-foreground/90">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {metric.label}
                  <div className="group relative flex items-center">
                    <Info className="h-3.5 w-3.5 text-muted-foreground/80 hover:text-primary transition-colors cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-card border border-border text-foreground text-[10px] rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 normal-case leading-normal font-medium">
                      <p className="font-bold text-foreground mb-1">
                        How it's calculated:
                      </p>
                      <p className="text-muted-foreground mb-2">
                        {metric.calc}
                      </p>
                      {"factors" in metric &&
                        metric.factors &&
                        metric.factors.length > 0 && (
                          <>
                            <p className="font-bold text-foreground mb-1">
                              Explainability Factors:
                            </p>
                            <ul className="space-y-0.5 text-[10px] text-muted-foreground list-none pl-0">
                              {metric.factors.map((f: string) => (
                                <li
                                  key={f}
                                  className={
                                    f.startsWith("+")
                                      ? "text-emerald-600"
                                      : f.startsWith("-")
                                        ? "text-destructive"
                                        : ""
                                  }
                                >
                                  {f}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      {"getReason" in metric && (
                        <>
                          <p className="font-bold text-foreground mb-1">
                            Status:
                          </p>
                          <p>{metric.getReason(metric.val)}</p>
                        </>
                      )}
                    </div>
                  </div>
                </span>
                <span
                  className={getScoreColorClass(displayColorVal).split(" ")[0]}
                >
                  {metric.val}
                </span>
              </div>
              <div className="bg-muted h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${getScoreBgClass(displayColorVal)}`}
                  style={{ width: `${metric.val}%` }}
                />
              </div>
              {/* Evidence Bullets */}
              {"evidence" in metric &&
                metric.evidence &&
                metric.evidence.length > 0 && (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] text-muted-foreground border-t border-border/40 pt-2 list-none pl-0">
                    {metric.evidence.map((ev: string) => (
                      <li key={ev} className="flex items-center gap-1.5">
                        <div className="h-1 w-1 bg-primary rounded-full shrink-0" />
                        <span className="truncate">{ev}</span>
                      </li>
                    ))}
                  </ul>
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
