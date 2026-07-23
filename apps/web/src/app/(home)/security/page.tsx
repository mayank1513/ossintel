import type { Metadata } from "next";
import { InfoPageLayout } from "@/components/info-page-layout";

export const metadata: Metadata = {
  title: "Security Policy | OSSIntel",
  description:
    "Learn about the security standards, app permissions, token management, and disclosure guidelines of the OSSIntel platform.",
  keywords: [
    "security policy",
    "github app authentication",
    "token rotation",
    "least-privilege permissions",
    "responsible disclosure",
  ],
};

const sections = [
  { id: "security-overview", title: "1. Security Overview" },
  { id: "github-authentication", title: "2. GitHub App Authentication" },
  { id: "least-privilege", title: "3. Least-Privilege Permissions" },
  { id: "installation-tokens", title: "4. Installation Tokens" },
  { id: "https-standards", title: "5. HTTPS / SSL Standards" },
  { id: "responsible-disclosure", title: "6. Responsible Disclosure" },
  { id: "contact-security", title: "7. Contact Security" },
];

export default function SecurityPage() {
  return (
    <InfoPageLayout
      title="Security Policy"
      subtitle="How we secure credentials, manage API tokens, and handle vulnerabilities responsibly."
      lastUpdated="July 23, 2026"
      sections={sections}
    >
      <div className="space-y-12">
        <section id="security-overview" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            1. Security Overview
          </h2>
          <p className="text-muted-foreground">
            OSSIntel is engineered to audit codebase quality and metrics
            securely. We prioritize data integrity and minimal exposure. Since
            we only request read-only access to metadata, we never write code or
            modify repository settings.
          </p>
        </section>

        <section id="github-authentication" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            2. GitHub App Authentication
          </h2>
          <p className="text-muted-foreground">
            Our platform interacts with GitHub using a GitHub App. App
            communication is authenticated using a Private Key (PEM format)
            issued by GitHub.
          </p>
          <p className="text-muted-foreground">
            This private key is securely stored inside server environment
            variables (never committed to version control) and is decrypted in
            memory only to sign JSON Web Tokens (JWTs) when requesting
            installation access.
          </p>
        </section>

        <section id="least-privilege" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            3. Least-Privilege Permissions
          </h2>
          <p className="text-muted-foreground">
            We follow the principle of least privilege. We only ask for the
            permissions absolutely necessary to run our metrics:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>
              <strong>Metadata (Read-only):</strong> Required to fetch
              repository info, stars, and basic package data.
            </li>
            <li>
              <strong>Pull Requests (Read-only):</strong> Required to analyze
              code review cycles and contributor velocity.
            </li>
          </ul>
          <p className="text-muted-foreground">
            For more details, see our dedicated{" "}
            <a
              href="/permissions"
              className="text-primary hover:underline font-medium"
            >
              GitHub Permissions page
            </a>
            .
          </p>
        </section>

        <section id="installation-tokens" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            4. Installation Tokens
          </h2>
          <p className="text-muted-foreground">
            OSSIntel generates temporary installation access tokens on-demand.
          </p>
          <div className="bg-muted/40 border border-border rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-foreground text-sm">
              Token Lifecycle
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              These tokens are valid for a maximum of 1 hour, are stored only in
              volatile memory caches during active requests, and are never saved
              to a database. They expire automatically and are rotated securely
              without human intervention.
            </p>
          </div>
        </section>

        <section id="https-standards" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            5. HTTPS / SSL Standards
          </h2>
          <p className="text-muted-foreground">
            We enforce HTTPS for all connections to the OSSIntel platform. All
            data transferred between your browser, our servers, and third-party
            APIs (GitHub, npm, Stack Overflow) is encrypted in transit using
            Transport Layer Security (TLS 1.3 or TLS 1.2).
          </p>
        </section>

        <section id="responsible-disclosure" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            6. Responsible Disclosure
          </h2>
          <p className="text-muted-foreground">
            We welcome vulnerability reports from researchers and security
            engineers. If you find a security bug in OSSIntel:
          </p>
          <ul className="list-decimal pl-5 space-y-2 text-muted-foreground">
            <li>
              Do not publicly disclose the issue before giving us a reasonable
              time to patch it.
            </li>
            <li>
              Do not exploit the vulnerability to view private data or disrupt
              service availability.
            </li>
            <li>
              Provide clear, reproducible steps so we can confirm and address
              the issue quickly.
            </li>
          </ul>
        </section>

        <section id="contact-security" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            7. Contact Security
          </h2>
          <p className="text-muted-foreground">
            Please report security vulnerabilities or concerns directly to our
            security team at:
          </p>
          <p className="text-muted-foreground font-mono">
            <code className="text-xs bg-muted px-2 py-1 rounded text-foreground">
              security@ossintel.org
            </code>
          </p>
          <p className="text-muted-foreground">
            We will acknowledge receipt of your report within 24 hours and keep
            you updated as we work to investigate and resolve the issue.
          </p>
        </section>
      </div>
    </InfoPageLayout>
  );
}
