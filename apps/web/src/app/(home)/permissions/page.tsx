import type { Metadata } from "next";
import { InfoPageLayout } from "@/components/info-page-layout";

export const metadata: Metadata = {
  title: "GitHub App Permissions | OSSIntel",
  description:
    "Detailed guide on the GitHub App permissions requested by OSSIntel, why they are required, and our strict read-only model.",
  keywords: [
    "github app permissions",
    "metadata access",
    "pull request read access",
    "read-only permissions",
    "data audit safety",
  ],
};

const sections = [
  { id: "permissions-overview", title: "1. Permissions Overview" },
  { id: "permissions-table", title: "2. Required Permissions Table" },
  { id: "metadata-access", title: "3. Repository Metadata" },
  { id: "pull-requests", title: "4. Pull Request Read Access" },
  { id: "organization-access", title: "5. Organization Access" },
  { id: "never-modified", title: "6. What OSSIntel Never Modifies" },
];

export default function PermissionsPage() {
  return (
    <InfoPageLayout
      title="GitHub App Permissions"
      subtitle="A clear explanation of every permission requested by the OSSIntel GitHub App."
      lastUpdated="July 23, 2026"
      sections={sections}
    >
      <div className="space-y-12">
        <section id="permissions-overview" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            1. Permissions Overview
          </h2>
          <p className="text-muted-foreground">
            OSSIntel uses a GitHub App integration to fetch repository
            structures and contributor details. We follow a strict **read-only**
            policy. Our app never requests permissions to edit, write, delete,
            or create repositories, code, comments, or settings.
          </p>
        </section>

        <section id="permissions-table" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            2. Required Permissions Table
          </h2>
          <p className="text-muted-foreground">
            Here is a breakdown of the specific GitHub permissions requested and
            why they are necessary:
          </p>
          <div className="overflow-x-auto border border-border rounded-xl bg-muted/20">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40 font-semibold text-foreground">
                  <th className="p-4">Permission</th>
                  <th className="p-4">Why Required</th>
                  <th className="p-4">Optional?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-muted-foreground">
                <tr>
                  <td className="p-4 font-mono text-foreground font-semibold">
                    Repository Metadata
                  </td>
                  <td className="p-4">
                    Allows us to identify basic details like star counts, forks,
                    description, release tags, and programming languages.
                  </td>
                  <td className="p-4 text-destructive font-semibold">
                    No (Core)
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-foreground font-semibold">
                    Pull Requests (Read)
                  </td>
                  <td className="p-4">
                    Analyzes timeline events to calculate review cycle
                    durations, pull request velocity, and active contributor
                    trends.
                  </td>
                  <td className="p-4 text-foreground font-semibold">Yes</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-foreground font-semibold">
                    Organization Members (Read)
                  </td>
                  <td className="p-4">
                    Audits organization composition and correlates member
                    associations to calculate team capability scoring.
                  </td>
                  <td className="p-4 text-foreground font-semibold">Yes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="metadata-access" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            3. Repository Metadata
          </h2>
          <p className="text-muted-foreground">
            Repository Metadata is a mandatory baseline permission for all
            GitHub Apps.
          </p>
          <p className="text-muted-foreground">
            This permission grants read-only access to basic, non-code
            information about a repository, including its name, description,
            contributors, tags, releases, and programming language ratios. We
            use these files to run our deterministic scoring systems.
          </p>
        </section>

        <section id="pull-requests" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            4. Pull Request Read Access
          </h2>
          <p className="text-muted-foreground">
            To assess the health and activity of an open-source codebase, we
            analyze how pull requests (PRs) are reviewed and merged.
          </p>
          <p className="text-muted-foreground">
            This read-only permission lets us collect aggregate data on PR
            timelines, such as the duration between PR creation and review, the
            number of reviewers, and commit velocity. We do not look at code
            changes in these pull requests; we only inspect structural flow
            metadata.
          </p>
        </section>

        <section id="organization-access" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            5. Organization Access
          </h2>
          <p className="text-muted-foreground">
            When installed on an organization, the app can read public member
            profiles to verify developer identities and contribution metrics.
          </p>
          <p className="text-muted-foreground">
            This allows our algorithms to provide a summary score for the entire
            organization's open-source portfolio, highlighting primary
            maintainers and active codebase assets.
          </p>
        </section>

        <section id="never-modified" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            6. What OSSIntel Never Modifies
          </h2>
          <div className="bg-muted/40 border border-border rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-foreground text-sm">
              Strict Isolation Policy
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              OSSIntel operates in a read-only sandboxed pipeline. The GitHub
              App does not request write access. Consequently, it is
              cryptographically impossible for OSSIntel to:
            </p>
            <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
              <li>Write, edit, or commit code to your repositories.</li>
              <li>
                Create, close, or modify pull requests, comments, or issues.
              </li>
              <li>
                Alter repository configurations, secrets, or branch protections.
              </li>
              <li>Invite collaborators or change user accounts/permissions.</li>
            </ul>
          </div>
        </section>
      </div>
    </InfoPageLayout>
  );
}
