import type { Metadata } from "next";
import { InfoPageLayout } from "@/components/info-page-layout";

export const metadata: Metadata = {
  title: "Data Transparency | OSSIntel",
  description:
    "Review our transparent data policies: what data we collect, what we never collect, caching behaviors, and AI-generated insights.",
  keywords: [
    "transparency report",
    "caching policy",
    "ai insights guidelines",
    "data usage model",
    "developer control",
  ],
};

const sections = [
  { id: "what-we-collect", title: "1. What Data Is Collected" },
  { id: "what-we-never-collect", title: "2. What Data Is Never Collected" },
  { id: "metadata-usage", title: "3. How Metadata Is Used" },
  { id: "ai-insights", title: "4. AI-Generated Insights" },
  { id: "caching-rules", title: "5. Caching & Storage" },
  { id: "user-control", title: "6. User Control & Deletion" },
  { id: "uninstall-process", title: "7. App Uninstall Process" },
];

export default function TransparencyPage() {
  return (
    <InfoPageLayout
      title="Data Transparency"
      subtitle="Complete visibility into how we handle codebase metadata, caching, and AI calculations."
      lastUpdated="July 23, 2026"
      sections={sections}
    >
      <div className="space-y-12">
        <section id="what-we-collect" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            1. What Data Is Collected
          </h2>
          <p className="text-muted-foreground">
            We collect structural and operational metrics from public developer
            sources to generate our auditing scores:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>
              Public repository metadata (stars, forks, description, tags,
              languages).
            </li>
            <li>
              Pull request velocity timelines (time to review, merge rates,
              contributor counts).
            </li>
            <li>
              npm package registry metadata (package downloads, package
              dependencies, list of maintainers).
            </li>
            <li>
              Public Stack Overflow reputation, active answer tags, and badge
              categories.
            </li>
          </ul>
        </section>

        <section id="what-we-never-collect" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            2. What Data Is Never Collected
          </h2>
          <div className="bg-muted/40 border border-border rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-foreground text-sm">
              Strict Non-Collection Safeguards
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We never inspect, query, or store:
            </p>
            <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
              <li>Your actual source code files or database credentials.</li>
              <li>
                Private keys, environment variables, or server configurations.
              </li>
              <li>
                Non-public developer email addresses or communication histories.
              </li>
              <li>
                Private repository names or commit logs (unless specifically
                authorized via App installation, and even then, we only analyze
                structure metadata, never the code content itself).
              </li>
            </ul>
          </div>
        </section>

        <section id="metadata-usage" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            3. How Metadata Is Used
          </h2>
          <p className="text-muted-foreground">
            All codebase and profile metadata is fed into our modular scoring
            engine (`@ossintel/scoring`) to compute deterministic scores across
            four main pillars:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>
              <strong>Security Risk:</strong> Evaluating dependency
              vulnerabilities, outdated packages, and secure release procedures.
            </li>
            <li>
              <strong>Code Quality:</strong> Reviewing documentation status,
              release frequencies, and structured workflows.
            </li>
            <li>
              <strong>Community Health:</strong> Auditing contributor
              distribution, active response rates, and team alignment.
            </li>
            <li>
              <strong>Developer Expertise:</strong> Calculating knowledge
              scoring and topics mapping based on verified contributions.
            </li>
          </ul>
        </section>

        <section id="ai-insights" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            4. AI-Generated Insights
          </h2>
          <p className="text-muted-foreground">
            Our insights package (`@ossintel/insights`) uses Large Language
            Models (LLMs) to synthesize complex metric structures into developer
            summaries and findings.
          </p>
          <p className="text-muted-foreground">
            These summaries are advisory. We use strictly public metrics to form
            the context prompt for our AI providers. We enforce confidentiality
            agreements that prevent our providers from using your codebase
            metadata to train public models.
          </p>
        </section>

        <section id="caching-rules" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            5. Caching & Storage
          </h2>
          <p className="text-muted-foreground">
            To prevent rate limit exhaustion on third-party APIs, OSSIntel
            implements a tiered caching strategy:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>
              <strong>Client Cache:</strong> Analyzed profiles are cached
              locally in your browser storage (IndexedDB) for immediate access.
            </li>
            <li>
              <strong>Server Cache:</strong> Query results are cached on our
              secure servers for up to 24 hours. A manual &quot;re-analyze&quot;
              request triggers an active bypass of this cache to retrieve fresh
              data directly from public APIs.
            </li>
          </ul>
        </section>

        <section id="user-control" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            6. User Control & Deletion
          </h2>
          <p className="text-muted-foreground">
            We support complete data control. If you want to delete cached
            calculations:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>
              You can clear your local browser storage via developer tools.
            </li>
            <li>
              You can request deletion of server-cached audit indices by filing
              a request on our contact page.
            </li>
            <li>
              Uninstalling the GitHub App instantly removes all token
              credentials and prevents future background queries.
            </li>
          </ul>
        </section>

        <section id="uninstall-process" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            7. App Uninstall Process
          </h2>
          <p className="text-muted-foreground">
            To completely remove OSSIntel from your account or organization:
          </p>
          <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
            <li>
              Navigate to your GitHub account or organization settings page.
            </li>
            <li>
              Click on <strong>Applications</strong> and select the{" "}
              <strong>Installed GitHub Apps</strong> tab.
            </li>
            <li>
              Locate <strong>OSSIntel</strong> and click{" "}
              <strong>Configure</strong>.
            </li>
            <li>
              Scroll down to the danger zone and click{" "}
              <strong>Uninstall</strong>.
            </li>
          </ol>
          <p className="text-muted-foreground">
            Once clicked, GitHub automatically destroys our installation tokens.
            All API keys associated with your account are invalidated instantly.
          </p>
        </section>
      </div>
    </InfoPageLayout>
  );
}
