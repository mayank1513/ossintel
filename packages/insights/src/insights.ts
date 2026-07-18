import type { RepositoryScores, ScoringInputs } from "@ossintel/scoring";
import type {
  Finding,
  PromptContext,
  Recommendation,
  RepositoryInsights,
} from "./types";

export const generateInsights = (
  inputs: ScoringInputs,
  scores: RepositoryScores,
): RepositoryInsights => {
  const { repository, contributors, releases } = inputs;
  const findings: Finding[] = [];
  const recommendations: Recommendation[] = [];

  // 1. Risk Rules
  if (scores.risk > 70) {
    findings.push({
      id: "risk_high",
      type: "warning",
      category: "risk",
      title: "High Maintenance Risk",
      description:
        "This project has signs of high maintenance risk due to inactivity, a low number of contributors, or a large open issues backlog relative to its community size.",
      score: scores.risk,
    });
    recommendations.push({
      id: "risk_high_mitigate",
      category: "risk",
      title: "Expand Contributor Pool & Address Backlog",
      description:
        "Encourage more contributors to join the maintenance team and actively triage or close older open issues to reduce project risk.",
      priority: "high",
    });
  } else if (scores.risk < 20) {
    findings.push({
      id: "risk_low",
      type: "highlight",
      category: "risk",
      title: "Low Risk Profile",
      description:
        "The project has a very low risk profile, exhibiting strong maintenance practices and an active developer base.",
      score: scores.risk,
    });
  }

  // 2. Activity Rules
  if (scores.activity < 30) {
    findings.push({
      id: "activity_low",
      type: "warning",
      category: "activity",
      title: "Negligible Update Activity",
      description:
        "No recent updates or releases have been published for this project, indicating it might be abandoned or in deep maintenance mode.",
      score: scores.activity,
    });
    recommendations.push({
      id: "activity_low_resume",
      category: "activity",
      title: "Publish Staged Work",
      description:
        "If there are staged changes, publish a new release tag to signal to consumers that the project is still actively watched.",
      priority: "medium",
    });
  } else if (scores.activity > 80) {
    findings.push({
      id: "activity_high",
      type: "highlight",
      category: "activity",
      title: "Vibrantly Active",
      description:
        "Frequent code updates and release cycles show highly active ongoing development.",
      score: scores.activity,
    });
  }

  // 3. Health Rules
  if (scores.health < 40) {
    findings.push({
      id: "health_poor",
      type: "warning",
      category: "health",
      title: "Neglected Issue Backlog",
      description:
        "A substantial volume of open issues relative to project size indicates difficulty in addressing bug reports or feature requests.",
      score: scores.health,
    });
    recommendations.push({
      id: "health_triage",
      category: "health",
      title: "Setup Issue Triage Workflow",
      description:
        "Introduce stale-issue automation or setup dedicated triaging guidelines to systematically address the issue backlog.",
      priority: "high",
    });
  } else if (scores.health > 80) {
    findings.push({
      id: "health_excellent",
      type: "highlight",
      category: "health",
      title: "Healthy Codebase Maintenance",
      description:
        "The codebase is healthy with a minimal issue backlog relative to popularity and an active maintenance schedule.",
      score: scores.health,
    });
  }

  // 4. Impact Rules
  if (scores.impact > 70) {
    findings.push({
      id: "impact_high",
      type: "highlight",
      category: "impact",
      title: "High Adoption & Popularity",
      description:
        "This project has achieved high popularity and critical adoption within the open-source ecosystem.",
      score: scores.impact,
    });
  } else if (scores.impact < 15) {
    findings.push({
      id: "impact_low",
      type: "highlight",
      category: "impact",
      title: "Early Stage or Niche Reach",
      description:
        "The project currently has low visibility or serves a highly specialized niche community.",
      score: scores.impact,
    });
    recommendations.push({
      id: "impact_promote",
      category: "impact",
      title: "Improve Visibility & Outreach",
      description:
        "Publish clear quickstart documentation, share the library in community channels, and add tags to boost discoverability.",
      priority: "low",
    });
  }

  // 5. Community Rules
  if (scores.community < 30) {
    findings.push({
      id: "community_small",
      type: "warning",
      category: "community",
      title: "Lacking Community Infrastructure",
      description:
        "The project has a very small contributor pool and lacks rich metadata options (like homepage, topics, or description).",
      score: scores.community,
    });
    recommendations.push({
      id: "community_metadata",
      category: "community",
      title: "Add Repository Metadata",
      description:
        "Add descriptive topics, homepage links, and a concise description in repository settings to encourage outside contribution.",
      priority: "medium",
    });
  } else if (scores.community > 80) {
    findings.push({
      id: "community_strong",
      type: "highlight",
      category: "community",
      title: "Strong Contributor Community",
      description:
        "Backed by an engaging contributor base and clean documentation, showing strong community interest.",
      score: scores.community,
    });
  }

  const now = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(now.getFullYear() - 1);
  const recentReleases = releases
    ? releases.filter(
        (r) => r.publishedAt && new Date(r.publishedAt) >= oneYearAgo,
      ).length
    : 0;

  const summary = `OSSIntel analysis report for repository ${repository.fullName}. Calculated Overall score is ${scores.overall}/100.`;

  const scoresText = [
    "### Calculated Scores",
    `- Overall Score: ${scores.overall}/100`,
    `- Health Score: ${scores.health}/100`,
    `- Impact Score: ${scores.impact}/100`,
    `- Activity Score: ${scores.activity}/100`,
    `- Community Score: ${scores.community}/100`,
    `- Risk Score: ${scores.risk}/100 (where 100 is highest risk)`,
  ].join("\n");

  const metricsText = [
    "### Raw Metrics & Metadata",
    `- Name: ${repository.name}`,
    `- Owner: ${repository.owner.login}`,
    `- Stars: ${repository.stargazersCount}`,
    `- Watchers: ${repository.watchersCount}`,
    `- Forks: ${repository.forksCount}`,
    `- Open Issues: ${repository.openIssuesCount}`,
    `- Language: ${repository.language ?? "Unknown"}`,
    `- Topics: ${repository.topics.join(", ") || "None"}`,
    `- Default Branch: ${repository.defaultBranch}`,
    `- Size: ${repository.size} KB`,
    `- Contributors Count: ${contributors?.length ?? 0}`,
    `- Releases in Past Year: ${recentReleases}`,
    `- Pushed At: ${repository.pushedAt}`,
    `- Updated At: ${repository.updatedAt}`,
  ].join("\n");

  const findingsText = [
    "### Findings",
    ...findings.map(
      (f) =>
        `- [${f.type.toUpperCase()}] (${f.category}): **${f.title}** (Score: ${f.score ?? "N/A"}) - ${f.description}`,
    ),
  ].join("\n");

  const recommendationsText = [
    "### Recommendations",
    ...recommendations.map(
      (r) =>
        `- [Priority: ${r.priority.toUpperCase()}] (${r.category}) **${r.title}**: ${r.description}`,
    ),
  ].join("\n");

  const promptContext: PromptContext = {
    summary,
    scoresText,
    metricsText,
    findingsText,
    recommendationsText,
  };

  return {
    findings,
    recommendations,
    promptContext,
  };
};
