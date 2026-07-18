import {
  fetchContributors,
  fetchDeveloper,
  fetchLanguages,
  fetchOrganizations,
  fetchReleases,
  fetchRepositories,
  fetchRepository,
} from "@ossintel/github-normalizer";
import { generateInsights } from "@ossintel/insights";
import { calculateRepositoryScore } from "@ossintel/scoring";
import { NextResponse } from "next/server";
import { auditDeveloper } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { type, owner, repo, token } = await request.json();

    if (!owner) {
      return NextResponse.json(
        { error: "Owner/Username is required" },
        { status: 400 },
      );
    }

    const options = { token };

    if (type === "repo") {
      if (!repo) {
        return NextResponse.json(
          { error: "Repository name is required for repo audits" },
          { status: 400 },
        );
      }

      // Fetch repository data
      const repository = await fetchRepository(owner, repo, options);
      let contributors: any[] = [];
      let releases: any[] = [];
      let languages: any[] = [];

      try {
        contributors = await fetchContributors(owner, repo, {
          ...options,
          allPages: false,
          perPage: 100,
        });
      } catch (e) {
        console.error("Failed to fetch contributors", e);
      }

      try {
        releases = await fetchReleases(owner, repo, {
          ...options,
          allPages: false,
          perPage: 100,
        });
      } catch (e) {
        console.error("Failed to fetch releases", e);
      }

      try {
        languages = await fetchLanguages(owner, repo, options);
      } catch (e) {
        console.error("Failed to fetch languages", e);
      }

      const scores = calculateRepositoryScore({
        repository,
        contributors,
        releases,
        languages,
      });
      const insightsResult = generateInsights(
        { repository, contributors, releases, languages },
        scores,
      );

      return NextResponse.json({
        type: "repo",
        metadata: {
          name: repository.name,
          fullName: repository.fullName,
          description: repository.description,
          stars: repository.stargazersCount,
          forks: repository.forksCount,
          watchers: repository.watchersCount,
          openIssues: repository.openIssuesCount,
          language: repository.language,
          topics: repository.topics,
          defaultBranch: repository.defaultBranch,
          isFork: repository.isFork,
          htmlUrl: repository.htmlUrl,
          pushedAt: repository.pushedAt,
          updatedAt: repository.updatedAt,
          owner: repository.owner,
        },
        scores,
        findings: insightsResult.findings,
        recommendations: insightsResult.recommendations,
        promptContext: insightsResult.promptContext,
        languages,
        contributorsCount: contributors.length,
      });
    } else if (type === "user") {
      const developer = await fetchDeveloper(owner, options);
      const repositories = await fetchRepositories(owner, {
        ...options,
        allPages: false,
        perPage: 30,
      });
      const organizations = await fetchOrganizations(owner, options);

      const auditResult = auditDeveloper(
        developer,
        repositories,
        organizations,
      );

      return NextResponse.json({
        type: "user",
        metadata: {
          login: developer.login,
          name: developer.name,
          avatarUrl: developer.avatarUrl,
          htmlUrl: developer.htmlUrl,
          company: developer.company,
          blog: developer.blog,
          location: developer.location,
          bio: developer.bio,
          followers: developer.followers,
          following: developer.following,
          publicRepos: developer.publicRepos,
          createdAt: developer.createdAt,
          organizations,
        },
        ...auditResult,
      });
    }

    return NextResponse.json({ error: "Invalid audit type" }, { status: 400 });
  } catch (error: any) {
    console.error("Analysis API failed", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze entity" },
      { status: 500 },
    );
  }
}
