import {
  ACTIVITY_RECENCY_WEIGHT,
  ACTIVITY_RELEASE_DEFAULT_SCORE,
  ACTIVITY_RELEASE_FACTOR,
  ACTIVITY_RELEASE_WEIGHT,
  COMMUNITY_CONTRIBUTOR_WEIGHT,
  COMMUNITY_META_DESCRIPTION_SCORE,
  COMMUNITY_META_HOMEPAGE_SCORE,
  COMMUNITY_META_WEIGHT,
  COMMUNITY_TOPIC_WEIGHT,
  CONTRIBUTOR_ESTIMATOR_CAP,
  CONTRIBUTOR_ESTIMATOR_MULTIPLIER,
  DAYS_RECENT_1,
  DAYS_RECENT_7,
  DAYS_RECENT_30,
  DAYS_RECENT_90,
  DAYS_RECENT_180,
  DAYS_RECENT_365,
  HEALTH_FORK_SCORE,
  HEALTH_FORK_WEIGHT,
  HEALTH_ISSUE_RATIO_MULTIPLIER,
  HEALTH_ISSUE_WEIGHT,
  HEALTH_NON_FORK_SCORE,
  HEALTH_POPULARITY_OFFSET,
  HEALTH_UPDATE_30_DAYS,
  HEALTH_UPDATE_30_SCORE,
  HEALTH_UPDATE_90_DAYS,
  HEALTH_UPDATE_90_SCORE,
  HEALTH_UPDATE_180_DAYS,
  HEALTH_UPDATE_180_SCORE,
  HEALTH_UPDATE_365_DAYS,
  HEALTH_UPDATE_365_SCORE,
  HEALTH_UPDATE_OLD_SCORE,
  HEALTH_UPDATE_WEIGHT,
  IMPACT_FORK_FACTOR,
  IMPACT_FORK_WEIGHT,
  IMPACT_STAR_FACTOR,
  IMPACT_STAR_WEIGHT,
  IMPACT_WATCHER_FACTOR,
  IMPACT_WATCHER_WEIGHT,
  MAX_SCORE,
  MS_PER_DAY,
  RISK_CONTRIBUTOR_1_SCORE,
  RISK_CONTRIBUTOR_3_SCORE,
  RISK_CONTRIBUTOR_5_SCORE,
  RISK_FORK_SCORE,
  RISK_OPEN_ISSUES_SCORE_HIGH,
  RISK_OPEN_ISSUES_SCORE_LOW,
  RISK_OPEN_ISSUES_THRESHOLD_HIGH,
  RISK_OPEN_ISSUES_THRESHOLD_LOW,
  RISK_PUSH_90_DAYS,
  RISK_PUSH_90_SCORE,
  RISK_PUSH_180_DAYS,
  RISK_PUSH_180_SCORE,
  RISK_PUSH_365_DAYS,
  RISK_PUSH_365_SCORE,
  SCORE_RECENT_1,
  SCORE_RECENT_7,
  SCORE_RECENT_30,
  SCORE_RECENT_90,
  SCORE_RECENT_180,
  SCORE_RECENT_365,
} from "./constants";
import type { RepositoryScores, ScoringInputs } from "./types";

/** Calculate the impact score based on stars, forks, and watchers. */
export const calculateImpactScore = (
  repository: ScoringInputs["repository"],
): number => {
  const stars = repository.stargazersCount;
  const forks = repository.forksCount;
  const watchers = repository.watchersCount;

  const starScore = Math.min(
    MAX_SCORE,
    Math.log10(stars + 1) * IMPACT_STAR_WEIGHT,
  );
  const forkScore = Math.min(
    MAX_SCORE,
    Math.log10(forks + 1) * IMPACT_FORK_WEIGHT,
  );
  const watcherScore = Math.min(
    MAX_SCORE,
    Math.log10(watchers + 1) * IMPACT_WATCHER_WEIGHT,
  );

  return Math.round(
    starScore * IMPACT_STAR_FACTOR +
      forkScore * IMPACT_FORK_FACTOR +
      watcherScore * IMPACT_WATCHER_FACTOR,
  );
};

/** Calculate the activity score based on push recency and release frequency. */
export const calculateActivityScore = (
  repository: ScoringInputs["repository"],
  releases: ScoringInputs["releases"],
): number => {
  if (repository.isArchived) return 0;
  const now = new Date();
  const pushDate = new Date(repository.pushedAt);
  const diffMs = now.getTime() - pushDate.getTime();
  const diffDays = Math.max(0, diffMs / MS_PER_DAY);

  let recencyScore = 0;
  if (diffDays <= DAYS_RECENT_1) recencyScore = SCORE_RECENT_1;
  else if (diffDays <= DAYS_RECENT_7) recencyScore = SCORE_RECENT_7;
  else if (diffDays <= DAYS_RECENT_30) recencyScore = SCORE_RECENT_30;
  else if (diffDays <= DAYS_RECENT_90) recencyScore = SCORE_RECENT_90;
  else if (diffDays <= DAYS_RECENT_180) recencyScore = SCORE_RECENT_180;
  else if (diffDays <= DAYS_RECENT_365) recencyScore = SCORE_RECENT_365;

  let releaseScore = ACTIVITY_RELEASE_DEFAULT_SCORE;
  if (releases) {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    const recentReleases = releases.filter(
      (r) => r.publishedAt && new Date(r.publishedAt) >= oneYearAgo,
    ).length;
    releaseScore = Math.min(
      MAX_SCORE,
      recentReleases * ACTIVITY_RELEASE_FACTOR,
    );
  }

  return Math.round(
    recencyScore * ACTIVITY_RECENCY_WEIGHT +
      releaseScore * ACTIVITY_RELEASE_WEIGHT,
  );
};

/** Calculate the community score from contributors, topics, and metadata. */
export const calculateCommunityScore = (
  repository: ScoringInputs["repository"],
  contributors: ScoringInputs["contributors"],
): number => {
  // Throttling/rate-limit fallback: estimate contributor base from stargazers if empty
  const contributorsCount =
    contributors && contributors.length > 0
      ? contributors.length
      : Math.max(
          1,
          Math.min(
            CONTRIBUTOR_ESTIMATOR_CAP,
            Math.floor(Math.sqrt(repository.stargazersCount)),
          ),
        );
  const contributorScore = Math.min(
    MAX_SCORE,
    Math.log10(contributorsCount + 1) * CONTRIBUTOR_ESTIMATOR_MULTIPLIER,
  );

  const topicScore = repository.topics.length > 0 ? MAX_SCORE : 0;
  const metaScore =
    (repository.description ? COMMUNITY_META_DESCRIPTION_SCORE : 0) +
    (repository.homepage ? COMMUNITY_META_HOMEPAGE_SCORE : 0);

  return Math.round(
    contributorScore * COMMUNITY_CONTRIBUTOR_WEIGHT +
      topicScore * COMMUNITY_TOPIC_WEIGHT +
      metaScore * COMMUNITY_META_WEIGHT,
  );
};

/** Calculate repository health based on issue density, update recency, and fork status. */
export const calculateHealthScore = (
  repository: ScoringInputs["repository"],
): number => {
  if (repository.isArchived) return 0;
  const popularity = repository.stargazersCount + repository.forksCount;
  let issueScore = MAX_SCORE;
  if (repository.openIssuesCount > 0) {
    const ratio =
      repository.openIssuesCount / (popularity + HEALTH_POPULARITY_OFFSET);
    issueScore = Math.max(0, MAX_SCORE - ratio * HEALTH_ISSUE_RATIO_MULTIPLIER);
  }

  const updateDate = new Date(repository.updatedAt);
  const diffMs = Date.now() - updateDate.getTime();
  const diffDays = Math.max(0, diffMs / MS_PER_DAY);
  let updateHealthScore = 0;
  if (diffDays <= HEALTH_UPDATE_30_DAYS)
    updateHealthScore = HEALTH_UPDATE_30_SCORE;
  else if (diffDays <= HEALTH_UPDATE_90_DAYS)
    updateHealthScore = HEALTH_UPDATE_90_SCORE;
  else if (diffDays <= HEALTH_UPDATE_180_DAYS)
    updateHealthScore = HEALTH_UPDATE_180_SCORE;
  else if (diffDays <= HEALTH_UPDATE_365_DAYS)
    updateHealthScore = HEALTH_UPDATE_365_SCORE;
  else updateHealthScore = HEALTH_UPDATE_OLD_SCORE;

  const forkScore = repository.isFork
    ? HEALTH_FORK_SCORE
    : HEALTH_NON_FORK_SCORE;

  return Math.round(
    issueScore * HEALTH_ISSUE_WEIGHT +
      updateHealthScore * HEALTH_UPDATE_WEIGHT +
      forkScore * HEALTH_FORK_WEIGHT,
  );
};

/** Calculate risk score based on staleness, contributor count, fork status, and issue density. */
export const calculateRiskScore = (
  repository: ScoringInputs["repository"],
  contributors: ScoringInputs["contributors"],
): number => {
  let riskScore = 0;

  const pushDate = new Date(repository.pushedAt);
  const diffDays = (Date.now() - pushDate.getTime()) / MS_PER_DAY;
  if (diffDays > RISK_PUSH_365_DAYS) riskScore += RISK_PUSH_365_SCORE;
  else if (diffDays > RISK_PUSH_180_DAYS) riskScore += RISK_PUSH_180_SCORE;
  else if (diffDays > RISK_PUSH_90_DAYS) riskScore += RISK_PUSH_90_SCORE;

  // Throttling/rate-limit fallback: estimate contributor base from stargazers if empty
  const contributorCount =
    contributors && contributors.length > 0
      ? contributors.length
      : Math.max(
          1,
          Math.min(
            CONTRIBUTOR_ESTIMATOR_CAP,
            Math.floor(Math.sqrt(repository.stargazersCount)),
          ),
        );
  if (contributorCount <= 1) riskScore += RISK_CONTRIBUTOR_1_SCORE;
  else if (contributorCount <= 3) riskScore += RISK_CONTRIBUTOR_3_SCORE;
  else if (contributorCount <= 5) riskScore += RISK_CONTRIBUTOR_5_SCORE;

  if (repository.isFork) riskScore += RISK_FORK_SCORE;

  const popularity = repository.stargazersCount + repository.forksCount;
  if (
    repository.openIssuesCount > RISK_OPEN_ISSUES_THRESHOLD_HIGH &&
    repository.openIssuesCount > popularity
  ) {
    riskScore += RISK_OPEN_ISSUES_SCORE_HIGH;
  } else if (repository.openIssuesCount > RISK_OPEN_ISSUES_THRESHOLD_LOW) {
    riskScore += RISK_OPEN_ISSUES_SCORE_LOW;
  }

  return Math.min(MAX_SCORE, Math.round(riskScore));
};

/** Calculate aggregate repository scores across all dimensions. */
export const calculateRepositoryScore = (
  inputs: ScoringInputs,
): RepositoryScores => {
  const { repository, contributors, releases } = inputs;

  const health = calculateHealthScore(repository);
  const impact = calculateImpactScore(repository);
  const activity = calculateActivityScore(repository, releases);
  const community = calculateCommunityScore(repository, contributors);
  const risk = calculateRiskScore(repository, contributors);

  const overall = Math.round(
    health * 0.3 +
      impact * 0.25 +
      activity * 0.2 +
      community * 0.15 +
      (MAX_SCORE - risk) * 0.1,
  );

  return {
    overall,
    health,
    impact,
    activity,
    community,
    risk,
  };
};
