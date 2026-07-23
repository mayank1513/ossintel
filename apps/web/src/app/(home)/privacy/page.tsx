import type { Metadata } from "next";
import { InfoPageLayout } from "@/components/info-page-layout";

export const metadata: Metadata = {
  title: "Privacy Policy | OSSIntel",
  description:
    "Understand what data OSSIntel collects, how GitHub App permissions are used, and our commitment to developer data privacy.",
  keywords: [
    "privacy policy",
    "data security",
    "github integration",
    "developer data",
    "data retention",
  ],
};

const sections = [
  { id: "information-collected", title: "1. Information Collected" },
  { id: "github-permissions", title: "2. GitHub App Permissions" },
  { id: "github-oauth", title: "3. GitHub OAuth (Future-Ready)" },
  { id: "cookies", title: "4. Cookies & Local Storage" },
  { id: "analytics", title: "5. Analytics & Monitoring" },
  { id: "ai-providers", title: "6. AI Providers (Future-Ready)" },
  { id: "data-retention", title: "7. Data Retention & Caching" },
  { id: "security-standards", title: "8. Security Standards" },
  { id: "user-rights", title: "9. Your Rights & Data Control" },
  { id: "contact-info", title: "10. Contact Us" },
];

export default function PrivacyPage() {
  return (
    <InfoPageLayout
      title="Privacy Policy"
      subtitle="How we collect, use, and protect your repository and developer data on the OSSIntel platform."
      lastUpdated="July 23, 2026"
      sections={sections}
    >
      <div className="space-y-12">
        <section id="information-collected" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            1. Information Collected
          </h2>
          <p className="text-muted-foreground">
            OSSIntel is an open-source intelligence platform. We collect data to
            provide codebase audits and developer profile insights.
          </p>
          <div className="bg-muted/40 border border-border rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-foreground text-sm">
              Public Data Sources
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We query public APIs (GitHub REST/GraphQL, npm Registry, and
              StackExchange) to retrieve public metrics. This includes
              repository description, star counts, fork counts, dependency
              structure, public release history, and developer contribution
              profiles.
            </p>
          </div>
        </section>

        <section id="github-permissions" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            2. GitHub App Permissions
          </h2>
          <p className="text-muted-foreground">
            When you install the OSSIntel GitHub App, it requests specific,
            read-only permissions to audit your code structures.
          </p>
          <p className="text-muted-foreground">
            We only access the metadata and pull requests required to compute
            developer scoring metrics. For a detailed breakdown of our
            permissions, see our dedicated{" "}
            <a
              href="/permissions"
              className="text-primary hover:underline font-medium"
            >
              GitHub App Permissions Guide
            </a>
            .
          </p>
        </section>

        <section id="github-oauth" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            3. GitHub OAuth (Future-Ready)
          </h2>
          <p className="text-muted-foreground">
            We are designing OSSIntel to be future-ready. In a future update, we
            may introduce sign-in via GitHub OAuth to provide personalized user
            dashboards.
          </p>
          <p className="text-muted-foreground">
            If introduced, OAuth will only collect basic profile information
            (such as your name, email address, and avatar image) to customize
            your user experience. We will never ask for credentials or request
            permissions to commit or write to your repositories.
          </p>
        </section>

        <section id="cookies" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            4. Cookies & Local Storage
          </h2>
          <p className="text-muted-foreground">
            We value your privacy. OSSIntel does not use tracking or advertising
            cookies.
          </p>
          <p className="text-muted-foreground">
            We use browser Local Storage and minimal cookies strictly for
            functional operations, such as persisting your light/dark theme
            preference or managing temporary session tokens to rate-limit
            database lookups.
          </p>
        </section>

        <section id="analytics" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            5. Analytics & Monitoring
          </h2>
          <p className="text-muted-foreground">
            We may use privacy-first, self-hosted, or anonymous analytics to
            collect aggregated data about page usage and performance.
          </p>
          <p className="text-muted-foreground">
            This analytics data does not contain personally identifiable
            information (PII) and is used solely to improve our platform’s user
            experience, optimize API querying routines, and monitor server
            health.
          </p>
        </section>

        <section id="ai-providers" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            6. AI Providers (Future-Ready)
          </h2>
          <p className="text-muted-foreground">
            OSSIntel is built to integrate with modern AI providers (like Google
            Gemini) to generate rich codebase summaries and developer insights.
          </p>
          <p className="text-muted-foreground">
            All AI-generated summaries are computed using strictly public
            codebase metadata. Your private source code is never transmitted to,
            stored by, or used to train third-party AI models. All API
            integrations enforce data confidentiality.
          </p>
        </section>

        <section id="data-retention" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            7. Data Retention & Caching
          </h2>
          <p className="text-muted-foreground">
            To respect API rate limits, OSSIntel caches retrieved repository and
            user metadata.
          </p>
          <div className="bg-muted/40 border border-border rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-foreground text-sm">
              Caching Architecture
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Metadata and score calculations are stored in local browser cache
              (IndexedDB) and secure server-side caches. We retain cached data
              temporarily (typically 24 hours), after which it is invalidated
              and refreshed upon a new request.
            </p>
          </div>
        </section>

        <section id="security-standards" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            8. Security Standards
          </h2>
          <p className="text-muted-foreground">
            We take data security seriously and employ industry-standard
            protocols to protect all operational variables:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>
              SSL/TLS encryption for all client-to-server and server-to-API
              network traffic.
            </li>
            <li>
              Encryption of application credentials and private keys using
              secure server environments.
            </li>
            <li>
              Frequent security audits of scoring packages and dependencies.
            </li>
          </ul>
        </section>

        <section id="user-rights" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            9. Your Rights & Data Control
          </h2>
          <p className="text-muted-foreground">
            You maintain full control over the visibility of your metrics on
            OSSIntel:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>
              <strong>App Uninstallation:</strong> You can uninstall the
              OSSIntel GitHub App from your account or organization settings at
              any time, which immediately revokes our access.
            </li>
            <li>
              <strong>Cache Deletion:</strong> You can clear your browser
              storage (IndexedDB) to remove locally cached reports.
            </li>
            <li>
              <strong>Opt-out:</strong> If you wish to exclude your public
              repository or profile from being searchable on our platform, you
              can file a request via our Contact page.
            </li>
          </ul>
        </section>

        <section id="contact-info" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">10. Contact Us</h2>
          <p className="text-muted-foreground">
            If you have questions about this Privacy Policy, our data practices,
            or wish to make an access request, please visit our{" "}
            <a
              href="/contact"
              className="text-primary hover:underline font-medium"
            >
              Contact page
            </a>{" "}
            or contact us at{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono text-foreground">
              privacy@ossintel.org
            </code>
            .
          </p>
        </section>
      </div>
    </InfoPageLayout>
  );
}
