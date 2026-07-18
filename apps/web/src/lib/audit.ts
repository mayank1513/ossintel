import type {
  NormalizedDeveloper,
  NormalizedOrganization,
  NormalizedRepository,
} from "@ossintel/github-normalizer";
import type { Finding, Recommendation } from "@ossintel/insights";
import { calculateRepositoryScore } from "@ossintel/scoring";

interface RepositoryScoreItem {
  repoName: string;
  fullName: string;
  scores: ReturnType<typeof calculateRepositoryScore>;
  stars: number;
  forks: number;
}

export const auditDeveloper = (
  developer: NormalizedDeveloper,
  repositories: NormalizedRepository[],
  organizations: NormalizedOrganization[],
) => {
  const repoScores: RepositoryScoreItem[] = repositories
    .map((r) => {
      try {
        return {
          repoName: r.name,
          fullName: r.fullName,
          scores: calculateRepositoryScore({ repository: r }),
          stars: r.stargazersCount,
          forks: r.forksCount,
        };
      } catch {
        return null;
      }
    })
    .filter((r): r is RepositoryScoreItem => r !== null);

  const count = repoScores.length;
  const avgHealth = Math.round(
    repoScores.reduce((acc, s) => acc + s.scores.health, 0) / (count || 1),
  );
  const avgActivity = Math.round(
    repoScores.reduce((acc, s) => acc + s.scores.activity, 0) / (count || 1),
  );
  const avgCommunity = Math.round(
    repoScores.reduce((acc, s) => acc + s.scores.community, 0) / (count || 1),
  );
  const avgRisk = Math.round(
    repoScores.reduce((acc, s) => acc + s.scores.risk, 0) / (count || 1),
  );

  const totalStars = repositories.reduce(
    (acc, r) => acc + r.stargazersCount,
    0,
  );
  const totalForks = repositories.reduce((acc, r) => acc + r.forksCount, 0);
  const totalWatchers = repositories.reduce(
    (acc, r) => acc + r.watchersCount,
    0,
  );

  const starScore = Math.min(100, Math.log10(totalStars + 1) * 20);
  const forkScore = Math.min(100, Math.log10(totalForks + 1) * 25);
  const watcherScore = Math.min(100, Math.log10(totalWatchers + 1) * 30);
  const devImpact = Math.round(
    starScore * 0.5 + forkScore * 0.35 + watcherScore * 0.15,
  );

  const devOverall = Math.round(
    avgHealth * 0.3 +
      devImpact * 0.25 +
      avgActivity * 0.2 +
      avgCommunity * 0.15 +
      (100 - avgRisk) * 0.1,
  );

  const devScores = {
    overall: devOverall,
    health: avgHealth,
    impact: devImpact,
    activity: avgActivity,
    community: avgCommunity,
    risk: avgRisk,
  };

  const findings: Finding[] = [];
  const recommendations: Recommendation[] = [];

  if (devScores.risk > 50) {
    findings.push({
      id: "dev_risk_high",
      type: "warning",
      category: "risk",
      title: "Elevated Portfolio Risk Profile",
      description:
        "The maintainer's repositories show an elevated risk profile on average, suggesting potential bus factor or neglect vulnerabilities.",
      score: devScores.risk,
    });
    recommendations.push({
      id: "dev_risk_recom",
      category: "risk",
      title: "Distribute Maintenance Responsibilities",
      description:
        "Consider onboarding co-maintainers for key repositories to decrease single-maintainer dependencies.",
      priority: "high",
    });
  } else if (devScores.risk < 25) {
    findings.push({
      id: "dev_risk_low",
      type: "highlight",
      category: "risk",
      title: "Excellent Repository Maintenance Practices",
      description:
        "The maintainer keeps their repositories at low risk with active contributions and multi-developer engagement.",
      score: devScores.risk,
    });
  }

  if (devScores.impact > 60) {
    findings.push({
      id: "dev_impact_high",
      type: "highlight",
      category: "impact",
      title: "High Ecosystem Reach",
      description: `Highly influential developer with a combined reach of ${totalStars.toLocaleString()} stars across public projects.`,
      score: devScores.impact,
    });
  }

  if (devScores.health < 40) {
    findings.push({
      id: "dev_health_low",
      type: "warning",
      category: "health",
      title: "Neglected Portfolio Bug Backlog",
      description:
        "Average repository health is low, driven by stale unresolved issue backlogs.",
      score: devScores.health,
    });
    recommendations.push({
      id: "dev_health_triage",
      category: "health",
      title: "Prioritize Bug Triage Sessions",
      description:
        "Focus on closing out stale issues and PRs on your top repositories.",
      priority: "medium",
    });
  }

  const summary = `OSSIntel analysis report for developer ${developer.login}. Calculated Overall Maintainer OSSIQ score is ${devScores.overall}/100.`;

  const scoresText = [
    "### Calculated Scores",
    `- Overall OSSIQ Score: ${devScores.overall}/100`,
    `- Avg Health Score: ${devScores.health}/100`,
    `- Portfolio Impact Score: ${devScores.impact}/100`,
    `- Avg Activity Score: ${devScores.activity}/100`,
    `- Avg Community Score: ${devScores.community}/100`,
    `- Avg Risk Score: ${devScores.risk}/100`,
  ].join("\n");

  const metricsText = [
    "### Maintainer Profile & Stats",
    `- Name: ${developer.name ?? developer.login}`,
    `- Followers: ${developer.followers}`,
    `- Public Repos: ${developer.publicRepos}`,
    `- Bio: ${developer.bio ?? "None"}`,
    `- Company: ${developer.company ?? "None"}`,
    `- Location: ${developer.location ?? "None"}`,
    `- Organizations Member: ${organizations.map((o) => o.login).join(", ") || "None"}`,
    `- Total Stars Gained: ${totalStars}`,
    `- Total Forks: ${totalForks}`,
    `- Total Watchers: ${totalWatchers}`,
  ].join("\n");

  const findingsText = [
    "### Findings",
    ...findings.map(
      (f) =>
        `- [${f.type.toUpperCase()}] (${f.category}): **${f.title}** - ${f.description}`,
    ),
  ].join("\n");

  const recommendationsText = [
    "### Recommendations",
    ...recommendations.map(
      (r) =>
        `- [Priority: ${r.priority.toUpperCase()}] (${r.category}) **${r.title}**: ${r.description}`,
    ),
  ].join("\n");

  const promptContext = {
    summary,
    scoresText,
    metricsText,
    findingsText,
    recommendationsText,
  };

  return {
    scores: devScores,
    findings,
    recommendations,
    promptContext,
    repositories: repoScores,
  };
};
