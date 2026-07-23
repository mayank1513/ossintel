"use client";

import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useEffect, useState } from "react";
import { Footer } from "./footer";

interface Section {
  id: string;
  title: string;
}

interface InfoPageLayoutProps {
  title: string;
  subtitle?: string;
  lastUpdated: string;
  sections?: Section[];
  children: React.ReactNode;
}

export const InfoPageLayout: React.FC<InfoPageLayoutProps> = ({
  title,
  subtitle,
  lastUpdated,
  sections = [],
  children,
}) => {
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    if (sections.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; // Offset for header

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;

          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial run

    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Header height offset
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between transition-colors duration-200">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none opacity-[0.03] dark:opacity-[0.15]" />

      <main className="relative max-w-7xl w-full mx-auto px-6 py-12 md:py-16 flex-1 z-10">
        {/* Navigation Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </Link>

        {/* Page Header */}
        <div className="space-y-4 mb-12 border-b border-border pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-muted border border-border rounded-full text-xs text-muted-foreground font-medium">
            <Calendar className="h-3.5 w-3.5" />
            <span>Last updated: {lastUpdated}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
            {title}
          </h1>
          {subtitle && (
            <p className="text-md md:text-lg text-muted-foreground font-medium max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>

        {/* Page Content Grid */}
        <div className="grid grid-cols-12 gap-8 md:gap-12 items-start">
          {/* Main Content Body */}
          <div className="col-span-12 lg:col-span-9 max-w-none text-sm leading-relaxed">
            {children}
          </div>

          {/* Sidebar Navigation (TOC) */}
          {sections.length > 0 && (
            <aside className="hidden lg:block lg:col-span-3 sticky top-28 pl-6 border-l border-border space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                On This Page
              </h3>
              <nav className="flex flex-col gap-2.5">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    onClick={(e) => scrollToSection(e, section.id)}
                    className={`text-xs font-medium hover:text-foreground transition-colors block leading-snug border-l-2 pl-3 -ml-[25px] ${
                      activeSection === section.id
                        ? "text-foreground border-primary font-semibold"
                        : "text-muted-foreground border-transparent"
                    }`}
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </aside>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
