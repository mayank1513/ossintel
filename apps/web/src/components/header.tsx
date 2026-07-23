"use client";

import { ThemeSwitch } from "fumadocs-ui/layouts/shared/slots/theme-switch";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import icon from "@/app/icon.png";
import { GithubIcon } from "@/components/icons";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();

  // Let Fumadocs handle its own header layout for docs
  if (pathname?.startsWith("/docs")) {
    return null;
  }

  const isHome = pathname === "/";

  if (isHome) {
    return (
      <header className="sticky top-0 border-b border-border bg-background/70 backdrop-blur-md z-50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-muted border border-border rounded-xl overflow-hidden shadow-sm shrink-0">
              {/* biome-ignore lint/performance/noImgElement: static logo */}
              <img
                src={icon.src}
                alt="OSSIntel Logo"
                className="h-9 w-9 object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                OSS<span className="text-emerald-600">Intel</span>
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                Open Source Intelligence Platform
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/docs"
              className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
            >
              <BookOpen className="h-4 w-4" /> Docs
            </Link>
            <a
              href="https://github.com/ossintel/ossintel"
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
            >
              <GithubIcon className="h-4 w-4" /> GitHub
            </a>
            <ThemeSwitch className="text-muted-foreground hover:text-foreground transition-colors" />
          </div>
        </div>
      </header>
    );
  }

  // Dashboard, Repo, and User page headers
  return (
    <header className="sticky top-0 border-b border-border bg-background/70 backdrop-blur-md z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Search
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="p-0.5 bg-muted border border-border rounded-lg overflow-hidden shrink-0">
              {/* biome-ignore lint/performance/noImgElement: static logo */}
              <img
                src={icon.src}
                alt="OSSIntel Logo"
                className="h-6 w-6 object-contain"
              />
            </div>
            <span className="text-sm font-bold text-foreground">OSSIntel</span>
          </div>
          <ThemeSwitch className="text-muted-foreground hover:text-foreground transition-colors" />
        </div>
      </div>
    </header>
  );
}
