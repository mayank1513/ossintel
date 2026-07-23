import Link from "next/link";
import type React from "react";
import icon from "@/app/icon.png";
import { GithubIcon } from "./icons";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-border bg-background/50 backdrop-blur-sm relative z-10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand section */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="p-0.5 bg-muted border border-border rounded-lg overflow-hidden shrink-0">
                {/* biome-ignore lint/performance/noImgElement: static logo */}
                <img
                  src={icon.src}
                  alt="OSSIntel Logo"
                  className="h-6 w-6 object-contain"
                />
              </div>
              <span className="text-md font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                OSSIntel
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Open source intelligence and codebase health scorecards. Evaluate,
              audit, and analyze repositories with confidence.
            </p>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link
                  href="/about"
                  className="hover:text-foreground transition-colors"
                >
                  About OSSIntel
                </Link>
              </li>
              <li>
                <Link
                  href="/transparency"
                  className="hover:text-foreground transition-colors"
                >
                  Data Transparency
                </Link>
              </li>
              <li>
                <Link
                  href="/permissions"
                  className="hover:text-foreground transition-colors"
                >
                  GitHub Permissions
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">
              Legal
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/security"
                  className="hover:text-foreground transition-colors"
                >
                  Security Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Community & GitHub */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">
              Community
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link
                  href="/contact"
                  className="hover:text-foreground transition-colors"
                >
                  Contact Support
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/mayank1513/ossintel"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-foreground transition-colors flex items-center gap-1.5"
                >
                  <GithubIcon className="h-3.5 w-3.5" /> Repository
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/marketplace/ossintel"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-foreground transition-colors"
                >
                  GitHub Marketplace
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground">
          <span>
            &copy; {new Date().getFullYear()} OSSIntel. Licensed under MIT.
          </span>
          <div className="flex items-center gap-4">
            <span>Built by</span>
            <a
              href="https://mayankchaudhari.com/"
              target="_blank"
              rel="noreferrer noopener"
              className="text-foreground hover:underline font-medium"
            >
              Mayank Chaudhari
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
