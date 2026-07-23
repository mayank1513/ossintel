import { AlertCircle, Clock, Mail, MessageSquare } from "lucide-react";
import type { Metadata } from "next";
import { InfoPageLayout } from "@/components/info-page-layout";

export const metadata: Metadata = {
  title: "Contact Support | OSSIntel",
  description:
    "Get in touch with the OSSIntel community and support channels. Ask questions on GitHub Discussions, report bugs on GitHub Issues, or send us an email.",
  keywords: [
    "contact support",
    "github discussions",
    "report bugs",
    "contact email",
    "response expectations",
  ],
};

const sections = [
  { id: "community-discussions", title: "1. GitHub Discussions" },
  { id: "bug-reports", title: "2. GitHub Issues" },
  { id: "email-support", title: "3. Email Contact" },
  { id: "response-times", title: "4. Response Expectations" },
];

export default function ContactPage() {
  return (
    <InfoPageLayout
      title="Contact Support"
      subtitle="Have questions, feedback, or need security assistance? Here is how to reach us."
      lastUpdated="July 23, 2026"
      sections={sections}
    >
      <div className="space-y-12">
        <section id="community-discussions" className="space-y-4 scroll-mt-24">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted border border-border rounded-xl text-foreground">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              1. GitHub Discussions
            </h2>
          </div>
          <p className="text-muted-foreground">
            For general questions, feature requests, custom integrations, or
            general feedback about the platform:
          </p>
          <p className="text-muted-foreground">
            Please open a thread in the{" "}
            <a
              href="https://github.com/mayank1513/ossintel/discussions"
              target="_blank"
              rel="noreferrer noopener"
              className="text-primary hover:underline font-semibold"
            >
              GitHub Discussions
            </a>{" "}
            section. This is the fastest way to collaborate with the maintainers
            and share ideas with other community members.
          </p>
        </section>

        <section id="bug-reports" className="space-y-4 scroll-mt-24">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted border border-border rounded-xl text-destructive">
              <AlertCircle className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              2. GitHub Issues
            </h2>
          </div>
          <p className="text-muted-foreground">
            If you encounter a specific coding bug, a broken page, or scoring
            mismatches:
          </p>
          <p className="text-muted-foreground">
            Please search for existing issues or open a new bug report in the{" "}
            <a
              href="https://github.com/mayank1513/ossintel/issues"
              target="_blank"
              rel="noreferrer noopener"
              className="text-primary hover:underline font-semibold"
            >
              GitHub Issues
            </a>{" "}
            tracker. Be sure to include your environment specs, query details,
            and console errors to help us troubleshoot quickly.
          </p>
        </section>

        <section id="email-support" className="space-y-4 scroll-mt-24">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted border border-border rounded-xl text-foreground">
              <Mail className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              3. Email Contact
            </h2>
          </div>
          <p className="text-muted-foreground">
            For private inquiries, business queries, or reporting security
            vulnerabilities:
          </p>
          <p className="text-muted-foreground">
            Please email us at:{" "}
            <code className="text-xs bg-muted px-2 py-1 rounded font-mono text-foreground">
              ossintel-support@mayankchaudhari.com
            </code>
          </p>
          <p className="text-muted-foreground">
            For security vulnerability reports, please refer to our guidelines
            on the{" "}
            <a
              href="/security"
              className="text-primary hover:underline font-semibold"
            >
              Security Policy page
            </a>{" "}
            and send emails to{" "}
            <code className="text-xs bg-muted px-2 py-1 rounded font-mono text-foreground">
              security@ossintel.org
            </code>
            .
          </p>
        </section>

        <section id="response-times" className="space-y-4 scroll-mt-24">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted border border-border rounded-xl text-foreground">
              <Clock className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              4. Response Expectations
            </h2>
          </div>
          <p className="text-muted-foreground">
            OSSIntel is maintained by open-source contributors. Here are the
            expected response times:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>
              <strong>GitHub Discussions:</strong> Checked periodically by the
              community (response typically in 2-3 business days).
            </li>
            <li>
              <strong>GitHub Issues:</strong> Triaged based on severity.
              Critical system bugs are prioritised (response typically in 1-2
              business days).
            </li>
            <li>
              <strong>Emails:</strong> Checked regularly for security or
              business compliance items (response typically in 2-3 business
              days).
            </li>
          </ul>
        </section>
      </div>
    </InfoPageLayout>
  );
}
