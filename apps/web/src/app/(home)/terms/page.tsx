import type { Metadata } from "next";
import { InfoPageLayout } from "@/components/info-page-layout";

export const metadata: Metadata = {
  title: "Terms of Service | OSSIntel",
  description:
    "Review the terms, conditions, and acceptable use guidelines governing the use of the OSSIntel open-source intelligence platform.",
  keywords: [
    "terms of service",
    "terms of use",
    "legal conditions",
    "user agreement",
    "no warranty",
  ],
};

const sections = [
  { id: "acceptance-terms", title: "1. Acceptance of Terms" },
  { id: "service-description", title: "2. Service Description" },
  { id: "user-responsibilities", title: "3. User Responsibilities" },
  { id: "acceptable-use", title: "4. Acceptable Use" },
  { id: "intellectual-property", title: "5. Intellectual Property" },
  { id: "no-warranty", title: "6. No Warranty" },
  { id: "limitation-liability", title: "7. Limitation of Liability" },
  { id: "third-party-services", title: "8. Third-Party Services" },
  { id: "termination-clause", title: "9. Termination" },
  { id: "contact-info", title: "10. Contact Us" },
];

export default function TermsPage() {
  return (
    <InfoPageLayout
      title="Terms of Service"
      subtitle="The terms and guidelines governing your access and usage of the OSSIntel platform."
      lastUpdated="July 23, 2026"
      sections={sections}
    >
      <div className="space-y-12">
        <section id="acceptance-terms" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            1. Acceptance of Terms
          </h2>
          <p className="text-muted-foreground">
            By accessing or using the OSSIntel website (the
            &quot;Service&quot;), you agree to be bound by these Terms of
            Service. If you do not agree to these terms, please do not use the
            Service.
          </p>
        </section>

        <section id="service-description" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            2. Service Description
          </h2>
          <p className="text-muted-foreground">
            OSSIntel is an open-source intelligence and auditing platform. We
            provide code health scores, developer activity insights, and
            organization portfolio metrics. Our services are powered by
            deterministic scoring engines and AI-assisted metadata analysis. We
            reserve the right to modify, suspend, or discontinue any aspect of
            the Service at any time.
          </p>
        </section>

        <section id="user-responsibilities" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            3. User Responsibilities
          </h2>
          <p className="text-muted-foreground">
            As a user of OSSIntel, you represent that you have the right and
            authority to audit the public repositories and developer identifiers
            you submit. You are responsible for ensuring that your utilization
            of our calculations complies with all applicable local, national,
            and international laws.
          </p>
        </section>

        <section id="acceptable-use" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            4. Acceptable Use
          </h2>
          <p className="text-muted-foreground">
            You agree not to engage in any of the following prohibited
            activities:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>
              Scraping or harvesting data from the website in a manner that
              bypasses pagination limits or API protection headers.
            </li>
            <li>
              Spamming, overloading, or executing denial of service (DoS)
              attacks on our database endpoints.
            </li>
            <li>
              Submitting malicious or formatted inputs designed to break our
              normalizers or scoring engines.
            </li>
            <li>
              Using OSSIntel calculations to harass, stalk, or discriminate
              against individual developers or organizations.
            </li>
          </ul>
        </section>

        <section id="intellectual-property" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            5. Intellectual Property
          </h2>
          <p className="text-muted-foreground">
            The OSSIntel codebase, including the normalizers, scoring packages,
            and web presentation files, is licensed under the MIT License.
          </p>
          <p className="text-muted-foreground">
            You remain the sole owner of all source code, comments, and assets
            located in your repositories. Our scoring outputs and metadata
            findings do not transfer any rights or ownership of your source
            repositories to OSSIntel.
          </p>
        </section>

        <section id="no-warranty" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">6. No Warranty</h2>
          <p className="text-muted-foreground">
            THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS
            AVAILABLE&quot; BASIS. OSSINTEL DISCLAIMS ALL WARRANTIES OF ANY
            KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
            NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE
            UNINTERRUPTED, SECURE, OR ERROR-FREE.
          </p>
        </section>

        <section id="limitation-liability" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            7. Limitation of Liability
          </h2>
          <p className="text-muted-foreground">
            IN NO EVENT SHALL OSSINTEL, ITS CONTRIBUTORS, OR DEVELOPERS BE
            LIABLE FOR ANY INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL
            DAMAGES ARISING OUT OF OR IN CONNECTION WITH THE USE OR INABILITY TO
            USE THE SERVICE. THIS INCLUDES, BUT IS NOT LIMITED TO, LOSS OF
            REVENUE, DATA CORRUPTION, COMPUTER FAILURE, OR API RATE-LIMIT
            IMPACTS.
          </p>
        </section>

        <section id="third-party-services" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">
            8. Third-Party Services
          </h2>
          <p className="text-muted-foreground">
            OSSIntel interacts with third-party platforms (including GitHub,
            npm, and Stack Overflow). Your use of these platforms is governed by
            their respective terms of service. OSSIntel is not responsible for
            changes, rate limits, or suspensions initiated by these third-party
            platforms.
          </p>
        </section>

        <section id="termination-clause" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">9. Termination</h2>
          <p className="text-muted-foreground">
            We reserve the right, in our sole discretion and without prior
            notice, to terminate or restrict your access to the Service for any
            reason, including violation of these terms or abusive API querying
            patterns.
          </p>
        </section>

        <section id="contact-info" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-foreground">10. Contact Us</h2>
          <p className="text-muted-foreground">
            For questions about these Terms of Service or to report violations,
            please visit our{" "}
            <a
              href="/contact"
              className="text-primary hover:underline font-medium"
            >
              Contact page
            </a>{" "}
            or contact us at{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono text-foreground">
              terms@ossintel.org
            </code>
            .
          </p>
        </section>
      </div>
    </InfoPageLayout>
  );
}
