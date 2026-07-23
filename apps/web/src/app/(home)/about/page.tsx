import type { Metadata } from "next";
import { InfoPageLayout } from "@/components/info-page-layout";

export const metadata: Metadata = {
  title: "About OSSIntel | Open Source Intelligence Platform",
  description:
    "Discover the mission, vision, core features, roadmap, and open-source philosophy of the OSSIntel software auditing platform.",
  keywords: [
    "about ossintel",
    "software auditing platform",
    "developer scorecards",
    "open source mission",
    "product roadmap",
  ],
};

const sections = [
  { id: "what-is-ossintel", title: "1. What is OSSIntel?" },
  { id: "mission", title: "2. Our Mission" },
  { id: "vision", title: "3. Our Vision" },
  { id: "key-features", title: "4. Core Features" },
  { id: "product-roadmap", title: "5. Roadmap" },
  { id: "open-source-philosophy", title: "6. Open Source Philosophy" },
];

export default function AboutPage() {
  return (
    <InfoPageLayout
      title="About OSSIntel"
      subtitle="The open intelligence platform built for developer auditing, codebase evaluation, and ecosystem transparency."
      lastUpdated="July 23, 2026"
      sections={sections}
    >
      <div className="space-y-12">
        <section id="what-is-ossintel" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            1. What is OSSIntel?
          </h2>
          <p className="text-muted-foreground">
            OSSIntel (Open Source Intelligence Audit Platform) is a unified tool
            designed to assess developer portfolios, codebase structures, and
            package ecosystems.
          </p>
          <p className="text-muted-foreground">
            By querying verified public APIs and passing metrics through a
            deterministic scoring library, we output clear scorecards. Rather
            than relying on vanity metrics (like GitHub stars or contributor
            counts), OSSIntel evaluates code quality, security postures, release
            histories, and active maintenance structures.
          </p>
        </section>

        <section id="mission" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">2. Our Mission</h2>
          <p className="text-muted-foreground">
            Our mission is to establish transparent, deterministic software
            health metrics for the global open-source community.
          </p>
          <p className="text-muted-foreground">
            We aim to remove the guesswork from dependency management.
            Developers, organizations, and security teams should have immediate,
            verifiable answers to whether an open-source library is actively
            maintained, structurally secure, and safe to include in their
            production codebases.
          </p>
        </section>

        <section id="vision" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">3. Our Vision</h2>
          <p className="text-muted-foreground">
            We envision a software ecosystem where open-source contributions are
            valued based on code quality and security impact rather than
            marketing popularity.
          </p>
          <p className="text-muted-foreground">
            By providing objective developer and repository audits, we hope to
            encourage healthier coding practices, prompt maintainers to
            prioritize security vulnerabilities, and help organizations support
            the foundational dependencies they rely on.
          </p>
        </section>

        <section id="key-features" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            4. Core Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/40 border border-border rounded-xl p-5">
              <h3 className="font-semibold text-foreground text-sm mb-2">
                Deterministic Scoring
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every metric is processed through `@ossintel/scoring` in a
                purely deterministic manner. The same repository data always
                generates the same score, ensuring complete audit
                reproducibility.
              </p>
            </div>
            <div className="bg-muted/40 border border-border rounded-xl p-5">
              <h3 className="font-semibold text-foreground text-sm mb-2">
                Multi-Platform Analytics
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We combine metadata from GitHub repositories, npm packages, and
                Stack Overflow profiles to assemble a cohesive intelligence
                dashboard.
              </p>
            </div>
            <div className="bg-muted/40 border border-border rounded-xl p-5">
              <h3 className="font-semibold text-foreground text-sm mb-2">
                AI-Generated Summaries
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                By integrating with Google Gemini and other advanced LLMs, we
                distill raw metrics into developer activity findings and
                recommendations.
              </p>
            </div>
            <div className="bg-muted/40 border border-border rounded-xl p-5">
              <h3 className="font-semibold text-foreground text-sm mb-2">
                Local Caching
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All parsed profiles and repository evaluations are stored
                directly in your browser using IndexedDB, reducing network lag
                and rate limiting.
              </p>
            </div>
          </div>
        </section>

        <section id="product-roadmap" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">5. Roadmap</h2>
          <p className="text-muted-foreground">
            OSSIntel is evolving. Our active roadmap includes the following
            planned releases:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>
              <strong>Additional Data Sources:</strong> Integrations for package
              registries like PyPI (Python) and NuGet (.NET).
            </li>
            <li>
              <strong>VS Code Extension:</strong> View codebase audit scores
              directly inside your editor.
            </li>
            <li>
              <strong>Organization Level Audits:</strong> Compute aggregated
              security risks for entire company portfolios.
            </li>
            <li>
              <strong>Credential Scopes:</strong> Expanding support for OAuth
              logins and custom developer profile views.
            </li>
          </ul>
        </section>

        <section id="open-source-philosophy" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            6. Open Source Philosophy
          </h2>
          <p className="text-muted-foreground">
            We believe that an audit platform must itself be auditable. OSSIntel
            is completely open-source, from our normalizers to our scoring
            algorithms.
          </p>
          <p className="text-muted-foreground">
            You can view, fork, review, and contribute to the code on our{" "}
            <a
              href="https://github.com/ossintel/ossintel"
              target="_blank"
              rel="noreferrer noopener"
              className="text-primary hover:underline font-medium"
            >
              GitHub repository
            </a>
            . We welcome pull requests, bug reports, and discussion from the
            community.
          </p>
        </section>
      </div>
    </InfoPageLayout>
  );
}
